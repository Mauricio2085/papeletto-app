"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import {
  printOrderAction,
  retryPrintOrderAction,
  type StaffPrintState,
} from "@/app/(admin)/admin/orders/actions";

const initialState: StaffPrintState = null;

type AdminPrintActionsProps = {
  orderId: string;
  mode: "print" | "retry";
};

export function AdminPrintActions({ orderId, mode }: AdminPrintActionsProps) {
  const router = useRouter();
  const action = mode === "print" ? printOrderAction : retryPrintOrderAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  const label =
    mode === "print"
      ? pending
        ? "Enviando…"
        : "Imprimir"
      : pending
        ? "Reintentando…"
        : "Reintentar impresión";

  return (
    <div className="space-y-3">
      <form action={formAction}>
        <input type="hidden" name="orderId" value={orderId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {label}
        </button>
      </form>

      {state?.ok && (
        <p className="text-sm text-emerald-300">
          {mode === "print" ? "Enviado a impresora" : "Reintento enviado"}
          {state.dryRun ? " (dry-run)" : ""}. Estado: {state.status}
          {state.printNodeJobId ? (
            <>
              {" "}
              · Job <span className="font-mono text-xs">{state.printNodeJobId}</span>
            </>
          ) : null}
        </p>
      )}

      {state && !state.ok && (
        <p role="alert" className="text-sm text-red-300">
          {state.error}
        </p>
      )}
    </div>
  );
}
