import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { PAPER_DIMENSIONS, type PaperSize } from "@/lib/print/paper-sizes";
import {
  getSpecialLayoutPreset,
  mmToPixels,
  mmToPoints,
  type SpecialLayoutPresetId,
} from "@/lib/print-special/constants";

export type PrintReadyResult = {
  pdfBuffer: Buffer;
  filename: string;
  widthPx: number;
  heightPx: number;
};

/**
 * Resize image to fit inside the photo box (no crop), embed centered on carta/oficio PDF.
 * If aspect ratio differs from the preset, the image keeps proportions and sits centered
 * within the 10×15 (or preset) area — with empty margins, not cropped edges.
 */
export async function buildSpecialPrintReadyPdf(input: {
  imageBuffer: Buffer;
  originalFilename: string;
  layoutPreset: SpecialLayoutPresetId;
  paperSize: PaperSize;
}): Promise<PrintReadyResult> {
  const preset = getSpecialLayoutPreset(input.layoutPreset);
  if (!preset.paperSizes.includes(input.paperSize)) {
    throw new Error("Este preset no está disponible para la hoja elegida.");
  }

  const targetW = mmToPixels(preset.widthMm);
  const targetH = mmToPixels(preset.heightMm);

  let jpeg: Buffer;
  let imgW: number;
  let imgH: number;
  try {
    const resized = await sharp(input.imageBuffer)
      .rotate()
      .resize(targetW, targetH, {
        fit: "inside",
        withoutEnlargement: false,
      })
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });

    jpeg = resized.data;
    imgW = resized.info.width;
    imgH = resized.info.height;
  } catch {
    throw new Error(
      "No se pudo procesar la imagen. Prueba con otro JPEG, PNG o WebP.",
    );
  }

  const page = PAPER_DIMENSIONS[input.paperSize];
  const boxW = mmToPoints(preset.widthMm);
  const boxH = mmToPoints(preset.heightMm);

  // Map resized pixels → points inside the physical photo box (same scale as 300 DPI).
  const drawW = (imgW / targetW) * boxW;
  const drawH = (imgH / targetH) * boxH;
  const x = (page.widthPt - drawW) / 2;
  const y = (page.heightPt - drawH) / 2;

  const pdf = await PDFDocument.create();
  const pdfPage = pdf.addPage([page.widthPt, page.heightPt]);
  const embedded = await pdf.embedJpg(jpeg);
  pdfPage.drawImage(embedded, {
    x,
    y,
    width: drawW,
    height: drawH,
  });

  const bytes = await pdf.save();
  const baseName = input.originalFilename.replace(/\.[^.]+$/, "") || "foto";
  const filename = `${baseName}-${preset.id}-${input.paperSize}.pdf`;

  return {
    pdfBuffer: Buffer.from(bytes),
    filename,
    widthPx: imgW,
    heightPx: imgH,
  };
}
