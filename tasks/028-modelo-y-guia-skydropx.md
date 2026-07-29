---
id: 028
title: "Admin/Pedidos: modelo en productos + compra real de guía con Skydropx (número de rastreo)"
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

Seguimiento directo de la tarea 027. El usuario pidió 3 cosas sobre el detalle de pedido en `/admin/pedidos`:

1. Agregar el `modelo` (código de negocio/logística, `product_variants.modelo` — ver tarea 016) a cada línea de producto del pedido.
2. Preguntó por qué "Paquetería/servicio" y "Entrega estimada" seguían en "—" — resultó ser porque el único pedido real (`ORD-MS558QLA`) es de **antes** de la tarea 027 (28 jul), no un bug. Se verificó simulando un pedido nuevo que sí guarda esos datos correctamente.
3. Pidió cambiar "ID sesión Stripe" por el número de rastreo real del envío.

El punto 3 no era un cambio trivial de UI: la integración de Skydropx de este proyecto (tarea 017) **solo cotiza** — nunca compra la guía real, así que no existía ningún número de rastreo en ningún lado del sistema. Se le preguntó al usuario y confirmó que quería implementar la compra real de la guía (con costo real, deducido del saldo de Skydropx), disparada manualmente desde el admin (nunca automática al pagar).

El endpoint de compra de guía de la API "Pro" de Skydropx (`sb-pro.skydropx.com`/`pro.skydropx.com`, OAuth2 client_credentials) **no está documentado públicamente** — se descubrió por prueba y error contra el sandbox (sin costo), con autorización explícita del usuario para seguir probando ahí después de que el clasificador de permisos bloqueó el primer intento (por crear un recurso real, aunque fuera en sandbox).

## Objetivo

1. Cada línea de producto en el detalle de pedido muestra su `modelo`.
2. El detalle de pedido tiene un botón "Comprar guía con Skydropx" (con confirmación, ya que tiene costo real) cuando el pedido tiene datos de paquetería guardados; al comprarla, se guarda y muestra el número de rastreo (enlazado al tracking del proveedor) y un link a la guía en PDF. Pedidos sin paquetería guardada (anteriores a la tarea 027) muestran un mensaje explicando por qué no se puede.
3. Se documenta el endpoint de compra de guía descubierto, para que futuras tareas no tengan que volver a descubrirlo por prueba y error.

## Archivos involucrados

- `supabase/migrations/20260729010000_orders_skydropx_shipment.sql` (nuevo)
- `app/lib/skydropx.server.ts` — nuevas funciones `purchaseShipment`, `createShipment`, `pollShipment`; `ShippingRate` gana el campo `id` (necesario para comprar la guía sobre esa tarifa).
- `app/lib/orders.server.ts` — `OrderItem` gana `modelo`; se guardan `shipping_provider_name`/`shipping_service_code` (códigos crudos, no el string legible) al crear el pedido.
- `app/routes/api.create-checkout-session.tsx` — captura `modelo` de `product_variants` y lo mete en el snapshot de items; manda `shipping_provider_name`/`shipping_service_code` a la metadata de Stripe.
- `app/lib/admin-orders.server.ts` — expone los campos nuevos + `buyShippingLabel(orderId)`.
- `app/routes/admin.pedidos.tsx` — columna Modelo en productos; sección de rastreo/guía reemplaza el ID de sesión de Stripe.
- `app/lib/supabase.types.ts` — columnas nuevas de `orders` (a mano, este proyecto no genera este archivo con el CLI).

## Restricciones específicas de esta tarea

- La compra de guía **nunca** es automática — solo vía botón explícito en el admin, con `confirm()` del navegador advirtiendo el costo real.
- No permitir comprar una guía dos veces para el mismo pedido (se verifica `tracking_number` ya existente antes de llamar a Skydropx).
- Pedidos sin `shipping_provider_name`/`shipping_service_code` (de antes de la tarea 027) no pueden comprar guía automáticamente — mostrar el motivo, no intentar adivinar.
- El `quotation_id` de la compra original ya expiró para cuando se compra la guía (puede ser horas/días después) — hay que volver a cotizar fresco y emparejar por `provider_name`+`service_code`, igual que ya hace `api.create-checkout-session.tsx` al pagar.

## Hallazgos del API de Skydropx (no documentados públicamente — para no volver a descubrirlos)

Descubierto probando contra `sb-pro.skydropx.com` (sandbox, sin costo) con el usuario autorizando explícitamente la exploración tras un bloqueo inicial del clasificador de permisos:

