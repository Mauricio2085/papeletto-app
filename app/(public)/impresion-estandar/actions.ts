"use server";

import {
  paperSizeLabel,
  parsePaperSize,
} from "@/lib/print/paper-sizes";
import {
  MAX_COPIES,
  MIN_COPIES,
} from "@/lib/print-standard/constants";
import { confirmStandardPrintQuote } from "@/lib/print-standard/confirm-order";
import { createStandardPrintQuoteOrder } from "@/lib/print-standard/create-quote-order";
import {
  fileToBuffer,
  validateStandardPrintUpload,
} from "@/lib/print-standard/validate";
import type { PaperSize } from "@/lib/print/paper-sizes";

export type StandardPrintFormState =
  | {
      ok: true;
      orderId: string;
      filename: string;
      pageCount: number;
      copies: number;
      unitPriceCents: number;
      totalCents: number;
      paperSize: PaperSize;
      paperSizeLabel: string;
      paperSizeWarning?: string;
      paperSizeMismatch?: boolean;
      confirmed?: boolean;
      confirmError?: string;
    }
  | {
      ok: false;
      error: string;
    }
  | null;

function parseCopies(raw: FormDataEntryValue | null): number | { error: string } {
  const value = Number(String(raw ?? "1"));
  if (!Number.isInteger(value) || value < MIN_COPIES || value > MAX_COPIES) {
    return { error: `Las copias deben estar entre ${MIN_COPIES} y ${MAX_COPIES}.` };
  }
  return value;
}

function parsePaperSizeInput(raw: FormDataEntryValue | null): PaperSize | { error: string } {
  const parsed = parsePaperSize(String(raw ?? ""));
  if (!parsed) {
    return { error: "Selecciona tamaño de hoja: carta u oficio." };
  }
  return parsed;
}

async function handleQuote(formData: FormData): Promise<StandardPrintFormState> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Selecciona un archivo PDF, .txt o Word (.docx)." };
  }

  const copiesResult = parseCopies(formData.get("copies"));
  if (typeof copiesResult !== "number") {
    return { ok: false, error: copiesResult.error };
  }

  const paperSizeResult = parsePaperSizeInput(formData.get("paperSize"));
  if (typeof paperSizeResult !== "string") {
    return { ok: false, error: paperSizeResult.error };
  }

  const validated = validateStandardPrintUpload(file);
  if ("error" in validated) {
    return { ok: false, error: validated.error };
  }

  try {
    const buffer = await fileToBuffer(file);
    const result = await createStandardPrintQuoteOrder({
      buffer,
      filename: validated.filename,
      mimeType: validated.mimeType,
      byteSize: file.size,
      copies: copiesResult,
      paperSize: paperSizeResult,
    });

    return {
      ok: true,
      orderId: result.orderId,
      filename: result.filename,
      pageCount: result.quote.pageCount,
      copies: result.quote.copies,
      unitPriceCents: result.quote.unitPriceCents,
      totalCents: result.quote.totalCents,
      paperSize: result.paperSize,
      paperSizeLabel: paperSizeLabel(result.paperSize),
      paperSizeWarning: result.paperSizeWarning,
      paperSizeMismatch: result.paperSizeMismatch,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo generar la cotización.";
    return { ok: false, error: message };
  }
}

async function handleConfirm(
  prev: StandardPrintFormState,
  formData: FormData,
): Promise<StandardPrintFormState> {
  if (!prev?.ok) {
    return { ok: false, error: "No hay cotización para confirmar." };
  }

  const orderId = String(formData.get("orderId") ?? prev.orderId);
  if (!orderId || orderId !== prev.orderId) {
    return { ok: false, error: "Referencia de pedido inválida." };
  }

  try {
    await confirmStandardPrintQuote(orderId);

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

export async function standardPrintFormAction(
  prev: StandardPrintFormState,
  formData: FormData,
): Promise<StandardPrintFormState> {
  const intent = String(formData.get("intent") ?? "quote");
  if (intent === "confirm") {
    return handleConfirm(prev, formData);
  }
  return handleQuote(formData);
}
