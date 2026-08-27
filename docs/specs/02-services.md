# Especificación de servicios

## 1. Impresión estándar

### Entrada

- Archivos (MVP): PDF preferido; texto plano (`.txt`) soportado
- Archivos (extensión Phase 2): **`.docx`** — Word moderno; **no** se soportará `.doc` (formato binario legacy, fuera de uso cotidiano)
- Opciones: copias, color/B&amp;N (si la impresora lo soporta), duplex (opcional Phase 2)

### Procesamiento

1. Validar MIME/límites de tamaño.
2. Contar páginas (conteo real en PDF; texto → estimación por chars/líneas por página).
3. Cotizar: `pages × copies × unitPrice` (precio unitario desde config por papel/color).
4. Persistir pedido + referencia al archivo (`QUOTED`).
5. **Cliente** autoriza el valor cotizado → `CONFIRMED` (sin enviar a impresora).
6. **Staff** en `/admin` confirma pago en mostrador y envía a PrintNode → `PROCESSING` → `SENT_TO_PRINTER`.
7. **Staff** marca listo cuando el trabajo está para recoger → `READY`; completado al entregar → `COMPLETED`.
8. Seguir estado: `QUOTED` → `CONFIRMED` → `SENT_TO_PRINTER` → `READY` → `COMPLETED` | `FAILED`.

### Salida

- Desglose de precio para el cliente (autorización de cotización)
- Vista previa del archivo **antes** de cotizar (cliente, en navegador) y **antes** de imprimir (staff, vía admin)
- Print job id (PrintNode) gestionado por el staff

### Errores

- PDF ilegible → rechazar con mensaje claro
- Fallo PrintNode → `FAILED` + acción de reintento para staff

### Extensión Phase 2 — Word (`.docx`)

Muchos clientes del público (poco tech) llegan con Word. PrintNode imprime con fidelidad vía **PDF**, no enviando el `.docx` directo.

**Infra (decidido)**

- Convertidor: **Gotenberg** (LibreOffice) en la **misma Lightsail 4 GB** que Papeletto-app (Compose, red interna).
- No usar la instancia n8n para esta conversión (aislar CV/async de cotización síncrona).
- Env: `GOTENBERG_URL` solo en servidor.

**Flujo propuesto**

1. Validar MIME/extensión (`.docx` únicamente).
2. POST del archivo a Gotenberg → PDF.
3. Contar páginas sobre el **PDF generado** (`pdf-lib`, misma lógica que PDF nativo).
4. Cotizar y persistir pedido con dos assets:
   - `original` — `.docx` subido por el cliente
   - `print_ready` — PDF derivado usado para cotización, preview admin e impresión
5. Enviar a PrintNode solo el PDF `print_ready`.
6. UI: mensaje “Convirtiendo Word…” durante la conversión (segundos).

**Errores adicionales**

- `.docx` corrupto o no convertible → rechazar con mensaje claro (“No pudimos abrir el Word; prueba guardar de nuevo o sube PDF”)
- Timeout / Gotenberg caído → error claro; staff puede pedir PDF o reintentar cotización

**Fuera de alcance**

- `.doc` (Word 97–2003): no soportado; el cliente debe guardar como `.docx` o exportar PDF
- Preview HTML aproximado del Word en el navegador: no requerido; preview del PDF convertido en admin sí

---

## 2. Impresión especial

### Entrada

- Imágenes (JPEG/PNG/WebP) y/o documentos
- Tamaño de impresión objetivo desde catálogo fijo (ej. 10×15, A4, carta — definir en pricing config)
- Opcional: preset de export para plataforma (público/comercial, máx. **&lt;2MB**)

### Procesamiento

1. Validar archivos.
2. Organizar en layout estándar (grid / single / multi-up).
3. Producir PDF/imagen **print-ready** al tamaño físico/DPI objetivo.
4. Producir export **web-safe**: resize + compresión hasta **&lt; 2MB** (preferir escalera de calidad, luego dimensiones).
5. Crear pedido; enviar asset print-ready a PrintNode.
6. Guardar/descargar asset web-safe para el cliente.

### Salida

- Archivo print-ready (interno / impresora)
- Archivo web-safe (&lt;2MB) para plataformas
- Precio según tamaño × cantidad (config)

---

## 3. Generación de CV

### Entrada

- Formulario estructurado: datos personales, experiencia, educación, skills, elección de plantilla

### Procesamiento

1. Validar formulario en servidor.
2. Crear `DocumentJob` con type `CV`, status `QUEUED`.
3. POST del payload al webhook de n8n.
4. n8n genera DOCX/PDF y hace callback con URL del archivo o referencia binaria.
5. Marcar job `READY`; el cliente descarga.

### Salida

- CV descargable (PDF y/o DOCX — definir con pipeline de plantillas)

### Responsabilidades

- Next.js: UX + persistencia; n8n: render de plantillas y transformaciones complejas.

---

## 4. Derechos de petición

### Entrada

- Formulario estructurado: datos del solicitante, entidad destinataria, hechos, peticiones, anexos opcionales

### Procesamiento

Mismo patrón que CV con type `DERECHO_PETICION` y webhook/workflow dedicado de n8n.

### Salida

- Documento formal (PDF/DOCX) listo para descargar/imprimir
- Opcional: ofrecer “imprimir esto” → crea pedido de impresión estándar desde el PDF generado

### Nota legal

- La app es asistente de redacción, no asesoría legal. Mostrar disclaimer breve en el flujo.
