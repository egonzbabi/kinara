---
id: 064
title: "Entradas y salidas de inventario (registro con fecha/concepto que ajusta el stock)"
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

El admin solo podía cambiar el stock editando el número directamente en `/admin/productos/:id` — sin quedar registro de cuándo se hizo el cambio, por qué motivo, ni distinguir una entrada (compra, devolución) de una salida (venta fuera de la tienda, merma). El usuario pidió lo más sencillo posible: una pantalla para registrar entradas/salidas con fecha y concepto, que además ajuste el inventario real.

## Objetivo

Nueva pantalla `/admin/inventario/movimientos`:
1. Un formulario para registrar un movimiento (producto → color → talla en cascada, tipo Entrada/Salida, cantidad, concepto, fecha) que ajusta `product_variants.stock` al guardarlo.
2. Un historial debajo con todos los movimientos ya registrados (fecha, tipo, producto, color/talla, cantidad, concepto, stock resultante), más reciente primero.

## Archivos involucrados

- `supabase/migrations/20260818000000_inventory_movements.sql`: tabla `inventory_movements` (product_id, color_name, size, type `entrada`/`salida`, quantity, concept, movement_date, resulting_stock, created_at) + función `register_inventory_movement(...)` — mismo patrón atómico que `decrement_variant_stock` (el RPC que ya usa el checkout, tarea 017): bloquea la fila de la variante (`for update`), calcula el nuevo stock, lo actualiza, e inserta el movimiento, todo en una sola transacción — así dos movimientos concurrentes sobre la misma variante no se pisan, y nunca queda un stock negativo (la función lanza una excepción clara si la salida pide más de lo disponible). Aplicada a la base real con `supabase db push`.
- `app/lib/supabase.types.ts`: se agregó la tabla `inventory_movements` y la función `register_inventory_movement` al tipo `Database` (mantenido a mano en este proyecto).
- `app/lib/admin-inventory-movements.server.ts` (nuevo): `listInventoryMovements()` (join con `products` para el nombre) y `createInventoryMovement(input)` (llama al RPC, devuelve el stock resultante para la confirmación en pantalla).
- `app/routes/admin.inventario.movimientos.tsx` (nueva): loader (`listInventory()` + `listInventoryMovements()`), action (valida y llama a `createInventoryMovement`), y el componente con el formulario + historial.
- `app/routes.ts`: registra `admin/inventario/movimientos`.
- `app/routes/admin.layout.tsx`: título del topbar para la nueva ruta.
- `app/routes/admin.inventario.tsx`: nuevo botón "Movimientos" junto a "Descargar Excel"/"Imprimir", que lleva a la nueva pantalla.

## Restricciones específicas de esta tarea

- **UI/UX**: se usó la skill `ui-ux-pro-max` (consulta al dominio `ux`) para confirmar patrones de formulario (feedback de envío, labels asociados, tablas responsive), pero sin tocar paleta ni tipografía — todo el color reutiliza combinaciones YA aprobadas y en producción en este mismo sitio: el toggle Entrada/Salida usa `bg-clay text-bone` para el estado activo (la misma combinación de `.btn-clay`, ya validada en todo el sitio) en vez de inventar un segundo color sólido; las etiquetas del historial reutilizan exactamente el criterio ya establecido en la matriz de inventario (`bg-sage/10 text-espresso` = positivo/con stock, `bg-clay/10 text-clay` = atención/salida) — se evitó deliberadamente `bg-sage` sólido con texto claro porque no alcanza el contraste 4.5:1 exigido en `CLAUDE.md` (verificado a mano: ratio ≈3.45:1, insuficiente).
- **Atomicidad**: se decidió usar una función RPC en vez de dos llamadas separadas (leer stock → actualizar) desde la app, replicando el patrón ya existente de `decrement_variant_stock` — más correcto ante concurrencia y consistente con el resto del código, no una decisión nueva de arquitectura.
- **Fecha sin corrimiento de zona horaria**: `movement_date` es un `date` de Postgres (sin hora). Al mostrarlo se parsea como `new Date(`${fecha}T00:00:00`)` (sin sufijo `Z`, interpretado en hora local) en vez de pasar por un round-trip UTC — mismo tipo de bug ya corregido en la tarea 057, evitado aquí desde el diseño.
- **Cascada producto → color → talla**: reutiliza los mismos datos que ya carga `/admin/inventario` (`listInventory()`), sin agregar una consulta nueva — la talla solo lista tallas que existen para ese color, y junto al selector se muestra el stock actual antes de escribir la cantidad (para que el admin no tenga que ir a otra pantalla a comprobarlo antes de una salida).
- **Concepto**: campo de texto libre con sugerencias vía `<datalist>` (nativo, sin componente nuevo) que cambian según Entrada/Salida — no es un catálogo cerrado, se puede escribir cualquier cosa, por pedido explícito de "lo más sencillo posible".
- No se agregó un ítem nuevo al sidebar (`AdminSidebar`) — se llega desde un botón dentro de `/admin/inventario`, mismo patrón ya usado para Excel y PDF (sub-vistas de Inventario, no secciones de primer nivel).

## Criterios de aceptación

- [x] Se puede registrar un movimiento (producto/color/talla/tipo/cantidad/concepto/fecha) y el stock de esa variante se ajusta de inmediato.
- [x] Una salida que pida más stock del disponible se rechaza con un mensaje claro, sin dejar el stock en negativo ni un movimiento fantasma.
- [x] El historial muestra todos los movimientos, más reciente primero, con fecha/tipo/producto/color/talla/cantidad/concepto/stock resultante.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — WCAG AA respetado (se verificó a mano el contraste del toggle antes de elegir los colores, ver arriba); tabla envuelta en `overflow-x-auto` para mobile, igual que las demás tablas del admin.
- Regresiones encontradas: ninguna — `/admin/inventario` y su botón "Descargar Excel"/"Imprimir" siguen funcionando igual, solo se agregó un botón más.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (funcionalidad de admin, no un estándar transversal del sitio público).

## Pruebas manuales

- `npm run typecheck` limpio.
- Migración aplicada a la base real (`supabase db push`, confirmado).
- Verificación funcional de punta a punta contra la base real (script desechable, revertido al terminar):
  - Entrada de +5 sobre una variante con stock 2 → resultado 7 (correcto).
  - Salida de −3 sobre esa misma variante → resultado 4 (correcto).
  - Intento de salida de 999999 (más que el disponible) → rechazada con "Stock insuficiente: disponible 4, se intentó sacar 999999", sin tocar el stock.
  - `listInventoryMovements()` devolvió los movimientos con el nombre de producto correcto vía el join.
  - Estado revertido al original al terminar (stock y filas de prueba eliminados).
- En el navegador: `/admin/inventario/movimientos` redirige correctamente a la pantalla de login sin errores de consola (no se cuenta con credenciales de admin para probar el formulario/tabla en vivo — mismo caso que tareas 058/059/060). El código sigue exactamente los patrones ya usados y probados en `/admin/productos` (fetcher.Form, cascada de selects) y `/admin/inventario` (estilo de tabla, colores semánticos).

## Notas de progreso

- 2026-08-18: Tarea creada e implementada en la misma sesión. El usuario pidió explícitamente "el mejor UI/UX" a mitad de la primera respuesta — se aplicó la skill `ui-ux-pro-max` para la guía de patrones (no de paleta, que ya está fija) antes de construir la interfaz.
