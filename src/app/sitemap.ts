import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = config.appUrl;
  const entries: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/check", priority: 0.8 },
    { path: "/rechner", priority: 0.7 },
    { path: "/rechner/gebaeudereinigung", priority: 0.8 },
    { path: "/rechner/handwerk-stundensatz", priority: 0.8 },
    { path: "/rechner/agentur-stundensatz", priority: 0.8 },
    { path: "/preise", priority: 0.6 },
    { path: "/impressum", priority: 0.3 },
    { path: "/datenschutz", priority: 0.3 },
    { path: "/agb", priority: 0.3 },
    { path: "/widerruf", priority: 0.3 },
    { path: "/kontakt", priority: 0.3 },
  ];
  return entries.map((e) => ({
    url: `${base}${e.path}`,
    changeFrequency: "weekly",
    priority: e.priority,
  }));
}