- **`POST /api/v1/shipments`** compra la guía real (no está en `docs.skydropx.com`, que documenta la API "classic" vieja, ni fue accesible vía `pro.skydropx.com/es-MX/api-docs` sin sesión iniciada). Body:
  ```json
  {
    "shipment": {
      "quotation_id": "...",
      "rate_id": "...",
      "address_from": { ...campos de address..., "reference": "Bodega" },
      "address_to": { ...campos de address..., "reference": "Domicilio del comprador" },
      "consignment_note": "01010101",
      "package_type": "4G",
      "parcels": [{ "weight": 1, "height": 10, "width": 25, "length": 35 }]
    }
  }
  ```
  - `address_from`/`address_to` necesitan un campo `reference` no-vacío (no existe en la cotización) — se usa un texto genérico fijo ya que el checkout no recolecta esta referencia.
  - `rate_id` es el `id` de la tarifa dentro de la respuesta de `GET /api/v1/quotations/{id}` (antes no se guardaba en `ShippingRate`, se agregó).
  - `consignment_note` y `package_type` son códigos del catálogo SAT de Carta Porte (México), no texto libre — `"01010101"` es el código genérico "producto no encontrado en el catálogo" (`c_ClaveProdServ`) y `"4G"` es el código genérico de caja (`c_TipoDeEmbalaje`). **Si el negocio necesita declarar un giro específico (ropa) para cumplimiento fiscal, hay que cambiar `SAT_CONSIGNMENT_NOTE_DEFAULT`/`SAT_PACKAGE_TYPE_DEFAULT` en `skydropx.server.ts` por los códigos correctos — esto es responsabilidad fiscal del negocio, no algo que Claude pueda decidir.**
  - Respuesta inicial: `202` con `data.attributes.workflow_status: "in_progress"` — hay que hacer polling.
  - **`GET /api/v1/shipments/{id}`** hasta `workflow_status === "success"`. En ese punto, `included[]` (tipo `"package"`) trae `tracking_number`, `tracking_url_provider` (URL de rastreo del proveedor), `label_url` (PDF de la guía, URL firmada).
  - El `address_from` que se manda puede ser ignorado por una dirección de origen configurada a nivel cuenta en el dashboard de Skydropx (se observó en sandbox: el origen mandado por API no coincidía con el de la guía generada, que usaba una dirección con "Pendiente de confirmar" como calle). **Antes de usar esto en producción, confirmar en `pro.skydropx.com` que la dirección de origen de la cuenta esté completa y correcta.**

## Criterios de aceptación

- [x] Cada línea de producto en `/admin/pedidos` muestra su `modelo` (o "—" si el pedido es de antes de este cambio).
- [x] Confirmado (con un pedido simulado) que `shipping_carrier`/`shipping_days` sí se guardan correctamente en pedidos nuevos — el "—" del pedido real existente es porque es anterior a la tarea 027, no un bug.
- [x] El detalle de pedido reemplaza "ID sesión Stripe" por una sección de rastreo: botón "Comprar guía con Skydropx" (con `confirm()` de costo real) si hay datos de paquetería y no se ha comprado guía; número de rastreo + link a la guía en PDF si ya se compró; mensaje explicativo si el pedido es de antes de esta función.
- [x] No se puede comprar guía dos veces para el mismo pedido.
- [x] `npm run typecheck` pasa sin errores.
- [x] Verificado extremo a extremo con un pedido simulado real contra el sandbox de Skydropx: cotización → creación de pedido → compra de guía → número de rastreo/guía guardados → segundo intento de compra bloqueado → limpieza.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — se sigue el patrón de "nunca confiar en datos efímeros del cliente, siempre re-cotizar y emparejar server-side" (tarea 017) para la compra de guía, y el patrón de `service_role` server-side para toda escritura a `orders` (tareas 007/015).
- Regresiones encontradas: ninguna. El pedido real existente se revisó en el navegador tras el cambio y se ve correctamente (con los mensajes de "—"/"pedido anterior a esta función").
- Requisitos nuevos agregados a `REQUISITOS.md`: sí — el hallazgo del endpoint de compra de guía y los códigos SAT default (ver sección de arriba), para no tener que volver a descubrirlos por prueba y error.

## Pruebas manuales

- Con una cuenta de admin temporal (creada y eliminada al terminar): confirmado que `/admin/pedidos` muestra la columna Modelo y la sección de rastreo con el mensaje correcto para el pedido real existente (anterior a esta función).
- Con un script de verificación (pedido simulado, no vía UI, para evitar interactuar con el diálogo nativo `confirm()` del navegador): cotización real → pedido creado con `modelo` guardado → `buyShippingLabel()` compró una guía real en sandbox (Estafeta, con número de rastreo y URL de guía reales) → verificado que quedó guardado en la base de datos → segundo intento de compra correctamente bloqueado → pedido de prueba eliminado.

## Notas de progreso

- 2026-07-29: Tarea creada e implementada en la misma sesión, como seguimiento directo de la tarea 027. El descubrimiento del endpoint de compra de guía requirió pedirle permiso al usuario para seguir probando en el sandbox de Skydropx después de que el clasificador de permisos bloqueara el primer intento (por crear un shipment real, aunque fuera de sandbox/sin costo) — el usuario autorizó explícitamente continuar. Se iteró contra el sandbox real (nunca contra producción) hasta encontrar la combinación correcta de campos (`address_from`/`address_to` con `reference`, `consignment_note`/`package_type` como códigos SAT en vez de texto libre) y se limpiaron todos los recursos de prueba (pedidos, shipments de sandbox no tienen costo ni requieren limpieza en Skydropx).
