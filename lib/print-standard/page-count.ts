import { PDFDocument } from "pdf-lib";
import {
  TEXT_CHARS_PER_PAGE,
  isDocxMime,
} from "@/lib/print-standard/constants";

export async function countPdfPages(buffer: Buffer): Promise<number> {
  try {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const count = doc.getPageCount();
    return count > 0 ? count : 1;
  } catch {
    throw new Error("No se pudo leer el PDF. Verifica que el archivo no esté dañado.");
  }
}

export function estimateTextPages(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 1;
  }
  return Math.max(1, Math.ceil(trimmed.length / TEXT_CHARS_PER_PAGE));
}

export async function countPages(buffer: Buffer, mimeType: string): Promise<number> {
  if (mimeType === "application/pdf") {
    return countPdfPages(buffer);
  }
  if (isDocxMime(mimeType)) {
    throw new Error(
      "Los archivos Word deben convertirse a PDF antes de contar páginas.",
    );
  }
  const text = buffer.toString("utf8");
  return estimateTextPages(text);
}
