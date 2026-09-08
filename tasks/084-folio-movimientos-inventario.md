---
id: 084
title: "Número de referencia (folio) en cada movimiento de inventario"
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

Después de tener que borrar manualmente un movimiento duplicado (identificándolo por producto/color/talla/hora), el usuario pidió una forma más simple de referenciar un movimiento puntual — por ejemplo para aclarar algo en el concepto de otro movimiento ("corrección del #12") o al hablar de él por teléfono/mensaje, sin tener que usar el `id` (uuid), que es largo e incómodo de citar.

## Objetivo

Cada movimiento de inventario tiene un número de referencia corto y secuencial ("folio": #1, #2, #3...), visible en el historial y en la confirmación al registrar uno nuevo.

## Archivos involucrados

- `supabase/migrations/20260908000000_inventory_movements_folio.sql` (nueva): agrega la columna `folio` (bigint, único) a `inventory_movements`. Rellena los movimientos ya existentes numerándolos en el orden en que ocurrieron (`created_at`), y deja una secuencia (`inventory_movements_folio_seq`) como valor por default para que cada movimiento nuevo tome el folio siguiente automáticamente. Aplicada a la base real con `supabase db push --linked`.
- `app/lib/supabase.types.ts`: agrega `folio: number` al tipo de la tabla `inventory_movements`.
- `app/lib/admin-inventory-movements.server.ts`: `InventoryMovement` ahora incluye `folio`; `listInventoryMovements()` lo devuelve; `createInventoryMovement()` ahora devuelve `{ resultingStock, folio }` en vez de solo el stock resultante (el RPC `register_inventory_movement` ya lo trae solo, porque hace `returning *` — no hizo falta tocar la función SQL).
- `app/routes/admin.inventario.movimientos.tsx`: nueva columna **"Ref."** (primera columna de la tabla, `#N` en mono) en el historial; el mensaje de confirmación al registrar un movimiento ahora dice "Movimiento #N registrado — nuevo stock: ...".

## Restricciones específicas de esta tarea

- El folio es puramente informativo/de referencia — no reemplaza al `id` (uuid) como llave real en la base, ni se usa para nada más que mostrarse y poder citarlo a mano en el campo de concepto de otro movimiento (texto libre, ya existente).
- No se agregó ninguna función de "buscar por folio" — con la tabla siendo relativamente chica y ordenada por fecha, el usuario puede ubicarlo visualmente; se puede agregar después si hace falta.
- El backfill numera por `created_at` (orden real en que ocurrieron los movimientos), no por el orden físico de la tabla — importante porque varios movimientos de carga inicial comparten el mismo `created_at` exacto (se crean en el mismo insert por lote), así que el orden entre esos es estable pero arbitrario; no afecta el uso práctico del folio.

## Criterios de aceptación

- [x] Todo movimiento (viejo y nuevo) tiene un folio único y secuencial.
- [x] El folio se ve en la primera columna del historial de `/admin/inventario/movimientos`.
- [x] Al registrar un movimiento nuevo, la confirmación muestra su folio.
- [x] Un movimiento nuevo siempre toma el folio siguiente al más alto ya usado, sin colisiones.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — la columna nueva reutiliza el mismo estilo de tabla (`text-muted`, `font-mono` ya usado para SKUs) sin paleta ni tipografía nueva.
- Regresiones encontradas: ninguna — se confirmó que el resto del historial (fecha, tipo, producto, color/talla, cantidad, concepto, stock resultante, admin) se sigue viendo igual.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Migración aplicada a la base real; confirmado que los movimientos existentes quedaron numerados 1-5 en el orden correcto de `created_at`, y que un insert de prueba tomó el folio 6 automáticamente (revertido después).
- Prueba de punta a punta contra la base real usando las funciones reales del código (`createInventoryMovement` + `listInventoryMovements`, no solo SQL directo): el movimiento de prueba se creó con folio 7, y apareció correctamente con ese folio al listar el historial. Revertido el stock y borrado el movimiento de prueba al terminar.
- En el navegador: `/admin/inventario/movimientos` (sin sesión) redirige al login sin errores de servidor.

## Notas de progreso

- 2026-09-08: Implementado en la misma sesión en la que el usuario borró a mano un movimiento duplicado y pidió una forma más fácil de referenciar movimientos puntuales.
