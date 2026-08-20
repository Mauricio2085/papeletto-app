import { createHmac, timingSafeEqual } from "node:crypto";

export function signN8nPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyN8nSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expected = signN8nPayload(payload, secret);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function postN8nWebhook(
  url: string,
  body: unknown,
  secret: string,
): Promise<Response> {
  const payload = JSON.stringify(body);
  const signature = signN8nPayload(payload, secret);

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Papeletto-Signature": signature,
    },
    body: payload,
  });
}
