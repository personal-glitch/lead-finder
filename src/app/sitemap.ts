import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = config.appUrl;
  return ["/", "/impressum", "/datenschutz", "/kontakt"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly",
    priority: p === "/" ? 1 : 0.5,
  }));
}
