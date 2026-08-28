# Roadmap

## Phase 0 — Fundación (bootstrap)

- [x] Specs, Cursor rules y skills
- [x] Licencia MIT, `.gitignore`, pnpm
- [x] Repositorio GitHub
- [x] Scaffold Next.js App Router + Tailwind + Prisma

## Phase 1 — Núcleo de plataforma

- [x] Auth para admin/operador (Auth.js / NextAuth JWT + formulario `/login`)
- [x] Prisma schema + seed de precios/impresoras (correr migrate contra tu DB)
- [x] Abstracción de file storage (disco local MVP)
- [x] Listado de pedidos (admin)
- [x] Máquina de estados de pedidos (transiciones + confirm/print/retry)

## Phase 2 — Impresión estándar

- [x] Upload PDF + conteo de páginas
- [x] Estimación de páginas en archivos de texto
- [x] UI de cotización
- [x] Confirmación cliente (autoriza cotización) + envío PrintNode desde admin + fallo/reintento staff
- [x] Marcar listo / completado manual en admin (entrega en mostrador)
- [x] Vista previa pre-upload (cliente) + revisión de archivo en admin antes de imprimir

### Extensión Phase 2 — Word (`.docx`)

**Infra (decidido):** Gotenberg en la misma Lightsail **4 GB** que Papeletto-app (Docker Compose, red interna). n8n aparte / Phase 4.

- [x] Añadir servicio `gotenberg` a `docker-compose.yml` + `GOTENBERG_URL` en `.env.example`
- [x] Aceptar upload `.docx` en validación y UI (sin `.doc` legacy)
- [x] Cliente HTTP servidor → Gotenberg; persistir `original` + `print_ready`
- [x] Conteo y cotización sobre PDF derivado; UX “Convirtiendo Word…”
- [x] Mensajes de error claros si la conversión falla / Gotenberg caído
- [ ] Checklist despliegue Lightsail 4 GB (firewall, Compose, sin puerto Gotenberg público)

### Extensión Phase 2 — Carta y oficio

Alineación con operación real (dos bandejas). Spec: [06-paper-sizes.md](06-paper-sizes.md).

- [x] Catálogo `lib/print/paper-sizes.ts` (puntos PDF, detección MediaBox)
- [x] Selector cliente carta/oficio + advertencia si PDF no coincide
- [x] Precios seed `print.bw.carta.page` / `print.bw.oficio.page` (migrar desde `a4`)
- [x] `text-to-pdf` y cotización según hoja elegida
- [x] Badge carta/oficio en admin (listado + detalle)

## Phase 3 — Impresión especial

- [ ] Catálogo de presets de layout + hoja carta/oficio obligatoria
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
