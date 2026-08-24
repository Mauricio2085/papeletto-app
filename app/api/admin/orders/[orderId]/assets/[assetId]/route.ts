import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  assetContentDisposition,
  readOrderAssetBuffer,
} from "@/lib/assets/order-asset";

type RouteParams = {
  params: Promise<{ orderId: string; assetId: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { orderId, assetId } = await params;
  const result = await readOrderAssetBuffer(orderId, assetId);

  if (!result) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  const { asset, buffer } = result;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Length": String(buffer.byteLength),
      "Content-Disposition": assetContentDisposition(asset.filename, true),
      "Cache-Control": "private, no-store",
    },
  });
}
