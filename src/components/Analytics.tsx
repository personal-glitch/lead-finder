"use client";
// Google Analytics 4 mit Consent-Mode + Cookie-Banner (DSGVO/§25 TTDSG):
// GA wird geladen, aber Analytics-Speicher bleibt „denied", bis der Nutzer
// aktiv zustimmt. Erst dann werden Cookies/Daten gesetzt.
import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-PKQ5P8NFGX";
const KEY = "kr-cookie-consent"; // "granted" | "denied"

function setConsentInGtag(granted: boolean) {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  w.gtag?.("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
  });
}

export function Analytics() {
  const [decided, setDecided] = useState(true); // bis localStorage gelesen ist: Banner aus

  useEffect(() => {
    let v: string | null = null;
    try { v = localStorage.getItem(KEY); } catch {}
    setDecided(v === "granted" || v === "denied");
  }, []);

  const choose = (granted: boolean) => {
    try { localStorage.setItem(KEY, granted ? "granted" : "denied"); } catch {}
    setConsentInGtag(granted);
    setDecided(true);
  };

  if (!GA_ID) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          var c = null; try { c = localStorage.getItem('${KEY}'); } catch (e) {}
          gtag('consent','default',{
            ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied',
            analytics_storage: c === 'granted' ? 'granted' : 'denied'
          });
          gtag('js', new Date());
          gtag('config','${GA_ID}',{ anonymize_ip: true });
        `}
      </Script>

      {!decided && (
        <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-[var(--color-line)] bg-[var(--color-surface)]/95 backdrop-blur">
          <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--color-ink-2)]">
              Wir verwenden Cookies für anonyme Statistik (Google Analytics), um KundenRadar zu verbessern.
              Mehr in der{" "}
              <a href="/datenschutz" className="text-[var(--color-brand)] hover:underline">Datenschutzerklärung</a>.
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => choose(false)}
                className="rounded-lg border border-[var(--color-line-strong)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] hover:bg-[var(--color-subtle)]"
              >
                Ablehnen
              </button>
              <button
                type="button"
                onClick={() => choose(true)}
                className="rounded-lg bg-[var(--color-brand)] px-3 py-1.5 text-xs font-semibold text-[var(--color-on-brand)] hover:opacity-90"
              >
                Akzeptieren
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
