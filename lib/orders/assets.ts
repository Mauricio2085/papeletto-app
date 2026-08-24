import type { Asset } from "@prisma/client";

/**
 * Oculta print_ready redundante cuando es copia del original PDF (pedidos legacy).
 */
export function visibleOrderAssets(assets: Asset[]): Asset[] {
  const original = assets.find((a) => a.kind === "original");
  if (!original || original.mimeType !== "application/pdf") {
    return assets;
  }

  return assets.filter((asset) => {
    if (asset.kind !== "print_ready") {
      return true;
    }
    const sameName = asset.filename === original.filename;
    const sameSize = asset.byteSize === original.byteSize;
    return !(sameName && sameSize);
  });
}
