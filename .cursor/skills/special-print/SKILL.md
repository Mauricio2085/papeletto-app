---
name: special-print
description: Implements Papeletto special print layout, standard sizes, and web-safe exports under 2MB. Use when building impresión especial, photo layouts, print-ready PDFs, or platform compression.
---

# Impresión especial

## When to use

Photos/documents need layout on **carta** or **oficio** sheets and optional public/commercial export (&lt;2MB).

## Paper sizes

Customer must pick **carta** or **oficio** for the print-ready PDF page. Photo presets (e.g. 10×15) are laid out **on** that sheet. See [docs/specs/06-paper-sizes.md](../../../docs/specs/06-paper-sizes.md).

## Workflow

1. Accept images (JPEG/PNG/WebP) and allowed docs.
2. Customer picks **carta** or **oficio**, layout preset from **fixed catalog**, quantity, and whether web export is needed.
3. Generate **print-ready** PDF with MediaBox matching selected sheet and target DPI (e.g. 300 for photos).
4. If platform export: generate **web-safe** asset:
   - Compress quality ladder, then downscale until **byteSize &lt; 2_000_000**
   - Prefer keeping aspect ratio
5. Persist assets (`original`, `print_ready`, optional `web_safe`); `metadata.paperSize` + `layoutPreset`.
6. Price from `PriceConfig` special preset keys (`special.*`).
7. Submit only `print_ready` to PrintNode (staff).

## Acceptance checks

- [ ] Print-ready page size is carta or oficio per customer choice
- [ ] Layout preset matches catalog selection
- [ ] Web-safe is always &lt; 2MB when requested
- [ ] Original files retained as `original` assets

## References

- [docs/specs/02-services.md](../../../docs/specs/02-services.md)
- [docs/specs/06-paper-sizes.md](../../../docs/specs/06-paper-sizes.md)
- Skill: `printnode-integration`
