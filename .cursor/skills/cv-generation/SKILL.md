---
name: cv-generation
description: Implements Papeletto automatic CV generation via forms, DocumentJob, and n8n webhooks. Use when building CV flows, resume templates, or cv webhook callbacks.
---

# Generación de CV

## When to use

Building or changing the automatic CV generation service.

## Workflow

1. Collect structured Spanish form: datos personales, experiencia, educación, skills, plantilla.
2. Validate server-side; create `Order` (`DOCUMENT_CV`) + `DocumentJob` (`CV`, `QUEUED`).
3. POST to `N8N_WEBHOOK_CV_URL` with signed payload (`jobId`, `callbackUrl`, form data).
4. Return job id to UI; poll/refresh until `READY` or `FAILED`.
5. On n8n callback: verify HMAC, store generated `Asset`, set `READY`.
6. Offer download; optional bridge to impresión estándar.

## UX notes

- Clear progress: “Generando tu CV…”
- On failure: human-readable message + retry if safe

## References

- Skill: `n8n-workflows`
- [docs/specs/02-services.md](../../../docs/specs/02-services.md)
