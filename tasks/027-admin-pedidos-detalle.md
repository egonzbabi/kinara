---
id: 027
title: "Admin/Pedidos: mostrar toda la info de la tienda + de Skydropx por pedido"
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

`/admin/pedidos` (`app/routes/admin.pedidos.tsx`) solo muestra folio, cliente, total, fecha y estado. La tabla `orders` ya guarda mucha más información que nunca se le muestra al usuario: `items` (productos/color/talla/cantidad/precio), `shipping_address` (calle, colonia, alcaldía/municipio, estado, CP), `customer_phone`, `subtotal`, `shipping_fee`, `currency`, `stripe_session_id`.

Además, al cotizar en `/checkout` con Skydropx (tarea 017) se calcula la paquetería/servicio elegido (`shipping_carrier`, ej. "Estafeta · Ocurre") y se manda a Stripe como metadata (`api.create-checkout-session.tsx`), pero **nunca se guarda en la tabla `orders`** — se pierde en cuanto se crea el pedido. Los días estimados de entrega (`ShippingRate.days`, ya disponible en el `match` de Skydropx en ese mismo archivo) tampoco se guardaban en ningún lado.

Nota importante de alcance: la integración de Skydropx en este proyecto (`app/lib/skydropx.server.ts`) solo **cotiza** tarifas en tiempo real — no crea el envío/guía ni genera número de rastreo. No existe ningún tracking number que mostrar todavía; lo único que Skydropx aporta hoy es la paquetería/servicio elegido, el costo real cobrado y los días estimados de entrega al momento de la cotización.

## Objetivo

`/admin/pedidos` muestra, por cada pedido, toda la información disponible: datos de contacto completos, dirección de envío completa, la paquetería/servicio de Skydropx usado + días estimados, el desglose de productos comprados (con color/talla/cantidad/precio), y el desglose de totales (subtotal/envío/total). Esto sin perder la vista resumen actual (tabla con folio/cliente/total/fecha/estado + cambio de estado).

## Archivos involucrados

- `supabase/migrations/20260729000000_orders_shipping_carrier.sql` (nuevo) — agrega `shipping_carrier text`, `shipping_days integer` a `orders`.
- `app/routes/api.create-checkout-session.tsx` — agregar `shipping_days` a la metadata de Stripe (el `shipping_carrier` ya se manda, solo falta guardarlo).
- `app/lib/orders.server.ts` — leer `shipping_carrier`/`shipping_days` de la metadata de Stripe y guardarlos al crear el pedido.
- `app/lib/admin-orders.server.ts` — seleccionar las columnas nuevas + las que ya existían pero no se exponían (`customer_phone`, `shipping_address`, `subtotal`, `shipping_fee`, `currency`, `stripe_session_id`).
- `app/routes/admin.pedidos.tsx` — fila expandible por pedido con el detalle completo.

## Restricciones específicas de esta tarea

- No inventar un número de rastreo ni un estado de envío que Skydropx no provee realmente — solo mostrar lo que la integración actual obtiene de verdad (paquetería, servicio, costo, días estimados de la cotización).
- Los pedidos ya existentes (creados antes de este cambio) no tendrán `shipping_carrier`/`shipping_days` — la UI debe manejar esos campos como `null` sin romperse (mostrar "—" o similar, no reventar).
- No tocar el flujo de pago/checkout en sí (`api.create-checkout-session.tsx` solo gana 2 campos de metadata, nada de su lógica de validación/recotización cambia).

## Pasos sugeridos

1. Migración: agregar columnas nuevas a `orders`, aplicar con `supabase db push`.
2. `api.create-checkout-session.tsx`: agregar `shipping_days: String(match.days ?? "")` a `metadata` (rama de tarifa real; la rama `fallback` no tiene días conocidos).
3. `orders.server.ts`: parsear `session.metadata?.shipping_carrier` y `shipping_days` (número o `null` si vacío) e incluirlos en el `insert`.
4. `admin-orders.server.ts`: ampliar el `select` y el tipo `AdminOrderListItem` con los campos nuevos + los que ya existían sin exponer.
5. `admin.pedidos.tsx`: agregar una fila de detalle expandible (botón/chevron por pedido) con contacto, dirección, envío/Skydropx, productos y totales.
6. Verificar `npm run typecheck` y en el navegador (login admin, `/admin/pedidos`) con al menos un pedido de prueba.

## Criterios de aceptación

