---
id: 020
title: "Agregar 'Oferta' como opción de destacar producto"
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

En "Destacar producto" del admin solo existían dos opciones (Nuevo, Best-seller). El usuario pidió que también se pueda marcar un producto como "Oferta".

## Objetivo

El admin puede marcar un producto como "Oferta" (checkbox junto a Nuevo/Best-seller); el sitio muestra la etiqueta "Oferta" sobre la foto igual que las otras, con su propio color.

## Archivos involucrados

- `supabase/migrations/20260726000000_product_on_sale.sql` — columna `products.is_on_sale`.
- `app/lib/catalog-constants.ts` — `VALID_BADGES` incluye `"Oferta"`.
- `app/data/products.ts` — tipo `Product.badge` incluye `"Oferta"`; nuevo campo `isOnSale?: boolean`.
- `app/lib/catalog.ts` / `app/lib/admin-catalog.server.ts` — leen/escriben `is_on_sale` igual que `is_new`/`is_bestseller`.
- `app/lib/supabase.types.ts` — tipo generado actualizado con `is_on_sale`.
- `app/components/admin/ProductForm.tsx` — tercer checkbox "Oferta"; prioridad si se marca más de una: Nuevo > Best-seller > Oferta.
- `app/components/ProductCard.tsx` — color del badge "Oferta" (`bg-clay-deep`, ya existente en la paleta, no se agregó color nuevo).
- `app/routes/admin.productos.$id.tsx` / `admin.productos.nuevo.tsx` — parsean `isOnSale` del form.
- `scripts/migrate-products.ts` / `scripts/migrate-parte2.ts` — `is_on_sale: false` agregado a sus upserts (solo para que compile, scripts ya corridos históricamente).

## Restricciones específicas de esta tarea

- No se agregó ningún color nuevo a la paleta — "Oferta" reutiliza `clay-deep`, ya definido para hover de `.btn-clay`.
- No se creó una sección "Ofertas" en la home ni se tocó el orden de `/tienda` — el pedido fue solo la etiqueta, igual que "Edición"/"Últimas unidades" que tampoco tienen sección propia.

## Pasos sugeridos

1. Migración: agregar `products.is_on_sale`.
2. Actualizar tipos (`catalog-constants.ts`, `products.ts`, `supabase.types.ts`).
3. Actualizar `catalog.ts` y `admin-catalog.server.ts` (lectura/escritura).
4. Actualizar rutas admin que parsean el form.
5. Agregar el checkbox en `ProductForm.tsx` + prioridad de badge.
6. Agregar el color del badge en `ProductCard.tsx`.
7. Arreglar los 2 scripts de migración históricos para que compilen.
8. Probar en el navegador con una cuenta admin temporal.

## Criterios de aceptación

- [x] El admin muestra un tercer checkbox "Oferta" junto a Nuevo/Best-seller.
- [x] Marcar "Oferta" (sin Nuevo/Best-seller) hace que el producto muestre la etiqueta "Oferta" en `/tienda` y en el detalle, con un color propio distinto a los otros badges.
- [x] Si se marca más de una casilla, gana Nuevo > Best-seller > Oferta (mismo patrón ya usado).
- [x] `npm run typecheck` sin errores.
- [x] Verificado en el navegador con cuenta admin temporal (creada y eliminada al terminar): checkbox aparece, guardar cambia el badge visible en `/tienda` y `/producto/:slug`, y se revirtió el producto de prueba (AIRLIFT SHORT) a su estado original (Nuevo) al terminar.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí, no aplica ningún punto existente en conflicto.
- Regresiones encontradas: ninguna — `isNew`/`isBestseller` conservan su comportamiento (Novedades, carrusel de más vendidos, orden de tienda) intacto.
- Requisitos nuevos agregados a `REQUISITOS.md`: no se agregó ninguno nuevo (es una extensión simple del patrón ya documentado de tarea 006/015 para escritura del catálogo vía admin con `service_role`).

## Pruebas manuales

- Editar un producto en `/admin/productos/:id`, marcar "Oferta", guardar, y confirmar que `/tienda` y `/producto/:slug` muestran la etiqueta "Oferta" con su propio color.

## Notas de progreso

- 2026-07-26: Implementado completo en una sesión (migración, tipos, admin, storefront) y verificado en el navegador con cuenta admin temporal.
