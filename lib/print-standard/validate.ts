import path from "node:path";
import {
  STANDARD_PRINT_ALLOWED_EXTENSIONS,
  STANDARD_PRINT_ALLOWED_MIME,
  STANDARD_PRINT_MAX_BYTES,
} from "@/lib/print-standard/constants";

export type ValidatedUpload = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  byteSize: number;
};

export function validateStandardPrintUpload(
  file: File | null,
): ValidatedUpload | { error: string } {
  if (!file || file.size === 0) {
    return { error: "Selecciona un archivo PDF o de texto." };
  }

  if (file.size > STANDARD_PRINT_MAX_BYTES) {
    return { error: "El archivo supera el límite de 15 MB." };
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!STANDARD_PRINT_ALLOWED_EXTENSIONS.has(ext)) {
    return { error: "Solo se aceptan archivos PDF o .txt." };
  }

  const mimeType = file.type || (ext === ".pdf" ? "application/pdf" : "text/plain");
  if (!STANDARD_PRINT_ALLOWED_MIME.has(mimeType)) {
    return { error: "Tipo de archivo no permitido." };
  }

  const safeName = path.basename(file.name).replace(/[^\w.\-() ]+/g, "_");
  if (!safeName) {
    return { error: "Nombre de archivo inválido." };
  }

  return {
    buffer: Buffer.from([]),
    filename: safeName,
    mimeType,
    byteSize: file.size,
  };
}

export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
