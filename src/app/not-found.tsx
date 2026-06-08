import Link from "next/link";
import { Icon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-brand)] text-[var(--color-on-brand)]">
        <Icon name="agents" size={26} strokeWidth={2.2} />
      </span>
      <div className="mt-6 text-5xl font-semibold tracking-tight tnum">404</div>
      <h1 className="mt-2 text-lg font-semibold">Seite nicht gefunden</h1>
      <p className="mt-1 max-w-sm text-sm text-[var(--color-muted)]">
        Diese Seite gibt es nicht (mehr). Vielleicht hilft dir die Startseite weiter.
      </p>
      <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
        Zur Startseite
      </Link>
    </div>
  );
}
