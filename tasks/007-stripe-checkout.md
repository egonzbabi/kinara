---
id: 007
title: "Cobros con Stripe (Checkout Sessions hospedado, modo test)"
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

El carrito (`CartContext.tsx`) hoy no tiene forma de cobrar. Se integra Stripe en modo test/sandbox, usando **Stripe Checkout Sessions hospedado** (no Elements embebido): el comprador hace clic en "Finalizar compra" y es redirigido a la página de pago de Stripe (que recolecta email, dirección de envío y método de pago), y Stripe redirige de vuelta a `/checkout/success` o `/checkout/cancelado`.

Se evaluó también Stripe Elements embebido (tomando como referencia un sitio ya construido con ese patrón, `flow-landing`, clonado en el scratchpad de una sesión anterior). Se decidió por hospedado porque: (1) requiere mucho menos código propio que mantener, (2) soporta OXXO nativamente sin trabajo extra (de hecho más simple que con embebido), y (3) Mercado Pago —que el usuario quiere agregar más adelante— sería una integración totalmente aparte sin relación con cuál enfoque de Stripe se use hoy, así que hospedado no cierra ninguna puerta a futuro.

## Prerrequisito (a cargo del usuario)

Claude no puede crear cuentas ni ingresar datos de pago. Antes de poder probar de punta a punta, el usuario debe:
1. Crear una cuenta en https://stripe.com (modo test activado por defecto).
2. Compartir la **Secret key** de test (`sk_test_...`) para `.env` (`STRIPE_SECRET_KEY`) — nunca se commitea, `.env` ya está en `.gitignore`.
3. Configurar el endpoint de webhook (local con Stripe CLI: `stripe listen --forward-to localhost:5173/api/stripe-webhook`; en producción vía el Dashboard) y compartir el **Webhook signing secret** (`STRIPE_WEBHOOK_SECRET`).

No se necesita Publishable key — al ser Checkout hospedado, no hay Stripe.js del lado del cliente.

## Objetivo

Que un comprador pueda completar una compra real (en modo test) desde el carrito hasta la confirmación, con el pago verificado vía webhook, el stock decrementado, y el pedido visible en un nuevo panel `/admin/pedidos`.

## Alcance decidido con el usuario

- Sin correo de confirmación por ahora (evitaría depender de una cuenta de Resend) — la confirmación se muestra en pantalla (`/checkout/success`). Se puede agregar después como tarea aparte.
- Sí agregar una vista "Pedidos" en `/admin` (folio, cliente, total, estado, fecha) — sin ella no hay forma de ver los pedidos salvo entrando al dashboard de Stripe.
- Envío: tarifa plana de **$150 MXN** como línea de línea separada en el Checkout Session — placeholder explícito (`TODO: reemplazar con cotización real de Skydropx`) hasta que el usuario integre Skydropx para cotizar envíos en tiempo real. El banner de "envío gratis desde $60" de `CartDrawer.tsx` (bug ya documentado en la tarea 008 — ese "$60" es en realidad un remanente en EUR) se deja intacto, sin tocar — es un problema aparte con dueño.
- Métodos de pago habilitados: `card` + `oxxo`.

## Archivos involucrados

- `supabase/migrations/20260716000000_orders.sql` (nuevo) — tabla `orders` + RPC `decrement_variant_stock`.
- `app/lib/stripe.server.ts` (nuevo) — cliente de Stripe server-side.
- `app/lib/shipping.ts` (nuevo) — constante `SHIPPING_FEE_MXN`.
- `app/lib/orders.server.ts` (nuevo) — `ensureOrderFromCheckoutSession` (dedup + creación de orden + decremento de stock).
- `app/routes/api.create-checkout-session.tsx` (nuevo) — valida carrito server-side, crea la Checkout Session.
- `app/routes/api.stripe-webhook.tsx` (nuevo) — valida firma, escucha `checkout.session.completed` / `checkout.session.async_payment_succeeded` / `checkout.session.async_payment_failed` / `charge.refunded`.
- `app/routes/checkout.success.tsx` y `app/routes/checkout.cancelado.tsx` (nuevos).
- `app/components/CartDrawer.tsx` — el botón "Finalizar compra" pasa a llamar al endpoint de checkout.
- `app/context/CartContext.tsx` — agregar `clear()`.
- `app/lib/admin-orders.server.ts` (nuevo) + `app/routes/admin.pedidos.tsx` (nuevo) — vista de pedidos en el admin.
- `app/routes.ts`, `app/components/admin/AdminSidebar.tsx`, `app/routes/admin.layout.tsx` — registrar las rutas nuevas.
- `.env` / `.env.example` — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- `package.json` — agregar dependencia `stripe` (SDK de Node; sin `@stripe/stripe-js` ni `@stripe/react-stripe-js`, no hacen falta con Checkout hospedado).

