import { PDFDocument } from "pdf-lib";
import {
  isDocxMime,
  textCharsPerPage,
} from "@/lib/print-standard/constants";
import type { PaperSize } from "@/lib/print/paper-sizes";

export async function countPdfPages(buffer: Buffer): Promise<number> {
  try {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const count = doc.getPageCount();
    return count > 0 ? count : 1;
  } catch {
    throw new Error("No se pudo leer el PDF. Verifica que el archivo no esté dañado.");
  }
}

export function estimateTextPages(text: string, paperSize: PaperSize): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 1;
  }
  const charsPerPage = textCharsPerPage(paperSize);
  return Math.max(1, Math.ceil(trimmed.length / charsPerPage));
}

export async function countPages(
  buffer: Buffer,
  mimeType: string,
  paperSize: PaperSize,
): Promise<number> {
  if (mimeType === "application/pdf") {
    return countPdfPages(buffer);
  }
  if (isDocxMime(mimeType)) {
    throw new Error(
      "Los archivos Word deben convertirse a PDF antes de contar páginas.",
    );
  }
  const text = buffer.toString("utf8");
  return estimateTextPages(text, paperSize);
}
