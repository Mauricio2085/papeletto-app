import { ServicePlaceholder } from "@/components/service-placeholder";

export const metadata = { title: "Impresión estándar" };

export default function ImpresionEstandarPage() {
  return (
    <ServicePlaceholder
      title="Impresión estándar"
      description="Carga PDF o texto, calcula cantidad de hojas × precio y envía a PrintNode."
    />
  );
}
