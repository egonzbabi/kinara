---
id: 145
title: "WhatsApp para consultas (producto, pie de página y contacto)"
status: done
---

## Contexto

La ropa es elástica y aún no hay tabla de medidas por talla; además las clientas necesitan un canal directo para cualquier consulta (talla, envío, pedido). La usuaria eligió un solo número de WhatsApp Business (el de la oficina, 55 1273 5325) atendido por dos personas con dispositivos vinculados, y que el enlace sea para cualquier consulta, no solo tallas.

## Objetivo

Enlaces a WhatsApp (`wa.me`) con mensaje ya escrito en tres lugares:
1. Página de producto, bajo el selector de talla: "¿Necesitas ayuda con tu pedido? Escríbenos por WhatsApp" (el mensaje menciona la prenda y el color si está elegido).
2. Pie de página, columna "Ayuda": "WhatsApp".
3. Página `/contacto`: línea "¿Prefieres WhatsApp?" bajo la introducción.
Cada clic se mide en GA4 (`contact`, `method: whatsapp`, `source`).

## Archivos involucrados

- `app/lib/whatsapp.ts` (número y armado del enlace)
- `app/lib/analytics.ts` (`trackWhatsappClick`)
- `app/routes/producto.$slug.tsx`, `app/components/SiteFooter.tsx`, `app/routes/contacto.tsx`

## Restricciones específicas de esta tarea

- Sin cambios de paleta ni tipografía: enlaces de texto con las clases ya usadas. Sin botón flotante (la usuaria no lo eligió).
- El número vive en un solo lugar (`WHATSAPP_NUMBER`).
- No se promete horario de respuesta en el texto (la usuaria no lo confirmó).

## Criterios de aceptación

- [x] Los tres enlaces abren `https://wa.me/525512735325?text=…` en pestaña nueva.
- [x] En producto, el mensaje incluye el nombre de la prenda (y el color si está elegido).
- [x] El clic dispara `contact` en GA4 con `source` producto / footer / contacto.
- [x] Typecheck sin errores; se ve bien a 375 px.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (sin cambios de paleta/tipografía; GA4 usa `trackEvent` que empuja `arguments`)
- Regresiones encontradas: ninguna
- Requisitos nuevos agregados a `REQUISITOS.md`: sí (número de WhatsApp en un solo lugar)

## Notas de progreso

- 2026-10-20: implementada y verificada en local (producto a 375 px, footer, /contacto). Falta subir a producción (requiere aprobación). Nota: una primera versión solo-tallas se descartó antes de commit; la usuaria pidió canal general.
- 2026-10-20: a petición de la usuaria se agregó el logo oficial de WhatsApp (`app/components/WhatsappIcon.tsx`, trazo de Simple Icons) en el enlace de producto, el de contacto y como cuarto ícono de redes del pie de página (se conserva el texto "WhatsApp" en Ayuda).
