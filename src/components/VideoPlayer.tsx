"use client";

/** Wiederverwendbarer, handy-fester Video-Player mit Browser-Rahmen. */
export function VideoPlayer({
  src,
  poster,
  label,
  duration,
  caption,
}: {
  src: string;
  poster: string;
  label: string;
  duration: string;
  caption?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[0_30px_80px_-25px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-xs text-[var(--color-faint)]">{label}</span>
          <span className="ml-auto text-[11px] text-[var(--color-faint)]">{duration} · mit Ton</span>
        </div>
        <video
          className="block w-full bg-black"
          poster={poster}
          controls
          preload="metadata"
          playsInline
          webkit-playsinline="true"
        >
          <source src={src} type="video/mp4" />
          Dein Browser kann das Video nicht abspielen.{" "}
          <a href={src} className="underline">Video herunterladen</a>.
        </video>
      </div>
      {caption && <p className="mt-3 text-center text-sm text-[var(--color-muted)]">{caption}</p>}
    </div>
  );
}
