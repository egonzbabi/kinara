---
id: 124
title: "Movimientos de inventario: buscar por SKU o nombre en el historial"
status: in-progress
---

<!--
Antes de trabajar esta tarea, Claude debe haber leído (en este orden):
1. ../CLAUDE.md
2. README.md (este directorio)
3. REQUISITOS.md (este directorio)
4. Este archivo completo
-->

## Contexto

El usuario pidió poder buscar en el historial de `/admin/inventario/movimientos` por SKU o por nombre de producto, y que la tabla se filtre a los registros que coinciden.

## Objetivo

Un buscador arriba del historial de movimientos que filtra las filas por SKU o nombre de producto (coincidencia parcial, sin importar mayúsculas/minúsculas).

## Archivos involucrados

- `app/routes/admin.inventario.movimientos.tsx`

## Restricciones específicas de esta tarea

- El movimiento en sí (`inventory_movements`) no guarda el SKU — solo `product_id`/`color_name`/`size`. Se resuelve con el mismo `rows` de `listInventory()` que el loader ya cargaba (para el buscador de arriba, el del formulario de registro), armando un mapa `${productId}|${colorName}|${size} -> sku`. No hace falta ninguna consulta nueva a Supabase.
- La tabla no mostraba columna de SKU — se agrega, porque sin verla en pantalla no tendría sentido poder buscar por ese dato.
- **Limitación de verificación conocida de este proyecto**: Claude no puede iniciar sesión en `/admin`, así que no se pudo probar en el navegador de punta a punta. Se verificó con `npm run typecheck` y una prueba aislada en Node de la lógica de filtrado contra datos de ejemplo.

## Pasos sugeridos

1. Armar `skuByVariant` (mapa `productId|colorName|size -> sku`) a partir de `rows` (ya cargado por el loader).
2. Enriquecer cada movimiento con su `sku` vía ese mapa (`movementsWithSku`).
3. Agregar estado `movementSearch` + `filteredMovements` (useMemo, coincidencia parcial case-insensitive contra `productName` o `sku`).
4. Agregar el input de búsqueda arriba de la tabla, columna "SKU" en la tabla, contador "X de Y movimientos" cuando hay texto de búsqueda, y mensaje de "sin resultados" cuando el filtro no encuentra nada (distinto del mensaje de "todavía no hay movimientos" cuando la lista completa está vacía).

## Criterios de aceptación

- [x] Buscar un SKU exacto o parcial filtra la tabla a los movimientos de esa variante.
- [x] Buscar por nombre de producto (parcial, sin importar mayúsculas) filtra igual.
- [x] Vaciar el buscador vuelve a mostrar todos los movimientos.
- [x] Un buscador sin resultados muestra un mensaje claro, sin confundirse con "no hay movimientos registrados" (que es cuando la lista real está vacía).
- [x] La tabla ahora muestra el SKU de cada movimiento.
- [x] `npm run typecheck` sin errores.
- [ ] Pendiente del usuario: confirmar en `/admin/inventario/movimientos` que el buscador funciona como se espera (Claude no puede iniciar sesión ahí).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí.
- Regresiones encontradas: ninguna esperada — no se tocó el registro de movimientos (`action`) ni el cálculo de stock, solo la tabla de historial.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno.

## Pruebas manuales

- Pendiente del usuario (Claude no puede iniciar sesión en `/admin`): entrar a Movimientos con varios registros ya cargados, buscar por un SKU conocido y por parte del nombre de un producto, y confirmar que la tabla filtra bien y que vaciar el campo regresa todos los registros.

## Notas de progreso

- 2026-09-20: Implementado. `npm run typecheck` limpio; la lógica de filtrado se probó de forma aislada en Node contra datos de ejemplo (SKU exacto, SKU parcial, nombre, sin resultados, vacío) — todos los casos correctos. Falta la confirmación del usuario probando en `/admin`.
