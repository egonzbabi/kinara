---
id: 055
title: "Excel de inventario: Precio y Valor con formato de moneda (2 decimales)"
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

Sobre el Excel de `/admin/inventario` (tareas 043–054), las columnas Precio y Valor (stock × precio) se guardaban como número plano (ej. `399`), sin símbolo de moneda ni decimales fijos.

## Objetivo

Las columnas Precio y Valor se muestran con formato de moneda: símbolo `$`, separador de miles y siempre 2 decimales (ej. `$399.00`, `$9,576.00`) — mismo criterio visual que `formatPrice()` (`app/lib/formatPrice.ts`) usa en el resto del sitio, pero con decimales fijos en vez de opcionales porque se pidió explícitamente "con 2 decimales".

## Archivos involucrados

- `app/lib/admin-inventory-excel.server.ts`: constante `CURRENCY_FORMAT = '"$"#,##0.00'` aplicada vía `sheet.getColumn("precio").numFmt` y `sheet.getColumn("valor").numFmt` — al ser un formato de columna, cubre automáticamente todas las celdas de datos y la fila de total sin tocar cada `cell.value` por separado.

## Restricciones específicas de esta tarea

- Es formato de visualización de Excel (`numFmt`), no un cambio de dato — el valor numérico subyacente sigue siendo el mismo número (`399`, no `"$399.00"` como texto), así que fórmulas o análisis posteriores en el archivo siguen funcionando con el número real.
- No se tocó ninguna otra columna, ancho, orden ni combinación de celdas de tareas anteriores.

## Criterios de aceptación

- [x] La columna Precio muestra `$` + 2 decimales.
- [x] La columna Valor (stock × precio) muestra `$` + 2 decimales, incluida la fila de total.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia la fuente de datos, solo el formato de visualización de columnas ya existentes.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Se generó el Excel real de NOVA TOP y se leyó de vuelta con `ExcelJS`:
  - `numFmt` de la columna Precio (F) y Valor (K): `"$"#,##0.00`.
  - `F4` (precio): valor `399`, formato `"$"#,##0.00` → se ve `$399.00`.
  - `K4` (valor): valor `798`, formato `"$"#,##0.00` → se ve `$798.00`.
  - `K16` (valor total): valor `9576`, formato `"$"#,##0.00` → se ve `$9,576.00`.
- `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-17: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario.
