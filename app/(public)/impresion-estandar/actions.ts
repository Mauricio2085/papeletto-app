"use server";

import {
  MAX_COPIES,
  MIN_COPIES,
} from "@/lib/print-standard/constants";
import { createStandardPrintQuoteOrder } from "@/lib/print-standard/create-quote-order";
import {
  fileToBuffer,
  validateStandardPrintUpload,
} from "@/lib/print-standard/validate";

export type StandardPrintQuoteState =
  | {
      ok: true;
      orderId: string;
      filename: string;
      pageCount: number;
      copies: number;
      unitPriceCents: number;
      totalCents: number;
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

export async function quoteStandardPrintAction(
  _prev: StandardPrintQuoteState,
  formData: FormData,
): Promise<StandardPrintQuoteState> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Selecciona un archivo PDF o de texto." };
  }

  const copiesResult = parseCopies(formData.get("copies"));
  if (typeof copiesResult !== "number") {
    return { ok: false, error: copiesResult.error };
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
    });

    return {
      ok: true,
      orderId: result.orderId,
      filename: result.filename,
      pageCount: result.quote.pageCount,
      copies: result.quote.copies,
      unitPriceCents: result.quote.unitPriceCents,
      totalCents: result.quote.totalCents,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo generar la cotización.";
    return { ok: false, error: message };
  }
}
