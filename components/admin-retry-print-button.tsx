"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import {
  retryPrintOrderAction,
  type RetryPrintState,
} from "@/app/(admin)/admin/orders/actions";

const initialState: RetryPrintState = null;

type AdminRetryPrintButtonProps = {
  orderId: string;
};

export function AdminRetryPrintButton({ orderId }: AdminRetryPrintButtonProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    retryPrintOrderAction,
    initialState,
  );

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="space-y-3">
      <form action={formAction}>
        <input type="hidden" name="orderId" value={orderId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Reintentando…" : "Reintentar impresión"}
        </button>
      </form>

      {state?.ok && (
        <p className="text-sm text-emerald-300">
          Reintento enviado
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
