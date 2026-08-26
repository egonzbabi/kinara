---
id: 070
title: "10% de descuento en la primera compra al dejar el correo (mínimo $799)"
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

El usuario pidió "si se registran reciben un 10% de descuento en la primera compra mínima de 799 pesos" y explícitamente pidió analizar bien la implementación antes de construirla. El sitio no tiene ningún sistema de cuentas de cliente (solo checkout como invitado) — se presentaron las opciones al usuario (captura de correo vs. cuenta real con login) y se confirmaron 3 decisiones antes de implementar: banner en el home, código vence a los 30 días, y el código exige que el correo del checkout coincida con el del registro.

## Objetivo

Un formulario de correo en el home genera un código de un solo uso por correo (10% de descuento). En `/checkout`, el cliente puede ingresar ese código; el servidor valida (correo coincide, no usado, no vencido, sin compra previa con ese correo, subtotal de productos ≥ $799) antes de aplicar el descuento vía Stripe.

## Decisión de arquitectura

Se evitó depender de las restricciones nativas de Stripe (`minimum_amount`, `first_time_transaction`, Promotion Codes por registro) porque:
- El envío se agrega como una línea más del carrito (no como `shipping_options` de Stripe), así que el `minimum_amount` nativo de Stripe contaría envío + producto, no solo producto.
- `first_time_transaction` requiere manejar objetos `Customer` persistentes de Stripe, que este checkout (100% invitado) no usa hoy.

En su lugar, toda la elegibilidad se valida en el servidor con datos que ya controlamos (mismo criterio que el resto de `api.create-checkout-session.tsx`: nunca confiar en el cliente), y Stripe solo se usa como el mecanismo mecánico de "cobra 10% menos" vía un único Coupon reutilizable.

## Archivos involucrados

- `supabase/migrations/20260820000000_discount_signups.sql`: tabla `discount_signups` (email único, code único, used_at, created_at) + columna `orders.discount_code`. Aplicada a la base real con `supabase db push`.
- `app/lib/supabase.types.ts`: tipos actualizados.
- `app/lib/discount-constants.ts` (nuevo, sin `.server` — se usa también en el cliente): `DISCOUNT_PERCENT=10`, `DISCOUNT_MIN_SUBTOTAL_MXN=799`, `DISCOUNT_EXPIRY_DAYS=30`, `DISCOUNT_CODE_PREFIX`.
- `app/lib/discount-signups.server.ts` (nuevo): `getOrCreateDiscountSignup(email)` (un correo nunca recibe más de un código — si ya existe, se reusa), `validateDiscountCode(code, email)` (existe, correo coincide, no usado, no vencido, sin pedido previo con ese correo en `orders`), `markDiscountCodeUsed(code)`.
- `app/lib/stripe.server.ts`: `getOrCreateWelcomeCoupon()` — un Coupon de Stripe (`percent_off: 10`, id fijo `bienvenida10`), creado la primera vez que se necesita y reutilizado siempre después.
- `app/lib/resend.server.ts`: `sendWelcomeDiscountEmail({email, code})` — mismo patrón que los correos ya existentes (nunca lanza si Resend no está configurado).
- `app/routes/api.newsletter-signup.tsx` (nueva ruta): valida el correo, crea/reusa el código, manda el correo.
- `app/components/WelcomeDiscountBanner.tsx` (nuevo): banda en el home (fondo espresso, acento clay) con el formulario de correo.
- `app/routes/_index.tsx`: banner insertado entre "Lo nuevo" y "Nuestra filosofía".
- `app/routes/checkout.tsx`: campo "¿Tienes un código de descuento?" en el paso de método de envío, se manda en el `POST` a `api/create-checkout-session`.
- `app/routes/api.create-checkout-session.tsx`: si viene `discountCode`, valida mínimo de $799 contra el `subtotal` de productos ya recalculado (no contra el total con envío) y llama a `validateDiscountCode`; si es válido, agrega `discounts: [{coupon: ...}]` a la sesión de Stripe y guarda `discount_code` en el metadata.
- `app/lib/orders.server.ts`: al crear el pedido, guarda `discount_code` en la orden y llama a `markDiscountCodeUsed` — así el código queda inutilizable en cuanto el pedido se confirma (webhook), no antes (si el cliente abandona el pago, el código sigue disponible).
- `app/lib/admin-orders.server.ts` y `app/routes/admin.pedidos.tsx`: el detalle de pedido en el admin muestra el código de descuento usado, si aplica.
- `app/components/AnnouncementBar.tsx`: nuevo mensaje "10% de descuento en tu primera compra — regístrate" en la barra de anuncios (todo el sitio, arriba de cada página) enlazando a `/#bienvenida` — es lo que hace que alguien que entra por cualquier página del sitio (no solo el home) se entere de la oferta, sin tener que llegar al home y hacer scroll a ciegas.
- `app/components/WelcomeDiscountBanner.tsx`: la sección tiene `id="bienvenida"`, y un `useEffect` (con `useLocation().hash` como dependencia, no solo al montar) hace `scrollIntoView` a mano cuando la URL trae `#bienvenida` — un `#hash` solo no alcanza aquí tampoco (mismo motivo que la tarea 068: `<ScrollRestoration>` de React Router no lo mira en una carga fresca de página).
- `app/lib/discount-signups.server.ts`: `listDiscountSignups()` — todos los registros, más reciente primero.
- `app/routes/admin.registros.tsx` (nueva pantalla de admin): tabla con correo, código, fecha de registro (hora de México) y estado (Usado/Disponible) — el usuario preguntó explícitamente si los correos quedaban guardados para poder mandar publicidad después; esta pantalla es la forma de verlos/consultarlos sin entrar directo a Supabase.
- `app/routes.ts`, `app/routes/admin.layout.tsx`, `app/components/admin/AdminSidebar.tsx`: se registra la ruta `admin/registros`, su título en el topbar, y un ítem nuevo en el menú del admin ("Registros"), mismo nivel que "Mensajes".

