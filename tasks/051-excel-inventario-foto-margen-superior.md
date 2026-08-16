---
id: 051
title: "Excel de inventario: margen superior en la foto para que no se encime con el producto de arriba"
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

Después de la tarea 050 (fotos de tamaño fijo), el usuario reportó que la foto quedaba pegada justo al borde superior de su bloque, dando la impresión de encimarse visualmente con el producto de arriba. Pidió bajarla un poco.

## Objetivo

Cada foto tiene un pequeño margen superior (~12px) antes de empezar, para que quede claramente separada del producto anterior — sin perder el tamaño fijo (80×100) de la tarea 050.

## Archivos involucrados

- `app/lib/admin-inventory-excel.server.ts` — el anclaje de la imagen (`sheet.addImage`, forma `{ tl: { col, row }, ext }`) usa un `row` fraccionario: la parte entera es la fila donde empieza el bloque del producto, la parte decimal (`PHOTO_TOP_OFFSET_FRACTION`) es qué tan abajo de esa fila arranca la imagen, expresada como fracción del alto de fila (`ROW_HEIGHT`, en puntos).

## Restricciones específicas de esta tarea

- **Primer intento fallido (corregido en la misma tarea):** se intentó pasar `colOff`/`rowOff` directamente junto con `col`/`row` en el objeto de anclaje — la clase `Anchor` de exceljs ignora esos campos por completo cuando `col` está presente (según su propio código fuente, revisado directamente en `node_modules/exceljs/lib/doc/anchor.js`), así que el margen no se aplicaba (se verificó con un script que el `rowOff` quedaba en 0). La forma correcta que exceljs sí soporta es un valor **fraccionario** en `row` (ej. `1.3` = fila 1, 30% de su alto hacia abajo) — así quedó implementado.
- No se tocó el tamaño fijo (80×100) de la tarea 050 ni la combinación de celdas de tareas anteriores.

## Criterios de aceptación

- [x] La foto de cada producto tiene un margen superior visible (no queda pegada al borde de la fila donde empieza su bloque).
- [x] El tamaño de la foto sigue siendo fijo (80×100), sin importar el margen agregado.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia la fuente de datos ni el tamaño fijo ya establecido en la tarea 050.
- Regresiones encontradas: el primer intento (con `rowOff` directo) no funcionó — se detectó y corrigió antes de cerrar la tarea, verificando con un script que leyó el archivo generado (`sheet.getImages()`) y confirmó `nativeRowOff: 0` en el primer intento vs. `nativeRowOff: 90000` (≈12px) después del arreglo.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Se generó el Excel de NOVA TOP y FIT SHORT y se leyeron las imágenes con `sheet.getImages()`: ambas mostraron `nativeRowOff: 90000` (el margen esperado) y `ext: { width: 80, height: 100 }` (tamaño sin cambios).
- `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-15: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario tras revisar el Excel de la tarea 050. Se documentó el hallazgo sobre la limitación real de `ImagePosition` en exceljs para que no se repita el mismo intento fallido en el futuro.