## Restricciones específicas de esta tarea

- Solo modo test/sandbox — no activar claves live sin que el usuario lo pida explícitamente.
- Nunca manejar el número de tarjeta directamente — todo el formulario de pago lo maneja la página hospedada de Stripe.
- La secret key y el webhook secret solo existen en el servidor, nunca en código que se envía al cliente.
- Validar la firma del webhook antes de confiar en su contenido (sobre el texto crudo del request, nunca parsear JSON antes de verificar).
- El precio y el stock de cada línea del carrito se recalculan/validan server-side contra Supabase — nunca se confía en el precio que manda el cliente.
- El patrón de deduplicación (índice único en `orders.stripe_session_id` + check-antes-de-insertar + catch de la violación de unicidad `23505`) es obligatorio: tanto el webhook como el loader de `/checkout/success` pueden llamar a `ensureOrderFromCheckoutSession` casi al mismo tiempo, y no debe decrementarse el stock dos veces.

## Criterios de aceptación

- [x] Se puede completar una compra de principio a fin con la tarjeta de test `4242 4242 4242 4242`, terminando en `/checkout/success` con el resumen correcto — **verificado en producción** (`kinara-ecommerce.vercel.app`): pedido real `ORD-MRTN80L4`, YUCA BRA/Negro/S, total $570 ($420 + $150 envío), datos de envío completos.
- [x] El webhook valida la firma y rechaza payloads sin firma válida — verificado en producción: el webhook real de Stripe llegó, la firma se validó correctamente contra `STRIPE_WEBHOOK_SECRET`, y la orden se creó a partir de ese evento (no del fallback del loader).
- [x] No hay ninguna clave secreta de Stripe en el bundle del cliente (verificado en `npm run build`, grep vacío en `build/client/`).
- [x] El carrito se vacía tras una compra exitosa (`clear()` en `CartContext`, invocado en `checkout.success.tsx` cuando `status === "paid"`).
- [x] El stock de cada variante comprada se decrementa exactamente una vez, incluso si el webhook y el loader de éxito corren casi simultáneamente — verificado con una orden simulada (dos llamadas a `ensureOrderFromCheckoutSession` con la misma sesión: la segunda detectó el duplicado, el stock bajó una sola vez).
- [x] `/admin/pedidos` muestra el pedido recién creado, protegido por el mismo login que `/admin/productos` — verificado en dev con la orden simulada (incluyendo cambio de estado Procesando → Enviado) y confirmado por consulta directa a Supabase que la orden real de producción (`ORD-MRTN80L4`) tiene exactamente la forma que `listAdminOrders()` espera mostrar.
- [x] Cancelar el pago regresa a `/checkout/cancelado` con el carrito intacto — verificado visualmente (el link "Back to Kinara" de la página de Stripe apunta correctamente a esa URL).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — la escritura nueva (`orders`) usa `service_role` server-side con RLS sin policies públicas, igual que `admins` (tarea 015); no se toca el esquema de `product_variants`/`products` de la tarea 006 más allá de leerlo; no se modifica el flujo de talla/color obligatorio de `producto.$slug.tsx` (tarea reciente de esta sesión).
- Regresiones encontradas: -
- Requisitos nuevos que esta tarea va a agregar a `REQUISITOS.md` al cerrarse: el patrón de dedup por índice único en `orders.stripe_session_id`; el costo de envío es un placeholder pendiente de Skydropx, no cerrarlo como definitivo en ninguna tarea futura sin revisar con el usuario.

## Pruebas manuales

- Completar una compra de extremo a extremo con la tarjeta de test `4242 4242 4242 4242` y confirmar `/checkout/success`.
- Probar una tarjeta de test que falla (`4000 0000 0000 0002`) directamente en la página de Stripe — confirmar que dentro de esa misma página se puede reintentar sin código nuestro.
- Cancelar el pago (botón "volver" de Stripe) y confirmar `/checkout/cancelado` con el carrito intacto.
- Revisar en el dashboard de Stripe (modo test) que la sesión, el pago y el evento de webhook quedaron registrados.
- Confirmar en Supabase que la orden, el `stripe_session_id` y el stock decrementado son correctos.

