---
id: 043
title: "Inventario: descarga en Excel real con fotos y celdas combinadas"
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

Tarea 042 agregó `/admin/inventario` con un botón "Descargar CSV". El usuario pidió que el archivo descargable sea un Excel real con la foto de cada producto incrustada (no solo la URL como texto), que la foto ocupe (con celda combinada) todos los renglones que ocupa ese producto, que no aparezca la columna de categoría, y que se agregue el "SKU original" (el código base, antes de agregarle color y talla) en una columna junto a la foto, también combinada a lo largo de todos los renglones del producto.

Un CSV no puede tener imágenes ni celdas combinadas — no era posible cumplir esto sin generar un `.xlsx` real. Se agregó la librería `exceljs` (única forma práctica de generar Excel con imágenes/merges desde Node; no existía nada así en el proyecto).

## Objetivo

El botón "Descargar Excel" en `/admin/inventario` genera un `.xlsx` real donde:

- Cada producto (agrupando todas sus combinaciones color+talla) tiene una sola foto incrustada, en una celda combinada que abarca exactamente todos los renglones de ese producto.
- El "SKU original" (código base) también aparece en una celda combinada junto a la foto, abarcando los mismos renglones.
- No hay columna de categoría.
- El resto de columnas (Producto, Tipo, Color, Talla, SKU completo, Stock, Precio, Estado) van una por renglón, como antes.
- Respeta los filtros de búsqueda/tipo activos en pantalla.

## Archivos involucrados

- `app/lib/admin-inventory-excel.server.ts` (nuevo) — `buildInventoryExcel(rows)`: agrupa las filas por producto, descarga la foto de cada producto (una sola vez por producto, en paralelo), arma la hoja con `exceljs`, combina celdas de Foto y SKU original por grupo, e incrusta la imagen anclada a ese rango.
- `app/routes/admin.inventario.excel.tsx` (nuevo) — loader que exige sesión de admin, aplica los mismos filtros de búsqueda/tipo que la pantalla (vía query params), genera el buffer del Excel y lo devuelve como descarga (`Content-Disposition: attachment`).
- `app/routes/admin.inventario.tsx` — se quitó toda la generación de CSV en el cliente (`csvEscape`, `downloadInventoryCsv`); el botón ahora es un link `<a>` a `/admin/inventario/excel?search=...&kind=...`.
- `app/routes.ts` — registra `admin/inventario/excel`.
- `package.json` — nueva dependencia `exceljs`.

## Restricciones específicas de esta tarea

- El "SKU original" nunca se guardó como campo separado — se deriva con la misma regla ya usada en `ProductForm.tsx` (`guessModeloBase`: quitar los últimos dos segmentos del SKU, `CÓDIGO-COLOR-TALLA` → `CÓDIGO`), tomando el primer SKU disponible del producto. No se agregó ninguna columna nueva a la base de datos.
- Si la foto de un producto no se puede descargar o no es un formato soportado por Excel (`exceljs` solo soporta jpeg/png/gif — no webp), esa fila se genera igual pero sin imagen — nunca se rompe la descarga completa del archivo por una sola foto.
- La generación es 100% server-side (la descarga de fotos, el armado del `.xlsx`) — el navegador solo recibe el archivo final, sin exponer credenciales de Supabase ni depender de CORS del lado del cliente.
- Se mantiene la protección de `requireAdmin` en el nuevo endpoint — igual que el resto de `/admin`.
- Hubo que relajar el tipado en dos puntos puntuales (`as unknown as ExcelJS.Image`, `as unknown as Promise<Buffer>`) por una incompatibilidad real entre los tipos de `exceljs` y la versión más nueva de `@types/node` (el `Buffer` genérico) — es una fricción de tipos entre librerías, no un problema de tipos del código propio; están comentados en el archivo.

## Criterios de aceptación

- [x] El Excel descargado tiene, por cada producto, una sola imagen incrustada en una celda combinada que abarca todos sus renglones (color+talla).
- [x] El "SKU original" (código base) aparece en una celda combinada junto a la foto, con el mismo rango de renglones.
- [x] No existe columna de categoría en el Excel.
- [x] El archivo respeta los filtros de búsqueda/tipo activos al momento de descargar.
- [x] Si Excel no puede leer una foto (formato no soportado), el resto del archivo se genera igual.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — reutiliza `listInventory()` (tarea 042) sin modificarla, respeta `requireAdmin` en la nueva ruta, y la derivación del SKU original sigue la misma regla ya usada en el admin de productos (no se inventó un formato nuevo).
- Regresiones encontradas: ninguna — se verificó que `/admin/inventario` (tabla en pantalla, buscador, filtro, impresión) sigue funcionando igual; solo cambió el mecanismo de descarga.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (funcionalidad puntual de exportación, no un patrón estructural nuevo).

## Pruebas manuales

- Con una cuenta de admin desechable (creada y luego eliminada): `GET /admin/inventario/excel?search=NOVA&kind=Todos` devolvió `200`, `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `Content-Disposition: attachment; filename="inventario-kinara-2026-08-13.xlsx"`, archivo de ~250KB.
- Se generó el Excel para "NOVA TOP" (12 filas: 4 colores × 3 tallas) con un script server-side que reutiliza `buildInventoryExcel` directamente y vuelve a leer el resultado con `exceljs`:
  - 1 sola imagen incrustada en el workbook (no 12).
  - Rango combinado de la foto: `A2:A13` (filas 2 a 13, exactamente las 12 filas del producto).
  - Rango combinado del SKU original: `B2:B13`, mismo rango.
  - Celda `B2` (SKU original): `3322` — coincide con el código base real de ese producto.
  - Cada fila conserva sus propios valores de Producto, Tipo, Color, Talla, SKU completo, Stock y Precio (ej. fila 2: `NOVA TOP · Top · Blanco · S · 3322-BLANCO-S · 2 · 399`).
  - No hay columna de categoría entre los encabezados (`Foto, SKU original, Producto, Tipo, Color, Talla, SKU, Stock, Precio, Estado`).
- `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-13: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario, como evolución directa de la tarea 042 (reemplaza el CSV por un Excel real con fotos y celdas combinadas). Verificado programáticamente (no solo visualmente) que el merge de filas y la imagen incrustada son exactamente los esperados.
