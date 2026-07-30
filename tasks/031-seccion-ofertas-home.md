---
id: 031
title: "Home: sección de Ofertas antes de Lo nuevo"
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

El usuario pidió una sección de "Ofertas" en el home, antes de la sección "Lo nuevo". El catálogo ya tiene el flag `products.is_on_sale` (tarea 020, usado hoy solo para el badge "Oferta" en `ProductCard`) — no existía ninguna sección en el home que agrupara los productos marcados así.

## Objetivo

El home (`_index.tsx`) muestra una sección "Ofertas" (mismo estilo que "Lo nuevo": grid de productos + link "Ver todo") justo antes de "Lo nuevo", con los productos donde `isOnSale` es `true`. Si no hay ningún producto en oferta, la sección no se renderiza (no mostrar un encabezado vacío).

## Archivos involucrados

- `app/routes/_index.tsx`

## Restricciones específicas de esta tarea

- Mismo patrón visual que la sección "Lo nuevo" ya existente (label + h2 + link "Ver todo" + `ProductGrid`) — no inventar un layout nuevo.
- Ocultar la sección por completo si no hay productos en oferta (hoy no hay ninguno publicado con `is_on_sale = true` — verificado contra la base real).

## Pasos sugeridos

1. Filtrar `products` por `isOnSale` en el loader/componente de `_index.tsx`, igual que ya se hace con `isNew` para "Lo nuevo".
2. Agregar la sección `<section>` con el mismo markup que "Lo nuevo", antes de esa sección, condicionada a que haya al menos 1 producto.
3. Verificar en el navegador: con 0 productos en oferta (estado real actual) no debe aparecer nada; marcar un producto de prueba como oferta desde `/admin/productos` y confirmar que aparece.

## Criterios de aceptación

- [x] Sección "Ofertas" aparece antes de "Lo nuevo" cuando hay al menos un producto con `isOnSale`.
- [x] La sección no se renderiza si no hay productos en oferta (no deja un hueco/encabezado vacío).
- [x] `npm run typecheck` pasa sin errores; verificado en el navegador sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no aplica ningún requisito de datos nuevo, reusa `products.is_on_sale` ya existente (tarea 020).
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Home con 0 productos en oferta (estado real): confirmado que no aparece la sección (pasa directo de "Compra por tipo" a "Lo nuevo").
- Marcados temporalmente 2 productos (`CONJUNTO NUBE`, `ZIPPER BRA`) como `is_on_sale = true` directo en la base de datos (más rápido que pasar por el admin para una prueba), recargado el home: la sección "Ofertas" apareció correctamente antes de "Lo nuevo" con esos 2 productos. Revertidos a `is_on_sale = false` al terminar — confirmado que quedaron 0 productos en oferta de nuevo.
- Sin errores de consola relacionados (los únicos vistos eran de un `<img src="">` de un carrito de prueba de una sesión anterior, en una pestaña vieja — confirmado en una pestaña nueva que no hay ningún error).

## Notas de progreso

- 2026-07-29: Tarea creada e implementada en la misma sesión. Verificado contra la base real: 0 productos publicados tenían `is_on_sale = true` al empezar, así que se agregó la condición `ofertas.length > 0` para ocultar la sección por defecto. Se agregó el filtro `products.filter((p) => p.isOnSale).slice(0, 4)` en `_index.tsx`, siguiendo exactamente el mismo patrón visual que "Lo nuevo" (label "Por tiempo limitado" + h2 "Ofertas" + link "Ver todo" + `ProductGrid`), colocado antes de esa sección. Verificado en el navegador marcando/revirtiendo 2 productos de prueba directo en la base de datos. `npm run typecheck` sin errores.
