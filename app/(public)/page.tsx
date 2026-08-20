import Link from "next/link";

const services = [
  {
    href: "/impresion-estandar",
    title: "Impresión estándar",
    description: "Sube PDF o texto, calcula hojas y envía a imprimir.",
  },
  {
    href: "/impresion-especial",
    title: "Impresión especial",
    description: "Organiza fotos y documentos en medidas estándar y exporta bajo 2MB.",
  },
  {
    href: "/cv",
    title: "Generación de CV",
    description: "Completa tus datos y genera un currículum listo para descargar.",
  },
  {
    href: "/derecho-peticion",
    title: "Derechos de petición",
    description: "Redacta y genera tu derecho de petición con acompañamiento guiado.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-brand-ink">
          Papeletto
        </p>
        <Link
          href="/admin"
          className="text-sm font-medium text-muted transition hover:text-brand-ink"
        >
          Admin
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-12 px-6 pb-20 pt-8">
        <section className="max-w-2xl space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
            Papelería
          </p>
          <h1 className="text-5xl leading-tight text-brand-ink sm:text-6xl">Papeletto</h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted">
            Impresión y documentos en un solo lugar: cotiza, genera y envía a la
            impresora desde la web.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="group rounded-2xl border border-line bg-surface/80 p-6 transition hover:border-brand hover:shadow-sm"
            >
              <h2 className="text-xl text-brand-ink group-hover:text-brand">
                {service.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {service.description}
              </p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
