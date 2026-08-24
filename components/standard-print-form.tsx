"use client";

import { useActionState } from "react";
import {
  standardPrintFormAction,
  type StandardPrintFormState,
} from "@/app/(public)/impresion-estandar/actions";
import { FileUploadPreview } from "@/components/file-upload-preview";
import { formatCop } from "@/lib/format/currency";
import { MAX_COPIES, MIN_COPIES } from "@/lib/print-standard/constants";

const initialState: StandardPrintFormState = null;

export function StandardPrintForm() {
  const [state, formAction, pending] = useActionState(
    standardPrintFormAction,
    initialState,
  );

  return (
    <div className="space-y-6">
      {!state?.ok && (
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="intent" value="quote" />
          <div className="space-y-2">
            <label htmlFor="file" className="block text-sm font-medium text-foreground">
              Archivo
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              required
              className="block w-full cursor-pointer rounded-xl border border-line bg-background px-4 py-3 text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-brand/15 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-bright"
            />
            <p className="text-xs text-muted">PDF o .txt · máximo 15 MB</p>
          </div>

          <FileUploadPreview fileInputId="file" />

          <div className="space-y-2">
            <label htmlFor="copies" className="block text-sm font-medium text-foreground">
              Copias
            </label>
            <input
              id="copies"
              name="copies"
              type="number"
              min={MIN_COPIES}
              max={MAX_COPIES}
              defaultValue={1}
              required
              className="w-full max-w-[8rem] rounded-xl border border-line bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/25"
            />
          </div>

          {state && !state.ok && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-bright disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {pending ? "Calculando…" : "Calcular cotización"}
          </button>
        </form>
      )}

      {state?.ok && (
        <div className="space-y-4 rounded-2xl border border-brand/30 bg-brand/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-bright">
            {state.confirmed ? "Cotización autorizada" : "Cotización lista"}
          </p>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Archivo</dt>
              <dd className="font-medium text-foreground">{state.filename}</dd>
            </div>
            <div>
              <dt className="text-muted">Referencia</dt>
              <dd className="font-mono text-xs text-foreground">{state.orderId}</dd>
            </div>
            <div>
              <dt className="text-muted">Páginas</dt>
              <dd className="font-medium text-foreground">{state.pageCount}</dd>
            </div>
            <div>
              <dt className="text-muted">Copias</dt>
              <dd className="font-medium text-foreground">{state.copies}</dd>
            </div>
            <div>
              <dt className="text-muted">Precio por página</dt>
              <dd className="font-medium text-foreground">
                {formatCop(state.unitPriceCents)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Total</dt>
              <dd className="text-lg font-bold text-brand-bright">
                {formatCop(state.totalCents)}
              </dd>
            </div>
          </dl>

          {state.confirmError && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {state.confirmError}
            </p>
          )}

          {state.confirmed && (
            <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              Autorizaste el valor cotizado. En mostrador confirmarán el pago y
              enviarán la impresión desde el panel.
            </p>
          )}

          {!state.confirmed && (
            <form action={formAction}>
              <input type="hidden" name="intent" value="confirm" />
              <input type="hidden" name="orderId" value={state.orderId} />
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-bright disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
              >
                {pending ? "Confirmando…" : "Autorizar cotización"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
