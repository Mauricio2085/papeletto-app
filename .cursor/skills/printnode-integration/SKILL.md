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
2. Ensure asset is print-ready and readable from storage
3. Create local `PrintJob` row (`PROCESSING` / equivalent)
4. Call PrintNode create-print-job
5. Save remote id; update order status `SENT_TO_PRINTER`
6. On error: `FAILED`, `lastError`, no silent swallow

## Retry

- Staff-only retry reuses same order asset unless replaced
- Idempotency: avoid duplicate submits without explicit retry action

## References

- [docs/specs/04-integrations.md](../../../docs/specs/04-integrations.md)
- Official PrintNode API docs when implementing request shapes
