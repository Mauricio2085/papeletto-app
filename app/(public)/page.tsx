import { PageShell } from "@/components/page-shell";
import { PaperCard } from "@/components/paper-card";
import { PapelettoLogo } from "@/components/papeletto-logo";
import { ServiceCard } from "@/components/service-card";

const services = [
  {
    href: "/impresion-estandar",
    title: "Impresión estándar",
    description: "Sube PDF o texto, calcula hojas y envía a imprimir.",
    icon: "print" as const,
  },
  {
    href: "/impresion-especial",
    title: "Impresión especial",
    description: "Organiza fotos y documentos en medidas estándar y exporta bajo 2MB.",
    icon: "photo" as const,
    tag: "bajo 2MB",
  },
  {
    href: "/cv",
    title: "Generación de CV",
    description: "Completa tus datos y genera un currículum listo para descargar.",
    icon: "cv" as const,
  },
  {
    href: "/derecho-peticion",
    title: "Derechos de petición",
    description: "Redacta y genera tu derecho de petición con acompañamiento guiado.",
    icon: "legal" as const,
  },
] as const;

export default function HomePage() {
  return (
    <PageShell>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 py-12 lg:py-16">
        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-bright">
              <span className="size-1.5 rounded-full bg-brand-bright" />
              Papelería digital
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Todo lo que necesitas{" "}
              <span className="bg-linear-to-r from-brand-bright to-brand bg-clip-text text-transparent">
                en un solo lugar
              </span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              Cotiza impresiones, organiza archivos especiales y genera documentos desde la
              web. Papeletto conecta tu pedido con la impresora.
            </p>
          </div>

          <PaperCard glow className="animate-float-soft p-8 lg:p-10">
            <div className="relative flex flex-col items-center text-center">
              <PapelettoLogo variant="hero" priority />
              <p className="mt-6 text-sm leading-relaxed text-muted">
                Impresión estándar y especial · CV automáticos · Derechos de petición
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {["PrintNode", "n8n", "Prisma"].map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg border border-line bg-background/60 px-2.5 py-1 text-xs font-medium text-muted"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </PaperCard>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Servicios</h2>
            <p className="mt-1 text-muted">Elige un flujo para comenzar.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((service) => (
              <ServiceCard key={service.href} {...service} />
            ))}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
