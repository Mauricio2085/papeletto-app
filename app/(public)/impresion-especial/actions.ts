"use server";

import {
  paperSizeLabel,
  parsePaperSize,
  type PaperSize,
} from "@/lib/print/paper-sizes";
import {
  MAX_QUANTITY,
  MIN_QUANTITY,
  parseSpecialLayoutPreset,
  type SpecialLayoutPresetId,
} from "@/lib/print-special/constants";
import { confirmSpecialPrintQuote } from "@/lib/print-special/confirm-order";
import { createSpecialPrintQuoteOrder } from "@/lib/print-special/create-quote-order";
import {
  fileToBuffer,
  validateSpecialPrintUpload,
} from "@/lib/print-special/validate";

export type SpecialPrintFormState =
  | {
      ok: true;
      orderId: string;
      filename: string;
      quantity: number;
      unitPriceCents: number;
      totalCents: number;
      paperSize: PaperSize;
      paperSizeLabel: string;
      layoutPreset: SpecialLayoutPresetId;
      layoutPresetLabel: string;
      confirmed?: boolean;
      confirmError?: string;
    }
  | {
      ok: false;
      error: string;
    }
  | null;

function parseQuantity(raw: FormDataEntryValue | null): number | { error: string } {
  const value = Number(String(raw ?? "1"));
  if (!Number.isInteger(value) || value < MIN_QUANTITY || value > MAX_QUANTITY) {
    return {
      error: `La cantidad debe estar entre ${MIN_QUANTITY} y ${MAX_QUANTITY}.`,
    };
  }
  return value;
}

function parsePaperSizeInput(
  raw: FormDataEntryValue | null,
): PaperSize | { error: string } {
  const parsed = parsePaperSize(String(raw ?? ""));
  if (!parsed) {
    return { error: "Selecciona tamaño de hoja: carta u oficio." };
  }
  return parsed;
}

function parseLayoutInput(
  raw: FormDataEntryValue | null,
): SpecialLayoutPresetId | { error: string } {
  const parsed = parseSpecialLayoutPreset(String(raw ?? ""));
  if (!parsed) {
    return { error: "Selecciona un layout del catálogo." };
  }
  return parsed;
}

async function handleQuote(formData: FormData): Promise<SpecialPrintFormState> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Selecciona una imagen JPEG, PNG o WebP." };
  }

  const quantityResult = parseQuantity(formData.get("quantity"));
  if (typeof quantityResult !== "number") {
    return { ok: false, error: quantityResult.error };
  }

  const paperSizeResult = parsePaperSizeInput(formData.get("paperSize"));
  if (typeof paperSizeResult !== "string") {
    return { ok: false, error: paperSizeResult.error };
  }

  const layoutResult = parseLayoutInput(formData.get("layoutPreset"));
  if (typeof layoutResult !== "string") {
    return { ok: false, error: layoutResult.error };
  }

  const validated = validateSpecialPrintUpload(file);
  if ("error" in validated) {
    return { ok: false, error: validated.error };
  }

  try {
    const buffer = await fileToBuffer(file);
    const result = await createSpecialPrintQuoteOrder({
      buffer,
      filename: validated.filename,
      mimeType: validated.mimeType,
      byteSize: file.size,
      quantity: quantityResult,
      paperSize: paperSizeResult,
      layoutPreset: layoutResult,
    });

    return {
      ok: true,
      orderId: result.orderId,
      filename: result.filename,
      quantity: result.quote.quantity,
      unitPriceCents: result.quote.unitPriceCents,
      totalCents: result.quote.totalCents,
      paperSize: result.paperSize,
      paperSizeLabel: paperSizeLabel(result.paperSize),
      layoutPreset: result.quote.layoutPreset,
      layoutPresetLabel: result.layoutPresetLabel,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo generar la cotización.";
    return { ok: false, error: message };
  }
}

async function handleConfirm(
  prev: SpecialPrintFormState,
  formData: FormData,
): Promise<SpecialPrintFormState> {
  if (!prev?.ok) {
    return { ok: false, error: "No hay cotización para confirmar." };
  }

  const orderId = String(formData.get("orderId") ?? prev.orderId);
  if (!orderId || orderId !== prev.orderId) {
    return { ok: false, error: "Referencia de pedido inválida." };
  }

  try {
    await confirmSpecialPrintQuote(orderId);
    return {
      ...prev,
      confirmed: true,
      confirmError: undefined,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo confirmar la cotización.";
    return {
      ...prev,
      confirmed: false,
      confirmError: message,
    };
  }
}

export async function specialPrintFormAction(
  prev: SpecialPrintFormState,
  formData: FormData,
): Promise<SpecialPrintFormState> {
  const intent = String(formData.get("intent") ?? "quote");
  if (intent === "confirm") {
    return handleConfirm(prev, formData);
  }
  return handleQuote(formData);
}
