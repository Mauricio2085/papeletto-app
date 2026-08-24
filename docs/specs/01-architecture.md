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
    │       └─ n8n webhooks → CV / derecho de petición / pipelines especiales
    │
    └─ Static assets + Tailwind UI
```

## Límites de módulos

| Módulo | Responsabilidad |
|--------|----------------|
| `orders` | Ciclo de vida del pedido, pricing snapshot, máquina de estados |
| `print-standard` | Conteo de páginas PDF/texto, cotización, envío a PrintNode |
| `print-special` | Layout, resize, compresión &lt;2MB, envío a impresión |
| `documents/cv` | Formulario → n8n → almacenamiento de artefactos |
| `documents/derecho-peticion` | Formulario → n8n → almacenamiento de artefactos |
| `integrations/printnode` | Wrapper fino de API + reintentos |
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

- Preferir runtime Node.js en rutas de PrintNode/procesamiento de archivos (no Edge) salvo que se demuestre seguro.
- Secretos solo en env de servidor; nunca exponer claves de PrintNode/n8n al cliente.
