"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FeatureFlags } from "@/lib/types";
import { api } from "@/lib/client";
import { Icon, type IconName } from "../icons";
import { cx } from "../ui";
import { TrialBanner } from "./TrialBanner";
import { HelpWidget } from "./HelpWidget";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { usePersona } from "@/components/use-persona";

const FlagsContext = createContext<FeatureFlags>({ supabase: false, resend: false, stripe: false });
export const useFlags = () => useContext(FlagsContext);

/** Pages dispatchen dieses Event nach Aktionen, damit die Sidebar-Zahlen aktuell bleiben. */
export function refreshStats() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("stats:refresh"));
}

const NAV: { href: string; label: string; icon: IconName; match: (p: string) => boolean }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "home", match: (p) => p.startsWith("/dashboard") },
  { href: "/pipeline", label: "Pipeline", icon: "pipeline", match: (p) => p.startsWith("/pipeline") },
  { href: "/unternehmen", label: "Unternehmen", icon: "building", match: (p) => p.startsWith("/unternehmen") },
  { href: "/kontakte", label: "Kontakte", icon: "user", match: (p) => p.startsWith("/kontakte") },
  { href: "/agenten", label: "Agenten", icon: "agents", match: (p) => p.startsWith("/agenten") },
  { href: "/suche", label: "Suche", icon: "search", match: (p) => p.startsWith("/suche") },
  { href: "/kalkulator", label: "Kalkulator", icon: "calculator", match: (p) => p.startsWith("/kalkulator") },
  { href: "/gratis", label: "Gratis-Tools", icon: "box", match: (p) => p.startsWith("/gratis") },
  { href: "/aufgaben", label: "Aufgaben", icon: "tasks", match: (p) => p.startsWith("/aufgaben") },
  { href: "/vorlagen", label: "Vorlagen", icon: "template", match: (p) => p.startsWith("/vorlagen") },
  { href: "/einstellungen", label: "Einstellungen", icon: "settings", match: (p) => p.startsWith("/einstellungen") },
];

function NavItem({ href, label, icon, active }: { href: string; label: string; icon: IconName; active: boolean }) {
  return (
    <Link
      href={href}
      className={cx(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-[var(--color-brand-tint)] text-[var(--color-brand)]"
          : "text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)] hover:text-[var(--color-ink)]",
      )}
    >
      <Icon name={icon} size={18} strokeWidth={active ? 2 : 1.75} />
      {label}
    </Link>
  );
}

interface Stats {
  anrufeHeute: number;
  ziel: number;
  offeneAufgaben: number;
  faelligHeute: number;
}

function CallTracker() {
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => {
    const load = () => api<Stats>("/api/stats").then(setS).catch(() => {});
    load();
    const onRefresh = () => load();
    window.addEventListener("stats:refresh", onRefresh);
    const t = setInterval(load, 60_000);
    return () => {
      window.removeEventListener("stats:refresh", onRefresh);
      clearInterval(t);
    };
  }, []);

  const pct = s && s.ziel ? Math.min(100, Math.round((s.anrufeHeute / s.ziel) * 100)) : 0;
  return (
    <div className="rounded-lg bg-[var(--color-subtle)] px-3 py-2.5">
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">Anrufe heute</span>
        <span className="text-xs text-[var(--color-muted)] tnum">Ziel {s?.ziel ?? "–"}</span>
      </div>
      <div className="mt-1 text-2xl font-semibold tnum">{s?.anrufeHeute ?? 0}</div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--color-line)]">
        <div className="h-full rounded-full bg-[var(--color-brand)] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <Link
        href="/aufgaben"
        className="mt-2 block text-[11px] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
      >
        {s?.faelligHeute ?? 0} heute fällig · {s?.offeneAufgaben ?? 0} offen
      </Link>
    </div>
  );
}

const STELLEN_ITEM = { href: "/stellen", label: "Stellen", icon: "user" as IconName, match: (p: string) => p.startsWith("/stellen") };

