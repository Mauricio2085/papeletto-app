import { ServicePlaceholder } from "@/components/service-placeholder";

export const metadata = { title: "Generación de CV" };

export default function CvPage() {
  return (
    <ServicePlaceholder
      title="Generación de CV"
      description="Formulario guiado y generación automática vía n8n."
    />
  );
}
