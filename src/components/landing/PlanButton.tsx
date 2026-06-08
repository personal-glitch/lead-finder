"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { cx } from "@/components/ui";
import { Icon } from "@/components/icons";

/**
 * Wählt ein Paket.
 * - Auth-Modus (`signupHref` gesetzt): führt zur Registrierung, Paket vorgewählt.
 * - Demo-Modus (kein Auth konfiguriert): speichert das Paket direkt und öffnet das Tool.
 */
export function PlanButton({
  plan,
  label,
  highlight,
  signupHref,
}: {
  plan: string;
  label: string;
  highlight?: boolean;
  signupHref?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const choose = async () => {
    setBusy(true);
    if (signupHref) {
      router.push(`${signupHref}?plan=${plan}`);
      return;
    }
    try {
      await api("/api/settings", { method: "PATCH", json: { plan } });
    } catch {
      /* Auswahl darf den Weg ins Tool nicht blockieren */
    }
    router.push("/dashboard");
  };

  return (
    <button
      onClick={choose}
      disabled={busy}
      className={cx(
        "mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-center text-sm font-medium disabled:opacity-60",
        highlight
          ? "bg-[var(--color-brand)] font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]"
          : "border border-[var(--color-line-strong)] text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]",
      )}
    >
      {busy ? "…" : <>{label}{highlight && <Icon name="chevronRight" size={15} />}</>}
    </button>
  );
}
