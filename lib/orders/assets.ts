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

/** Asset más útil para revisar antes de imprimir (print_ready o original). */
export function getPrintPreviewAsset(assets: Asset[]): Asset | undefined {
  const visible = visibleOrderAssets(assets);
  return visible.find((a) => a.kind === "print_ready") ?? visible.find((a) => a.kind === "original");
}

export function adminAssetUrl(orderId: string, assetId: string): string {
  return `/api/admin/orders/${orderId}/assets/${assetId}`;
}

export function isPdfAsset(mimeType: string, filename: string): boolean {
  return mimeType === "application/pdf" || filename.toLowerCase().endsWith(".pdf");
}

export function isTextAsset(mimeType: string, filename: string): boolean {
  return mimeType === "text/plain" || filename.toLowerCase().endsWith(".txt");
}
