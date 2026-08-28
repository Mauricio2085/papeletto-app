import {
  DEFAULT_PAPER_SIZE,
  type PaperSize,
  printBwPriceKey,
} from "@/lib/print/paper-sizes";

export const STANDARD_PRINT_MAX_BYTES = 15 * 1024 * 1024; // 15 MB

export const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const STANDARD_PRINT_ALLOWED_MIME = new Set([
  "application/pdf",
  "text/plain",
  DOCX_MIME,
]);

export const STANDARD_PRINT_ALLOWED_EXTENSIONS = new Set([".pdf", ".txt", ".docx"]);

/** Legacy Word binary — explicitly rejected. */
export const LEGACY_DOC_EXTENSION = ".doc";

/** Default price key for B&W carta per page (seed). */
export const STANDARD_PRINT_PRICE_KEY = printBwPriceKey(DEFAULT_PAPER_SIZE);

/** ~3000 chars per carta page at default font (estimate for .txt). */
export const TEXT_CHARS_PER_PAGE_CARTA = 3000;

/** ~4000 chars per oficio page (longer sheet, same width). */
export const TEXT_CHARS_PER_PAGE_OFICIO = 4000;

export function textCharsPerPage(paperSize: PaperSize): number {
  return paperSize === "oficio"
    ? TEXT_CHARS_PER_PAGE_OFICIO
    : TEXT_CHARS_PER_PAGE_CARTA;
}

export const MIN_COPIES = 1;
export const MAX_COPIES = 99;

export function isDocxMime(mimeType: string): boolean {
  return mimeType === DOCX_MIME;
}

export function isDocxFilename(filename: string): boolean {
  return filename.toLowerCase().endsWith(".docx");
}

export function resolveUploadMime(filename: string, browserMime: string): string {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  if (ext === ".pdf") {
    return "application/pdf";
  }
  if (ext === ".txt") {
    return "text/plain";
  }
  if (ext === ".docx") {
    return DOCX_MIME;
  }
  return browserMime;
}
