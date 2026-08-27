---
id: 075
title: "Conteo físico de inventario: capturar el conteo en papel y comparar contra el sistema"
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

El usuario pidió "algo práctico y rápido" para cargar el inventario físico que cuenta en papel y compararlo contra el inventario cargado en la base de datos, para obtener las diferencias. Se le preguntó si prefería escribir los conteos directo en una pantalla web o hacerlo por Excel (descargar plantilla, llenar, volver a subir) — eligió la pantalla web. Después aclaró un punto importante: quiere **conservar los dos números** (el del sistema y el nuevo conteo), no solo ver una comparación que se pierda al recargar la página.

## Objetivo

Nueva pantalla `/admin/inventario/conteo`:
1. Muestra la misma matriz color × talla que ya existe en `/admin/inventario`, pero con una casilla editable en cada combinación para escribir el número contado en papel.
2. La diferencia contra el stock del sistema se calcula al momento, sin recargar.
3. El conteo se guarda en la base de datos (no se pierde al cerrar la pestaña) — un botón "Guardar conteo" persiste todo lo capturado hasta ese momento.
4. **No ajusta el inventario real** — es un reporte de comparación, no una corrección automática. Si el admin quiere corregir el stock después de revisar las diferencias, lo hace a mano desde `/admin/inventario/movimientos` (ya existente, tarea 064).

## Archivos involucrados

- `supabase/migrations/20260826000000_inventory_counts.sql` (nueva): tabla `inventory_counts` (product_id, color_name, size, system_stock, counted_stock, counted_at, updated_at; único por producto+color+talla) — sin RPC, un upsert simple basta (a diferencia de `inventory_movements`, aquí no hay que tocar `product_variants.stock` ni hay riesgo de condición de carrera sobre un valor compartido). Aplicada a la base real con `supabase db push --linked`.
- `app/lib/supabase.types.ts`: agregado el tipo de la tabla `inventory_counts` (mismo patrón que `inventory_movements`).
- `app/lib/admin-inventory-counts.server.ts` (nuevo): `listInventoryCounts()`, `saveInventoryCounts(inputs[])` (upsert por lote, on conflict `product_id,color_name,size`), `clearInventoryCounts()` (borra todo, para empezar de cero).
- `app/routes/admin.inventario.conteo.tsx` (nueva): loader (`listInventory()` + `listInventoryCounts()`), action (JSON: `{action:"save", counts}` o `{action:"clear"}`), y la pantalla — matriz igual a `/admin/inventario` pero con un `<input>` numérico por casilla (precargado con el conteo ya guardado, si existe) y un badge de diferencia (✓ verde si coincide, ±N en rojo si no) calculado en el cliente mientras se escribe. Incluye buscador, filtro "Solo con diferencia"/"Solo sin contar", resumen (capturados / con diferencia / sin contar), y "Empezar de nuevo" (borra todo, con confirmación).
- `app/routes.ts`: registra `admin/inventario/conteo`.
- `app/routes/admin.layout.tsx`: título del topbar para la nueva ruta.
- `app/routes/admin.inventario.tsx`: nuevo botón "Conteo físico" junto a "Movimientos"/"Descargar Excel"/"Imprimir".

## Restricciones específicas de esta tarea

- **No es un ajuste de stock**: a propósito no llama a `register_inventory_movement` ni escribe en `product_variants` — el usuario pidió "sacar las diferencias", no corregir el inventario automáticamente. Si más adelante pide poder aplicar la diferencia como movimiento con un clic, es una extensión natural que reutilizaría `inventory_movements` (ya existente), pero no se construyó sin que se pidiera.
- **`system_stock` es una foto del momento en que se guarda cada casilla**, no se recalcula después — así la diferencia que se ve al revisar el conteo guardado sigue siendo la correcta aunque el stock del sistema haya cambiado después (ventas, movimientos) antes de que el admin lo revise. La diferencia mostrada *mientras se está escribiendo* (antes de guardar) sí compara contra el stock más reciente del sistema (el que trae el loader en ese momento).
- **Upsert por combinación producto+color+talla, sin historial**: un conteo nuevo pisa al anterior de esa misma casilla — no hay "conteo del 3 de julio" vs "conteo del 10 de agosto" por separado. Encaja con "algo práctico y rápido"; si se necesita historial de conteos en el futuro, es un cambio de modelo de datos, no algo que se pueda agregar encima sin tocar el esquema.
- **UI/UX**: reutiliza exactamente los mismos patrones ya aprobados de `/admin/inventario` (misma matriz, mismos colores semánticos `bg-sage/10 text-espresso` para "coincide" y `bg-clay/10 text-clay` para "hay diferencia", mismo estilo de inputs/botones) — no se introdujo paleta ni tipografía nueva.
- **No se pudo probar la pantalla en vivo con sesión de admin real** (mismo caso ya documentado en tareas 058/059/060/064: no hay credenciales de admin disponibles para esta sesión) — se verificó en cambio: (a) toda la capa de datos contra la base real con un script desechable (guardar, upsert que pisa sin duplicar, limpiar — revertido al terminar), y (b) que la ruta no truena y redirige correctamente al login sin errores de servidor quien no tiene sesión.

## Criterios de aceptación

- [x] Cada casilla de color×talla tiene un campo para escribir el conteo físico, precargado si ya se había guardado antes.
- [x] La diferencia contra el sistema se calcula y muestra al momento, sin recargar la página.
- [x] "Guardar conteo" persiste todas las casillas capturadas en ese momento — al volver a entrar (o recargar), siguen ahí.
- [x] No se modifica `product_variants.stock` en ningún momento de este flujo.
- [x] "Empezar de nuevo" borra todo el conteo guardado, con confirmación previa.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no toca paleta, tipografía ni layout aprobado; reutiliza componentes/clases ya en uso. Es funcionalidad interna de admin, no un estándar transversal del sitio público (mismo criterio que tarea 064).
- Regresiones encontradas: ninguna — `/admin/inventario` sigue igual, solo se agregó un botón más (mismo patrón que "Movimientos").
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Migración aplicada a la base real (`supabase db push --linked`), confirmada con una consulta de prueba (`select * from inventory_counts limit 1` → `[]`, sin error).
- Verificación funcional de punta a punta contra la base real (script desechable, revertido al terminar):
  - Guardar 2 conteos (uno igual al sistema, otro con diferencia de +3) → guardado correcto.
  - Volver a guardar una de esas 2 casillas con otro valor (+1 sobre el original) → sigue habiendo 2 filas (no duplica), la casilla correcta quedó con el valor nuevo — confirma que el upsert pisa en vez de acumular.
  - `clearInventoryCounts()` → la tabla queda vacía.
- En el navegador: `/admin/inventario/conteo` (sin sesión) redirige al login sin errores de consola ni de servidor — mismo patrón ya aceptado en tareas anteriores sin credenciales de admin disponibles.

## Notas de progreso

- 2026-08-26: Tarea creada e implementada en la misma sesión. Antes de construir se preguntó al usuario cómo prefería capturar los conteos (web vs. Excel) — eligió web. A mitad de la primera respuesta aclaró un requisito importante ("conservar las dos existencias") que llevó a diseñar la persistencia (guardar en una tabla nueva) en vez de un cálculo puramente en memoria del navegador.
