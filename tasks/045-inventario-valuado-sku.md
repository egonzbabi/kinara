---
id: 045
title: "Inventario: valuación de stock + SKU original visible y buscable"
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

Sobre el rediseño de `/admin/inventario` (tarea 044), el usuario pidió agregar "el inventario valuado" (el valor monetario del stock) y "el SKU" (el código base/original, no el de color+talla) — y, en un segundo mensaje, que la búsqueda también funcione por ese SKU general.

## Objetivo

1. Una tarjeta de resumen "Valor de inventario" (stock × precio, sumado sobre todo lo filtrado) junto a las demás tarjetas de la tarea 044.
2. Cada tarjeta de producto muestra su "Valor" (stock total del producto × precio) junto a Stock total y Precio.
3. El SKU original (código base, ej. `3322`) se muestra junto al tipo en el encabezado de cada tarjeta de producto — antes solo estaba disponible en el Excel (tarea 043) y al pasar el cursor sobre una celda de la matriz.
4. El buscador también encuentra productos por su SKU original (antes solo coincidía por el SKU completo `CÓDIGO-COLOR-TALLA`, que por ser texto libre ya incluía el código base como substring, pero ahora se compara explícitamente contra el código base derivado).
5. El Excel (tarea 043) también gana una columna "Valor (stock × precio)" por fila y una fila final "Valor total del inventario".

## Archivos involucrados

- `app/lib/slug.ts` — nueva función compartida `baseSkuFrom(sku)` (mismo cálculo que ya existía duplicado en `admin-inventory-excel.server.ts` y, con otra forma de entrada, en `ProductForm.tsx`).
- `app/lib/admin-inventory-excel.server.ts` — usa `baseSkuFrom` en vez de su propia copia de la lógica; nueva columna "Valor (stock × precio)" y fila de total al final del archivo.
- `app/routes/admin.inventario.tsx` — `ProductGroup` ahora lleva `baseSku` y `value`; nueva tarjeta de resumen "Valor de inventario"; el encabezado de cada producto muestra su SKU original y su valor; el buscador compara también contra `baseSkuFrom(r.sku)`; se ajustó el tamaño de fuente de las tarjetas de resumen (`clamp` + `truncate`) para que un valor largo como una cifra en pesos no se corte ni desborde la tarjeta en mobile/desktop.

## Restricciones específicas de esta tarea

- El SKU original nunca se guarda como campo separado — se sigue derivando en tiempo real del primer SKU disponible del producto, misma regla de siempre (quitar los últimos dos segmentos separados por guion).
- El valor de inventario es una cifra calculada (stock × precio), no un campo guardado — se recalcula sobre los datos ya cargados, sin consultas adicionales a Supabase.
- La tarjeta de resumen "Valor de inventario" se redondea a pesos enteros (sin centavos) para que quepa en la tarjeta incluso en mobile — el valor exacto (con centavos si los hay) sigue disponible por producto y en el Excel.

## Criterios de aceptación

- [x] Tarjeta "Valor de inventario" en el resumen superior, con el total correcto sobre lo filtrado.
- [x] Cada tarjeta de producto muestra "Valor" (stock total × precio) además de Stock total y Precio.
- [x] El SKU original aparece visible (no solo en tooltip) en el encabezado de cada tarjeta de producto.
- [x] Buscar por el SKU original (ej. "0605") encuentra el producto correcto.
- [x] El Excel descargado incluye la columna de valor por fila y el total al final.
- [x] Las tarjetas de resumen no se cortan ni desbordan en mobile (375px) ni desktop, incluso con valores largos en pesos.
- [x] `npm run typecheck` pasa sin errores; sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no rompe nada de las tareas 042/043/044; extiende los mismos datos ya cargados.
- Regresiones encontradas: se detectó y corrigió en la misma tarea que la tarjeta de "Valor de inventario" se cortaba en mobile (texto del monto desbordaba la tarjeta) — se ajustó con `clamp()` responsivo, `truncate` como respaldo, y redondeo a pesos enteros solo para esa tarjeta.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Con una cuenta de admin desechable (creada y luego eliminada): "Valor de inventario" mostró $675,407.64 (redondeado a $675,408 en la tarjeta) sobre 38 productos / 481 SKUs / 1173 unidades.
- Tarjeta de NOVA TOP: Stock total 24, Precio $399, Valor $9,576 (24 × 399, correcto).
- Búsqueda "0605" (SKU original de FIT SHORT) encontró exactamente ese producto.
- Verificado por script server-side que el Excel de NOVA TOP tiene la columna "Valor (stock × precio)" (fila 2: precio 399, valor 798 = 2 unidades × 399) y una fila final "Valor total del inventario" con 9576.
- Mobile (375px) y desktop (1280px): tarjetas de resumen sin corte ni desborde tras el ajuste.
- Sin errores de consola. `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-13: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario en dos mensajes seguidos (valor + SKU, luego búsqueda por SKU general). Se encontró y corrigió en el momento un problema de overflow en la tarjeta de valor en mobile.
