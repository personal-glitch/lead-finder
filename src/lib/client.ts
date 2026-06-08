// Schlanker fetch-Wrapper für den Client. Wirft mit der deutschen Fehlermeldung
// aus dem einheitlichen API-Fehlerformat ({ error: { code, message } }).
"use client";

export interface ApiOptions extends Omit<RequestInit, "body"> {
  json?: unknown;
}

export async function api<T>(url: string, options: ApiOptions = {}): Promise<T> {
  const { json, headers, ...rest } = options;
  const init: RequestInit = { ...rest, headers: { ...headers } };
  if (json !== undefined) {
    init.method = init.method ?? "POST";
    init.body = JSON.stringify(json);
    (init.headers as Record<string, string>)["Content-Type"] = "application/json";
  }
  const res = await fetch(url, init);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (data as { error?: { message?: string } })?.error?.message ??
      `Anfrage fehlgeschlagen (HTTP ${res.status}).`;
    throw new Error(message);
  }
  return data as T;
}
