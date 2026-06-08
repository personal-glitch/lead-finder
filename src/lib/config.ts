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
    overpassUrl:
      env("OVERPASS_URL") ?? "https://overpass-api.de/api/interpreter",
    // Öffentliche Overpass-Mirror als Fallback (Reihenfolge = Priorität).
    overpassFallbacks: [
      "https://overpass.kumi.systems/api/interpreter",
      "https://overpass.openstreetmap.fr/api/interpreter",
      "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    ],
    // Kürzeres Timeout für Fallback-Mirror, damit ein Ausfall schnell auffällt.
    overpassFallbackTimeoutMs: 8_000,
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
  admin: { email: superAdminEmail?.toLowerCase() ?? null },

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
