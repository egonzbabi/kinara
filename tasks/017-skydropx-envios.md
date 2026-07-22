---
id: 017
title: "Integración de Skydropx para cotización real de envíos"
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

El costo de envío usado en el checkout (tarea 007) es una tarifa plana de $150 MXN, marcada explícitamente como placeholder pendiente de una integración real con Skydropx (agregador de paqueterías mexicano: DHL, Estafeta, FedEx, etc.). El usuario pidió conectar Skydropx para cotizar en tiempo real según la dirección real del comprador, en vez de seguir cobrando una tarifa fija.

## Objetivo

El comprador ve tarifas de envío reales (paquetería, servicio, precio, días estimados) calculadas por Skydropx a partir de su propia dirección de entrega, elige una, y el precio cobrado en Stripe coincide exactamente con la tarifa elegida (re-verificada server-side, nunca confiando en el precio mostrado en el navegador).

## Archivos involucrados

- `app/lib/skydropx.server.ts` (nuevo) — cliente OAuth2 + cotización + polling de Skydropx Pro API.
- `app/lib/shipping.ts` (extender) — estimado automático de peso/parcela + `SHIPPING_FEE_MXN` como fallback.
- `app/routes/api.shipping-quote.tsx` (nuevo) — action que devuelve tarifas reales al cliente.
- `app/routes/checkout.tsx` (nuevo) — paso de dirección + selección de paquetería, antes de redirigir a Stripe.
- `app/routes/api.create-checkout-session.tsx` (modificar) — re-cotiza server-side y usa el precio autoritativo.
- `app/lib/orders.server.ts` (modificar) — lee la dirección de envío desde `metadata` en vez de `session.collected_information`.
- `app/components/CartDrawer.tsx` (modificar) — el botón "Finalizar compra" navega a `/checkout` en vez de crear la sesión directo.
- `app/routes.ts` — registrar las rutas nuevas.
- `.env` — variables `SKYDROPX_*`.

## Restricciones específicas de esta tarea

- Nunca confiar en el precio de envío ni en el `id` de cotización que manda el cliente — el servidor vuelve a cotizar con Skydropx al crear la Checkout Session y empareja la tarifa elegida por `provider_name` + `provider_service_code` (el `id` de cotización es efímero, cambia en cada llamada).
- Si Skydropx no responde o no devuelve tarifas, debe existir un fallback (la tarifa plana de $150 MXN) para que el checkout nunca se bloquee por completo.
- Sin cambios visuales al diseño aprobado fuera de la nueva página `/checkout` (que es funcionalidad nueva, no un rediseño de algo existente) — seguir la paleta/tipografía/patrones ya usados en el resto del sitio.
- Credenciales de Skydropx solo en variables de entorno de servidor, nunca expuestas al cliente.

## Pasos sugeridos

1. `app/lib/skydropx.server.ts`: token OAuth2 cacheado, `createQuotation`, `pollQuotation`, `getShippingRates`.
2. Extender `app/lib/shipping.ts` con el estimado automático de peso/parcela.
3. `app/routes/api.shipping-quote.tsx`.
4. `app/routes/checkout.tsx` + actualizar botón en `CartDrawer.tsx`.
5. Modificar `app/routes/api.create-checkout-session.tsx` para recibir dirección + tarifa elegida y re-cotizar.
6. Modificar `app/lib/orders.server.ts` para leer la dirección desde `metadata`.
7. Registrar rutas nuevas en `app/routes.ts`.
8. Variables de entorno en `.env` (y luego Vercel).

## Criterios de aceptación

- [x] `npm run typecheck` sin errores.
- [x] Flujo probado en sandbox: carrito → `/checkout` → dirección de prueba (CP 03100, Del Valle, Benito Juárez, CDMX) → tarifas reales de Skydropx visibles en la UI (FedEx $109.98, Estafeta $157.32, Paquetexpress, etc.) → elegir una → redirige a Stripe con el monto exacto (MX$499.98 = $390 + $109.98, verificado en la propia página de Stripe). Verificado también por API directa que la sesión de Stripe creada tiene `metadata.shipping_fee`, `shipping_carrier` y `shipping_address_json` correctos.
- [x] El precio cobrado en Stripe coincide con el de la tarifa elegida, re-verificado server-side (probado además que una tarifa inventada/no vigente es rechazada con 400 "ya no está disponible").
- [x] Fallback verificado: con `shipping.providerName === "fallback"` el endpoint usa `SHIPPING_FEE_MXN` sin volver a llamar Skydropx, y `/api/shipping-quote` devuelve esa única opción cuando Skydropx no tiene tarifas `success`.
- [x] `SKYDROPX_CLIENT_SECRET` no aparece en el bundle de cliente (`npm run build` + grep, confirmado).
- [ ] Commit y push solo al remoto `mio` — pendiente, a ejecutar cuando el usuario lo confirme.
- Nota: no se completó un pago real de extremo a extremo por la UI de Stripe (tarjeta 4242) por limitaciones del entorno de automatización del navegador; se verificó el mismo resultado por inspección directa de la Checkout Session vía API (metadata, line items, monto). El parseo de `shipping_address_json` en `orders.server.ts` (para cuando el webhook/`/checkout/success` creen la orden) se revisó manualmente y sigue el mismo patrón ya probado que `items_json`.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí.
- Regresiones encontradas: ninguna esperada — el patrón de dedup de órdenes (`ensureOrderFromCheckoutSession`) y el de nunca confiar en precios del cliente (ya exigido para productos) se preservan y extienden a envío.
- Requisitos nuevos agregados a `REQUISITOS.md`: el placeholder de $150 deja de ser el precio cobrado (pasa a ser solo fallback) + "nunca confiar en el precio de envío del cliente, siempre re-cotizar server-side contra Skydropx" junto al requisito ya existente de precios de producto.

## Pruebas manuales

- Agregar productos al carrito, ir a "Finalizar compra", llenar dirección de prueba, ver tarifas reales, elegir una, pagar con `4242 4242 4242 4242`, confirmar `/checkout/success` y el pedido en `/admin/pedidos` con el envío correcto.
- Probar el camino de fallback (forzar que Skydropx no devuelva tarifas) y confirmar que no rompe el checkout.

## Notas de progreso

- 2026-07-21: Tarea creada e iniciada. Credenciales sandbox de Skydropx ya verificadas por prueba directa contra la API (`sb-pro.skydropx.com`). Dirección de origen confirmada: CP 10910, La Magdalena Contreras, CDMX. Decisión: estimado automático de peso (no se agrega campo de peso a productos). Faltan calle/teléfono/email exactos de origen — pendiente de confirmar con el usuario antes de probar en vivo.