function Sidebar({ flags }: { flags: FeatureFlags }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const { persona } = usePersona();
  // Persona-adaptive Navigation: Personalvermittler bekommen statt der allgemeinen
  // „Suche" (Branchen-Firmensuche) direkt den Stellen-Bereich – das verhindert
  // Verwirrung, weil ihre Suche immer die offenen Stellen meint.
  const navItems = persona?.features.jobs
    ? [...NAV.slice(0, 5), STELLEN_ITEM, ...NAV.slice(6)]
    : NAV;
  useEffect(() => {
    api<{ isAdmin: boolean }>("/api/admin/me").then((r) => setIsAdmin(r.isAdmin)).catch(() => {});
  }, []);
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-hidden border-r border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="flex items-center gap-3 px-4 py-4">
        <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[var(--color-brand)] text-[var(--color-on-brand)]">
          <Icon name="agents" size={18} strokeWidth={2.2} />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-semibold">KundenRadar</div>
          <div className="eyebrow">Vertrieb</div>
        </div>
      </div>

      <nav className="scroll-slim min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 pt-2">
        <div className="eyebrow px-3 pb-1.5">Arbeitsbereich</div>
        {navItems.map((n) => (
          <NavItem key={n.href} {...n} active={n.match(pathname)} />
        ))}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-[var(--color-line)] p-3">
        <CallTracker />
        <div className="rounded-lg bg-[var(--color-subtle)] px-3 py-2.5">
          <div className="eyebrow mb-1">Datenbasis</div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-2)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand)]" />
            Live-Recherche aktiv
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-[var(--color-muted)]">
            <span>{flags.supabase ? "Supabase" : "Lokaler Speicher"}</span>
            <span>{flags.resend ? "E-Mail aktiv" : "E-Mail: Vorschau"}</span>
          </div>
        </div>
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-tint)]"
          >
            <Icon name="agents" size={18} strokeWidth={1.75} /> Superadmin
          </Link>
        )}
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-subtle)] hover:text-[var(--color-ink)]"
          >
            <Icon name="chevronLeft" size={18} strokeWidth={1.75} /> Abmelden
          </button>
        </form>
      </div>
    </aside>
  );
}

export function AppShell({ flags, children }: { flags: FeatureFlags; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  // Drawer bei Seitenwechsel automatisch schließen.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <FlagsContext.Provider value={flags}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar: fest ab Tablet/Desktop … */}
        <div className="hidden md:block">
          <Sidebar flags={flags} />
        </div>

        {/* … und als einklappbares Menü auf dem Handy. */}
        <div
          className={cx("fixed inset-0 z-50 md:hidden", mobileOpen ? "pointer-events-auto" : "pointer-events-none")}
          aria-hidden={!mobileOpen}
        >
          <div
            className={cx("absolute inset-0 bg-black/50 transition-opacity", mobileOpen ? "opacity-100" : "opacity-0")}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={cx(
              "absolute inset-y-0 left-0 w-64 max-w-[82%] shadow-2xl transition-transform duration-200",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Menü schließen"
              className="absolute right-2 top-3.5 z-10 grid h-9 w-9 place-items-center rounded-lg text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]"
            >
              <Icon name="x" size={18} />
            </button>
            <Sidebar flags={flags} />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Obere Leiste nur auf dem Handy mit Menü-Button. */}
          <header className="flex items-center gap-3 border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Menü öffnen"
              className="grid h-9 w-9 place-items-center rounded-lg text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]"
            >
              <Icon name="menu" size={20} />
            </button>
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--color-brand)] text-[var(--color-on-brand)]">
              <Icon name="agents" size={15} strokeWidth={2.2} />
            </span>
            <span className="text-sm font-semibold">KundenRadar</span>
          </header>

          <TrialBanner />
          <main className="scroll-slim flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
      <HelpWidget />
      <OnboardingWizard />
    </FlagsContext.Provider>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  back,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[var(--color-canvas)]/80 px-4 py-4 backdrop-blur sm:px-7 sm:py-5">
      {back && (
        <Link
          href={back.href}
          className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        >
          <Icon name="chevronLeft" size={14} /> {back.label}
        </Link>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-[-0.01em] sm:text-[22px]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>}
      </div>
    </div>
  );
}
