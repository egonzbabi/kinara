---
id: 046
title: "Excel de inventario: reduce alto de fila y combina todas las columnas repetidas"
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

El usuario reportó que en el Excel descargado desde `/admin/inventario` (tareas 043/045) los renglones se veían "muy anchos" y las fotos "muy mal" — el alto de fila estaba fijo en 60pt para cada uno de los ~481 renglones, y al combinarse la foto en un rango de muchos renglones (ej. 12 para un producto con 4 colores × 3 tallas), la imagen quedaba estirada verticalmente de forma exagerada. Además pidió combinar en un solo cuadro **todas** las columnas consecutivas que repiten la misma información por producto, no solo Foto y SKU original.

## Objetivo

- Alto de fila reducido (24pt en vez de 60pt) para que las fotos no se vean estiradas/deformadas.
- Además de Foto y SKU original (ya combinados desde la tarea 043), ahora también se combinan en un solo cuadro por producto: **Producto**, **Tipo** y **Estado** (Borrador/Publicado) — son el mismo valor en cada renglón de un producto. **Precio** también se combina, porque en este catálogo el precio es un dato del producto, no de la combinación color+talla (aunque **Valor**, al depender del stock de cada renglón, sigue sin combinarse).
- Color, Talla, SKU completo, Stock y Valor siguen siendo un valor por renglón, porque sí cambian entre combinaciones color+talla.

## Archivos involucrados

- `app/lib/admin-inventory-excel.server.ts` — `ROW_HEIGHT` bajó de 60 a 24; nuevo arreglo `MERGE_COLUMNS` (A, B, C, D, I, K) que se combina por grupo de producto; los valores de Producto/Tipo/Precio/Estado ahora se escriben una sola vez (en la fila superior del grupo, igual que ya se hacía con el SKU original) en vez de repetirse en cada `addRow`.

## Restricciones específicas de esta tarea

- Al combinar una celda en exceljs (igual que en Excel), solo la celda superior-izquierda del rango puede tener valor — las demás deben ir vacías; se ajustó `sheet.addRow(...)` para no volver a escribir esos campos en cada renglón.
- No se tocó la lógica de `listInventory()` ni la agrupación por producto — mismo mecanismo de la tarea 043.
- El archivo sigue reflejando los filtros de búsqueda/tipo activos en pantalla (sin cambios en `admin.inventario.excel.tsx`).

## Criterios de aceptación

- [x] El alto de cada fila de datos es 24pt (antes 60pt).
- [x] Foto, SKU original, Producto, Tipo, Precio y Estado quedan en un solo cuadro combinado por producto.
- [x] Color, Talla, SKU completo, Stock y Valor siguen teniendo su propio valor en cada renglón.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia la fuente de datos ni el mecanismo de filtros; solo el formato/presentación del archivo generado.
- Regresiones encontradas: ninguna — se generó el Excel real de un producto de prueba y se confirmó que cada renglón sigue devolviendo los valores correctos (Color/Talla/SKU/Stock/Valor por renglón; Producto/Tipo/Precio/Estado/SKU original iguales en todo el bloque, vía lectura de exceljs sobre celdas combinadas).
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Se generó el Excel de "NOVA TOP" (12 renglones: 4 colores × 3 tallas) con un script server-side que reutiliza `buildInventoryExcel` directamente:
  - Alto de fila 2: `24` (antes `60`).
  - Rangos combinados confirmados: `A2:A13`, `B2:B13`, `C2:C13`, `D2:D13`, `I2:I13`, `K2:K13` — Foto, SKU original, Producto, Tipo, Precio, Estado.
  - Cada renglón conserva su propio Color, Talla, SKU completo, Stock y Valor (ej. renglón 5: Vino/S/`3322-VINO-S`/2/798).
- `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-15: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario tras ver el Excel real generado desde `/admin/inventario`.
