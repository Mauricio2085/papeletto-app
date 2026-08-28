# Modelo de datos (borrador Prisma)

> Borrador de implementación. Ajustar nombres de campos al evolucionar `prisma/schema.prisma`.

## Enums

```prisma
enum OrderType {
  PRINT_STANDARD
  PRINT_SPECIAL
  DOCUMENT_CV
  DOCUMENT_DERECHO_PETICION
}

enum OrderStatus {
  DRAFT
  QUOTED
  CONFIRMED
  PROCESSING
  SENT_TO_PRINTER
  READY
  COMPLETED
  FAILED
  CANCELLED
}

enum DocumentJobType {
  CV
  DERECHO_PETICION
}

enum DocumentJobStatus {
  QUEUED
  PROCESSING
  READY
  FAILED
}
```

## Modelos principales

```prisma
model Customer {
  id        String   @id @default(cuid())
  name      String?
  email     String?
  phone     String?
  orders    Order[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Order {
  id              String      @id @default(cuid())
  type            OrderType
  status          OrderStatus @default(DRAFT)
  customerId      String?
  customer        Customer?   @relation(fields: [customerId], references: [id])
  currency        String      @default("COP")
  subtotalCents   Int         @default(0)
  totalCents      Int         @default(0)
  pricingSnapshot Json?
  metadata        Json?
  assets          Asset[]
  printJobs       PrintJob[]
  documentJobs    DocumentJob[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model Asset {
  id           String   @id @default(cuid())
  orderId      String
  order        Order    @relation(fields: [orderId], references: [id])
  kind         String   // original | print_ready | web_safe | generated
  filename     String
  mimeType     String
  byteSize     Int
  storageKey   String
  pageCount    Int?
  createdAt    DateTime @default(now())
}

model PrintJob {
  id              String   @id @default(cuid())
  orderId         String
  order           Order    @relation(fields: [orderId], references: [id])
  printNodeJobId  String?
  printerId       String
  copies          Int      @default(1)
  options         Json?
  status          String
  lastError       String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model DocumentJob {
  id            String            @id @default(cuid())
  orderId       String
  order         Order             @relation(fields: [orderId], references: [id])
  type          DocumentJobType
  status        DocumentJobStatus @default(QUEUED)
  inputPayload  Json
  n8nExecutionId String?
  resultAssetId String?
  lastError     String?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
}

model PriceConfig {
  id        String   @id @default(cuid())
  key       String   @unique // ej. print.bw.carta.page, special.10x15
  amountCents Int
  unit      String   // page | copy | size
  active    Boolean  @default(true)
  updatedAt DateTime @updatedAt
}

model PrinterConfig {
  id                String  @id @default(cuid())
  name              String
  printNodePrinterId String @unique
  isDefault         Boolean @default(false)
  active            Boolean @default(true)
}
```

## Metadata de pedido (JSON)

Campos comunes en `Order.metadata` para impresión:

| Campo | Tipo | Servicios | Descripción |
|-------|------|-----------|-------------|
| `paperSize` | `"carta" \| "oficio"` | estándar, especial | Hoja elegida por el cliente |
| `detectedPaperSize` | `"carta" \| "oficio"` | estándar | Tamaño detectado en PDF (si aplica) |
| `paperSizeMismatch` | `boolean` | estándar | `true` si elección ≠ detección |
| `filename`, `copies`, `mimeType` | — | estándar | Ya en uso |
| `layoutPreset` | `string` | especial | Clave de catálogo (ej. `10x15_single`) |

`pricingSnapshot` incluye `paperSize` y `priceKey` (ej. `print.bw.carta.page`).

## Reglas de pricing (MVP)

- Impresión estándar: `pageCount * copies * price(print.{color}.{carta|oficio}.page)`
- Impresión especial: `quantity * price(special.{preset})` (hoja en metadata; catálogo en [06-paper-sizes.md](06-paper-sizes.md))
- Generación de documentos: tarifa fija `price(doc.cv)` / `price(doc.derecho_peticion)` (+ add-on de impresión opcional)

### Seed de precios (objetivo)

Reemplazar claves legacy `print.*.a4.page` por:

- `print.bw.carta.page`, `print.bw.oficio.page`
- `print.color.carta.page`, `print.color.oficio.page`
- `special.10x15`, `special.carta` / presets según catálogo Phase 3
