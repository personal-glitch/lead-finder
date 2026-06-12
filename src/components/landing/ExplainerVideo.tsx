"use client";

// Echtes gerendertes Erklärvideo (Remotion-Stil, deutsche Sprecherstimme).
// Liegt unter /public/erklaervideo.mp4 mit Poster /public/erklaervideo-poster.jpg.
export function ExplainerVideo() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[0_30px_80px_-25px_rgba(0,0,0,0.7)]">
        <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-xs text-[var(--color-faint)]">Erklärvideo · KundenRadar</span>
          <span className="ml-auto text-[11px] text-[var(--color-faint)]">2:46 Min · mit Ton</span>
        </div>
        <video
          className="block w-full bg-black"
          src="/erklaervideo.mp4"
          poster="/erklaervideo-poster.jpg"
          controls
          preload="none"
          playsInline
        />
      </div>
      <p className="mt-3 text-center text-sm text-[var(--color-muted)]">
        In 2:46 Minuten erklärt: von der Suche bis zum gewonnenen Kunden – Schritt für Schritt.
      </p>
    </div>
  );
}
