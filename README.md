# Papeletto

App web para la papelería **Papeletto**: impresión estándar, impresión especial, generación de CV y derechos de petición.

## Stack

- Next.js 16 (App Router) + React 19
- PostgreSQL + Prisma
- Tailwind CSS 4
- n8n (automatizaciones de documentos)
- PrintNode API (impresión física)
- **pnpm**

## Inicio rápido

```bash
pnpm install
cp .env.example .env

# Postgres en Docker (desarrollo)
pnpm db:up

# Esperar a que el healthcheck esté healthy, luego:
pnpm db:migrate
pnpm db:seed
pnpm dev
```

### Acceso staff (dev)

El panel **no** aparece en la UI pública. Abrir `/login` directamente.

Credenciales por defecto del seed (cambiar en producción):

- Email: `admin@papeletto.local`
- Password: `papeletto-admin`

Requiere `AUTH_SECRET` en `.env` (ver `.env.example`).

### Base de datos (Docker)

| | |
|--|--|
| Contenedor | `papeletto-db` |
| Imagen | `postgres:16-alpine` |
| Puerto | `5432` |
| User / pass / db | `papeletto` / `papeletto` / `papeletto` |
| Volume | `papeletto_pg_data` |

```bash
pnpm db:up      # levantar
pnpm db:down    # parar (conserva datos)
pnpm db:reset   # borrar volume y recrear
pnpm db:logs    # logs
```

## Estructura

```
app/(public)/     # Flujos de cliente
app/(admin)/      # Panel staff
app/api/          # Webhooks (n8n, etc.)
lib/              # Prisma, PrintNode, n8n, storage
prisma/           # Schema + seed
docs/specs/       # Specs de producto (español + términos técnicos en inglés)
.cursor/          # Rules y skills del agente
```

## Scripts

| Script | Uso |
|--------|-----|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` / `pnpm start` | Producción |
| `pnpm db:migrate` | Migraciones Prisma |
| `pnpm db:seed` | Precios (e impresora si hay env) |
| `pnpm db:studio` | Prisma Studio |

## Documentación

Ver [docs/specs/](docs/specs/).

## Licencia

[MIT](LICENSE)
