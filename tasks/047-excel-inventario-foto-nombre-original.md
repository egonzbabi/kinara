---
id: 047
title: "Excel de inventario: columna de foto más ancha + columna Nombre original"
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

Después de la tarea 046 (que redujo el alto de fila para evitar que las fotos se vieran estiradas), el usuario reportó que ahora la columna de la foto se veía "muy angosta" y las fotos seguían deformándose — el ancho de la columna Foto era 14 (unidades de Excel), demasiado angosto para el alto combinado de varias filas. También pidió una columna con el "nombre del campo url" (el slug del producto) llamada "Nombre original" — mismo dato que ya se agregó a `/admin/inventario` en pantalla (tarea 044) y a la hoja de shooting, ahora también en este Excel.

## Objetivo

- La columna Foto es más ancha (26, antes 14) y el alto de fila sube un poco (30pt, antes 24pt de la tarea 046) para que la proporción ancho/alto de la celda combinada se acerque más a una foto de prenda real y no se vea deformada.
- Nueva columna "Nombre original" (el slug del producto, ej. `daily-top`) entre "Producto" y "Tipo", combinada en un solo cuadro por producto igual que el resto de las columnas que no cambian por color/talla.

## Archivos involucrados

- `app/lib/admin-inventory-excel.server.ts` — `sheet.columns`: ancho de "Foto" a 26, nueva columna "Nombre original" (`nombreOriginal`, usa `InventoryRow.productSlug`, ya disponible desde la tarea 042); `ROW_HEIGHT` a 30; `MERGE_COLUMNS` actualizado con las letras de columna corridas por la columna nueva (A, B, C, D, E, J, L).

## Restricciones específicas de esta tarea

- No se agregó ningún campo nuevo a `listInventory()` — `productSlug` ya existía en `InventoryRow` desde la tarea 042 (se usa en pantalla y en la hoja de shooting), solo faltaba incluirlo en este Excel.
- Mismo cuidado que en la tarea 046: al insertar la columna nueva, todas las letras de columna después de "Producto" se recorrieron una posición — se revisó cada referencia (`MERGE_COLUMNS`, asignación de celdas, rango de la imagen) para que sigan apuntando a la columna correcta.

## Criterios de aceptación

- [x] La columna Foto tiene ancho 26 (antes 14).
- [x] Existe la columna "Nombre original" con el slug del producto, combinada por producto igual que Producto/Tipo/Precio/Estado/SKU original.
- [x] El resto de columnas y sus combinaciones (Color/Talla/SKU/Stock/Valor sin combinar; Producto/Tipo/Precio/Estado combinados) siguen funcionando igual que en la tarea 046.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia la fuente de datos; usa un campo (`productSlug`) que ya existía en `InventoryRow`.
- Regresiones encontradas: ninguna — se generó el Excel real de "NOVA TOP" y se confirmaron encabezados, valores y rangos combinados correctos tras el corrimiento de columnas.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Excel generado para "NOVA TOP" (12 renglones): encabezados `Foto, SKU original, Producto, Nombre original, Tipo, Color, Talla, SKU, Stock, Precio, Valor (stock × precio), Estado`; columna Foto con ancho `26`; alto de fila `30`; celda D2 (Nombre original) = `daily-top`; rangos combinados confirmados en A2:A13, B2:B13, C2:C13, D2:D13, E2:E13, J2:J13, L2:L13 (Foto, SKU original, Producto, Nombre original, Tipo, Precio, Estado).
- `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-15: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario tras revisar el Excel de la tarea 046.
