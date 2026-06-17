import { AGENT_COLORS } from "@/components/icons";

function initials(name: string): string {
  const parts = name.replace(/\b(gmbh|ag|kg|ohg|e\.?v\.?|co|mbh|ug)\b/gi, "").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || name[0]?.toUpperCase() || "?";
}
function colorFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AGENT_COLORS[h % AGENT_COLORS.length];
}

/** Firmen-Logo mit Initial-Fallback in Markenfarbe (Server-Component, kein Fetch). */
export function CompanyLogo({ name, logoUrl, size = 48, rounded = "rounded-xl" }: { name: string; logoUrl?: string | null; size?: number; rounded?: string }) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`Logo ${name}`}
        width={size}
        height={size}
        loading="lazy"
        className={`${rounded} shrink-0 border border-[var(--color-line)] bg-white object-contain`}
        style={{ width: size, height: size }}
      />
    );
  }
  const c = colorFor(name);
  return (
    <span
      className={`${rounded} grid shrink-0 place-items-center font-semibold`}
      style={{ width: size, height: size, background: c.bg, color: c.fg, fontSize: Math.round(size * 0.36) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
