import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/landing/MarketingShell";
import { ExplainerVideo } from "@/components/landing/ExplainerVideo";

export const metadata: Metadata = {
  title: "Erklärvideo – KundenRadar in 2:46 Minuten",
  description:
    "Sieh dir in unter 3 Minuten an, wie KundenRadar funktioniert: neue Geschäftskunden finden, anrufen, per E-Mail ansprechen und gewinnen – Schritt für Schritt.",
  alternates: { canonical: "/erklaervideo" },
};

const WHATSAPP_SCHULUNG =
  "https://wa.me/4915292627062?text=" +
  encodeURIComponent("Hallo, ich hätte gerne eine kurze kostenlose Einführung zu KundenRadar.");

export default function ErklaervideoPage() {
  return (
    <MarketingShell>
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
          KundenRadar in 2:46 Minuten erklärt
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--color-muted)]">
          Von der Suche bis zum gewonnenen Kunden – der komplette Ablauf Schritt für Schritt, mit Ton.
        </p>
      </div>

      <div className="mt-8">
        <ExplainerVideo />
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/registrieren"
          className="inline-flex items-center justify-center rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]"
        >
          3 Tage kostenlos testen
        </Link>
        <a
          href={WHATSAPP_SCHULUNG}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1ebe5d]"
        >
          💬 Kostenlose Einführung per WhatsApp
        </a>
      </div>
    </MarketingShell>
  );
}
