# Guía del agente — Papeletto

Antes de implementar features:

1. Leer `docs/specs/` (documentación en español; términos técnicos en inglés).
2. Seguir `.cursor/rules/` (siempre activa: `papeletto-core`).
3. Usar skills de dominio en `.cursor/skills/` para print, CV, derecho de petición, PrintNode y n8n.
4. Usar **pnpm** únicamente.

Servicios principales: impresión estándar, impresión especial (export web bajo 2MB), CV, derechos de petición.

## Comandos

```bash
pnpm install
pnpm infra:up    # Postgres + Gotenberg (o pnpm db:up solo DB)
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Infra local vía `docker-compose.yml` (`db` + `gotenberg`). Credenciales y `GOTENBERG_URL` en `.env.example`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
