# Integraciones

## PrintNode

### Propósito

Enviar archivos print-ready a impresoras físicas gestionadas por PrintNode.

### Reglas del client

- Módulo solo servidor bajo `lib/printnode/`
- Auth: Basic con API key (según docs de PrintNode)
- Impresora por defecto desde `PRINTNODE_DEFAULT_PRINTER_ID` o `PrinterConfig.isDefault`
- Persistir `printNodeJobId` en `PrintJob`
- En fallo HTTP/red: marcar `FAILED`, guardar `lastError`, permitir reintento del staff

### Operaciones típicas

1. Listar impresoras (sync admin)
2. Enviar print job (PDF / content URI o base64 según API)
3. Poll o webhook de estado si existe; si no, refresh del staff + dashboard PrintNode

### Seguridad

- Nunca loguear la API key completa
- No exponer lista de impresoras ni claves a clientes anónimos más allá de lo necesario para UX

---

## Gotenberg (conversión `.docx` → PDF)

### Propósito

Convertir Word moderno a PDF print-ready para impresión estándar, con fidelidad aceptable para cotización e PrintNode.

### Reglas

- Módulo solo servidor (ej. `lib/print-standard/docx-to-pdf.ts` o `lib/gotenberg/`)
- URL vía `GOTENBERG_URL` (Compose: `http://gotenberg:3000`)
- **No** exponer el puerto de Gotenberg a Internet
- Producción MVP: misma Lightsail 4 GB que Papeletto-app (ver `01-architecture.md`)
- n8n **no** orquesta esta conversión en el happy path (cotización síncrona)

### Operación típica

1. Recibir buffer `.docx` validado
2. POST multipart a Gotenberg LibreOffice convert
3. Recibir PDF; persistir como `Asset` `print_ready`
4. Fallos HTTP/timeout → mensaje al cliente; no marcar pedido cotizado a medias sin asset usable

---

## n8n

### Propósito

Generación compleja de documentos: CVs, derechos de petición y otras transformaciones multi-paso que no pertenecen a Next.js.

### Patrón

1. La app crea `DocumentJob` (`QUEUED`) con `inputPayload` validado.
2. La app hace POST a URL de webhook por servicio con:
   - `jobId`
   - `callbackUrl` (ruta de la app)
   - `payload`
   - firma HMAC (`N8N_WEBHOOK_SECRET`)
3. El workflow de n8n genera el archivo, sube/almacena, hace POST de callback.
4. La app verifica firma, adjunta `Asset`, pone job en `READY` / `FAILED`.

### Webhooks (env)

- `N8N_WEBHOOK_CV_URL`
- `N8N_WEBHOOK_DERECHO_PETICION_URL`
- Opcional después: pipelines pesados de impresión especial

### Ruta de callback

- `POST /api/webhooks/n8n`
- Idempotente por `jobId`
- Rechazar firmas inválidas con 401

### Timeouts

- UI cliente: mostrar “generando…” con polling o SSE después
- Job atascado &gt; N minutos → marcar `FAILED` vía cron/herramienta admin (Phase 2)

---

## Almacenamiento de archivos (TBD Phase 1)

Decidir entre:

1. Disco local / volume (más simple para MVP de una sola tienda)
2. Object storage compatible S3 (mejor para producción)

Requisito de spec: todos los assets referenciados por `Asset.storageKey`, sin rutas hardcodeadas en lógica de negocio.
