// Serialisiert externe Aufrufe pro Schlüssel und erzwingt einen Mindestabstand.
// Nötig wegen der Rate-Limits/Etikette von Nominatim & Overpass.

const chains = new Map<string, Promise<unknown>>();
const lastCallAt = new Map<string, number>();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Reiht `fn` in die Warteschlange für `key` ein. Aufrufe mit demselben Schlüssel
 * laufen strikt nacheinander und halten `minIntervalMs` Abstand ein.
 */
export function rateLimited<T>(
  key: string,
  minIntervalMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const prev = chains.get(key) ?? Promise.resolve();

  const run = prev.then(async () => {
    const last = lastCallAt.get(key) ?? 0;
    const wait = last + minIntervalMs - Date.now();
    if (wait > 0) await sleep(wait);
    lastCallAt.set(key, Date.now());
    return fn();
  });

  // Kette am Leben halten – egal ob der Aufruf erfolgreich war oder nicht.
  chains.set(
    key,
    run.then(
      () => undefined,
      () => undefined,
    ),
  );

  return run;
}

// ── Einfaches In-Memory-Limit pro Schlüssel (Fixed Window) ──
// Schützt öffentliche Endpunkte vor Spam/Abuse. Best-effort pro Instanz;
// für Mehr-Instanz-Setups später durch einen geteilten Store (z. B. Upstash) ersetzen.
const hits = new Map<string, { count: number; resetAt: number }>();

/** true = Limit überschritten (Anfrage sollte abgelehnt werden). */
export function rateLimitExceeded(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const e = hits.get(key);
  if (!e || now > e.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  e.count += 1;
  return e.count > limit;
}

/** fetch mit Timeout (AbortController). Wirft bei Zeitüberschreitung. */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit & { timeoutMs: number },
): Promise<Response> {
  const { timeoutMs, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...rest, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
