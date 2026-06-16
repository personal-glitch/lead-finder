"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export interface ConfirmOptions {
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}
type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const Ctx = createContext<ConfirmFn>(async () => false);
/** In-App-Bestätigung statt window.confirm(). `if (!(await confirm({...}))) return;` */
export const useConfirm = () => useContext(Ctx);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => new Promise<boolean>((resolve) => setState({ ...opts, resolve })), []);
  const finish = (v: boolean) => { setState((s) => { s?.resolve(v); return null; }); };

  return (
    <Ctx.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={!!state}
        title={state?.title ?? "Bestätigen"}
        message={state?.message ?? ""}
        confirmLabel={state?.confirmLabel}
        cancelLabel={state?.cancelLabel}
        danger={state?.danger ?? true}
        onConfirm={() => finish(true)}
        onClose={() => finish(false)}
      />
    </Ctx.Provider>
  );
}