- [x] `orders` tiene columnas `shipping_carrier`/`shipping_days`, se llenan en pedidos nuevos.
- [x] `/admin/pedidos` muestra, al expandir un pedido: teléfono, dirección completa (calle, colonia, alcaldía/municipio, estado, CP), paquetería/servicio + días estimados (o "—" si no hay dato), lista de productos con color/talla/cantidad/precio, y subtotal/envío/total.
- [x] La vista resumen (tabla) y el cambio de estado siguen funcionando igual que antes.
- [x] Pedidos viejos sin `shipping_carrier`/`shipping_days` no rompen la página.
- [x] `npm run typecheck` pasa sin errores; verificado en el navegador sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — aplica el patrón de `service_role` server-side para todo acceso a `orders` (ya vigente, tarea 007/015), y el patrón de re-cotización server-side de Skydropx (tarea 017) no se toca, solo se persiste un dato que ya se calculaba ahí.
- Regresiones encontradas: ninguna. El cambio de estado (`fetcher.Form` + `<select>`) se probó con la fila expandida (se agregó `e.stopPropagation()` en el `<td>` del select para que no colapse el detalle al hacer click ahí) y persiste correctamente tras recargar.
- Requisitos nuevos agregados a `REQUISITOS.md`: sí — "todo dato calculado en el checkout que sea útil después (ej. `shipping_carrier`/`shipping_days`) debe persistirse en `orders`, no solo mandarse a Stripe metadata" (sección Pagos, origen: tarea 027).

## Pruebas manuales

- Creada una cuenta de admin temporal (`scripts/create-admin.ts`), verificado `/admin/pedidos` con el único pedido real existente (`ORD-MS558QLA`, de antes de este cambio): el detalle expandido muestra contacto, dirección completa, "—" en paquetería/entrega estimada (correcto, es un pedido viejo sin esos datos), costo de envío, desglose de totales, ID de sesión de Stripe, y la tabla de productos (AIRLIFT SHORT, Ivory, M, 1, $390, $390) — todo coincide con lo guardado en la base de datos.
- Cambiado el estado del pedido de "Enviado" a "Entregado" con la fila expandida: el detalle no se colapsó, el cambio persistió tras recargar la página. Revertido a "Enviado" al terminar para no dejar alterado el pedido real del usuario.
- Cuenta de admin temporal eliminada al terminar.

## Notas de progreso

- 2026-07-29: Tarea creada a pedido del usuario ("pongas toda la información disponible tanto de la tienda como toda la información que puedas obtener de Skydropx") e implementada en la misma sesión. Detectado que `shipping_carrier` ya se calculaba en `api.create-checkout-session.tsx` pero se perdía (nunca se guardaba en `orders`, solo iba a la metadata de Stripe), y que el resto de la info de la tienda (items, dirección completa, teléfono, subtotal/envío/moneda, ID de sesión de Stripe) ya vivía en la tabla `orders` pero `/admin/pedidos` nunca la exponía — solo mostraba folio/cliente/total/fecha/estado.

  Cambios: migración `20260729000000_orders_shipping_carrier.sql` (agrega `shipping_carrier text`, `shipping_days integer` a `orders`, aplicada con `supabase db push`); `api.create-checkout-session.tsx` ahora manda `shipping_days` a la metadata de Stripe (`shipping_carrier` ya se mandaba); `orders.server.ts` (`ensureOrderFromCheckoutSession`) parsea ambos campos de la metadata y los guarda al crear el pedido; `supabase.types.ts` actualizado a mano (no se genera con CLI en este proyecto) con las columnas nuevas; `admin-orders.server.ts` amplía el `select` y `AdminOrderListItem` con `customerPhone`, `subtotal`, `shippingFee`, `currency`, `shippingAddress` (tipado), `shippingCarrier`, `shippingDays`, `stripeSessionId`.

  `admin.pedidos.tsx` reescrito: la tabla resumen se mantiene igual, pero cada fila ahora es expandible (chevron + click en la fila, estado local `expanded` en el componente padre) y muestra un panel de detalle con 3 columnas (Contacto, Envío, Totales) más una tabla de productos abajo. El `<td>` del selector de estado usa `stopPropagation` en su click para no colapsar el detalle al cambiar el estado.

  Verificado creando una cuenta de admin temporal (mismo patrón que tareas anteriores — "cuenta de prueba temporal, luego eliminada"), navegando a `/admin/pedidos`, expandiendo el único pedido real existente (anterior a este cambio, así que sirve para probar el caso `shipping_carrier`/`shipping_days` en `null`) y confirmando que se ve toda la info sin romperse. Se probó también cambiar el estado con la fila expandida (persiste, no colapsa) y se revirtió al valor original para no alterar el pedido real del usuario. Cuenta de admin temporal eliminada al terminar. `npm run typecheck` sin errores, sin errores de consola.
