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
    { path: "/rechner/webdesign-preis", priority: 0.8 },
    { path: "/rechner/seo-kosten", priority: 0.8 },
    { path: "/rechner/personalvermittlung-provision", priority: 0.8 },
    { path: "/rechner/neukunde-kosten", priority: 0.8 },
    { path: "/rechner/maler-stundensatz", priority: 0.8 },
    { path: "/rechner/elektriker-stundensatz", priority: 0.8 },
    { path: "/rechner/garten-landschaftsbau-stundensatz", priority: 0.8 },
    { path: "/rechner/dachdecker-stundensatz", priority: 0.8 },
    { path: "/rechner/fliesenleger-stundensatz", priority: 0.8 },
    { path: "/rechner/tischler-schreiner-stundensatz", priority: 0.8 },
    { path: "/rechner/reinigungskosten-pro-quadratmeter", priority: 0.8 },
    { path: "/hilfe", priority: 0.6 },
    { path: "/erklaervideo", priority: 0.6 },
    { path: "/blog", priority: 0.7 },
    { path: "/blog/kaltakquise-b2b-erlaubt", priority: 0.8 },
    { path: "/blog/neukunden-reinigungsfirma", priority: 0.8 },
    { path: "/blog/webdesign-kunden-gewinnen", priority: 0.8 },
    { path: "/blog/offene-stellen-vertriebssignal", priority: 0.8 },
    { path: "/blog/personalvermittlung-kunden-gewinnen", priority: 0.8 },
    { path: "/newsletter", priority: 0.5 },
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
