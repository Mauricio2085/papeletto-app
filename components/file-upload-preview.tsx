"use client";

import { useEffect, useState } from "react";

type PreviewState =
  | { kind: "pdf"; url: string; filename: string }
  | { kind: "text"; text: string; filename: string }
  | { kind: "docx"; filename: string }
  | null;

interface FileUploadPreviewProps {
  fileInputId?: string;
}

function revokePdfUrl(preview: PreviewState) {
  if (preview?.kind === "pdf") {
    URL.revokeObjectURL(preview.url);
  }
}

export function FileUploadPreview({ fileInputId = "file" }: FileUploadPreviewProps) {
  const [preview, setPreview] = useState<PreviewState>(null);

  useEffect(() => {
    const input = document.getElementById(fileInputId) as HTMLInputElement | null;
    if (!input) {
      return;
    }

    function handleChange() {
      const file = input?.files?.[0];
      if (!file) {
        setPreview((prev) => {
          revokePdfUrl(prev);
          return null;
        });
        return;
      }

      const name = file.name.toLowerCase();
      const isPdf = file.type === "application/pdf" || name.endsWith(".pdf");
      const isDocx =
        name.endsWith(".docx") ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if (isPdf) {
        setPreview((prev) => {
          revokePdfUrl(prev);
          return { kind: "pdf", url: URL.createObjectURL(file), filename: file.name };
        });
        return;
      }

      if (isDocx) {
        setPreview((prev) => {
          revokePdfUrl(prev);
          return { kind: "docx", filename: file.name };
        });
        return;
      }

      void file.text().then((text) => {
        setPreview((prev) => {
          revokePdfUrl(prev);
          const trimmed = text.trim();
          const excerpt =
            trimmed.length > 6000
              ? `${trimmed.slice(0, 6000)}\n\n… (vista previa truncada)`
              : trimmed;
          return {
            kind: "text",
            text: excerpt || "(archivo vacío)",
            filename: file.name,
          };
        });
      });
    }

    input.addEventListener("change", handleChange);
    return () => {
      input.removeEventListener("change", handleChange);
    };
  }, [fileInputId]);

  useEffect(() => {
    return () => {
      revokePdfUrl(preview);
    };
  }, [preview]);

  if (!preview) {
    return null;
  }

  return (
    <div className="space-y-2 rounded-xl border border-line bg-background/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        Vista previa · {preview.filename}
      </p>
      {preview.kind === "pdf" ? (
        <iframe
          title={`Vista previa de ${preview.filename}`}
          src={preview.url}
          className="h-[min(28rem,60vh)] w-full rounded-lg border border-line bg-white"
        />
      ) : preview.kind === "docx" ? (
        <div className="rounded-lg border border-brand/30 bg-brand/5 px-4 py-6 text-sm text-muted">
          <p className="font-medium text-foreground">Documento Word (.docx)</p>
          <p className="mt-2">
            Al cotizar lo convertimos a PDF para contar páginas e imprimir. La vista
            previa del PDF aparecerá en el panel del staff.
          </p>
        </div>
      ) : (
        <pre className="max-h-[min(28rem,60vh)] overflow-auto rounded-lg border border-line bg-background p-4 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
          {preview.text}
        </pre>
      )}
      <p className="text-xs text-muted">
        Revisa que sea el archivo correcto antes de calcular la cotización.
      </p>
    </div>
  );
}
