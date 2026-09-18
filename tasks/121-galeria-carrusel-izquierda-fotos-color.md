---
id: 121
title: "Detalle de producto: el carrusel de fotos extra pasa a la izquierda, en vez de debajo de la foto"
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

El usuario pidió mover el carrusel de "más fotos del color elegido" (que vivía debajo de la foto principal, agregado en la tarea 019 y arreglado en la 074) para que quede como una columna vertical a la izquierda de la foto principal, en vez de abajo. Aclaró explícitamente que esto es distinto de la galería de miniaturas por color (tarea 013): no quiere una miniatura por cada color a la izquierda — quiere las fotos extra del color YA seleccionado, y que el cambio de color siga siendo exclusivo de las bolitas de color del panel de la derecha.

## Objetivo

`ProductGallery` (antes usada para mostrar una miniatura por color) ahora muestra, en una columna izquierda siempre visible, las fotos del color actualmente elegido — el mismo contenido que antes vivía en el carrusel de abajo. Las bolitas de color de la derecha siguen siendo el único control para cambiar de color.

## Archivos involucrados

- `app/components/ProductGallery.tsx`
- `app/routes/producto.$slug.tsx`

## Restricciones específicas de esta tarea

- No tocar la sección de bolitas de color (`Color: Selecciona un color` + botones redondos) — debe seguir llamando a `setColor` exactamente igual que antes.
- No es válido "arreglar" solo el breakpoint responsive de la miniatura-por-color existente (eso fue un primer intento equivocado, corregido a mitad de la tarea tras aclaración explícita del usuario) — la fuente de datos del carrusel izquierdo debe ser las fotos del color activo (`product.colorGallery`), no una miniatura por color.

## Pasos sugeridos

1. En `producto.$slug.tsx`, reemplazar `galleryItems` (antes: una miniatura por color) por la lista de fotos del color mostrado (`colorPhotos`, con fallback a `product.gallery` si el color no tiene galería propia).
2. Cambiar `ProductGallery`'s `active`/`onSelect` para que controlen `activePhotoIndex` (qué foto del color se ve), no el color.
3. Eliminar el bloque JSX separado "Carrusel de más fotos del color elegido" (y su `carouselRef`/`useDragScroll`), ya que su contenido pasa a vivir dentro de `ProductGallery`.
4. En `ProductGallery.tsx`, la columna de miniaturas pasa de `flex-col-reverse` (abajo en mobile) a `flex-row` siempre (izquierda en todos los anchos), con scroll vertical propio.
5. Ajustar `MAIN_SIZES` para descontar el ancho de la columna izquierda en el `sizes` de la imagen principal.

## Criterios de aceptación

- [x] En un producto donde el color activo tiene varias fotos, aparece una columna vertical a la izquierda (mobile y desktop) con esas fotos; hacer clic en una cambia la foto principal sin tocar el color elegido.
- [x] En un producto/color con una sola foto, no aparece columna de miniaturas — solo la foto principal a ancho completo (igual que el carrusel de abajo original con `otherPhotos.length > 0`).
- [x] Las bolitas de color de la derecha siguen cambiando el color exactamente igual que antes, y al cambiar de color el carrusel izquierdo se actualiza para mostrar las fotos de ese nuevo color (reseteando a la primera foto).
- [x] `npm run typecheck` sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no se agrega ningún requisito nuevo de estándar (es una reorganización de layout ya aprobada implícitamente al aprobarse el patrón de galería); no rompe el requisito de "diseño visual intocable sin permiso" porque el cambio de layout fue pedido explícitamente por el usuario.
- Regresiones encontradas: durante la verificación en el navegador, la primera pestaña usada seguía cacheando un módulo viejo de React (error `activeGalleryIndex is not defined`, un identificador que ya no existe en el código fuente) — no era un bug del código sino un HMR/module-cache atascado en esa pestaña; se confirmó abriendo una pestaña nueva, donde cargó sin error.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno.

## Pruebas manuales

- `lulu-top-2315` (CROP TOP, colores con 5 fotos cada uno): verificado en mobile (375px) y desktop que el carrusel izquierdo muestra las 5 fotos de "Lila" (color por defecto), que hacer clic en una miniatura cambia la foto principal, y que al hacer clic en la bolita "Rojo" el color cambia (anillo de selección, botón de agregar al carrito se habilita, texto "Color: Rojo"), la foto principal y las 5 miniaturas cambian a las fotos de Rojo, y se resetea a la primera foto.
- `chaqueta-fit` (JACKET FIT, colores con una sola foto cada uno): verificado que no aparece carrusel izquierdo, solo la foto principal a ancho completo.

## Notas de progreso

- 2026-09-18: Primer intento (solo arreglar el breakpoint de la miniatura-por-color para que fuera siempre a la izquierda) fue corregido tras dos mensajes explícitos del usuario aclarando que quería el carrusel de fotos-extra-del-color, no una miniatura por color. Reimplementado correctamente y verificado en el navegador (mobile + desktop, con y sin fotos extra, y cambio de color). Pendiente de aprobación del usuario para subir a `main`.
