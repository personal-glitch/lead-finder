"use client";
import type { CSSProperties, ReactNode } from "react";

// Kuratiertes Linien-Icon-Set (Lucide-Stil). Bewusst schlicht – kein Emoji –
// damit Agenten/Navigation seriös wirken statt verspielt.

export type IconName =
  | "pipeline"
  | "agents"
  | "home"
  | "tasks"
  | "template"
  | "settings"
  | "search"
  | "plus"
  | "trash"
  | "pencil"
  | "play"
  | "chevronLeft"
  | "chevronRight"
  | "phone"
  | "mail"
  | "user"
  | "globe"
  | "pin"
  | "clock"
  | "check"
  | "x"
  | "filter"
  | "refresh"
  | "external"
  // Agent-Kategorien
  | "box"
  | "health"
  | "wrench"
  | "broom"
  | "building"
  | "truck"
  | "factory"
  | "cart"
  | "hardhat"
  | "bolt"
  | "bed"
  | "school"
  | "utensils"
  | "key";

const P: Record<IconName, ReactNode> = {
  pipeline: (
    <>
      <rect x="3" y="4" width="5" height="16" rx="1" />
      <rect x="10" y="4" width="5" height="11" rx="1" />
      <rect x="17" y="4" width="4" height="7" rx="1" />
    </>
  ),
  agents: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  home: (
    <>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10.5V20h12v-9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  tasks: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4h6v2.5H9z" />
      <path d="m8.5 13 2 2 4-4.5" />
    </>
  ),
  template: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 8h18M8 5v14" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.2A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 2.6 14H2.4a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 4 7.6l-.4-.3a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9 4.6V4.4a2 2 0 1 1 4 0v.2A1.6 1.6 0 0 0 17 7l.3-.4a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 21.4 12v.2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  trash: (
    <>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </>
  ),
  pencil: (
    <>
      <path d="M16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1 1-4Z" />
    </>
  ),
  play: <path d="M7 5.5v13l11-6.5z" />,
  chevronLeft: <path d="M15 5l-7 7 7 7" />,
  chevronRight: <path d="M9 5l7 7-7 7" />,
  phone: (
    <path d="M6.5 4h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  check: <path d="M5 12.5 10 17l9-10" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  filter: <path d="M3 5h18l-7 8v6l-4-2v-4z" />,
  refresh: (
    <>
      <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
      <path d="M21 4v4h-4" />
      <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
      <path d="M3 20v-4h4" />
    </>
  ),
  external: (
    <>
      <path d="M14 5h5v5M19 5l-8 8" />
      <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </>
  ),
  box: (
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </>
  ),
  health: (
    <>
      <path d="M12 21s-7-4.5-9.2-9C1 8.5 3 5 6.5 5 9 5 12 8 12 8s3-3 5.5-3C21 5 23 8.5 21.2 12 19 16.5 12 21 12 21Z" />
      <path d="M7 12h2l1.5-2.5L12.5 15 14 12h3" />
    </>
  ),
  wrench: (
    <path d="M21 4a5 5 0 0 1-6.5 6.5L6 19l-3-3 8.5-8.5A5 5 0 0 1 18 3l-2.5 2.5L17 8l2.5-1.5L21 4Z" />
  ),
  broom: (
    <>
      <path d="M14 4 9 9l4 4 5-5z" />
      <path d="M9 9 3 19l2 2 8-6" />
      <path d="m11 13 2 2" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17.5" cy="18" r="1.8" />
    </>
  ),
  factory: (
    <>
      <path d="M3 21V9l6 4V9l6 4V6h3v15z" />
      <path d="M7 17h2M13 17h2" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
      <path d="M3 4h2l2.2 11.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L20 8H6" />
    </>
  ),
  hardhat: (
    <>
      <path d="M3 17a9 9 0 0 1 18 0" />
      <path d="M10 8a2 2 0 0 1 4 0v4M2.5 17h19" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  bed: (
    <>
      <path d="M3 8v11M3 12h13a4 4 0 0 1 4 4v3M3 12h0" />
      <path d="M3 16h18" />
      <circle cx="7.5" cy="10" r="1.5" />
    </>
  ),
  school: (
    <>
      <path d="m12 4 9 4-9 4-9-4z" />
      <path d="M6 10v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5M21 8v5" />
    </>
  ),
  utensils: (
    <>
      <path d="M6 3v8a2 2 0 0 0 4 0V3M8 11v10M16 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4v9" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="8" r="4" />
      <path d="m11 11 8 8M16 16l2-2M19 19l2-2" />
    </>
  ),
};

export function Icon({
  name,
  size = 18,
  strokeWidth = 1.75,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      {P[name]}
    </svg>
  );
}

// ── Kuratierte Farbpalette (entsättigt, „bewusst gewählt") ──
export interface AgentColor {
  key: string;
  label: string;
  bg: string;
  fg: string;
}

export const AGENT_COLORS: AgentColor[] = [
  { key: "slate", label: "Schiefer", bg: "rgba(148,163,184,0.16)", fg: "#aab4bf" },
  { key: "blue", label: "Blau", bg: "rgba(96,165,250,0.16)", fg: "#7fb6ff" },
  { key: "indigo", label: "Indigo", bg: "rgba(129,140,248,0.16)", fg: "#a6aefc" },
  { key: "teal", label: "Petrol", bg: "rgba(45,212,191,0.16)", fg: "#5eded0" },
  { key: "emerald", label: "Grün", bg: "rgba(52,211,153,0.16)", fg: "#5ad99a" },
  { key: "amber", label: "Bernstein", bg: "rgba(245,196,81,0.16)", fg: "#f0c463" },
  { key: "rose", label: "Rosé", bg: "rgba(247,139,160,0.16)", fg: "#f78ba0" },
  { key: "violet", label: "Violett", bg: "rgba(167,139,250,0.16)", fg: "#bda6fb" },
];

export const DEFAULT_COLOR = "slate";

export function colorOf(key: string | null | undefined): AgentColor {
  return AGENT_COLORS.find((c) => c.key === key) ?? AGENT_COLORS[0];
}

// ── Icons, die als Agent-Avatar wählbar sind ──
export const AGENT_ICONS: { key: IconName; label: string }[] = [
  { key: "box", label: "Logistik / Lager" },
  { key: "truck", label: "Transport" },
  { key: "factory", label: "Industrie" },
  { key: "wrench", label: "Service / Technik" },
  { key: "broom", label: "Reinigung" },
  { key: "health", label: "Pflege / Gesundheit" },
  { key: "building", label: "Büro / Firma" },
  { key: "hardhat", label: "Bau / Handwerk" },
  { key: "cart", label: "Handel" },
  { key: "bed", label: "Hotel" },
  { key: "school", label: "Bildung" },
  { key: "utensils", label: "Gastronomie" },
  { key: "bolt", label: "Energie / Technik" },
  { key: "key", label: "Immobilien" },
];

export const DEFAULT_ICON: IconName = "box";

/** Farbe deterministisch aus einem Seed (z. B. Lead-ID) ableiten. */
export function leadColorFor(seed: string): AgentColor {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AGENT_COLORS[h % AGENT_COLORS.length];
}

function leadInitials(name: string | null): string {
  if (!name) return "–";
  const parts = name.replace(/\b(gmbh|ag|kg|ohg|e\.?v\.?|co|mbh)\b/gi, "").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || name[0].toUpperCase();
}

/** Initialen-Avatar (Firma) in deterministischer Farbe. */
export function InitialsAvatar({ name, seed, size = 36 }: { name: string | null; seed: string; size?: number }) {
  const c = leadColorFor(seed);
  return (
    <span
      className="grid shrink-0 place-items-center rounded-lg font-semibold"
      style={{ background: c.bg, color: c.fg, width: size, height: size, fontSize: Math.round(size * 0.34) }}
    >
      {leadInitials(name)}
    </span>
  );
}

export function AgentAvatar({
  icon,
  color,
  size = 40,
}: {
  icon: IconName;
  color: string;
  size?: number;
}) {
  const c = colorOf(color);
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-[10px] ring-1 ring-white/10"
      style={{ background: c.bg, color: c.fg, width: size, height: size }}
    >
      <Icon name={icon} size={Math.round(size * 0.5)} strokeWidth={1.9} />
    </span>
  );
}
