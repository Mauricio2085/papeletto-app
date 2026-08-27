---
name: standard-print
description: Implements Papeletto standard print flow (PDF/text upload, page count, pricing, PrintNode). Use when building impresión estándar, page counting, print quotes, or standard print orders.
---

# Impresión estándar

## When to use

Customer uploads PDF, text, or `.docx` → count pages → quote → client authorizes → staff PrintNode.

## Workflow

1. Validate file (MIME, size). PDF preferred; `.txt` and `.docx` allowed (no legacy `.doc`).
2. Count pages:
   - PDF: real page count via PDF library
   - Text: estimate pages from lines/chars per page (document constant in config)
   - `.docx`: convert via Gotenberg → PDF, then real page count; persist `print_ready`
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
- Don't expose Gotenberg to the public internet; use `GOTENBERG_URL` server-side only.
- Prod MVP: Gotenberg on the same Lightsail 4 GB host as the app (see architecture spec).

## References

- [docs/specs/02-services.md](../../../docs/specs/02-services.md)
- [docs/specs/01-architecture.md](../../../docs/specs/01-architecture.md)
- Skill: `printnode-integration`
