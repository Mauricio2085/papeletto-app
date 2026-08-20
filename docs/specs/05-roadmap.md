# Roadmap

## Phase 0 — Fundación (bootstrap)

- [x] Specs, Cursor rules y skills
- [x] Licencia MIT, `.gitignore`, pnpm
- [x] Repositorio GitHub
- [x] Scaffold Next.js App Router + Tailwind + Prisma

## Phase 1 — Núcleo de plataforma

- [ ] Auth para admin/operador (credenciales simples o Auth.js)
- [x] Prisma schema + seed de precios/impresoras (correr migrate contra tu DB)
- [x] Abstracción de file storage (disco local MVP)
- [ ] Listado de pedidos (admin) + máquina de estados

## Phase 2 — Impresión estándar

- [ ] Upload PDF + conteo de páginas
- [ ] Estimación de páginas en archivos de texto
- [ ] UI de cotización
- [ ] Envío PrintNode + fallo/reintento

## Phase 3 — Impresión especial

- [ ] Catálogo de tamaños + presets de layout
- [ ] Generación print-ready
- [ ] Compresor web-safe &lt;2MB
- [ ] Envío PrintNode para trabajos especiales

## Phase 4 — Documentos (n8n)

- [ ] Formulario CV + webhook + callback + descarga
- [ ] Formulario derecho de petición + webhook + callback + descarga
- [ ] Opcional: puente “imprimir PDF generado” → impresión estándar

## Phase 5 — Endurecimiento

- [ ] Pagos (si aplica) o códigos de confirmación en tienda
- [ ] Observabilidad (structured logs, error tracking)
- [ ] Rate limits en uploads/webhooks
- [ ] Política de backup y retención de archivos de clientes
