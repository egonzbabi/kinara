---
id: 019
title: "Múltiples fotos por color + carrusel en la página de producto"
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

Hasta ahora cada color de un producto solo podía tener **una** foto (`product_images.position = 0`). El usuario pidió poder subir varias fotos por color desde el admin, mostrando la primera como foto principal (y en la miniatura de la izquierda) y el resto en un carrusel debajo de la foto principal, en un recuadro blanco.

## Objetivo

El admin puede subir, quitar y reordenar varias fotos por color. En la página de producto, la primera foto de cada color es la principal; si hay más, aparecen en un carrusel debajo (recuadro blanco) — al elegir una foto del carrusel, pasa a ser la principal.

## Archivos involucrados

- `app/lib/admin-catalog.server.ts` — `AdminColorInput.imageUrl` (string) → `imageUrls` (string[]); lectura/escritura de `product_images` con varias filas por color (`position` = índice).
- `app/components/admin/ProductForm.tsx` — UI de fotos por color: subir varias, quitar, reordenar (↑/↓/✕), igual que ya existía para la galería genérica.
- `app/routes/admin.upload.tsx` — la key de Storage para fotos de color ahora incluye timestamp (antes pisaba el archivo si se subía una segunda foto del mismo color).
- `app/data/products.ts` — nuevo campo `colorGallery?: Record<string, string[]>` (todas las fotos por color; `colorImages` sigue siendo solo la principal, para no romper nada que ya lo use).
- `app/lib/catalog.ts` — `mapRow` arma `colorGallery` agrupando `product_images` por color (ordenadas por `position`) y deriva `colorImages` como la primera de cada una.
- `app/components/ProductGallery.tsx` — nuevo prop opcional `mainSrcOverride` para mostrar una foto específica como principal sin tocar qué miniatura de color está activa.
- `app/routes/producto.$slug.tsx` — estado `activePhotoIndex` (se resetea al cambiar de color); carrusel nuevo (drag-scroll, mismo patrón que `BestsellerRail`/`LookbookBand` vía `useDragScroll`) debajo de la galería, solo visible si el color tiene más de una foto.

## Restricciones específicas de esta tarea

- No romper el comportamiento de productos con una sola foto por color (mayoría del catálogo actual) — debe verse exactamente igual que antes.
- El recuadro blanco del carrusel solo aparece cuando el color elegido tiene más de una foto.

## Pasos sugeridos

1. Cambiar el esquema de datos del admin (`AdminColorInput`, lectura/escritura en `admin-catalog.server.ts`).
2. Actualizar `ProductForm.tsx` para subir/quitar/reordenar varias fotos por color.
3. Actualizar `admin.upload.tsx` para no pisar archivos al subir una segunda foto del mismo color.
4. Actualizar `catalog.ts`/`products.ts` para exponer `colorGallery` en el catálogo público.
5. Agregar el carrusel en `producto.$slug.tsx` + soporte en `ProductGallery.tsx`.
6. Probar: en el admin, un producto con 4 colores de 1 foto cada uno debe guardar sin duplicar ni perder fotos; en el sitio, agregar una segunda foto de prueba a un color y confirmar que aparece el carrusel y que seleccionarla la pasa a principal.

## Criterios de aceptación

- [x] El admin permite subir varias fotos por color, quitarlas y reordenarlas (la primera queda marcada como principal).
- [x] La foto principal de cada color sigue siendo la que se ve en la miniatura de la izquierda y como foto principal, sin cambios para productos de una sola foto por color.
- [x] Cuando un color tiene más de una foto, aparece un carrusel (recuadro blanco) debajo de la foto principal con las demás; elegir una la pasa a ser la principal.
- [x] Guardar un producto sin cambios no duplica ni pierde fotos (probado end-to-end con CONJUNTO CAMUFLAJE).
- [x] `npm run typecheck` sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí. No contradice el patrón de "todos los colores con stock se muestran, caigan o no a la foto genérica" (tarea 018) — `colorImages` (principal) sigue derivándose igual, solo cambia de dónde sale.
- Regresiones encontradas: ninguna. Verificado que productos con una sola foto por color siguen funcionando igual (no aparece carrusel, la foto principal es la misma).
- Requisitos nuevos agregados a `REQUISITOS.md`: sí — ver sección "Datos (Supabase)".

## Pruebas manuales

- Admin: editar CONJUNTO CAMUFLAJE, confirmar que cada color muestra "Fotos (1)"; guardar sin cambios y confirmar en Supabase que `product_images` no duplicó ni perdió filas.
- Sitio: agregar temporalmente una segunda foto a un color vía script, confirmar que aparece el carrusel blanco debajo de la foto principal, que el thumbnail correcto se resalta, y que hacer clic en él cambia la foto principal y actualiza qué queda "en el carrusel". Foto de prueba eliminada después de verificar.

## Notas de progreso

- 2026-07-24: Implementado completo en una sesión. Cambios en `admin-catalog.server.ts`, `ProductForm.tsx`, `admin.upload.tsx`, `products.ts`, `catalog.ts`, `ProductGallery.tsx`, `producto.$slug.tsx`. Verificado en el navegador con una cuenta admin temporal (creada y eliminada al terminar): el flujo completo (lectura, guardado sin duplicar, carrusel en el sitio) funciona correctamente.
