import { PaperCard } from "@/components/paper-card";
import { auth } from "@/lib/auth";

export const metadata = { title: "Admin" };

const adminItems = [
  "Pedidos por estado",
  "PriceConfig / PrinterConfig",
  "Reintento de PrintJob fallidos",
] as const;

export default async function AdminPage() {
  const session = await auth();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-bright">
          Panel staff · {session?.user.role}
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Dashboard Papeletto</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Bienvenido{session?.user.name ? `, ${session.user.name}` : ""}. Los listados de
          pedidos llegan en la siguiente fase.
        </p>
      </div>

      <PaperCard className="p-8">
        <h2 className="text-lg font-semibold">Próximamente en el panel</h2>
        <ul className="mt-4 space-y-3">
          {adminItems.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 rounded-xl border border-line bg-background/40 px-4 py-3 text-sm text-muted"
            >
              <span className="size-2 rounded-full bg-brand/70" />
              {item}
            </li>
          ))}
        </ul>
      </PaperCard>
    </div>
  );
}
