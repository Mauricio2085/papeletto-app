# Arquitectura

## Stack (fijo)

| Capa | Elección |
|-------|--------|
| Framework | Next.js (App Router) |
| UI | React + Tailwind CSS |
| DB | PostgreSQL |
| ORM | Prisma 7 (`prisma.config.ts` para DB URL; adapter `pg` en runtime) |
| Automatizaciones | n8n (CV, derechos de petición, otros flujos complejos) |
| Impresión | PrintNode API |
| Conversión Word (`.docx` → PDF) | **Gotenberg** (LibreOffice) en la misma instancia de la app |
| Gestor de paquetes | **pnpm** únicamente |

## Flujo de alto nivel

```
Browser (Next.js App Router)
    │
    ├─ Server Actions / Route Handlers
    │       │
    │       ├─ Prisma → PostgreSQL
    │       ├─ File storage (local / compatible S3; definir en Phase 1)
    │       ├─ PrintNode client → impresoras
    │       ├─ Gotenberg (Docker, red interna) → .docx → PDF
    │       └─ n8n webhooks → CV / derecho de petición / pipelines especiales
    │
    └─ Static assets + Tailwind UI
```

## Despliegue producción (MVP tienda) — Amazon Lightsail

### Decisión

Una sola instancia **Lightsail Linux ~4 GB RAM / 2 vCPU** (~**USD 24/mes** plan estándar con IPv4; confirmar en [precios Lightsail](https://aws.amazon.com/lightsail/pricing/)) alojando:

| Proceso | Rol |
|---------|-----|
| Next.js (Papeletto-app) | App pública + admin + server actions |
| PostgreSQL | Docker en la misma instancia (MVP) |
| **Gotenberg** | Conversión `.docx` → PDF; **solo red interna**, sin puerto público |
| Storage local | Disco de la instancia (`STORAGE_ROOT`) |

n8n **no** corre aquí: instancia **Papeletto-n8n** aparte cuando arranque Phase 4. Cotización Word es síncrona vía Gotenberg en la app.

### Red / seguridad

- Firewall: solo **80/443** (+ SSH restringido) hacia la app.
- Gotenberg sin publish a Internet; Next.js usa `GOTENBERG_URL=http://gotenberg:3000`.
- Secretos solo en env de servidor.

### Recursos y UX

- Word **ocasional** (público poco tech); una conversión a la vez.
- UI: “Convirtiendo Word…”; timeouts de server action elevados.

### Compose

`docker-compose.yml` incluye `db` + `gotenberg`.

- Local / Lightsail con Next en el host: puerto **solo** `127.0.0.1:3001→3000`; `GOTENBERG_URL=http://127.0.0.1:3001`
- Si la app corre en la misma red Compose: `GOTENBERG_URL=http://gotenberg:3000` (sin exponer el puerto públicamente)

```bash
pnpm infra:up    # db + gotenberg
pnpm gotenberg:up
pnpm gotenberg:logs
```

## Límites de módulos

| Módulo | Responsabilidad |
|--------|----------------|
| `orders` | Ciclo de vida del pedido, pricing snapshot, máquina de estados |
| `print` (shared) | Catálogo carta/oficio, detección PDF, labels UI |
| `print-standard` | Conteo PDF/texto/`.docx` (vía Gotenberg), cotización, envío a PrintNode |
| `print-special` | Layout, resize, compresión &lt;2MB, envío a impresión |
| `documents/cv` | Formulario → n8n → almacenamiento de artefactos |
| `documents/derecho-peticion` | Formulario → n8n → almacenamiento de artefactos |
| `integrations/printnode` | Wrapper fino de API + reintentos |
| `integrations/gotenberg` | Cliente HTTP `.docx` → PDF (servidor) |
| `integrations/n8n` | Cliente webhook + callbacks firmados |
| `admin` | Precios, impresoras, trabajos fallidos |

## Convenciones App Router

- `app/(public)/` — flujos de cliente
- `app/(admin)/` — staff / admin
- `app/api/` — webhooks (n8n, callbacks de PrintNode si aplica) y endpoints externos
- `lib/` — utilidades de servidor compartidas (prisma, clients)
- `components/` — solo UI; sin acceso directo a DB

## Variables de entorno (esperadas)

```bash
DATABASE_URL=   # local: postgresql://papeletto:papeletto@localhost:5432/papeletto?schema=public
AUTH_SECRET=    # openssl rand -base64 32
ADMIN_EMAIL=    # seed staff (dev)
ADMIN_PASSWORD=
ADMIN_NAME=
PRINTNODE_API_KEY=
PRINTNODE_DEFAULT_PRINTER_ID=
GOTENBERG_URL=              # ej. http://gotenberg:3000 (solo servidor)
N8N_WEBHOOK_CV_URL=
N8N_WEBHOOK_DERECHO_PETICION_URL=
N8N_WEBHOOK_SECRET=
STORAGE_ROOT=./storage
```

## Base de datos local (Docker)

Postgres de desarrollo definido en `docker-compose.yml`:

- Servicio: `db` → contenedor `papeletto-db`
- Imagen: `postgres:16-alpine`
- Puerto: `5432`
- Credenciales: user/password/db = `papeletto`
- Persistencia: volume `papeletto_pg_data`

```bash
pnpm db:up
pnpm db:migrate
pnpm db:seed
```

## Notas de despliegue

- Preferir runtime Node.js en rutas de PrintNode/Gotenberg/procesamiento de archivos (no Edge) salvo que se demuestre seguro.
- Secretos solo en env de servidor; nunca exponer claves de PrintNode/n8n ni `GOTENBERG_URL` al cliente.
- Gotenberg: no abrir su puerto en el firewall de Lightsail.
