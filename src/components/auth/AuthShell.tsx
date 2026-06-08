import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons";

/** Schlichte, markenkonforme Hülle für Login-/Registrieren-Seiten (dunkel + grün). */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
      {/* dezenter grüner Schimmer oben */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-60"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(168,232,58,0.12), transparent 70%)",
        }}
      />
      <div className="relative w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[var(--color-brand)] text-[var(--color-on-brand)]">
            <Icon name="agents" size={18} strokeWidth={2.2} />
          </span>
          <span className="text-lg font-semibold">KundenRadar</span>
        </Link>

        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-7 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
          <h1 className="text-xl font-semibold tracking-[-0.01em]">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-[var(--color-muted)]">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && (
          <p className="mt-5 text-center text-sm text-[var(--color-muted)]">{footer}</p>
        )}
      </div>
    </div>
  );
}
