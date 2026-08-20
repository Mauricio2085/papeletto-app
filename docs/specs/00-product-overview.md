# Papeletto — Visión de producto

## Visión

Papeletto es una app web para una papelería que permite a los clientes solicitar trabajos de impresión y generar documentos legales o profesionales en línea, y enrutarlos hacia impresoras físicas y flujos del personal.

## Marca

- Nombre del producto: **Papeletto**
- Contexto: papelería / servicios de impresión
- Audiencia: clientes presenciales y remotos que necesitan impresiones o generación de documentos

## Servicios principales

| Servicio | Resumen |
|---------|---------|
| Impresión estándar | El cliente sube PDF/texto; precio = hojas × precio unitario; envío a PrintNode |
| Impresión especial | Maquetación de fotos/docs en medidas estándar; también export comprimido (&lt;2MB) para plataformas públicas o comerciales |
| Generación de CV | CV guiado (n8n + plantillas) |
| Derechos de petición | Generación guiada de derechos de petición (n8n + plantillas) |

## Criterios de éxito (MVP)

1. El cliente puede subir un PDF, ver cantidad de hojas y precio, y enviar un pedido de impresión.
2. El pedido llega a PrintNode (o queda en estado claro de cola/fallo con visibilidad para el staff).
3. El flujo de impresión especial acepta imágenes/docs, produce layout print-ready y un export web-safe &lt;2MB.
4. Los flujos de CV y derecho de petición recogen datos, llaman n8n y devuelven documentos descargables.
5. El staff puede listar pedidos por estado y reintentar `PrintJob` fallidos.

## Fuera de alcance (MVP)

- Catálogo e-commerce completo / POS de inventario
- Multi-tenant multi-tienda
- Apps nativas móviles
- Editor de diseño complejo (tipo Canva)

## Personas

- **Cliente**: sube archivos, completa formularios, paga/confirma, descarga resultados.
- **Operador papelería**: monitorea cola de impresión, reintenta fallos, ajusta precios.
- **Admin**: configura impresoras, precios, webhooks de n8n, feature flags.
