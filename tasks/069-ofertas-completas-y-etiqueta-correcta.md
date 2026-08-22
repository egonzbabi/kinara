---
id: 069
title: "Home/Ofertas: mostrar todos los productos en oferta, siempre con la etiqueta 'Oferta'"
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

La sección "Ofertas" del home (tarea 031) tenía dos problemas, reportados juntos por el usuario: no mostraba todos los productos marcados en oferta, y algunos aparecían con la etiqueta "Nuevo" en vez de "Oferta" sobre la foto.

## Diagnóstico

Dos causas distintas, en la misma sección:

1. `ofertas = products.filter((p) => p.isOnSale).slice(0, 4)` — cortaba a 4 productos. Verificado contra la base real: hay 5 productos en oferta (GLOW LEGGIN, ONE MOTION JUMPSUIT, SCULPT SET, CROP TOP, BUTTON), así que uno siempre quedaba fuera.
2. La etiqueta que se muestra sobre la foto (`product.badge`) es un solo campo con prioridad fija Nuevo > Best-seller > Oferta (definida en `ProductForm.tsx`, tarea 020) — un producto marcado como Nuevo y en oferta a la vez guarda `badge: "Nuevo"`, y `ProductCard` siempre mostraba ese valor tal cual, sin importar en qué sección de la página apareciera. De los 5 productos en oferta, 2 (GLOW LEGGIN, CROP TOP) también son "Nuevo", así que mostraban esa etiqueta en vez de "Oferta" — justo dentro de la sección que se llama "Ofertas".

## Objetivo

1. La sección Ofertas del home muestra todos los productos en oferta, sin límite.
2. Dentro de esa sección, todas las tarjetas dicen "Oferta", sin importar qué otra bandera tenga el producto — el dato guardado del producto (`badge`) no se toca, solo se fuerza lo que se muestra ahí.

## Archivos involucrados

- `app/routes/_index.tsx`: `ofertas` ya no lleva `.slice(0, 4)` (a diferencia de `novedades`, que sigue acotada a 4 — es una vitrina, no pretende ser exhaustiva). Se pasa `forceBadge="Oferta"` a `<ProductGrid>` en esa sección.
- `app/components/ProductGrid.tsx`: nueva prop opcional `forceBadge?: string`, se reenvía a cada `ProductCard`.
- `app/components/ProductCard.tsx`: nueva prop opcional `forceBadge?: string` — `displayBadge = forceBadge ?? product.badge` reemplaza todas las comparaciones que antes usaban `product.badge` directamente para decidir color/texto de la etiqueta. Mismo patrón ya usado por `activeFamily` (una prop que cambia cómo se ve la tarjeta según el contexto de la sección, sin tocar el dato del producto).

## Restricciones específicas de esta tarea

- No se tocó la prioridad Nuevo > Best-seller > Oferta que usa el resto del sitio (tienda, detalle de producto, etc.) — sigue igual, es correcta para esos contextos. El cambio es puntual a la sección Ofertas del home.
- `novedades` (sección "Lo nuevo") se dejó con su límite de 4 — no se pidió cambiarla, y tiene un propósito distinto (vitrina, no listado completo).
- Se verificó que no exista ninguna otra "sección de ofertas" en el sitio (se revisó `/tienda`, que no tiene ningún filtro ni sección dedicada a ofertas) — el home es el único lugar afectado por este pedido.

## Criterios de aceptación

- [x] Los 5 productos en oferta aparecen en la sección Ofertas del home.
- [x] Los 5 dicen "Oferta" en la etiqueta, incluidos los 2 que también son "Nuevo".
- [x] El resto del sitio (tienda, detalle de producto) sigue mostrando la etiqueta de prioridad normal para esos mismos productos.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia paleta ni tipografía; reutiliza los mismos colores de badge ya definidos (`bg-clay-deep text-bone` para "Oferta").
- Regresiones encontradas: ninguna — se confirmó en el navegador que "Lo nuevo" sigue mostrando "Nuevo" normalmente (no se le pasó `forceBadge`).
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Se contaron los productos en oferta reales en la base (5) antes de implementar, para confirmar el diagnóstico.
- En el navegador: el home muestra los 5 productos en la sección Ofertas (GLOW LEGGIN, CROP TOP, SCULPT SET, ONE MOTION JUMPSUIT, BUTTON), los 5 con la etiqueta "Oferta" — incluidos GLOW LEGGIN y CROP TOP, que antes decían "Nuevo". Sección "Lo nuevo" más abajo sigue mostrando "Nuevo" en sus tarjetas, sin cambios. Sin errores de consola reales (se descartó un log residual de una pestaña de navegador vieja, de la tarea anterior).

## Notas de progreso

- 2026-08-19: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario.
