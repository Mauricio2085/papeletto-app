---
name: printnode-integration
description: Integrates PrintNode API for Papeletto print jobs, printers, retries, and server-only clients. Use when calling PrintNode, configuring printers, or debugging print submission.
---

# PrintNode integration

## Rules

- Server-only: `lib/printnode/`
- Auth via `PRINTNODE_API_KEY`
- Default printer: env or `PrinterConfig.isDefault`
- Persist `printNodeJobId` on every successful submit

## Submit checklist

1. Resolve printer id
2. Ensure asset is print-ready and readable from storage; PDF pages must match `metadata.paperSize` (carta/oficio — see [06-paper-sizes.md](../../../docs/specs/06-paper-sizes.md))
3. Staff loads correct physical tray (carta or oficio) before printing
4. Create local `PrintJob` row (`PROCESSING` / equivalent)
5. Call PrintNode create-print-job
6. Save remote id; update order status `SENT_TO_PRINTER`
7. On error: `FAILED`, `lastError`, no silent swallow

## Retry

- Staff-only retry reuses same order asset unless replaced
- Idempotency: avoid duplicate submits without explicit retry action

## References

- [docs/specs/04-integrations.md](../../../docs/specs/04-integrations.md)
- [docs/specs/06-paper-sizes.md](../../../docs/specs/06-paper-sizes.md)
- Official PrintNode API docs when implementing request shapes
