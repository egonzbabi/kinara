---
id: 063
title: "Página de Política de Envíos"
status: done
---

<!--
Antes de trabajar esta tarea, Claude debe haber leído (en este orden):
1. ../CLAUDE.md
2. README.md (este directorio)
3. REQUISITOS.md (este directorio)
4. Este archivo completo
-->

## Contexto

Del mismo documento `~/Downloads/POLÍTICAS KINARA.pages` usado en la tarea 062 (Aviso de Privacidad), el usuario pidió publicar también la Política de Envíos que traía ese archivo.

## Objetivo

`/politica-de-envios` publica el texto completo de esa política, y el link "Envíos y entregas" del pie de página (que era un placeholder apuntando a `/tienda`, igual que "Devoluciones" antes de la tarea 061) ahora apunta ahí.

## Archivos involucrados

- `app/routes/politica-de-envios.tsx` (nueva): mismo patrón visual que `aviso-de-privacidad.tsx` y `politica-de-cambios-y-devoluciones.tsx` (mismas clases `sectionClass`/`h2Class`/`pClass`/`ulClass`). 7 secciones transcritas tal cual del documento del usuario: Tiempo de preparación, Tiempo de entrega, Guía de rastreo, Costos de envío, Dirección incorrecta, Cambios de talla, Pedidos no entregados.
- `app/routes.ts`: registra `politica-de-envios`.
- `app/components/SiteFooter.tsx`: "Envíos y entregas" pasa de apuntar a `/tienda` (placeholder sin conectar) a `/politica-de-envios`.

## Restricciones específicas de esta tarea

- No se tocó ningún otro mensaje de envío del sitio (el bullet "· Envío calculado al finalizar la compra" del detalle de producto, la tarjeta de `TrustStrip`, o el mensaje del marquee) — a diferencia de la tarea 061 (devoluciones), esos textos ya eran correctos (no afirmaban algo falso), así que no había nada que corregir; solo se conectó el link del footer que ya existía como placeholder con el nombre exacto "Envíos y entregas".
- Esta política no tiene correo de contacto propio en el documento del usuario (a diferencia del Aviso de Privacidad y la Política de Cambios y Devoluciones) — no se agregó ninguno por iniciativa propia.
- Texto transcrito tal cual, sin reescribir ni resumir.

## Criterios de aceptación

- [x] `/politica-de-envios` publica el texto completo de las 7 secciones.
- [x] El link "Envíos y entregas" del pie de página apunta a la nueva página.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — mismo patrón visual ya aprobado, reutilizado sin cambios.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Se abrió `/politica-de-envios` en el navegador y se confirmó el texto completo de las 7 secciones.
- Se confirmó vía JS en el home que el link `Envíos y entregas` del footer apunta a `/politica-de-envios`.
- Sin errores de consola.

## Notas de progreso

- 2026-08-18: Tarea creada e implementada en la misma sesión, inmediatamente después de la tarea 062, a pedido explícito del usuario ("sí, arma también la política de envíos"). El documento `.pages` original también contiene unos Términos y Condiciones completos, todavía no solicitados — el link "Términos" del pie de página sigue siendo placeholder `href="#"`.
