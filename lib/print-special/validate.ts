import path from "node:path";
import {
  SPECIAL_PRINT_ALLOWED_EXTENSIONS,
  SPECIAL_PRINT_ALLOWED_MIME,
  SPECIAL_PRINT_MAX_BYTES,
  resolveSpecialUploadMime,
} from "@/lib/print-special/constants";

export type ValidatedSpecialUpload = {
  filename: string;
  mimeType: string;
  byteSize: number;
};

export function validateSpecialPrintUpload(
  file: File | null,
): ValidatedSpecialUpload | { error: string } {
  if (!file || file.size === 0) {
    return { error: "Selecciona una imagen JPEG, PNG o WebP." };
  }

  if (file.size > SPECIAL_PRINT_MAX_BYTES) {
    return { error: "La imagen supera el límite de 12 MB." };
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!SPECIAL_PRINT_ALLOWED_EXTENSIONS.has(ext)) {
    return { error: "Solo se aceptan JPEG, PNG o WebP." };
  }

  const mimeType = resolveSpecialUploadMime(file.name, file.type || "");
  if (!SPECIAL_PRINT_ALLOWED_MIME.has(mimeType)) {
    return { error: "Tipo de imagen no permitido." };
  }

  const safeName = path.basename(file.name).replace(/[^\w.\-() ]+/g, "_");
  if (!safeName) {
    return { error: "Nombre de archivo inválido." };
  }

  return {
    filename: safeName,
    mimeType,
    byteSize: file.size,
  };
}

export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
