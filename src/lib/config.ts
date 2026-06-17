// Zentrale Konfiguration & Feature-Flags, ausschließlich server-seitig lesen.
// Die App läuft ohne jegliche Keys; gesetzte Variablen schalten Features frei.
import type { FeatureFlags } from "@/lib/types";

/**
 * Owner-ID ohne echte Auth (lokaler Store bzw. Supabase mit Service-Role).
 * Nil-UUID, damit derselbe Code in beiden Modi funktioniert. Sobald Supabase-
 * Auth verdrahtet ist, hier die echte `auth.uid()` verwenden.
 */
export const DEV_OWNER_ID = "00000000-0000-0000-0000-000000000000";

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v.trim() : undefined;
}

const supabaseUrl = env("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnon = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const supabaseService = env("SUPABASE_SERVICE_ROLE_KEY");
const resendKey = env("RESEND_API_KEY");
const resendFrom = env("RESEND_FROM");
const stripeSecret = env("STRIPE_SECRET_KEY");
const stripePrice = env("STRIPE_PRICE_ID");
const stripeWebhook = env("STRIPE_WEBHOOK_SECRET");
const superAdminEmail = env("SUPER_ADMIN_EMAIL");

export const config = {
  appUrl: env("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",

  osm: {
    // Pflicht-Etikette: aussagekräftiger User-Agent mit Kontakt.
    userAgent: env("OSM_USER_AGENT") ?? "LeadFinder/1.0 (kontakt@example.com)",
    nominatimUrl:
      env("NOMINATIM_URL") ?? "https://nominatim.openstreetmap.org/search",
    // Photon (komoot) als Geocoder-Fallback, falls Nominatim die IP sperrt.
    photonUrl: env("PHOTON_URL") ?? "https://photon.komoot.io/api/",
    // Primär: kumi.systems – erlaubt (anders als overpass-api.de & die mail.ru/
    // .fr-Mirror) Cloud-/Vercel-IPs; braucht nur etwas mehr Zeit als 8 s.
    overpassUrl:
      env("OVERPASS_URL") ?? "https://overpass.kumi.systems/api/interpreter",
    // Öffentliche Overpass-Mirror als Fallback (Reihenfolge = Priorität).
    overpassFallbacks: [
      "https://overpass.private.coffee/api/interpreter",
      "https://overpass.osm.ch/api/interpreter",
      "https://overpass-api.de/api/interpreter",
    ],
    // Fallback-Mirror bekommen jetzt mehr Luft (Cloud-IP-Latenz).
    overpassFallbackTimeoutMs: 12_000,
    // true = ein eigener OVERPASS_URL (z. B. Cloudflare-Worker-Proxy) ist gesetzt.
    // Dann ist Overpass von der Cloud erreichbar und wird PRIMÄR genutzt
    // (Kategorie-Suche = Firmen nach Tätigkeit, viel mehr Treffer).
    overpassProxied: Boolean(env("OVERPASS_URL")),
    // Nominatim: max. 1 Request/Sekunde.
    nominatimMinIntervalMs: 1100,
    // Overpass ist rate-limited – Anfragen serialisieren.
    overpassMinIntervalMs: 1500,
    overpassTimeoutSec: 90,
    // HTTP-Timeout für Geocoding/Overpass-Aufrufe.
    fetchTimeoutMs: 30_000,
    // Sinnvolle Grenzen für den Suchradius.
    minRadiusKm: 0.5,
    maxRadiusKm: 50,
  },

  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnon,
    serviceRoleKey: supabaseService,
    enabled: Boolean(supabaseUrl && (supabaseAnon || supabaseService)),
  },

  resend: {
    apiKey: resendKey,
    from: resendFrom,
    // Pflicht-Footer (Impressum) für jede ausgehende E-Mail.
    impressum: env("SENDER_IMPRESSUM"),
    enabled: Boolean(resendKey && resendFrom),
  },

  stripe: {
    secretKey: stripeSecret,
    priceId: stripePrice,
    webhookSecret: stripeWebhook,
    enabled: Boolean(stripeSecret && stripePrice),
  },

  // Nur diese E-Mail sieht die Superadmin-Übersicht (/admin).
  // notifyEmail = Postfach, das interne Benachrichtigungen (neue Katalog-Einträge,
  // Leads, Marktplatz-Anfragen) empfängt. Standard: kontakt@seciora-solutions.de,
  // überschreibbar via ADMIN_NOTIFY_EMAIL. Entkoppelt vom Login (SUPER_ADMIN_EMAIL).
  admin: {
    email: superAdminEmail?.toLowerCase() ?? null,
    notifyEmail: env("ADMIN_NOTIFY_EMAIL") ?? "kontakt@seciora-solutions.de",
  },

  // Tagesziel für Anrufe (Fortschritt in Sidebar/Dashboard).
  targets: {
    callsPerDay: Number(env("CALL_GOAL")) || 60,
  },

  enrich: {
    fetchTimeoutMs: 12_000,
    // Höfliches Crawling: kleine Verzögerung pro Domain.
    perDomainDelayMs: 1_200,
    maxHtmlBytes: 2_000_000,
  },
} as const;

export function featureFlags(): FeatureFlags {
  return {
    supabase: config.supabase.enabled,
    resend: config.resend.enabled,
    stripe: config.stripe.enabled,
  };
}
