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
| Impresión estándar | El cliente sube PDF/texto/Word, elige **carta u oficio**, ve hojas y precio; staff imprime vía PrintNode |
| Impresión especial | Maquetación de fotos/docs en **carta u oficio** y medidas de catálogo; export comprimido (&lt;2MB) opcional |
| Generación de CV | CV guiado (n8n + plantillas) |
| Derechos de petición | Generación guiada de derechos de petición (n8n + plantillas) |

## Contexto operativo

- Impresora con **dos bandejas**: carta y oficio (ver [06-paper-sizes.md](06-paper-sizes.md)).
- El cliente elige tamaño de hoja en impresión estándar y especial; el PDF print-ready debe coincidir con la bandeja física.

## Criterios de éxito (MVP)

1. El cliente puede subir un PDF, elegir **carta u oficio**, ver cantidad de hojas y precio, y autorizar un pedido.
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
