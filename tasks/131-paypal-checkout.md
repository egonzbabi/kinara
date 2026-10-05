---
id: 131
title: "Pagar con PayPal (además de Stripe)"
status: in-progress
---

<!-- El flujo de pago ya está probado end-to-end en sandbox (ver Notas de progreso). Queda pendiente registrar el webhook de PayPal en producción (necesita URL pública) antes de poder cerrar la tarea como done. -->

<!--
Antes de trabajar esta tarea, Claude debe haber leído (en este orden):
1. ../CLAUDE.md
2. README.md (este directorio)
3. REQUISITOS.md (este directorio)
4. Este archivo completo
-->

## Contexto

El usuario pidió poder cobrar también con PayPal. Stripe (ya integrado, tarea 007) no ofrece PayPal como método de pago para esta cuenta/moneda (confirmado en el Dashboard de Stripe: no aparece ni como "Disabled", simplemente no está en la lista de métodos disponibles) — así que no se puede agregar como un `payment_method_types` más dentro del Checkout Session existente. Hay que integrar el SDK/API de PayPal por separado, como un segundo proveedor de pago en paralelo a Stripe.

## Objetivo

El cliente puede elegir entre "Pagar con tarjeta/OXXO" (flujo actual de Stripe, sin tocar) o "Pagar con PayPal" en `/checkout`. Ambos flujos validan el carrito/stock/envío/descuento de la misma forma server-side, y al completarse crean la orden en `orders`, decrementan stock, marcan el código de descuento usado y mandan los mismos correos — sin duplicar esa lógica de negocio entre los dos proveedores.

## Prerrequisito a cargo del usuario (bloqueante)

Claude no puede crear cuentas. Antes de escribir código real hace falta:

