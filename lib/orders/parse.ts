import type { PaperSize } from "@/lib/print/paper-sizes";
import { isPaperSize } from "@/lib/print/paper-sizes";
import {
  isSpecialLayoutPresetId,
  type SpecialLayoutPresetId,
} from "@/lib/print-special/constants";

export type StandardPrintPricingSnapshot = {
  service: string;
  priceKey: string;
  paperSize?: PaperSize;
  pageCount: number;
  copies: number;
  unitPriceCents: number;
  subtotalCents: number;
  totalCents: number;
};

export type SpecialPrintPricingSnapshot = {
  service: string;
  priceKey: string;
  paperSize?: PaperSize;
  layoutPreset?: SpecialLayoutPresetId;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
  totalCents: number;
};

export type OrderMetadata = {
  filename?: string;
  copies?: number;
  quantity?: number;
  mimeType?: string;
  paperSize?: PaperSize;
  detectedPaperSize?: PaperSize;
  paperSizeMismatch?: boolean;
  layoutPreset?: SpecialLayoutPresetId;
  layoutPresetLabel?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePaperSizeField(value: unknown): PaperSize | undefined {
  if (typeof value === "string" && isPaperSize(value)) {
    return value;
  }
  return undefined;
}

function parseLayoutPresetField(value: unknown): SpecialLayoutPresetId | undefined {
  if (typeof value === "string" && isSpecialLayoutPresetId(value)) {
    return value;
  }
  return undefined;
}

export function parseStandardPrintSnapshot(
  value: unknown,
): StandardPrintPricingSnapshot | null {
  if (!isRecord(value)) {
    return null;
  }

  const { pageCount, copies, unitPriceCents, subtotalCents, totalCents } = value;

  if (
    typeof pageCount !== "number" ||
    typeof copies !== "number" ||
    typeof unitPriceCents !== "number" ||
    typeof subtotalCents !== "number" ||
    typeof totalCents !== "number"
  ) {
    return null;
  }

  return {
    service: typeof value.service === "string" ? value.service : "PRINT_STANDARD",
    priceKey: typeof value.priceKey === "string" ? value.priceKey : "",
    paperSize: parsePaperSizeField(value.paperSize),
    pageCount,
    copies,
    unitPriceCents,
    subtotalCents,
    totalCents,
  };
}

export function parseSpecialPrintSnapshot(
  value: unknown,
): SpecialPrintPricingSnapshot | null {
  if (!isRecord(value)) {
    return null;
  }

  const { quantity, unitPriceCents, subtotalCents, totalCents } = value;

  if (
    typeof quantity !== "number" ||
    typeof unitPriceCents !== "number" ||
    typeof subtotalCents !== "number" ||
    typeof totalCents !== "number"
  ) {
    return null;
  }

  return {
    service: typeof value.service === "string" ? value.service : "PRINT_SPECIAL",
    priceKey: typeof value.priceKey === "string" ? value.priceKey : "",
    paperSize: parsePaperSizeField(value.paperSize),
    layoutPreset: parseLayoutPresetField(value.layoutPreset),
    quantity,
    unitPriceCents,
    subtotalCents,
    totalCents,
  };
}

export function parseOrderMetadata(value: unknown): OrderMetadata {
  if (!isRecord(value)) {
    return {};
  }

  return {
    filename: typeof value.filename === "string" ? value.filename : undefined,
    copies: typeof value.copies === "number" ? value.copies : undefined,
    quantity: typeof value.quantity === "number" ? value.quantity : undefined,
    mimeType: typeof value.mimeType === "string" ? value.mimeType : undefined,
    paperSize: parsePaperSizeField(value.paperSize),
    detectedPaperSize: parsePaperSizeField(value.detectedPaperSize),
    paperSizeMismatch:
      typeof value.paperSizeMismatch === "boolean" ? value.paperSizeMismatch : undefined,
    layoutPreset: parseLayoutPresetField(value.layoutPreset),
    layoutPresetLabel:
      typeof value.layoutPresetLabel === "string" ? value.layoutPresetLabel : undefined,
  };
}

export function resolveOrderPaperSize(
  metadata: OrderMetadata,
  snapshot: { paperSize?: PaperSize } | null,
): PaperSize | undefined {
  return metadata.paperSize ?? snapshot?.paperSize;
}
