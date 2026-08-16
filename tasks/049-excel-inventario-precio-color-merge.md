---
id: 049
title: "Excel de inventario: mueve Precio junto a Color y combina filas por color"
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

El usuario pidió dos ajustes más al Excel de `/admin/inventario` (tareas 043/046/047): mover la columna Precio para que quede entre Tipo y Color, y combinar en un solo cuadro las filas que comparten el mismo color (antes Color se repetía en cada talla de un mismo color, solo Producto/Tipo/Precio/Estado estaban combinados a nivel de todo el producto). También preguntó qué significa "Estado: Publicado".

**Respuesta a la pregunta:** "Publicado" quiere decir que el producto está visible y a la venta en `/tienda` (lo opuesto de "Borrador", que son productos sin precio todavía — ver `is_draft` en la base de datos).

## Objetivo

- Orden de columnas: Foto, SKU original, Producto, Nombre original, Tipo, **Precio**, **Color**, Talla, SKU, Stock, Valor, Estado.
- Precio combinado por producto (igual que antes, solo cambió de posición).
- Color combinado por sub-bloque: todas las filas de un mismo color (una por talla) comparten un solo cuadro en la columna Color — no todo el producto, solo mientras el color no cambie.
- Talla, SKU, Stock y Valor siguen siendo un valor por renglón.

## Archivos involucrados

- `app/lib/admin-inventory-excel.server.ts` — `sheet.columns` reordenado; `MERGE_COLUMNS` (combinación a nivel de todo el producto) actualizado a las nuevas letras; nueva lógica de combinación anidada para Color, que detecta dónde empieza y termina cada bloque de color dentro del grupo del producto (comparando con la fila anterior/siguiente) y combina esa columna en ese sub-rango.

## Restricciones específicas de esta tarea

- La combinación de Color depende de que las filas de un mismo color lleguen consecutivas desde `listInventory()` — ya es así (se verificó: Blanco S/M/L, luego Vino S/M/L, etc., nunca intercaladas), así que no hizo falta reordenar nada antes de armar el Excel.
- Al combinar Color, igual que con las demás columnas combinadas, el valor solo se escribe en la fila superior del sub-bloque — el resto se deja vacío (regla de exceljs/Excel: solo la celda superior-izquierda de un rango combinado puede tener valor).

## Criterios de aceptación

- [x] El orden de columnas es Foto, SKU original, Producto, Nombre original, Tipo, Precio, Color, Talla, SKU, Stock, Valor, Estado.
- [x] Precio sigue combinado por producto completo (mismo comportamiento de antes, nueva posición).
- [x] Color se combina solo dentro de las filas de ese mismo color, no de todo el producto.
- [x] Talla, SKU, Stock y Valor siguen siendo un valor por renglón.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia la fuente de datos ni el mecanismo de filtros, solo el orden/agrupación visual de columnas ya existentes.
- Regresiones encontradas: ninguna — se generó el Excel real de "NOVA TOP" y se confirmó que cada renglón conserva su Talla/SKU/Stock/Valor correctos y que los rangos combinados de Foto/SKU original/Producto/Nombre original/Tipo/Precio/Estado siguen abarcando las 12 filas completas del producto.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Excel generado para "NOVA TOP" (12 filas: 4 colores × 3 tallas): encabezados en el orden pedido; Precio (columna F) combinado F2:F13; Color (columna G) combinado en 4 sub-bloques correctos — `G2:G4` (Blanco), `G5:G7` (Vino), `G8:G10` (Rosa), `G11:G13` (Negro); cada fila conserva su Talla/SKU/Stock/Valor individual (ej. fila 5: Vino/S/`3322-VINO-S`/2/798).
- `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-15: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario, junto con la aclaración de qué significa el estado "Publicado" (visible y a la venta en /tienda, vs. "Borrador" = sin precio todavía).
