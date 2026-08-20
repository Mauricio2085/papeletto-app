---
name: n8n-workflows
description: Designs and wires n8n webhooks/callbacks for Papeletto document automations. Use when adding n8n workflows, signing webhooks, or handling generation callbacks.
---

# n8n workflows

## Responsibility split

| App (Next.js) | n8n |
|---------------|-----|
| Forms, validation, DB jobs | Templates, multi-step generation |
| Signed webhooks out | Heavy transforms |
| Callback verification + assets | Return file URL or binary meta |

## Outbound payload (minimum)

```json
{
  "jobId": "cuid",
  "type": "CV | DERECHO_PETICION",
  "callbackUrl": "https://app/.../api/webhooks/n8n",
  "payload": {}
}
```

Sign with `N8N_WEBHOOK_SECRET` (HMAC header). Reject unsigned/invalid callbacks.

## Callback handling

1. Verify signature
2. Load `DocumentJob` by `jobId` (404 if missing)
3. If already `READY`, return 200 (idempotent)
4. Store asset + mark `READY` or `FAILED` with error

## Adding a new automation

1. New env webhook URL
2. New `DocumentJobType` / `OrderType` if needed
3. Spec update under `docs/specs/`
4. Mirror form + skill/rule touchpoints

## References

- [docs/specs/04-integrations.md](../../../docs/specs/04-integrations.md)
