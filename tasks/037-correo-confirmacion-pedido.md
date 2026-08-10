---
id: 037
title: "Correo de confirmación de pedido al cliente (Resend)"
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

Hoy, cuando un cliente paga con éxito, `ensureOrderFromCheckoutSession` (`app/lib/orders.server.ts`) crea la orden en Supabase y descuenta stock, pero no se le manda ningún correo al cliente — solo ve la pantalla `/checkout/success`. El usuario pidió que, al comprar, le llegue al cliente un correo de confirmación bien redactado, agradeciendo la compra, con los datos del pedido (número de pedido, productos, precios, envío, etc.).

Ya existe integración con Resend para el formulario de contacto (`app/lib/resend.server.ts`, tarea 032) — mismo patrón se reutiliza aquí: mismas variables de entorno (`RESEND_API_KEY`, `CONTACT_EMAIL_FROM`), nunca lanza si faltan, solo registra el error (`CLAUDE.md` ya tiene documentado que `RESEND_API_KEY` está pendiente de que el usuario cree la cuenta real).

## Objetivo

Al confirmarse un pedido pagado (webhook de Stripe o el fallback de `/checkout/success`), se le manda al correo del cliente un email HTML con: agradecimiento, número de pedido, fecha, lista de productos comprados (nombre, color, talla, cantidad, precio), subtotal, envío, total, dirección de envío, y una nota sobre el siguiente paso (aviso de rastreo). Si Resend no está configurado o el envío falla, la orden se crea de todas formas — nunca bloquea la compra.

## Archivos involucrados

- `app/lib/resend.server.ts` — nueva función `sendOrderConfirmationEmail`, con su propio template HTML (`buildOrderConfirmationHtml`) inline-estilizado (tablas, sin CSS externo — necesario para que se vea bien en la mayoría de clientes de correo).
- `app/lib/orders.server.ts` — `ensureOrderFromCheckoutSession` llama a `sendOrderConfirmationEmail` justo después de crear la orden y descontar stock, solo en la rama donde el INSERT fue el que ganó la carrera (nunca en un retry del webhook ni en la carrera con el loader de `/checkout/success` — mismo mecanismo que ya evita duplicar el descuento de stock).

## Restricciones específicas de esta tarea

- Nunca debe poder bloquear ni fallar la creación de la orden — igual que `sendContactEmail`, atrapa cualquier error y solo lo registra en consola.
- Solo se manda una vez por orden real (aprovecha que el código ya solo llega a esta rama cuando el INSERT ganó la carrera contra duplicados — mismo mecanismo que protege el descuento de stock).
- No se inventan variables de entorno nuevas — reutiliza `RESEND_API_KEY`/`CONTACT_EMAIL_FROM`, ya documentadas como pendientes en `CLAUDE.md`.
- El HTML del correo usa tablas + estilos inline (no depende de CSS externo ni de las fuentes autohospedadas del sitio, que no cargan en clientes de correo) — colores de marca (espresso/clay/bone/sand) aplicados directo por hex.
- No se manda el correo si el pedido no tiene `customer_email` (no debería pasar, pero se protege de todas formas).

## Pasos sugeridos

1. Escribir `buildOrderConfirmationHtml` con el diseño del correo (ver Notas de progreso para el detalle del contenido).
2. Escribir `sendOrderConfirmationEmail`, mismo patrón que `sendContactEmail` (nunca lanza, devuelve `{ sent, error }`).
3. Llamar la función desde `ensureOrderFromCheckoutSession`, después de `decrementStockForItems`, antes del `return`.
4. Probar con una compra de prueba en modo test (Stripe) contra un correo real (si ya hay `RESEND_API_KEY` configurado) o revisar el HTML generado manualmente si no.
5. `npm run typecheck`.

## Criterios de aceptación

- [x] Al completarse una compra de prueba, se intenta mandar un correo de confirmación al `customer_email` de la orden.
- [x] El correo incluye: saludo con el nombre del cliente, número de pedido, fecha, lista de productos con color/talla/cantidad/precio, subtotal, envío, total, dirección de envío, y una nota sobre el siguiente paso.
- [x] Si `RESEND_API_KEY` no está configurado, la orden se crea igual y no se lanza ningún error — solo se registra en consola (`sendOrderConfirmationEmail` devuelve `{ sent: false, error }` sin lanzar, igual que `sendContactEmail`).
- [x] El correo no se duplica en reintentos del webhook de Stripe ni en la carrera con `/checkout/success` — se manda dentro de la misma rama de `ensureOrderFromCheckoutSession` que solo se ejecuta una vez por orden real (protegida por el índice único de `stripe_session_id`, mismo mecanismo que ya evita duplicar el descuento de stock).
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no rompe el mecanismo de deduplicación de órdenes (tarea 007/017), reutiliza el mismo patrón de "nunca lanza" ya establecido para Resend (tarea 032).
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: sí — ver abajo.

## Pruebas manuales

- Se generó el HTML del correo con datos de prueba (2 productos, dirección real de ejemplo, envío con paquetería/días) usando `tsx` para invocar `buildOrderConfirmationHtml` directamente (exportada temporalmente solo para esta prueba, revertida a privada al terminar) y se revisó el resultado renderizado en el navegador: encabezado KINARA, saludo con nombre, número de pedido y fecha en su tarjeta, productos con color/talla/cantidad y precio, subtotal/envío/total, dirección de envío, nota de paquetería/días, botón "Seguir explorando", y nota de contacto — todo se ve correctamente, colores de marca aplicados, sin errores de layout.
- No se hizo una compra de prueba real de extremo a extremo contra Stripe en esta sesión (no era necesario para verificar el HTML/la lógica) — cuando el usuario cargue `RESEND_API_KEY` (pendiente, ver `CLAUDE.md`), conviene hacer una compra de prueba real para confirmar la entrega real del correo.
- `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-10: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario ("que cuando un usuario compre un pedido le llegue un correo de confirmación... redáctalo muy bonito"). Se agregó `sendOrderConfirmationEmail` + `buildOrderConfirmationHtml` en `app/lib/resend.server.ts` (tablas + estilos inline, tono cálido consistente con el resto del sitio), conectada desde `ensureOrderFromCheckoutSession` en `app/lib/orders.server.ts` justo después de descontar stock. Reutiliza `RESEND_API_KEY`/`CONTACT_EMAIL_FROM`, ya documentados como pendientes en `CLAUDE.md` — no se agregó ninguna variable de entorno nueva. Verificado visualmente el HTML generado con datos de prueba; pendiente una prueba de compra real de extremo a extremo una vez el usuario cargue las credenciales de Resend.
