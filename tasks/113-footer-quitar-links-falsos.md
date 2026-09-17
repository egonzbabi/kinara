---
id: 113
title: "Footer: quitar links que no llevan a nada real"
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

El usuario pidió quitar del footer "todas las opciones que no tenemos" en las columnas Marca/Tienda/Ayuda. Revisando `SiteFooter.tsx` se confirmó que varios links eran placeholders que nunca se conectaron a nada real:

- "Guía de tallas" (columna Ayuda) → apuntaba a `/tienda`, no existe ninguna guía de tallas.
- Columna **Marca** completa → sus 4 links ("Nuestra historia", "Sostenibilidad", "Instagram", "TikTok") apuntaban todos a `/tienda` — no hay página de historia/sostenibilidad ni cuentas de redes sociales conectadas.
- "Términos" y "Cookies" (fila inferior) → `href="#"`, enlaces muertos sin página real detrás.

## Objetivo

El footer solo muestra links que van a una página real que existe hoy.

## Archivos involucrados

- `app/components/SiteFooter.tsx`

## Restricciones específicas de esta tarea

- No inventar páginas nuevas para "rellenar" lo que se quita — el pedido fue quitar, no crear contenido de relleno.
- Ajustar el grid de columnas para que no quede un hueco vacío al quitar la columna Marca completa.

## Criterios de aceptación

- [x] Columna "Marca" eliminada por completo (los 4 links eran falsos).
- [x] "Guía de tallas" eliminado de la columna "Ayuda" (quedan: Envíos y entregas, Cambios y devoluciones, Contacto — las 3 reales).
- [x] "Términos" y "Cookies" eliminados de la fila inferior (quedan: copyright + "Privacidad", el único link real ahí).
- [x] Grid ajustado de 4 a 3 columnas (`md:grid-cols-[1.4fr_1fr_1fr]`) — sin hueco vacío visible.
- [x] `npm run typecheck` limpio.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no rompe el patrón de heading `<h3>` para las columnas del footer (tarea 102), solo quita una de las tres columnas existentes.
- Regresiones encontradas: ninguna — verificado en el navegador (desktop y mobile 375px) que el footer se ve equilibrado con 2 columnas de links en vez de 3, sin huecos ni desalineación.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno.

## Pruebas manuales

- Verificado en el navegador (desktop y mobile): el footer renderiza correctamente con "Tienda" y "Ayuda" únicamente, sin columna "Marca".
- Confirmado por DOM (`textContent`) que ningún link fantasma sigue presente.
- `npm run typecheck` limpio, sin errores de consola.

## Notas de progreso

- 2026-09-17: Implementado y verificado en una sola sesión, a partir del pedido explícito del usuario.
