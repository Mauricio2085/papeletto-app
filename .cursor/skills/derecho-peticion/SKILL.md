---
name: derecho-peticion
description: Implements Papeletto derecho de petición document generation with forms and n8n. Use when building derechos de petición, petition forms, or related document jobs.
---

# Derechos de petición

## When to use

Building the derecho de petición drafting/generation flow.

## Workflow

1. Form sections: solicitante, entidad destinataria, hechos, peticiones, anexos opcionales.
2. Show short disclaimer: herramienta de redacción, no asesoría legal.
3. Validate → `Order` (`DOCUMENT_DERECHO_PETICION`) + `DocumentJob` (`DERECHO_PETICION`).
4. POST signed payload to `N8N_WEBHOOK_DERECHO_PETICION_URL`.
5. Callback → verify → store asset → `READY`.
6. Download + optional “Imprimir” → standard print order from generated PDF.

## Content rules

- Keep formal Spanish register in generated docs (template owned by n8n).
- Do not invent legal citations unless provided by template/user input.
- Persist full `inputPayload` for regeneration/audit.

## References

- Skill: `n8n-workflows`
- [docs/specs/02-services.md](../../../docs/specs/02-services.md)
