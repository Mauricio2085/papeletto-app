"use client";

import { useEffect, useState } from "react";

type PreviewState =
  | { kind: "pdf"; url: string; filename: string }
  | { kind: "text"; text: string; filename: string }
  | null;

interface FileUploadPreviewProps {
  fileInputId?: string;
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
        setPreview(null);
        return;
      }

      const isPdf =
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        setPreview((prev) => {
          if (prev?.kind === "pdf") {
            URL.revokeObjectURL(prev.url);
          }
          return { kind: "pdf", url: URL.createObjectURL(file), filename: file.name };
        });
        return;
      }

      void file.text().then((text) => {
        setPreview((prev) => {
          if (prev?.kind === "pdf") {
            URL.revokeObjectURL(prev.url);
          }
          const trimmed = text.trim();
          const excerpt =
            trimmed.length > 6000 ? `${trimmed.slice(0, 6000)}\n\n… (vista previa truncada)` : trimmed;
          return { kind: "text", text: excerpt || "(archivo vacío)", filename: file.name };
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
      if (preview?.kind === "pdf") {
        URL.revokeObjectURL(preview.url);
      }
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
