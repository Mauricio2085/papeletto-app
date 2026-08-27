import path from "node:path";
import {
  LEGACY_DOC_EXTENSION,
  STANDARD_PRINT_ALLOWED_EXTENSIONS,
  STANDARD_PRINT_ALLOWED_MIME,
  STANDARD_PRINT_MAX_BYTES,
  resolveUploadMime,
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
    return { error: "Selecciona un archivo PDF, .txt o Word (.docx)." };
  }

  if (file.size > STANDARD_PRINT_MAX_BYTES) {
    return { error: "El archivo supera el límite de 15 MB." };
  }

  const ext = path.extname(file.name).toLowerCase();
  if (ext === LEGACY_DOC_EXTENSION) {
    return {
      error:
        "No se aceptan archivos .doc (Word antiguo). Guárdalo como .docx o exporta PDF.",
    };
  }

  if (!STANDARD_PRINT_ALLOWED_EXTENSIONS.has(ext)) {
    return { error: "Solo se aceptan PDF, .txt o .docx (Word)." };
  }

  const mimeType = resolveUploadMime(file.name, file.type || "");
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
