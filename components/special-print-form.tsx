"use client";

import { useActionState, useEffect, useState, type ChangeEvent } from "react";
import {
  specialPrintFormAction,
  type SpecialPrintFormState,
} from "@/app/(public)/impresion-especial/actions";
import { formatCop } from "@/lib/format/currency";
import { PAPER_SIZES, paperSizeLabel } from "@/lib/print/paper-sizes";
import {
  MAX_QUANTITY,
  MIN_QUANTITY,
  SPECIAL_LAYOUT_PRESETS,
  type SpecialLayoutPresetId,
} from "@/lib/print-special/constants";

const initialState: SpecialPrintFormState = null;

const PRESET_IDS = Object.keys(SPECIAL_LAYOUT_PRESETS) as SpecialLayoutPresetId[];

export function SpecialPrintForm() {
  const [state, formAction, pending] = useActionState(
    specialPrintFormAction,
    initialState,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  return (
    <div className="space-y-6">
      {!state?.ok && (
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="intent" value="quote" />

          <div className="space-y-2">
            <label htmlFor="file" className="block text-sm font-medium text-foreground">
              Foto
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              required
              onChange={handleFileChange}
              className="block w-full cursor-pointer rounded-xl border border-line bg-background px-4 py-3 text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-brand/15 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-bright"
            />
            <p className="text-xs text-muted">JPEG, PNG o WebP · máximo 12 MB</p>
          </div>

          {previewUrl && (
            <div className="overflow-hidden rounded-xl border border-line bg-background/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Vista previa de la foto"
                className="mx-auto max-h-64 w-auto object-contain"
              />
            </div>
          )}

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">Layout</legend>
            <div className="space-y-3">
              {PRESET_IDS.map((id) => {
                const preset = SPECIAL_LAYOUT_PRESETS[id];
                return (
                  <label
                    key={id}
                    className="flex cursor-pointer gap-3 rounded-xl border border-line bg-background/40 px-4 py-3 text-sm"
                  >
                    <input
                      type="radio"
                      name="layoutPreset"
                      value={id}
                      defaultChecked={id === "photo_10x15"}
                      required
                      className="mt-0.5 size-4 accent-brand"
                    />
                    <span>
                      <span className="font-medium text-foreground">{preset.label}</span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {preset.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">Tamaño de hoja</legend>
            <div className="flex flex-wrap gap-4">
              {PAPER_SIZES.map((size) => (
                <label
                  key={size}
                  className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                >
                  <input
                    type="radio"
                    name="paperSize"
                    value={size}
                    defaultChecked={size === "carta"}
                    required
                    className="size-4 accent-brand"
                  />
                  {paperSizeLabel(size)}
                  <span className="text-xs text-muted">
                    {size === "carta" ? "8.5×11″" : "8.5×14″"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-foreground"
            >
              Cantidad
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={MIN_QUANTITY}
              max={MAX_QUANTITY}
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
            {pending ? "Generando layout…" : "Calcular cotización"}
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
              <dt className="text-muted">Layout</dt>
              <dd className="font-medium text-foreground">{state.layoutPresetLabel}</dd>
            </div>
            <div>
              <dt className="text-muted">Hoja</dt>
              <dd className="font-medium text-foreground">{state.paperSizeLabel}</dd>
            </div>
            <div>
              <dt className="text-muted">Cantidad</dt>
              <dd className="font-medium text-foreground">{state.quantity}</dd>
            </div>
            <div>
              <dt className="text-muted">Precio unitario</dt>
              <dd className="font-medium text-foreground">
                {formatCop(state.unitPriceCents)}
              </dd>
            </div>
            <div className="sm:col-span-2">
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
