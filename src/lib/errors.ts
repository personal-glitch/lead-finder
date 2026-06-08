// Einheitliche, nutzerverständliche Fehler für externe Aufrufe & API-Routen.

export type AppErrorCode =
  | "bad_request"
  | "rate_limited"
  | "timeout"
  | "no_geocode"
  | "upstream"
  | "robots_blocked"
  | "not_configured"
  | "not_found"
  | "auth"
  | "limit";

const STATUS: Record<AppErrorCode, number> = {
  bad_request: 400,
  rate_limited: 429,
  timeout: 504,
  no_geocode: 404,
  upstream: 502,
  robots_blocked: 403,
  not_configured: 501,
  not_found: 404,
  auth: 401,
  limit: 402,
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS[code];
  }
}

/** true, wenn der Fehler von einem AbortController-Timeout stammt. */
export function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
}

/** Wandelt beliebige Fehler in eine AppError mit deutscher Meldung um. */
export function toAppError(err: unknown, context: string): AppError {
  if (err instanceof AppError) return err;
  if (isAbortError(err)) {
    return new AppError(
      "timeout",
      `${context}: Zeitüberschreitung. Bitte gleich erneut versuchen.`,
    );
  }
  const detail = err instanceof Error ? err.message : String(err);
  return new AppError("upstream", `${context}: ${detail}`);
}
