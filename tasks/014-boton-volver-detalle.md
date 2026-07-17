---
id: 014
title: 'Botón "Volver" en el detalle de producto regresa a la tienda con filtros y scroll intactos'
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

En el detalle de producto solo existía un breadcrumb ("Inicio / Categoría / Producto"). El link de categoría del breadcrumb lleva a `/tienda?cat=X` limpio, lo que pierde cualquier otro filtro activo (talla, color, orden) y no restaura la posición de scroll en la que estaba el usuario dentro de la lista. El usuario pidió un botón para volver a la página anterior exactamente donde estaba (la lista de productos en el punto donde hizo click), no reiniciar al principio de la tienda.

## Objetivo

Agregar un botón "Volver" en el detalle de producto que use la navegación de historial del navegador (`navigate(-1)`) para regresar exactamente a la vista anterior — misma URL con todos sus filtros (`cat`, `talla`, `color`, `orden`, etc. vía query params) y la misma posición de scroll.

## Archivos involucrados

- `app/routes/producto.$slug.tsx` — botón nuevo arriba del breadcrumb, usa `useNavigate()` de `react-router`.

## Restricciones específicas de esta tarea

- No rediseñar el breadcrumb existente, solo agregar el botón nuevo con el mismo estilo tipográfico (`text-muted`, hover `text-clay`) ya usado ahí.
- No implementar una reconstrucción manual de URL — usar el historial real del navegador para heredar automáticamente scroll y cualquier filtro, sin tener que duplicar el estado de filtros de `tienda.tsx` en el detalle de producto.

## Pasos sugeridos

1. Agregar botón "Volver" con ícono de flecha, usando `useNavigate()` + `navigate(-1)`.
2. Verificar que `<ScrollRestoration />` (ya presente en `app/root.tsx`) restaura la posición de scroll al usar `navigate(-1)`.
3. Probar con filtros activos en la tienda (ej. `?cat=mujer`) y con scroll bajado, para confirmar que "Volver" regresa exactamente ahí.

## Criterios de aceptación

- [x] Botón "Volver" visible en el detalle de producto, arriba del breadcrumb.
- [x] Click en "Volver" regresa a la URL exacta de la tienda con sus filtros (ej. `/tienda?cat=mujer`), no a `/tienda` limpio ni a inicio.
- [x] La posición de scroll de la lista se restaura (verificado con scroll a 1200px antes de entrar al producto).
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no toca paleta/tipografía/layout aprobado, solo agrega un control de navegación nuevo con el mismo lenguaje visual del breadcrumb existente.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (es una mejora de navegación puntual, no un estándar transversal nuevo).

## Pruebas manuales

- [x] Desde `/tienda?cat=mujer`, con scroll bajado ~1200px, click en un producto y luego en "Volver": confirmado que la URL vuelve a `/tienda?cat=mujer` y `window.scrollY` vuelve a 1200 (mismo valor exacto).

## Notas de progreso

- 2026-07-14: Implementado con `useNavigate()` + `navigate(-1)` en vez de reconstruir la URL manualmente — esto hereda automáticamente cualquier filtro de `tienda.tsx` (categoría, talla, color, orden) sin acoplar el detalle de producto al estado de esa página.
- 2026-07-14: Durante la verificación se descubrió que el sitio tiene `scroll-behavior: smooth` global, lo que inicialmente hizo parecer que el scroll no se restauraba (las lecturas de `window.scrollY` inmediatamente después de navegar capturaban la animación a medio camino). Confirmado con una espera adecuada que `<ScrollRestoration />` (ya presente en `app/root.tsx`) sí restaura la posición exacta.
- **TAREA COMPLETADA.**
