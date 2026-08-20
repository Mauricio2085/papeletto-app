import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { PaperCard } from "@/components/paper-card";
import { getService, type ServiceKey } from "@/lib/services";

type ComingSoonServiceProps = {
  serviceKey: ServiceKey;
};

export function ComingSoonService({ serviceKey }: ComingSoonServiceProps) {
  const service = getService(serviceKey);

  if (!service) {
    return null;
  }

  return (
    <PageShell showFooter={false}>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted transition hover:text-brand-bright"
        >
          ← Volver al inicio
        </Link>

        <PaperCard className="space-y-4 p-8 lg:p-10">
          <span className="badge-soon badge-soon-lg">Próximamente</span>
          <h1 className="text-3xl font-bold sm:text-4xl">{service.title}</h1>
          <p className="text-lg text-muted">{service.description}</p>
          <p className="rounded-xl border border-line bg-background/50 px-4 py-3 text-sm text-muted">
            Estamos trabajando primero en <strong className="text-foreground">impresión estándar</strong>.
            Este servicio estará disponible en una fase posterior.
          </p>
        </PaperCard>
      </div>
    </PageShell>
  );
}
