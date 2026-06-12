import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/landing/MarketingShell";
import { VideoPlayer } from "@/components/VideoPlayer";

export const metadata: Metadata = {
  title: "Hilfe & Video-Tutorials – KundenRadar",
  description:
    "Kurze Erklärvideos zu KundenRadar: komplette Tour, rechtssicher mailen (§7 UWG, Impressum, Abmeldelink), bessere Suche mit Keywords, der Kalkulator und Pipeline & Follow-up.",
  alternates: { canonical: "/hilfe" },
};

const VIDEOS = [
  {
    src: "/erklaervideo.mp4",
    poster: "/erklaervideo-poster.jpg",
    title: "Komplette Tour",
    duration: "2:46",
    desc: "Der ganze Ablauf – von der Suche bis zum gewonnenen Kunden, Schritt für Schritt.",
  },
  {
    src: "/video-email-recht.mp4",
    poster: "/video-email-recht-poster.jpg",
    title: "Rechtssicher mailen",
    duration: "0:50",
    desc: "§7 UWG, Einwilligung, Impressum und Abmeldelink – worauf du beim E-Mail-Versand achten musst. (Keine Rechtsberatung.)",
  },
  {
    src: "/video-suche.mp4",
    poster: "/video-suche-poster.jpg",
    title: "Bessere Suche mit Keywords",
    duration: "0:44",
    desc: "Mit konkreten Branchen-Keywords, passendem Umkreis und Begriffs-Varianten findest du mehr und passendere Firmen.",
  },
  {
    src: "/video-kalkulator.mp4",
    poster: "/video-kalkulator-poster.jpg",
    title: "Kalkulator erklärt",
    duration: "0:34",
    desc: "Welche Felder es gibt, was berechnet wird und wie du das Ergebnis im Verkaufsgespräch nutzt.",
  },
  {
    src: "/video-pipeline.mp4",
    poster: "/video-pipeline-poster.jpg",
    title: "Pipeline & Follow-up meistern",
    duration: "0:33",
    desc: "Stages richtig nutzen, Wiedervorlagen und automatischer Nachfass – damit kein Lead verloren geht.",
  },
];

export default function HilfePage() {
  return (
    <MarketingShell>
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">Hilfe &amp; Video-Tutorials</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--color-muted)]">
          Kurze Erklärvideos mit Ton – damit du KundenRadar in wenigen Minuten sicher bedienst.
        </p>
      </div>

      <div className="mt-10 space-y-14">
        {VIDEOS.map((v) => (
          <div key={v.src} className="scroll-mt-24">
            <h2 className="mb-1 text-center text-xl font-semibold">{v.title}</h2>
            <p className="mx-auto mb-5 max-w-xl text-center text-sm text-[var(--color-muted)]">{v.desc}</p>
            <VideoPlayer src={v.src} poster={v.poster} label={`${v.title} · KundenRadar`} duration={v.duration} />
          </div>
        ))}
      </div>

      <div className="mt-14 text-center">
        <p className="text-sm text-[var(--color-muted)]">Noch Fragen? Wir geben dir eine kostenlose persönliche Einführung.</p>
        <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/registrieren" className="inline-flex items-center justify-center rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
            3 Tage kostenlos testen
          </Link>
          <a
            href={"https://wa.me/4915292627062?text=" + encodeURIComponent("Hallo, ich hätte gerne eine kurze kostenlose Einführung zu KundenRadar.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1ebe5d]"
          >
            💬 Einführung per WhatsApp
          </a>
        </div>
      </div>
    </MarketingShell>
  );
}
