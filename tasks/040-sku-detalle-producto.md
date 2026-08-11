---
id: 040
title: "Mostrar el SKU en el detalle de producto"
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

Tarea 039 cambió la etiqueta "Modelo" por "SKU" en el admin. El usuario pidió, como siguiente paso, que el SKU también se muestre en `/producto/:slug` (la página de detalle de producto que ve el cliente al hacer clic en un producto).

El SKU real vive en `product_variants.modelo`, es específico de cada combinación color+talla (ej. `3322-BLANCO-M`) — no existía antes en el `Product` que carga `app/lib/catalog.ts`, solo se consultaba en el admin.

## Objetivo

Al entrar al detalle de un producto y elegir un color y una talla, se muestra el SKU exacto de esa combinación. Si el producto no tiene SKU cargado para esa combinación (o todavía no se eligió color/talla), no se muestra nada — nunca un placeholder vacío o "—" que se vea como un error.

## Archivos involucrados

- `app/data/products.ts` — nuevo campo opcional `skuByVariant?: Record<string, string>` en el tipo `Product` (clave `"Color|Talla"`).
- `app/lib/catalog.ts` — el `SELECT` de Supabase ahora pide también `modelo` de `product_variants`; `mapRow` arma el mapa `skuByVariant`.
- `app/routes/producto.$slug.tsx` — calcula `sku` a partir del color/talla elegidos y lo muestra como una línea pequeña ("SKU: CÓDIGO-COLOR-TALLA") antes del botón de añadir al carrito.

## Restricciones específicas de esta tarea

- Solo se agregó la columna `modelo` al `SELECT` ya existente — no se tocó ninguna política de RLS (`product_variants` ya tenía lectura pública, tarea 006; RLS es a nivel de fila, no de columna, así que no hacía falta ningún cambio de permisos).
- El SKU solo se muestra cuando el cliente ya eligió color Y talla (mismo criterio que ya usa el propio botón de "Añadir al carrito" para saber si la selección está completa) — nunca se muestra a medias ni con datos inventados.
- Estilo discreto (`text-[13px] text-muted`), no compite visualmente con el precio ni el CTA — consistente con el resto de la información secundaria de la página (envío, devoluciones).

## Criterios de aceptación

- [x] Al seleccionar color y talla en `/producto/:slug`, aparece "SKU: CÓDIGO-COLOR-TALLA" con el valor real de esa combinación.
- [x] Sin color/talla seleccionados, no aparece la línea de SKU.
- [x] Se ve bien en desktop y mobile.
- [x] `npm run typecheck` pasa sin errores; sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no rompe el requisito de "catálogo vive en Supabase, no hardcodeado" (tarea 006); solo se agrega una columna más a una consulta ya existente con lectura pública ya autorizada.
- Regresiones encontradas: ninguna — se verificó que la página de producto sigue funcionando igual para productos sin SKU cargado (no aparece la línea, sin errores).
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (extensión de un patrón de datos ya existente, no un requisito estructural nuevo).

## Pruebas manuales

- `/producto/daily-top`: sin selección, `document.body.innerText` no contiene "SKU:". Al elegir Blanco + M, aparece "SKU: 3322-BLANCO-M"; al cambiar a Vino + S (mobile, 375px), aparece "SKU: 3322-VINO-S" — confirma que el SKU cambia correctamente según la combinación elegida, no queda pegado al primero.
- Sin errores de consola en desktop ni mobile.

## Notas de progreso

- 2026-08-10: Tarea creada e implementada en la misma sesión, continuación directa de la tarea 039 a pedido explícito del usuario.
