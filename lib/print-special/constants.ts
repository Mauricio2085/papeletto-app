import type { PaperSize } from "@/lib/print/paper-sizes";

export const SPECIAL_PRINT_MAX_BYTES = 12 * 1024 * 1024; // 12 MB

export const SPECIAL_PRINT_ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const SPECIAL_PRINT_ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
]);

export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;

/** Target print DPI for embedded photo layouts. */
export const SPECIAL_PRINT_DPI = 300;

export function resolveSpecialUploadMime(
  filename: string,
  browserMime: string,
): string {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return browserMime;
}

export type SpecialLayoutPresetId = "photo_10x15";

export type SpecialLayoutPreset = {
  id: SpecialLayoutPresetId;
  /** PriceConfig key */
  priceKey: string;
  label: string;
  description: string;
  /** Photo box width in mm (physical print area). */
  widthMm: number;
  /** Photo box height in mm. */
  heightMm: number;
  /** Allowed sheets for this preset. */
  paperSizes: PaperSize[];
};

/**
 * Fixed MVP catalog. Photo presets are laid out on carta/oficio sheets.
 */
export const SPECIAL_LAYOUT_PRESETS: Record<
  SpecialLayoutPresetId,
  SpecialLayoutPreset
> = {
  photo_10x15: {
    id: "photo_10x15",
    priceKey: "special.10x15",
    label: "Foto 10×15",
    description: "Una foto redimensionada a 10×15 cm (sin recortar) centrada en la hoja.",
    widthMm: 100,
    heightMm: 150,
    paperSizes: ["carta", "oficio"],
  },
};

export const SPECIAL_LAYOUT_PRESET_IDS = Object.keys(
  SPECIAL_LAYOUT_PRESETS,
) as SpecialLayoutPresetId[];

export function isSpecialLayoutPresetId(
  value: string,
): value is SpecialLayoutPresetId {
  return value in SPECIAL_LAYOUT_PRESETS;
}

export function getSpecialLayoutPreset(
  id: SpecialLayoutPresetId,
): SpecialLayoutPreset {
  return SPECIAL_LAYOUT_PRESETS[id];
}

export function parseSpecialLayoutPreset(
  raw: string | null | undefined,
): SpecialLayoutPresetId | null {
  const normalized = String(raw ?? "").trim();
  return isSpecialLayoutPresetId(normalized) ? normalized : null;
}

/** mm → PDF points (1 inch = 25.4 mm = 72 pt). */
export function mmToPoints(mm: number): number {
  return (mm / 25.4) * 72;
}

/** Physical size in pixels at target DPI. */
export function mmToPixels(mm: number, dpi: number = SPECIAL_PRINT_DPI): number {
  return Math.round((mm / 25.4) * dpi);
}
