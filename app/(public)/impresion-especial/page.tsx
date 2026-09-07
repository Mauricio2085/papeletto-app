import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { PaperCard } from "@/components/paper-card";
import { SpecialPrintForm } from "@/components/special-print-form";

export const metadata = { title: "Impresión especial" };

export default function ImpresionEspecialPage() {
  return (
    <PageShell showFooter={false}>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted transition hover:text-brand-bright"
        >
          ← Volver al inicio
        </Link>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-bright">
            Impresión especial
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">Maqueta tu foto</h1>
          <p className="text-muted">
            Sube una imagen, elige layout 10×15 y hoja carta u oficio. Autoriza la
            cotización; en mostrador se imprime.
          </p>
        </div>

        <PaperCard glow className="p-8 lg:p-10">
          <SpecialPrintForm />
        </PaperCard>
      </div>
    </PageShell>
  );
}
