import type { NextConfig } from "next";

// Externe Calls (Recherche/Anreicherung) laufen ausschließlich server-seitig in
// Route-Handlern. Die Such-/Datenlogik ist server-only (siehe lib/leadgen/branchen.ts).

// Pragmatische, funktionsfähige CSP: alles von 'self', keine fremden Skripte/Styles.
// Next benötigt 'unsafe-inline' (Bootstrap-Skripte); Bilder/Connect bewusst offen
// für data:/https: (Supabase-Auth, Inline-SVG-Vorschauen).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

// Security-Header NUR in Produktion (über HTTPS). Im Dev (http://localhost)
// würden CSP/HSTS Subressourcen blockieren und HMR stören.
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Keine Client-Source-Maps in Produktion (erschwert das Auslesen des Codes).
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  async headers() {
    if (!isProd) return [];
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