## Notas de progreso

- 2026-07-16: Tarea replanteada de "Stripe Checkout hospedado o Elements" (diseño original) a específicamente **Checkout Sessions hospedado**, tras evaluar con el usuario el sitio de referencia `flow-landing` (Elements embebido) y confirmar que hospedado no limita agregar OXXO ni Mercado Pago más adelante. Plan completo aprobado por el usuario (incluye migración, RPC de stock, endpoints, vista de admin de pedidos).
- 2026-07-16: Implementado todo el código: migración `orders` + RPC `decrement_variant_stock` (aplicada y verificada — RLS confirmado: anon no puede insertar/ver filas, igual que `admins`); `app/lib/stripe.server.ts` (cliente perezoso — construirlo a nivel de módulo con la llave vacía hacía que el SDK de Stripe lanzara una excepción al *importar* el archivo, rompiendo la ruta completa en vez de solo la llamada; ahora `getStripe()` se invoca dentro de cada `try/catch`); `app/lib/shipping.ts`; `app/lib/orders.server.ts` (`ensureOrderFromCheckoutSession` con el patrón de dedup); `app/routes/api.create-checkout-session.tsx` (valida precio/stock server-side); `app/routes/api.stripe-webhook.tsx`; `app/routes/checkout.success.tsx` y `checkout.cancelado.tsx`; botón "Finalizar compra" conectado en `CartDrawer.tsx`; `clear()` agregado a `CartContext.tsx`; vista `/admin/pedidos` (`admin-orders.server.ts` + `admin.pedidos.tsx`, registrada en sidebar/layout/rutas).
- 2026-07-16: Durante el typecheck aparecieron errores de tipos en `catalog.ts`/`admin-catalog.server.ts` (código preexistente, no tocado en esta tarea) al declarar el nuevo RPC en `Database["Functions"]` — causa raíz: `product_variants`/`product_images` tenían `Relationships: []` (vacío) en `supabase.types.ts` a pesar de tener FK reales hacia `products.id`, y agregar cualquier entrada a `Functions` hacía que el inferidor de tipos de `postgrest-js` cayera al tipo de fallback `SelectQueryError` en los `.select()` con joins de esos archivos. Se corrigió agregando las `Relationships` correctas (referencia real a `products.id`) — un fix de tipos puro, sin cambio de runtime/esquema, que además deja los tipos más precisos para el futuro. También se corrigió `session.shipping_details` → `session.collected_information.shipping_details` (la versión instalada del SDK de Stripe anida ahí la dirección de envío recolectada).
- 2026-07-16: Verificado: `npm run typecheck` sin errores; `npm run build` sin fugas de `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` en el bundle de cliente (grep vacío en `build/client/`); en el navegador, con `STRIPE_SECRET_KEY` vacío en `.env`, "Finalizar compra" muestra el error "Falta STRIPE_SECRET_KEY en las variables de entorno (.env)." de forma clara (sin pantalla rota, el botón vuelve a estar disponible) — confirma el criterio de degradación elegante antes de tener cuenta de Stripe.
- 2026-07-20: El usuario desplegó el sitio en su propia cuenta de Vercel (ver notas de infraestructura) y creó su cuenta de Stripe. Se agregaron `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` a Vercel (Production) y al `.env` local. Primer intento de compra falló con `"In order to use Checkout, you must set an account or business name"` — el usuario completó el nombre de negocio en el Dashboard de Stripe y se resolvió.
- 2026-07-20: **Compra real completada de punta a punta en producción** (`kinara-ecommerce.vercel.app`): agregado YUCA BRA al carrito → "Finalizar compra" → redirigido a la Checkout Session hospedada de Stripe (`checkout.stripe.com`, badge "Sandbox") → formulario de envío + tarjeta de prueba `4242 4242 4242 4242` → pago aceptado → redirigido a `/checkout/success` con folio `ORD-MRTN80L4` y resumen correcto ($420 + $150 envío = $570). Confirmado por consulta directa a Supabase: la orden se creó con todos los campos correctos (cliente, dirección, items, `stripe_session_id` real) y el stock de la variante (Negro/S) bajó de 2 a 1 — una sola vez. Datos de prueba limpiados después (orden eliminada, stock restaurado a 2).
- **TAREA COMPLETADA.**
