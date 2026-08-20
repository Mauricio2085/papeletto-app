export type ServiceKey =
  | "impresion-estandar"
  | "impresion-especial"
  | "cv"
  | "derecho-peticion";

export type ServiceAvailability = {
  key: ServiceKey;
  href: string;
  title: string;
  description: string;
  icon: "print" | "photo" | "cv" | "legal";
  tag?: string;
  available: boolean;
};

export const services: ServiceAvailability[] = [
  {
    key: "impresion-estandar",
    href: "/impresion-estandar",
    title: "Impresión estándar",
    description: "Sube PDF o texto, calcula hojas y envía a imprimir.",
    icon: "print",
    available: true,
  },
  {
    key: "impresion-especial",
    href: "/impresion-especial",
    title: "Impresión especial",
    description: "Organiza fotos y documentos en medidas estándar y exporta bajo 2MB.",
    icon: "photo",
    tag: "bajo 2MB",
    available: false,
  },
  {
    key: "cv",
    href: "/cv",
    title: "Generación de CV",
    description: "Completa tus datos y genera un currículum listo para descargar.",
    icon: "cv",
    available: false,
  },
  {
    key: "derecho-peticion",
    href: "/derecho-peticion",
    title: "Derechos de petición",
    description: "Redacta y genera tu derecho de petición con acompañamiento guiado.",
    icon: "legal",
    available: false,
  },
];

export function isServiceAvailable(key: ServiceKey): boolean {
  return services.find((s) => s.key === key)?.available ?? false;
}

export function getService(key: ServiceKey): ServiceAvailability | undefined {
  return services.find((s) => s.key === key);
}
