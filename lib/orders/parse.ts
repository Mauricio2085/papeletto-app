export type StandardPrintPricingSnapshot = {
  service: string;
  priceKey: string;
  pageCount: number;
  copies: number;
  unitPriceCents: number;
  subtotalCents: number;
  totalCents: number;
};

export type OrderMetadata = {
  filename?: string;
  copies?: number;
  mimeType?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
    pageCount,
    copies,
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
    mimeType: typeof value.mimeType === "string" ? value.mimeType : undefined,
  };
}
