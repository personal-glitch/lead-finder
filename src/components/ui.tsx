"use client";
import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "./icons";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

// ── Button ──
type Variant = "primary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[var(--color-brand)] text-[var(--color-on-brand)] font-semibold hover:bg-[var(--color-brand-ink)] shadow-[0_0_0_1px_rgba(168,232,58,0.25),0_6px_18px_-6px_rgba(168,232,58,0.45)] disabled:opacity-50",
  ghost:
    "border border-[var(--color-line-strong)] bg-[var(--color-surface)] text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)] hover:text-[var(--color-ink)] disabled:opacity-50",
  danger:
    "bg-[var(--color-danger)] text-[var(--color-on-brand)] font-semibold hover:brightness-110 disabled:opacity-50",
  subtle:
    "text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-subtle)] disabled:opacity-50",
};
const SIZES: Record<Size, string> = {
  sm: "h-7 gap-1.5 px-2.5 text-[13px]",
  md: "h-9 gap-2 px-3.5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed",
        SIZES[size],
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function IconButton({
  icon,
  label,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string }) {
  return (
    <button
      {...props}
      aria-label={label}
      title={label}
      className={cx(
        "inline-grid h-8 w-8 place-items-center rounded-lg text-[var(--color-faint)] transition-colors hover:bg-[var(--color-subtle)] hover:text-[var(--color-ink)]",
        className,
      )}
    >
      <Icon name={icon} size={16} />
    </button>
  );
}

// ── Badge ──
type Tone = "slate" | "brand" | "amber" | "green" | "red" | "blue";
const TONES: Record<Tone, string> = {
  slate: "bg-[var(--color-subtle)] text-[var(--color-ink-2)]",
  brand: "bg-[var(--color-brand-tint)] text-[var(--color-brand)]",
  amber: "bg-[var(--color-warn-tint)] text-[var(--color-warn)]",
  green: "bg-[var(--color-success-tint)] text-[var(--color-success)]",
  red: "bg-[var(--color-danger-tint)] text-[var(--color-danger)]",
  blue: "bg-[var(--color-info-tint)] text-[var(--color-info)]",
};

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  return (
    <Tag
      className={cx(
        "rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Spinner({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={cx("animate-spin", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ── Formularelemente ──
export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow mb-1.5 block">
        {label}
        {required && <span className="text-[var(--color-danger)]"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[var(--color-muted)]">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-subtle)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition-shadow placeholder:text-[var(--color-faint)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand-tint)]";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(inputClass, props.className)} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(inputClass, "resize-y leading-relaxed", props.className)} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx(inputClass, "appearance-none pr-8", props.className)} />;
}

// ── Overlays ──
function Backdrop({ onClose }: { onClose: () => void }) {
  return <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden />;
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <Backdrop onClose={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-[var(--color-line)] bg-[var(--color-surface)] shadow-[-8px_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-start justify-between border-b border-[var(--color-line)] px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold">{title}</h2>
            {subtitle && <div className="mt-0.5 text-xs text-[var(--color-muted)]">{subtitle}</div>}
          </div>
          <IconButton icon="x" label="Schließen" onClick={onClose} />
        </div>
        <div className="scroll-slim flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Backdrop onClose={onClose} />
      <div
        className={cx(
          "relative z-10 flex max-h-[88vh] w-full flex-col overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-elevated)] shadow-[0_24px_70px_rgba(0,0,0,0.6)]",
          wide ? "max-w-3xl" : "max-w-lg",
        )}
      >
        <div className="flex items-start justify-between border-b border-[var(--color-line)] px-6 py-4">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {subtitle && <div className="mt-0.5 text-xs text-[var(--color-muted)]">{subtitle}</div>}
          </div>
          <IconButton icon="x" label="Schließen" onClick={onClose} />
        </div>
        <div className="scroll-slim flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-[var(--color-line)] bg-[var(--color-subtle)] px-6 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-elevated)] px-4 py-2.5 text-sm text-[var(--color-ink)] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <span>{message}</span>
        <button onClick={onClose} className="text-[var(--color-faint)] hover:text-[var(--color-ink)]" aria-label="Schließen">
          <Icon name="x" size={14} />
        </button>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon?: IconName;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-line-strong)] bg-[var(--color-surface)] px-6 py-12 text-center">
      {icon && (
        <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-[var(--color-subtle)] text-[var(--color-faint)]">
          <Icon name={icon} size={20} />
        </span>
      )}
      <h3 className="text-sm font-semibold text-[var(--color-ink)]">{title}</h3>
      {children && <div className="mt-1 max-w-sm text-sm text-[var(--color-muted)]">{children}</div>}
    </div>
  );
}
