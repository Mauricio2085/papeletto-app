"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import {
  markOrderCompletedAction,
  markOrderReadyAction,
  printOrderAction,
  retryPrintOrderAction,
  type StaffOrderActionState,
} from "@/app/(admin)/admin/orders/actions";

const initialState: StaffOrderActionState = null;

type AdminStaffActionProps = {
  orderId: string;
  mode: "print" | "retry" | "ready" | "completed";
};

const ACTION_MAP = {
  print: printOrderAction,
  retry: retryPrintOrderAction,
  ready: markOrderReadyAction,
  completed: markOrderCompletedAction,
} as const;

const LABELS: Record<AdminStaffActionProps["mode"], { pending: string; idle: string }> = {
  print: { pending: "Enviando…", idle: "Imprimir" },
  retry: { pending: "Reintentando…", idle: "Reintentar impresión" },
  ready: { pending: "Marcando…", idle: "Marcar listo" },
  completed: { pending: "Marcando…", idle: "Marcar completado" },
};

export function AdminStaffAction({ orderId, mode }: AdminStaffActionProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(ACTION_MAP[mode], initialState);

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  const labels = LABELS[mode];

  return (
    <div className="space-y-3">
      <form action={formAction}>
        <input type="hidden" name="orderId" value={orderId} />
        <button
          type="submit"
          disabled={pending}
          className={
            mode === "completed"
              ? "rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
              : "rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-bright disabled:cursor-not-allowed disabled:opacity-60"
          }
        >
          {pending ? labels.pending : labels.idle}
        </button>
      </form>

      {state?.ok && (
        <p className="text-sm text-emerald-300">
          {state.message ?? `Estado: ${state.status}`}
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
