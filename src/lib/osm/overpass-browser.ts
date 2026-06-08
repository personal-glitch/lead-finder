"use client";
// Overpass direkt aus dem BROWSER abfragen. Anders als Vercels Rechenzentrums-IP
// (die von den öffentlichen Overpass-Servern geblockt wird) nutzt der Browser die
// normale Internet-Verbindung des Nutzers – die Anfragen gehen durch.
// overpass-api.de sendet CORS-Header (Access-Control-Allow-Origin: *), daher klappt
// fetch aus dem Browser. KEIN eigener User-Agent (vom Browser verboten) und nur
// "simple" Content-Type, damit kein CORS-Preflight nötig ist.

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

export interface BrowserOverpassElement {
  type?: string;
  id?: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export async function runOverpassBrowser(query: string): Promise<BrowserOverpassElement[]> {
  let lastError: Error | null = null;
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(query),
      });
      if (!res.ok) {
        lastError = new Error(`${url}: HTTP ${res.status}`);
        continue;
      }
      const json = (await res.json()) as { elements?: BrowserOverpassElement[] };
      return Array.isArray(json.elements) ? json.elements : [];
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastError ?? new Error("Overpass nicht erreichbar.");
}
