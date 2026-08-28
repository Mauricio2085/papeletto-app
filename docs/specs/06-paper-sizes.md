# Tamaños de papel — carta y oficio

Documento de referencia para impresión estándar, impresión especial y PrintNode en Papeletto.

## Contexto operativo

La impresora de la papelería tiene **dos bandejas**: **carta** y **oficio**. No hay bandeja A4 u otros formatos en el MVP. El PDF print-ready y la bandeja física deben coincidir.

| Nombre (UI) | Tamaño físico | mm (aprox.) | Puntos PDF (72 dpi) |
|-------------|---------------|-------------|---------------------|
| **Carta** | 8.5" × 11" | 216 × 279 | **612 × 792** |
| **Oficio** | 8.5" × 14" | 216 × 356 | **612 × 1008** |

Claves internas: `carta` | `oficio` (inglés en código/metadata).

**A4** no es tamaño operativo en Papeletto. Si un cliente sube PDF A4, el sistema puede detectarlo y advertir que no coincide con carta/oficio; no se ofrece A4 como opción de impresión.

## Elección carta u oficio

### Quién elige

| Servicio | Cliente | Staff |
|----------|---------|-------|
| Impresión estándar | Selector obligatorio **carta** u **oficio** (default **carta** si no hay detección) | Ve `paperSize` en admin; confirma bandeja antes de imprimir |
| Impresión especial | Selector obligatorio (define el canvas del layout) | Igual que estándar |

El staff **no** redefine el tamaño en el MVP salvo corrección en mostrador (Phase 5 / herramienta admin opcional).

### Detección automática (impresión estándar)

Cuando el archivo es PDF (o PDF derivado de `.docx`):

1. Leer **MediaBox** de la primera página (y validar homogeneidad entre páginas si es posible).
2. Si coincide con carta u oficio (tolerancia ±2 pt), **preseleccionar** ese valor en el formulario.
3. Si el cliente eligió otro tamaño → **advertencia** antes de cotizar (“El archivo parece carta/oficio; si imprimes en otro tamaño puede escalarse o quedar con márgenes”).
4. Tamaños distintos (A4, legal US distinto, mixto) → advertencia; no bloquear por defecto.

Archivos **`.txt`**: no hay MediaBox; el PDF generado debe usar el **tamaño elegido** por el cliente.

Archivos **`.docx`**: Gotenberg respeta el tamaño de página del Word; tras conversión, aplicar la misma lógica de detección sobre el PDF derivado y comparar con la elección del cliente.

## Persistencia

En `Order.metadata` (y reflejado en `pricingSnapshot` cuando afecte precio):

```json
{
  "paperSize": "carta",
  "detectedPaperSize": "carta",
  "paperSizeMismatch": false
}
```

`detectedPaperSize` opcional si no hubo detección (solo `.txt` sin preview previo).

## Pricing (`PriceConfig`)

Claves por color y tamaño de hoja:

- `print.bw.carta.page` / `print.bw.oficio.page`
- `print.color.carta.page` / `print.color.oficio.page` (cuando color esté activo)

Impresión especial (catálogo + hoja):

- Medidas de **foto** (ej. `special.10x15`) — precio por unidad de foto/layout
- Hoja destino: `carta` u `oficio` en metadata; el PDF print-ready usa dimensiones de la hoja elegida

Fórmula estándar: `pageCount × copies × price(print.{color}.{paperSize}.page)`.

## PrintNode

1. El PDF enviado debe tener **páginas con MediaBox** carta u oficio según `paperSize`.
2. La bandeja física debe tener el papel correspondiente.
3. MVP: confiar en tamaño de página del PDF + metadata visible en admin.
4. Futuro: `PrintJob.options` con hints de driver si el cliente PrintNode del mostrador lo soporta.

## Módulo compartido (implementación)

Catálogo y helpers en `lib/print/paper-sizes.ts` (o `lib/print-standard/paper-sizes.ts` reexportado):

- Constantes en puntos
- `detectPaperSizeFromPdf(buffer)`
- `paperSizeLabel("carta")` → “Carta” para UI
- Validación `isKnownPaperSize`

Usado por `print-standard`, `print-special` y admin.
