---
id: 013
title: "Miniaturas de la galería del detalle de producto muestran la foto de cada color"
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

En la página de detalle de producto, la columna de miniaturas a la izquierda de la foto principal (`ProductGallery`) solo mostraba la foto del color actualmente seleccionado más las fotos genéricas del producto (normalmente 1-2 imágenes en total), aunque el producto tuviera foto real para 5, 6 o 7 colores distintos (tareas 009-011). El usuario pidió que esas miniaturas muestren la foto de todos los colores disponibles.

## Objetivo

Cuando un producto tiene foto real por color (`product.colorImages`), la columna de miniaturas muestra una miniatura por cada color (en el mismo orden que el selector de swatches), y hacer click en una miniatura cambia tanto la foto principal como el color seleccionado (mantiene todo sincronizado). Si el producto no tiene fotos por color todavía, se mantiene el comportamiento anterior (miniaturas = `product.gallery`).

## Archivos involucrados

- `app/components/ProductGallery.tsx` — pasa de manejar `images: string[]` con estado interno a `items: {src, color?}[]` con índice activo opcionalmente controlado por el padre.
- `app/routes/producto.$slug.tsx` — construye `galleryItems` (uno por color cuando aplica) y sincroniza el índice activo con el estado `color` existente.

## Restricciones específicas de esta tarea

- No es un cambio de diseño/paleta/layout — mismo estilo visual de miniaturas (mismas clases, mismo tamaño). Es un cambio de qué imágenes se listan y cómo se sincroniza la selección.
- No romper productos sin fotos por color todavía (deben seguir usando `product.gallery` sin cambios).

## Pasos sugeridos

1. Extender `ProductGallery` para aceptar items con color asociado y un índice activo controlado.
2. En la página de producto, construir la lista de miniaturas a partir de `product.colors` + `product.colorImages` cuando existan.
3. Sincronizar: click en swatch → cambia índice activo de la galería; click en miniatura → cambia el color seleccionado.
4. Verificar en el navegador con productos de 3, 5 y 7 colores.

## Criterios de aceptación

- [x] Productos con fotos por color muestran una miniatura por cada color en la galería (BICROSSFLARE: 7, PASTEL FALDA: 3).
- [x] Click en una miniatura cambia la foto principal Y actualiza el color seleccionado (label "Color: X" y el swatch resaltado).
- [x] Click en un swatch de color sigue resaltando la miniatura correspondiente.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia qué colores se muestran (eso lo sigue controlando `product_images.color_name`, requisito de tarea 009), solo cómo se listan sus miniaturas. No se toca paleta/tipografía/layout aprobado, solo el dato mostrado en un componente ya existente.
- Regresiones encontradas: ninguna. Productos sin `colorImages` (todavía sin fotos por color) siguen usando `product.gallery` sin cambios.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (es una corrección de comportamiento, no un estándar nuevo).

## Pruebas manuales

- [x] `/producto/bicrossflare` (7 colores): 7 miniaturas visibles al hacer scroll en la columna; click en "Rosa" cambia la foto principal y resalta el swatch rosa.
- [x] `/producto/pastel-falda` (3 colores): 3 miniaturas visibles, sincronización correcta.

## Notas de progreso

- 2026-07-14: Implementado. `ProductGallery` ahora recibe `items: {src, color?}[]` y un `active` opcional controlado por el padre (antes manejaba su propio índice con `images: string[]`). `producto.$slug.tsx` construye `galleryItems` a partir de `product.colors`/`product.colorImages` cuando existen, calcula `activeGalleryIndex` a partir del color seleccionado, y sincroniza ambos sentidos (swatch↔miniatura) vía el mismo estado `color`.
- 2026-07-14: Verificado que las miniaturas adicionales no se veían "perdidas" — con 7 colores la columna de miniaturas excede la altura de la imagen principal y requiere scroll de página (comportamiento esperado, `overflow: visible`, no hay recorte real).
- **TAREA COMPLETADA.**
