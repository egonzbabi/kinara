---
id: 066
title: "Movimientos de inventario: selección por SKU, fecha real de registro y usuario"
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

Sobre la pantalla de movimientos de inventario (tarea 064), el usuario pidió tres mejoras: que la selección de la variante sea por SKU (no por cascada Producto→Color→Talla) mostrando el nombre original y el actual del producto; que se guarde tanto la fecha que el admin digita para el movimiento como la fecha/hora real en que quedó registrado; y que quede constancia de qué usuario lo hizo.

## Objetivo

1. El formulario resuelve producto/color/talla a partir de un solo campo de SKU (con autocompletar nativo), mostrando el nombre actual del producto y su "nombre original" (el slug — mismo término ya usado en el Excel de inventario, tarea 047) para reconocer productos que cambiaron de nombre.
2. Cada movimiento guarda `movement_date` (la fecha que digita el admin) y `created_at` (la fecha/hora real del registro, automática) por separado — ambas visibles en el historial.
3. Cada movimiento guarda quién lo hizo (`admin_id` + `admin_name`), tomado de la sesión verificada en el servidor, no de un campo del formulario.

## Archivos involucrados

- `supabase/migrations/20260819000000_inventory_movements_admin.sql`: agrega `admin_id uuid references admins(id) on delete set null` y `admin_name text not null` a `inventory_movements`; recrea `register_inventory_movement` con dos parámetros nuevos (`p_admin_id`, `p_admin_name`) — como cambia la firma, se hizo `drop function` de la versión vieja antes de crear la nueva (Postgres trata firmas distintas como sobrecargas, no reemplazos). Aplicada a la base real con `supabase db push`.
- `app/lib/supabase.types.ts`: `inventory_movements.Row` y los `Args` de `register_inventory_movement` actualizados.
- `app/lib/admin-inventory-movements.server.ts`: `InventoryMovementInput`/`InventoryMovement` con `adminId`/`adminName`; `createInventoryMovement` pasa esos dos parámetros al RPC.
- `app/routes/admin.inventario.movimientos.tsx`:
  - El `action` captura `{ adminId, adminName } = await requireAdmin(request)` (antes descartaba el valor de retorno) y los usa directamente — nunca se confía en un campo del formulario para saber quién hizo el movimiento, evita que alguien falsee la autoría editando el HTML.
  - El formulario reemplaza los 3 `<select>` en cascada por un solo campo de texto `SKU` con `<datalist>` (autocompletar nativo, sin componente nuevo) que lista `SKU — Producto · Color · Talla`. Al escribir/elegir un SKU que existe, se resuelve automáticamente `productId`/`colorName`/`size` (campos ocultos del formulario) y se muestra una tarjeta con el nombre actual del producto, el nombre original (si difiere del actual) y el stock disponible. Un SKU que no existe muestra "No se encontró ningún SKU con ese valor." y desactiva el botón de enviar.
  - El historial ahora tiene una columna "Registrado" con la fecha/hora real (`created_at`, formateada en hora de México) y el nombre del admin debajo, separada de "Fecha del movimiento" (`movement_date`, la que digitó el admin).

## Restricciones específicas de esta tarea

- "Nombre original" reutiliza exactamente el mismo dato y término ya establecido en el Excel de inventario (`productSlug`, columna "Nombre original") — no se inventó un campo nuevo.
- La fecha real de registro (`created_at`) es un instante con zona horaria real, así que sí se formatea con `timeZone: "America/Mexico_City"` explícito (a diferencia de `movement_date`, que es un `date` sin hora y se sigue anclando a medianoche local para evitar el corrimiento de día — mismo criterio ya documentado en la tarea 057).
- `admin_name` es una copia (snapshot) del nombre al momento del movimiento, no solo una referencia — así el historial sigue siendo legible aunque ese admin se borre o cambie de nombre después; `admin_id` es la referencia real (nula si el admin ya no existe) por si se necesita en el futuro.
- El selector de SKU no reemplaza el catálogo por un componente de terceros — sigue siendo HTML nativo (`<input list>` + `<datalist>`), consistente con el resto del admin y con "lo más sencillo posible" ya pedido en la tarea 064.

## Criterios de aceptación

- [x] Escribir o elegir un SKU resuelve producto/color/talla automáticamente.
- [x] Se muestra el nombre actual y el nombre original del producto seleccionado.
- [x] Un SKU inexistente bloquea el envío con un mensaje claro.
- [x] El historial muestra la fecha del movimiento y la fecha/hora real de registro por separado, más quién lo hizo.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — mismos colores/tipografía ya aprobados, sin componentes nuevos de terceros.
- Regresiones encontradas: ninguna — se repitió la verificación de la tarea 064 (entrada, salida, rechazo por stock insuficiente) con la nueva firma del RPC y sigue funcionando igual.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Migración aplicada a la base real (`supabase db push`, confirmado).
- Verificación funcional contra la base real (script desechable, revertido al terminar): entrada de +4 sobre NOVA TOP (SKU `3322-BLANCO-S`) → stock correcto (2→6); el movimiento devuelto por `listInventoryMovements()` trae `adminName: "Script de prueba"`, `movementDate: "2026-08-19"` y `createdAt` con el instante real — los tres datos pedidos, correctos y separados.
- En el navegador: `/admin/inventario/movimientos` redirige a login sin errores de consola (no se cuenta con credenciales de admin para probar el formulario en vivo — mismo caso que las tareas 058/059/060/064).

## Notas de progreso

- 2026-08-19: Tarea creada e implementada en la misma sesión, inmediatamente después de la 064/065, a pedido explícito del usuario.
