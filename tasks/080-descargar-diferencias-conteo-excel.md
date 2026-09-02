---
id: 080
title: "Descargar en Excel las diferencias del conteo físico"
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

El usuario pidió comparar el conteo físico ya guardado (471 casillas, tarea 075) contra el stock actual del sistema y obtener las diferencias — se le entregó un Excel armado con un script desechable. Pidió después que esa comparación quede **dentro de la funcionalidad del inventario** (no un script suelto), para poder generarla de nuevo cuando quiera sin pedirla por chat.

## Objetivo

Un botón "Descargar diferencias (Excel)" en `/admin/inventario/conteo` que genera, al momento, un Excel con todas las casillas del conteo guardado cuyo número no coincide con el stock actual del sistema.

## Archivos involucrados

- `app/lib/admin-inventory-counts.server.ts`:
  - `getInventoryCountDiffs()` (nueva): compara cada conteo guardado contra el stock **actual** del sistema (no la foto que se guardó al momento de contar — el stock puede haberse movido desde entonces por ventas o Movimientos), y devuelve solo las que no coinciden, con producto, nombre original (slug), color, talla, SKU, sistema, contado y diferencia.
  - `buildInventoryCountDiffExcel()` (nueva): arma el `.xlsx` (con `exceljs`, ya usado en el resto del proyecto) a partir de esas diferencias — mismo patrón visual que `admin-inventory-excel.server.ts` (encabezado en negrita, autofiltro), con la columna de diferencia en verde (sobrante) o rojo (faltante).
- `app/routes/admin.inventario.conteo.excel.tsx` (nueva): ruta de descarga — mismo patrón que `admin.inventario.excel.tsx` (fecha del nombre de archivo en hora de México, no UTC, ver tarea 057).
- `app/routes.ts`: registra `admin/inventario/conteo/excel`.
- `app/routes/admin.inventario.conteo.tsx`: nuevo botón "Descargar diferencias (Excel)" junto a "Empezar de nuevo"/"Guardar conteo".

## Restricciones específicas de esta tarea

- La comparación es contra el stock **actual**, no contra la foto (`system_stock`) guardada en cada fila del conteo — si el stock cambió después de contar (por una venta, por ejemplo), la diferencia mostrada sigue siendo la relevante para decidir qué corregir hoy.
- Reutiliza `exceljs`, ya usado en `admin-inventory-excel.server.ts` — no se agregó ninguna librería nueva.
- Mismo criterio de color ya usado en el resto del sitio para "positivo"/"atención" (verde para sobrante, rojo para faltante).

## Criterios de aceptación

- [x] El botón descarga un `.xlsx` con exactamente las casillas cuyo conteo no coincide con el stock actual.
- [x] El archivo incluye producto, nombre original, color, talla, SKU, sistema, contado y diferencia.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — reutiliza el mismo patrón visual y de nombre de archivo ya aprobado en el Excel de inventario general.
- Regresiones encontradas: ninguna — no se tocó ninguna pantalla existente además de agregar el botón.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- `getInventoryCountDiffs()` y `buildInventoryCountDiffExcel()` probadas contra la base real: devolvieron las mismas 48 diferencias ya confirmadas por chat, y el Excel se generó sin errores (9013 bytes).
- En el navegador: `/admin/inventario/conteo/excel` (sin sesión) redirige al login sin errores de servidor.

## Notas de progreso

- 2026-08-27: Implementado en la misma sesión en la que se entregó el primer Excel de diferencias por chat — el usuario pidió dejarlo como funcionalidad permanente del panel.
