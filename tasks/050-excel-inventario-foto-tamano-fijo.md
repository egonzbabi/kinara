---
id: 050
title: "Excel de inventario: fotos de tamaño fijo (ya no se estiran a la celda)"
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

Desde la tarea 043, la foto de cada producto se anclaba con un rango de celdas (`sheet.addImage(imageId, 'A{inicio}:A{fin}')`), lo que hace que exceljs **estire la imagen para llenar exactamente ese rango**. Como cada producto tiene un número distinto de filas (según cuántos colores/tallas tenga), las fotos salían de tamaños distintos entre sí — un producto con 3 filas mostraba la foto muy pequeña, uno con 32 filas la mostraba enorme y potencialmente deformada. El usuario preguntó si se podía hacer que todas las fotos fueran del mismo tamaño sin importar el alto de la celda.

## Objetivo

Todas las fotos del Excel de `/admin/inventario` tienen exactamente el mismo tamaño (80×100 px), sin importar cuántas filas ocupe el bloque combinado de ese producto.

## Archivos involucrados

- `app/lib/admin-inventory-excel.server.ts` — se cambió el anclaje de imagen de la forma "rango de celdas" (que estira) a la forma "posición + tamaño fijo" de exceljs (`{ tl: { col, row }, ext: { width, height } }`), ancladas en la esquina superior del bloque de cada producto con `PHOTO_WIDTH`/`PHOTO_HEIGHT` constantes (80×100).

## Restricciones específicas de esta tarea

- Con tamaño fijo, un producto con muy pocas filas (bloque bajo) puede hacer que la foto se asome visualmente sobre las filas del producto siguiente — es el comportamiento normal de imágenes flotantes en Excel (no están recortadas por los límites de la celda) y no rompe ni desordena los datos, solo es una superposición visual leve en productos con muy pocas variantes.
- No se tocó la lógica de combinación de celdas (Producto/Tipo/Precio/Color/Estado, tareas 046/049) — solo cómo se ancla la imagen.

## Criterios de aceptación

- [x] Todas las fotos del Excel tienen el mismo tamaño (80×100 px), sin importar el número de filas del producto.
- [x] Las fotos ya no se deforman por estirarse a un rango de celdas de alto variable.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia la fuente de datos ni la combinación de celdas de otras columnas.
- Regresiones encontradas: ninguna — se generó el Excel real combinando el producto con menos filas (ONE MOTION JUMPSUIT, 3 filas) y el de más filas (AURA LEGGIN, 32 filas) del catálogo, y ambas fotos midieron exactamente 80×100.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Se generó el Excel combinando el producto con menos filas del catálogo real (ONE MOTION JUMPSUIT, 3 filas) y el de más filas (AURA LEGGIN, 32 filas), y se leyeron las imágenes incrustadas con `sheet.getImages()`: ambas reportaron `ext: { width: 80, height: 100 }` — mismo tamaño exacto para ambos productos, sin importar la diferencia de filas.
- `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-15: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario tras notar que las fotos variaban de tamaño según el producto.
