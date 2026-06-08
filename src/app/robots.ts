import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

// Öffentliche Seiten dürfen indexiert werden; das Tool & APIs nicht.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard", "/pipeline", "/unternehmen", "/kontakte",
          "/agenten", "/suche", "/aufgaben", "/vorlagen", "/einstellungen",
          "/admin", "/abo", "/login", "/registrieren", "/api/",
        ],
      },
    ],
    sitemap: `${config.appUrl}/sitemap.xml`,
  };
}
