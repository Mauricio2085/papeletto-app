/**
 * Gotenberg HTTP client (server-only) — LibreOffice .docx → PDF.
 */

function getGotenbergUrl(): string {
  const url = process.env.GOTENBERG_URL?.trim();
  if (!url) {
    throw new Error(
      "GOTENBERG_URL no está configurada. Ejecuta pnpm gotenberg:up y define la URL en .env.",
    );
  }
  return url.replace(/\/$/, "");
}

/**
 * Convert a .docx buffer to PDF via Gotenberg LibreOffice route.
 */
export async function convertDocxToPdf(
  buffer: Buffer,
  filename: string,
): Promise<Buffer> {
  const baseUrl = getGotenbergUrl();
  const form = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const safeName = filename.toLowerCase().endsWith(".docx")
    ? filename
    : `${filename}.docx`;
  form.append("files", blob, safeName);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/forms/libreoffice/convert`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(120_000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error(
        "La conversión del Word tardó demasiado. Intenta de nuevo o sube un PDF.",
      );
    }
    throw new Error(
      "No pudimos conectar con el convertidor de Word (Gotenberg). Verifica que esté en marcha.",
    );
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      "No pudimos abrir el Word. Prueba guardarlo de nuevo como .docx o sube un PDF." +
        (detail ? ` (${response.status})` : ""),
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength === 0) {
    throw new Error("La conversión del Word devolvió un PDF vacío.");
  }

  return Buffer.from(arrayBuffer);
}
