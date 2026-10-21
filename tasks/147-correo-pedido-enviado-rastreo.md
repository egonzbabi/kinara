---
id: 147
title: "Correo automático 'Tu pedido va en camino' con botón para rastrear, al comprar la guía"
status: in-progress
---

## Contexto

El correo de confirmación (tarea 037) sale al pagar, cuando todavía no hay guía ni número de rastreo (la guía se compra a mano en `/admin/pedidos`, tarea 028). Ese correo prometía "Te avisaremos por correo en cuanto tu pedido salga, con su número de rastreo", pero no existía ningún segundo correo. La usuaria pidió un botón de rastreo en el correo; se acordó (2026-10-20) que se envíe automáticamente un correo nuevo al comprar la guía.

## Decisiones tomadas con la usuaria (2026-10-20)

- Algunas guías las genera a mano en `pro.skydropx.com` (cuando Skydropx cotiza el envío genérico de $150): el botón "Comprar guía" no aplica a esos pedidos. Como todos sus envíos están en la cuenta de Skydropx, el sistema los **busca solo** (`GET /api/v1/shipments`, solo lectura) y los empareja con el pedido.
- Envío **100 % automático** con regla estricta: solo cuando UNA guía coincide en nombre + código postal + (teléfono o correo). Si hay 0 o varias coincidencias no se envía nada; queda el botón manual y la captura a mano como respaldo.

- **Pedidos que ya existen** (8 al 20-oct-2026: 4 entregados sin rastreo/cancelado, 3 entregados con rastreo, 1 procesando con rastreo): NO deben recibir el aviso. Candados: el proceso automático solo toca pedidos en estado "Procesando", sin rastreo y creados desde `AUTO_SHIPPED_NOTICE_FROM` (20-oct-2026 00:00 CDMX); los botones manuales piden confirmación mostrando el correo de la clienta.

- **Plan de Vercel: Hobby (gratis)** → el cron solo puede correr 1 vez al día (`vercel.json`, 15:00 UTC = 09:00 CDMX, con tolerancia de ±1 h). Para no esperar un día: (a) el loader de `/admin/pedidos` también ejecuta la revisión al abrir la pantalla (tope de 8 s, errores solo se registran, no consulta Skydropx si no hay pedidos pendientes) y (b) el botón manual por pedido. Opcional si se quiere cada hora sin pagar: un cron externo gratuito (p. ej. cron-job.org) llamando a la ruta con `Authorization: Bearer <CRON_SECRET>`.

- **El estatus manda (decisión de la usuaria):** el aviso solo se manda a pedidos en **Procesando**, y el estatus avanza solo al cerrar cada paso: `processing` (pagado, preparando) → `shipped` (guía hecha + clienta avisada; también al comprar la guía desde el admin) → `delivered` (cuando Skydropx reporta el paquete como `delivered`; el valor exacto de `tracking_status` hay que confirmarlo con un envío real porque el sandbox solo muestra `created`) → `cancelled` siempre manual. Si el correo falla, el pedido vuelve a Procesando y se reintenta. Un pedido Enviado/Entregado/Cancelado nunca recibe el aviso por el proceso ni por los botones manuales. El estatus se sigue pudiendo cambiar a mano en el admin.

## Objetivo

1. Correo nuevo "Tu pedido va en camino" (mismo diseño que la confirmación) con paquetería, número de rastreo, entrega estimada, dirección y botón **Rastrear mi pedido** (a `tracking_url` de Skydropx; si no hay URL, solo se muestra el número).
2. Se envía solo, al terminar `buyShippingLabel` (la guía no se puede comprar dos veces, así que no hay duplicados). Si el correo falla, la guía y el pedido quedan bien y el admin puede reenviarlo con un enlace "Reenviar aviso por correo".
3. Copia oculta (`bcc`) al correo del negocio, igual que la confirmación.

## Archivos involucrados

- `app/lib/resend.server.ts` (`sendOrderShippedEmail`, `buildOrderShippedHtml`)
- `app/lib/skydropx.server.ts` (`listRecentShipments`, solo lectura)
- `app/lib/shipment-match.ts` (regla estricta de emparejamiento, función pura)
- `app/lib/admin-orders.server.ts` (`buyShippingLabel` envía el correo; `syncShipmentsForOrders`; `registerManualTracking`; `sendShippedEmailForOrder`)
- `app/routes/api.cron.sync-shipments.tsx` + `app/routes.ts` (proceso automático, protegido con `CRON_SECRET`)
- `app/routes/admin.pedidos.tsx` (botones: buscar guía, capturar rastreo a mano, reenviar aviso)
- `vercel.json` (cron — solo cuando se confirme el plan de Vercel)

## Restricciones específicas de esta tarea

- Nunca bloquea ni revierte la compra de la guía si el correo falla.
- No cambia el estado del pedido (pasar a "Enviado" sigue siendo manual).
- Solo se aceptan enlaces `http(s)` en el botón; todo texto se escapa (`escapeHtml`).
- No se prueba enviando a clientas reales: la prueba se hace renderizando el HTML y, si la usuaria lo aprueba, mandándolo a su propio correo.

## Criterios de aceptación

- [x] Al comprar una guía desde el admin se envía el correo al cliente con el botón de rastreo.
- [x] El correo se ve igual de cuidado que el de confirmación (revisado a 375 px y escritorio; URL no http(s) no genera botón).
- [x] Regla de emparejamiento probada con 11 casos (coincide, otro CP, otro nombre, guía anterior al pedido, guía ya usada, dos coincidencias → ambigua…).
- [x] Si Resend falla en el proceso automático/captura a mano, no se guarda el rastreo (se reintenta); en compra desde el admin la guía se conserva y queda "Reenviar aviso por correo".
- [x] Typecheck sin errores.
- [ ] En producción: configurar `CRON_SECRET` y el cron de Vercel; validar con una guía real (hecha a mano y comprada desde el admin) que el emparejamiento acierte.

## Verificación de requisitos anteriores

- Pendiente

## Notas de progreso

- 2026-10-20: código completo y probado en local (typecheck, 11 casos de la regla, correo renderizado). NO subido: falta (1) que la usuaria confirme su plan de Vercel (un cron más frecuente que lo que admite el plan hace fallar el deploy), (2) `CRON_SECRET` en Vercel Production, (3) aprobación para subir. La consulta de prueba a Skydropx fue contra el sandbox (`sb-pro`, 3 envíos de prueba): hay que validar el formato real en producción con una guía real.
- La pantalla `/admin/pedidos` no se pudo revisar visualmente (requiere sesión de admin); validar los 3 botones nuevos al abrir un pedido sin rastreo.
