import { PDFDocument } from "pdf-lib";

export const PAPER_SIZES = ["carta", "oficio"] as const;

export type PaperSize = (typeof PAPER_SIZES)[number];

export const DEFAULT_PAPER_SIZE: PaperSize = "carta";

/** Match tolerance when reading PDF MediaBox (points). */
export const PAPER_SIZE_TOLERANCE_PT = 2;

export type PaperDimensions = {
  widthPt: number;
  heightPt: number;
};

export const PAPER_DIMENSIONS: Record<PaperSize, PaperDimensions> = {
  carta: { widthPt: 612, heightPt: 792 },
  oficio: { widthPt: 612, heightPt: 1008 },
};

export function isPaperSize(value: string): value is PaperSize {
  return value === "carta" || value === "oficio";
}

export function parsePaperSize(raw: string | null | undefined): PaperSize | null {
  const normalized = String(raw ?? "").trim().toLowerCase();
  return isPaperSize(normalized) ? normalized : null;
}

export function paperSizeLabel(size: PaperSize): string {
  return size === "carta" ? "Carta" : "Oficio";
}

export function printBwPriceKey(paperSize: PaperSize): string {
  return `print.bw.${paperSize}.page`;
}

export function matchPaperSizeFromDimensions(
  widthPt: number,
  heightPt: number,
): PaperSize | null {
  for (const size of PAPER_SIZES) {
    const dims = PAPER_DIMENSIONS[size];
    const portrait =
      Math.abs(widthPt - dims.widthPt) <= PAPER_SIZE_TOLERANCE_PT &&
      Math.abs(heightPt - dims.heightPt) <= PAPER_SIZE_TOLERANCE_PT;
    const landscape =
      Math.abs(widthPt - dims.heightPt) <= PAPER_SIZE_TOLERANCE_PT &&
      Math.abs(heightPt - dims.widthPt) <= PAPER_SIZE_TOLERANCE_PT;
    if (portrait || landscape) {
      return size;
    }
  }
  return null;
}

/**
 * Reads the first page MediaBox. Returns null if unknown or unreadable.
 */
export async function detectPaperSizeFromPdf(buffer: Buffer): Promise<PaperSize | null> {
  try {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    if (doc.getPageCount() === 0) {
      return null;
    }
    const { width, height } = doc.getPage(0).getSize();
    return matchPaperSizeFromDimensions(width, height);
  } catch {
    return null;
  }
}

export function paperSizeMismatchWarning(
  chosen: PaperSize,
  detected: PaperSize,
): string {
  return `El archivo parece ${paperSizeLabel(detected).toLowerCase()}, pero elegiste ${paperSizeLabel(chosen).toLowerCase()}. Si imprimes en otro tamaño puede escalarse o quedar con márgenes distintos.`;
}

export function unknownPaperSizeWarning(): string {
  return "No detectamos carta u oficio en el PDF (puede ser A4 u otro formato). Revisa la vista previa antes de autorizar.";
}
