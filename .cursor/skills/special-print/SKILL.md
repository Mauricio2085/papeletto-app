---
name: special-print
description: Implements Papeletto special print layout, standard sizes, and web-safe exports under 2MB. Use when building impresión especial, photo layouts, print-ready PDFs, or platform compression.
---

# Impresión especial

## When to use

Photos/documents need layout to standard print sizes and optional public/commercial export (&lt;2MB).

## Workflow

1. Accept images (JPEG/PNG/WebP) and allowed docs.
2. Customer picks size from **fixed catalog** (config), quantity, and whether web export is needed.
3. Generate **print-ready** asset (correct physical size / DPI).
4. If platform export: generate **web-safe** asset:
   - Compress quality ladder, then downscale until **byteSize &lt; 2_000_000**
   - Prefer keeping aspect ratio
5. Persist both assets (`print_ready`, `web_safe`).
6. Price from `PriceConfig` special size keys.
7. Submit only `print_ready` to PrintNode.

## Acceptance checks

- [ ] Print-ready matches selected size preset
- [ ] Web-safe is always &lt; 2MB when requested
- [ ] Original files retained as `original` assets

## References

- [docs/specs/02-services.md](../../../docs/specs/02-services.md)
- Skill: `printnode-integration`
