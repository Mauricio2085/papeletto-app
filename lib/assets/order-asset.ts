import type { Asset } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { readAssetBuffer } from "@/lib/storage/local";

export type OrderAssetRecord = Pick<
  Asset,
  "id" | "orderId" | "filename" | "mimeType" | "byteSize" | "storageKey" | "kind"
>;

export async function getOrderAsset(
  orderId: string,
  assetId: string,
): Promise<OrderAssetRecord | null> {
  return prisma.asset.findFirst({
    where: { id: assetId, orderId },
    select: {
      id: true,
      orderId: true,
      filename: true,
      mimeType: true,
      byteSize: true,
      storageKey: true,
      kind: true,
    },
  });
}

export async function readOrderAssetBuffer(
  orderId: string,
  assetId: string,
): Promise<{ asset: OrderAssetRecord; buffer: Buffer } | null> {
  const asset = await getOrderAsset(orderId, assetId);
  if (!asset) {
    return null;
  }

  const buffer = await readAssetBuffer(asset.storageKey);
  return { asset, buffer };
}

export function assetContentDisposition(filename: string, inline: boolean): string {
  const safeName = filename.replace(/[^\w.\-() ]+/g, "_") || "archivo";
  return `${inline ? "inline" : "attachment"}; filename="${safeName}"`;
}
