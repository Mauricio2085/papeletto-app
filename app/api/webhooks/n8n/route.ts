import { NextResponse } from "next/server";
import { verifyN8nSignature } from "@/lib/n8n/client";

export const runtime = "nodejs";

/**
 * n8n callback endpoint. Full DocumentJob handling lands with CV / derecho flows.
 */
export async function POST(request: Request) {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "N8N_WEBHOOK_SECRET no configurado" },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-papeletto-signature") ?? "";

  if (!verifyN8nSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  // Placeholder: parse jobId and update DocumentJob in later phase
  return NextResponse.json({ ok: true, received: true });
}