## Restricciones específicas de esta tarea

- No se construyó ningún sistema de cuentas de cliente (login/contraseña/sesión) — fue una decisión explícita, presentada y confirmada por el usuario antes de implementar.
- El código se marca usado recién cuando el pedido se confirma como pagado (en `ensureOrderFromCheckoutSession`, llamado por el webhook), no al crear la sesión de Stripe — si el cliente abandona el checkout sin pagar, el código sigue disponible.
- El correo de bienvenida usa el mismo patrón de degradación ya establecido (`sendContactEmail`/`sendOrderConfirmationEmail`): si `RESEND_API_KEY` no está configurado, el registro y el código igual se guardan, solo no se manda el correo — verificado en vivo (ver Pruebas manuales).
- El Coupon de Stripe se crea perezosamente (primera vez que se necesita), no requiere que el usuario lo configure a mano en el Dashboard de Stripe.

## Criterios de aceptación

- [x] El banner del home genera un código único por correo y lo guarda.
- [x] Un mismo correo que se registra dos veces recibe el mismo código (no uno nuevo).
- [x] El código exige que el correo del checkout coincida con el del registro.
- [x] El código se rechaza si ya se usó, si venció (30 días), si no hay compra ≥ $799 en productos, o si ya existe un pedido previo con ese correo.
- [x] El descuento se aplica vía Stripe (Coupon único, reutilizado).
- [x] El admin puede ver qué código se usó en un pedido.
- [x] La oferta se anuncia en la barra de anuncios de todo el sitio, no solo en el home, y el enlace lleva directo a la sección del banner.
- [x] Los correos registrados se pueden ver desde el admin (`/admin/registros`), con su código y si ya lo usaron.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — el banner reutiliza combinaciones de color ya aprobadas (fondo espresso + acento clay, igual que `AnnouncementBar`), sin paleta nueva. No se tocó el diseño de ninguna pantalla existente, solo se agregó contenido nuevo en los espacios ya previstos.
- Regresiones encontradas: ninguna — la lógica de creación de pedido/webhook/decremento de stock sigue igual, solo se le agregaron dos pasos (guardar `discount_code`, marcar el código usado) sin alterar el resto del flujo.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (funcionalidad de negocio puntual, no un estándar transversal de performance/SEO/accesibilidad).

## Pruebas manuales

- `npm run typecheck` limpio.
- Migración aplicada a la base real (`supabase db push`, confirmado).
- Verificación de punta a punta contra Supabase y Stripe reales (modo test), con script desechable: registro nuevo genera código; un segundo registro con el mismo correo reusa el mismo código; validación con correo distinto se rechaza; validación correcta pasa; el Coupon de Stripe se crea una vez y se reutiliza (mismo id en llamadas sucesivas); tras marcar el código como usado, una nueva validación se rechaza; un código inexistente se rechaza. Los 7 escenarios dieron el resultado esperado.
- En el navegador: el banner "Bienvenida" aparece correctamente en el home entre "Lo nuevo" y "Nuestra filosofía". Se probó el registro real desde el navegador (`fetch` a `/api/newsletter-signup` con un correo de prueba) — devolvió `{ok: true, emailSent: false}` (correo no enviado por no tener `RESEND_API_KEY` configurado, comportamiento esperado); se confirmó que el código sí quedó guardado en Supabase, y se limpió el registro de prueba.
- El campo de código en `/checkout` no se pudo verificar visualmente en vivo por una falla del panel de navegador de esta sesión (quedó "atascado" en varias pestañas nuevas, mismo problema ya visto en una tarea anterior de esta sesión) — se verificó por revisión de código: es un input controlado simple, agregado dentro de un bloque condicional que ya renderizaba correctamente antes de este cambio, sin tocar su lógica.
- Mensaje de la barra de anuncios: verificado en el navegador que aparece en `/tienda` (no solo el home) con el link correcto (`/#bienvenida`). El scroll a la sección se verificó con `getBoundingClientRect()`/`scrollIntoView({behavior:"instant"})` (el panel de esta sesión no renderiza animaciones `scroll-behavior: smooth`, limitación ya documentada en la tarea 068) — el elemento existe, está en la posición esperada, y el mismo mecanismo ya probado funciona. Contenido de la sección confirmado con `get_page_text` en la posición correcta de la página (justo después de "Lo nuevo").

## Notas de progreso

- 2026-08-19: Tarea creada e implementada en la misma sesión. Antes de escribir código se presentó un análisis con 2 opciones (captura de correo vs. cuenta real) y 3 decisiones puntuales (ubicación del banner, expiración, si el código exige coincidencia de correo) — el usuario confirmó la opción recomendada en las 3.
- 2026-08-20: El usuario preguntó "dónde vamos a poner el mensaje para que las personas que entren a la página sepan esto" — se agregó el mensaje a la barra de anuncios (mecanismo ya establecido y visible en todo el sitio, mismo patrón que "Política de cambios y devoluciones") en vez de dejar la oferta descubrible solo por quien llegara al home y bajara hasta esa sección.
- 2026-08-20: El usuario preguntó si los correos quedaban guardados para poder mandar publicidad después — confirmado que sí (nunca se borran), pero no había ninguna pantalla para verlos; se agregó `/admin/registros` a pedido explícito ("si, agrégala"). Verificado de punta a punta contra la base real (crear, listar, marcar usado, limpiar) antes de reportarlo.