1. Cuenta en [developer.paypal.com](https://developer.paypal.com) (puede ser con el mismo login de una cuenta PayPal Business, o crear una).
2. Ahí, crear una "App" en modo **Sandbox** (Apps & Credentials → Create App) y copiar:
   - `Client ID` (sandbox)
   - `Secret` (sandbox)
3. Pasarle esas dos credenciales de **sandbox** a Claude por chat para cargarlas en `.env` local (nunca las de producción/"Live" hasta que se pida explícitamente pasar a producción — mismo criterio que ya aplica a Stripe en este proyecto).

Sin esto no se puede probar nada end-to-end; el código se puede ir escribiendo pero no verificar.

## Diseño técnico (propuesta)

- **No usar Stripe Elements ni manejar tarjeta directamente tampoco aquí** — igual que con Stripe, el pago se aprueba en una superficie de PayPal (popup/redirect de PayPal), nunca se captura un número de tarjeta en nuestro sitio.
- **Validación server-side compartida**: la lógica que hoy vive solo en `app/routes/api.create-checkout-session.tsx` (recalcular precios contra `products`, stock contra `product_variants`, volver a cotizar envío con Skydropx, validar código de descuento) se factoriza a un helper común (ej. `app/lib/checkout-validation.server.ts`) usado por la ruta de Stripe y por la nueva ruta de PayPal — para no tener dos copias de una validación de seguridad tan sensible.
- **Nueva tabla `pending_checkouts`** (migración nueva en `supabase/migrations/`): guarda el snapshot ya validado (items, dirección, envío, descuento, totales) bajo un id propio, igual a lo que hoy viaja en la metadata de la Stripe Checkout Session — PayPal no tiene un objeto de sesión persistente equivalente con ese tamaño de metadata. Se referencia desde PayPal vía `purchase_units[0].custom_id` = id de esta fila.
- **Nueva ruta `api.create-paypal-order.tsx`**: valida con el helper común, inserta la fila en `pending_checkouts`, crea la orden en PayPal (`POST /v2/checkout/orders`, intent `CAPTURE`) con ese `custom_id`, regresa el `id` de la orden de PayPal al cliente.
- **Botón de PayPal en `/checkout`**: se agrega el JS SDK de PayPal (`<script src="https://www.paypal.com/sdk/js?...">`, cargado solo cuando el comprador ya cotizó envío, no en el load inicial de la página — ver regla de performance de `CLAUDE.md` sobre no cargar scripts de terceros que bloqueen el render). El botón llama a `createOrder` (pega a `api.create-paypal-order.tsx`) y `onApprove`.
- **Nueva ruta `api.capture-paypal-order.tsx`**: en `onApprove`, el cliente manda el `orderId` de PayPal aquí; el servidor captura el pago (`POST /v2/checkout/orders/{id}/capture`), confirma `status === "COMPLETED"`, y si es así llama a una función equivalente a `ensureOrderFromCheckoutSession` pero para PayPal (mismo patrón de deduplicación por índice único, esta vez sobre una columna `paypal_order_id`).
- **Nuevo webhook `api.paypal-webhook.tsx`**: red de seguridad igual a la de Stripe — si el `capture` del paso anterior nunca llega a completarse en el navegador del cliente (cierra la pestaña, error de red), el evento `PAYMENT.CAPTURE.COMPLETED` de PayPal crea la orden de todos modos. Hay que verificar la firma del webhook con el método de PayPal (`/v1/notifications/verify-webhook-signature`), no es automático como `stripe.webhooks.constructEvent`.
- **Esquema de `orders`**: agregar columnas `payment_provider` (`'stripe' | 'paypal'`, default `'stripe'`) y `paypal_order_id` (nullable, único) vía migración. `cancelOrderAndRestoreStock` debe poder localizar la orden por cualquiera de los dos ids al procesar un reembolso.
- **Reembolsos desde PayPal**: evento de webhook `PAYMENT.CAPTURE.REFUNDED` → mismo `cancelOrderAndRestoreStock`, adaptado para aceptar un id de PayPal en vez de un `stripe_session_id`.

## Archivos involucrados

- `app/lib/paypal.server.ts` (nuevo) — cliente de la API REST de PayPal (auth OAuth2 client-credentials, create order, capture order, verify webhook).
- `app/lib/checkout-validation.server.ts` (nuevo, extraído de `api.create-checkout-session.tsx`) — validación compartida de carrito/stock/envío/descuento.
- `app/routes/api.create-checkout-session.tsx` — se adapta para usar el helper extraído, sin cambiar su comportamiento actual.
- `app/routes/api.create-paypal-order.tsx` (nuevo)
- `app/routes/api.paypal-webhook.tsx` (nuevo)
- `app/components/PayPalButton.tsx` (nuevo) — botón/SDK de PayPal.
- `app/routes/checkout.tsx` — agrega `PayPalButton` junto al botón "Pagar" existente.
- `app/routes/checkout.success.tsx` — la captura real del pago de PayPal sucede aquí (no en una ruta aparte), igual patrón que Stripe: `onApprove` solo redirige con `?paypal_order_id=`, y este loader captura + crea la orden (idempotente si se recarga la página).
- `app/lib/orders.server.ts` — nueva función `ensureOrderFromPaypalCapture` equivalente a `ensureOrderFromCheckoutSession`; `cancelOrderAndRestoreStock` acepta ambos tipos de id.
- `supabase/migrations/<fecha>_paypal_orders.sql` (nuevo) — tabla `pending_checkouts` + columnas `payment_provider`/`paypal_order_id` en `orders`.
- `.env` — `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_BASE_URL` (sandbox vs producción).

## Restricciones específicas de esta tarea

- Sandbox únicamente hasta que el usuario pida explícitamente pasar a producción (mismo criterio que Stripe en `CLAUDE.md`).
- No se le quita ni se modifica el botón/flujo de Stripe existente — PayPal es una opción adicional, no un reemplazo.
- El SDK de PayPal se carga diferido (tras cotizar envío), nunca bloqueando el render inicial de `/checkout`.
- Nunca se confía en nada que mande el cliente sobre precio/stock/envío — la ruta de PayPal reusa la misma validación server-side que ya existe para Stripe (ver "Diseño técnico").
- No se puede probar ni completar un pago real de PayPal (ni siquiera en sandbox) sin que el usuario primero cargue sus credenciales de sandbox — ver "Prerrequisito" arriba.

## Pasos sugeridos

1. Usuario crea la app sandbox en developer.paypal.com y pasa `Client ID`/`Secret` por chat.
2. Cargar esas credenciales en `.env` local.
3. Migración de Supabase: tabla `pending_checkouts` + columnas nuevas en `orders`.
4. Extraer `checkout-validation.server.ts` del código existente de Stripe (sin cambiar su comportamiento — verificar con una compra de prueba de Stripe que nada se rompió).
5. `app/lib/paypal.server.ts`: auth, create order, capture order, verify webhook.
6. Ruta `api.create-paypal-order.tsx`.
7. Botón de PayPal en `/checkout` (SDK diferido).
8. Ruta `api.capture-paypal-order.tsx` + función de creación de orden en `orders.server.ts`.
9. Ruta `api.paypal-webhook.tsx` (verificación de firma + manejo de `PAYMENT.CAPTURE.COMPLETED`/`REFUNDED`).
10. Prueba end-to-end en sandbox (cuenta de comprador sandbox de PayPal) — verificar que la orden se crea, el stock decrementa, el correo de confirmación llega y el código de descuento se marca usado.

## Criterios de aceptación

- [x] El usuario cargó credenciales de sandbox de PayPal en `.env`.
- [x] `/checkout` muestra un botón de PayPal junto al de Stripe, solo después de cotizar envío.
- [x] Un pago de prueba en sandbox de PayPal crea la orden en `orders` con `payment_provider = 'paypal'`, decrementa stock correctamente (probado 2026-10-02: `ORD-MURHOGMG`, luego borrada por ser de prueba). El código de descuento y el BCC usan exactamente el mismo código ya probado para Stripe (`ensureOrderFromPaypalCapture` llama a las mismas funciones), no se probaron de nuevo uno por uno.
- [ ] Un reembolso en sandbox de PayPal cancela la orden y restaura el stock — **pendiente**: requiere registrar el webhook de PayPal con una URL pública (`https://www.kinarafit.com.mx/api/paypal-webhook`) y cargar `PAYPAL_WEBHOOK_ID`, lo cual solo se puede hacer después de desplegar.
- [x] El flujo de Stripe (tarjeta/OXXO) sigue funcionando exactamente igual que antes — probado en local y en producción tras los cambios.
- [x] `npm run typecheck` limpio.
- [x] El SDK de PayPal no afecta el LCP/performance de `/checkout` (carga diferida, no bloqueante, solo tras cotizar envío).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí.
- Regresiones encontradas: ninguna — el refactor de `checkout-validation.server.ts` se verificó con una compra de prueba real de Stripe en local y en producción (redirect a `checkout.stripe.com` sin errores, monto correcto) antes y después de los cambios de esta tarea.
- Requisitos nuevos agregados a `REQUISITOS.md`: sí, bajo "Pagos (Stripe / PayPal)" — validación compartida en un solo archivo, `orders` con más de un proveedor (`payment_provider`/`paypal_order_id`), mismo patrón de deduplicación para PayPal, sandbox-only hasta pasar a producción.

## Pruebas manuales

- [x] Compra de prueba con Stripe (tarjeta) después de la refactorización del helper compartido — confirmado que sigue funcionando idéntico, en local y en producción.
- [x] Compra de prueba con PayPal sandbox (cuenta "Personal" de developer.paypal.com) — confirmado: orden `ORD-MURHOGMG` creada con `payment_provider: 'paypal'`, `paypal_order_id` = id de la captura real de PayPal, subtotal/envío/total exactos ($1,448 + $108.82 = $1,556.82, coincide con lo mostrado en el modal de PayPal), stock decrementado. Orden de prueba borrada y stock restaurado después de verificar.
- [ ] Reembolso de prueba desde PayPal sandbox — pendiente de registrar el webhook (necesita URL pública).

## Notas de progreso

- 2026-10-01: Se crea la tarea y se documenta el diseño propuesto. Pendiente de que el usuario cree la app sandbox en developer.paypal.com y comparta `Client ID`/`Secret` de sandbox — sin eso no se puede avanzar con el código real (`paypal.server.ts`, rutas nuevas) ni probarlo.
- 2026-10-02: Usuario compartió credenciales de sandbox (Client ID/Secret) y se cargaron en `.env` local (`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com`, más `VITE_PAYPAL_CLIENT_ID` para el SDK del navegador). Usuario corrió la migración de Supabase (`20261001000000_paypal_orders.sql`) manualmente en el SQL Editor — confirmado que las columnas/tabla nuevas existen. Se implementó todo el flujo: `checkout-validation.server.ts` (extraído de la ruta de Stripe), `paypal.server.ts` (auth, create/capture/get order, verificación de firma de webhook), rutas `api.create-paypal-order.tsx` y `api.paypal-webhook.tsx`, botón `PayPalButton.tsx` en `/checkout` (SDK diferido tras cotizar envío), y la captura real sucede en el loader de `/checkout/success` (no en una ruta de captura aparte — mismo patrón que Stripe, para poder reusar `getOrCapturePaypalOrder` de forma idempotente si la página se recarga). Probado end-to-end con la cuenta sandbox "Personal" que el usuario compartió: login en el modal de PayPal, aprobación, creación real de la orden, stock decrementado — todo correcto. **Pendiente para cerrar la tarea**: una vez desplegado, registrar el webhook de PayPal (Apps & Credentials → la app → Add Webhook) apuntando a `https://www.kinarafit.com.mx/api/paypal-webhook`, suscrito a `PAYMENT.CAPTURE.COMPLETED` y `PAYMENT.CAPTURE.REFUNDED`, y cargar el `PAYPAL_WEBHOOK_ID` resultante tanto en `.env` local como en Vercel — sin esto, un reembolso hecho en PayPal no restaura el stock automáticamente (sí funciona la creación de la orden al pagar, que no depende del webhook).
