import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { PAPER_DIMENSIONS, type PaperSize } from "@/lib/print/paper-sizes";

const FONT_SIZE = 11;
const LINE_HEIGHT = 14;
const MARGIN = 54;

/**
 * Build a simple PDF from plain text for PrintNode (print-ready).
 */
export async function textBufferToPdf(
  buffer: Buffer,
  paperSize: PaperSize,
): Promise<Buffer> {
  const { widthPt: PAGE_WIDTH, heightPt: PAGE_HEIGHT } = PAPER_DIMENSIONS[paperSize];
  const text = buffer.toString("utf8").replace(/\r\n/g, "\n");
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Courier);
  const maxWidth = PAGE_WIDTH - MARGIN * 2;
  const lines = wrapText(text, font, FONT_SIZE, maxWidth);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  for (const line of lines) {
    if (y < MARGIN + LINE_HEIGHT) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
    page.drawText(line.length > 0 ? line : " ", {
      x: MARGIN,
      y,
      size: FONT_SIZE,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= LINE_HEIGHT;
  }

  if (lines.length === 0) {
    page.drawText("(archivo vacío)", {
      x: MARGIN,
      y,
      size: FONT_SIZE,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

function wrapText(
  text: string,
  font: { widthOfTextAtSize: (t: string, size: number) => number },
  fontSize: number,
  maxWidth: number,
): string[] {
  const result: string[] = [];
  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    if (paragraph.length === 0) {
      result.push("");
      continue;
    }

    const words = paragraph.split(/\s+/);
    let current = "";

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
        current = candidate;
        continue;
      }

      if (current) {
        result.push(current);
      }

      if (font.widthOfTextAtSize(word, fontSize) <= maxWidth) {
        current = word;
      } else {
        let chunk = "";
        for (const ch of word) {
          const next = chunk + ch;
          if (font.widthOfTextAtSize(next, fontSize) <= maxWidth) {
            chunk = next;
          } else {
            if (chunk) result.push(chunk);
            chunk = ch;
          }
        }
        current = chunk;
      }
    }

    if (current) {
      result.push(current);
    }
  }

  return result;
}
