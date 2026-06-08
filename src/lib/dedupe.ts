// Dedupe-Schlüssel, um doppelte Leads zu verhindern (Website bzw. Name+Adresse).

export function normalizePart(s: string | null | undefined): string {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9äöüß]+/gi, "");
}

/** Host einer (ggf. schemalosen) URL, ohne führendes www. */
export function hostFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    return u.host.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Stabiler Schlüssel zur Duplikaterkennung. Priorität:
 * 1. Website-Host (stärkstes Signal für „dieselbe Firma")
 * 2. Name + Straße + PLZ
 * 3. OSM-ID als Fallback
 */
export function dedupeKey(l: {
  name?: string | null;
  strasse?: string | null;
  plz?: string | null;
  website?: string | null;
  osmId?: string | null;
}): string {
  const host = hostFromUrl(l.website);
  if (host) return `web:${host}`;

  const addr = `${normalizePart(l.name)}|${normalizePart(l.strasse)}|${normalizePart(l.plz)}`;
  if (addr.replace(/\|/g, "").length > 0) return `addr:${addr}`;

  if (l.osmId) return `ext:${l.osmId}`;
  return `name:${normalizePart(l.name)}`;
}
