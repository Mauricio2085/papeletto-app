---
name: standard-print
description: Implements Papeletto standard print flow (PDF/text upload, page count, pricing, PrintNode). Use when building impresión estándar, page counting, print quotes, or standard print orders.
---

# Impresión estándar

## When to use

Customer uploads PDF or text → count pages → quote → confirm → PrintNode.

## Workflow

1. Validate file (MIME, size). PDF preferred; `.txt` allowed.
2. Count pages:
   - PDF: real page count via PDF library
   - Text: estimate pages from lines/chars per page (document constant in config)
3. Load unit price from `PriceConfig` (e.g. B&W A4 per page).
4. Quote: `pages * copies * unitPriceCents`.
5. Create `Order` (`PRINT_STANDARD`) + `Asset` (`original`) + pricing snapshot (`QUOTED`).
6. Client authorizes quote → `CONFIRMED` (no PrintNode).
7. Staff prints from admin → create `PrintJob`, call PrintNode, store remote id.
8. Map failures to `FAILED` + `lastError`; expose staff retry.

## Do / Don't

- Do persist quote snapshot before payment/confirm.
- Don't send unvalidated files to PrintNode.
- Don't compute prices only on the client.

## References

- [docs/specs/02-services.md](../../../docs/specs/02-services.md)
- Skill: `printnode-integration`
