import { redirect } from "next/navigation";
import { PaperCard } from "@/components/paper-card";
import { PapelettoLogo } from "@/components/papeletto-logo";
import { LoginForm } from "@/components/login-form";
import { auth } from "@/lib/auth";

export const metadata = { title: "Ingreso staff" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="mb-8">
        <PapelettoLogo variant="header" priority />
      </div>

      <PaperCard glow className="w-full max-w-md space-y-6 p-8">
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-bright">
            Acceso staff
          </p>
          <h1 className="text-2xl font-bold">Ingresar al panel</h1>
          <p className="text-sm text-muted">
            Solo operadores y administradores de Papeletto.
          </p>
        </div>

        <LoginForm />
      </PaperCard>
    </div>
  );
}
