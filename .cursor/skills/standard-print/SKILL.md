---
name: standard-print
description: Implements Papeletto standard print flow (PDF/text upload, page count, pricing, PrintNode). Use when building impresión estándar, page counting, print quotes, or standard print orders.
---

# Impresión estándar

## When to use

Customer uploads PDF, text, or `.docx` → pick **carta** or **oficio** → count pages → quote → client authorizes → staff PrintNode.

## Paper sizes

Only **carta** (612×792 pt) and **oficio** (612×1008 pt). See [docs/specs/06-paper-sizes.md](../../../docs/specs/06-paper-sizes.md).

## Workflow

1. Validate file (MIME, size). PDF preferred; `.txt` and `.docx` allowed (no legacy `.doc`).
2. Customer selects `paperSize`: `carta` | `oficio` (default carta).
3. If PDF (or PDF from `.docx`): detect MediaBox → preselect; warn if choice ≠ detection.
4. Count pages:
   - PDF: real page count via PDF library
   - Text: estimate pages using chars/lines per **selected paper size**
   - `.docx`: convert via Gotenberg → PDF, then detect + count; persist `print_ready`
5. Load unit price from `PriceConfig` (e.g. `print.bw.carta.page`).
6. Quote: `pages * copies * unitPriceCents`.
7. Create `Order` (`PRINT_STANDARD`) + `Asset` + `metadata.paperSize` + pricing snapshot (`QUOTED`).
8. Client authorizes quote → `CONFIRMED` (no PrintNode).
9. Staff prints from admin → create `PrintJob`, call PrintNode, store remote id.
10. Map failures to `FAILED` + `lastError`; expose staff retry.

## Do / Don't

- Do persist quote snapshot and `paperSize` before confirm.
- Do generate text→PDF at carta or oficio dimensions, not A4.
- Don't send unvalidated files to PrintNode.
- Don't compute prices only on the client.
- Don't expose Gotenberg to the public internet; use `GOTENBERG_URL` server-side only.
- Prod MVP: Gotenberg on the same Lightsail 4 GB host as the app (see architecture spec).

## References

- [docs/specs/02-services.md](../../../docs/specs/02-services.md)
- [docs/specs/06-paper-sizes.md](../../../docs/specs/06-paper-sizes.md)
- [docs/specs/01-architecture.md](../../../docs/specs/01-architecture.md)
- Skill: `printnode-integration`
