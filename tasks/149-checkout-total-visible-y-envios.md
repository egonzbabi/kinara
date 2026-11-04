---
id: 149
title: "Checkout: total visible, lista de envíos más corta y eventos de GA4 de envío/pago"
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

La campaña de Google Shopping llevaba 204 clics (20 oct – 1 nov) y 0 compras. En GA4 (15 oct – 3 nov): 104 productos vistos, 9 agregados al carrito, 5 usuarios con `begin_checkout` (4 en celular) y 0 compras. Al recorrer `/checkout` en celular (375px) con datos de prueba se encontró:

1. Hay que llenar 8 campos y tocar "Ver opciones de envío" antes de saber cuánto cuesta el envío.
2. La lista de tarifas de Skydropx muestra TODAS (12 en la prueba, de $108 a $1,245), lo que obliga a bajar mucho en celular para llegar al botón de pago.
3. Nunca se ve el total final: arriba solo dice "Subtotal", al elegir envío no hay resumen y el botón de pago no dice el monto. El total real se ve hasta la página de Stripe.
4. El sitio solo manda `begin_checkout` y `purchase`; `add_shipping_info` y `add_payment_info` nunca se envían, así que el embudo de GA4 muestra 0% en esos pasos aunque no sea dato real.

La usuaria autorizó (2026-11-03) los tres cambios siguientes.

## Objetivo

1. Resumen de la compra (subtotal, envío, total) visible antes del botón de pago, y botón con el monto ("Pagar $507.82 con tarjeta u OXXO").
2. Lista de métodos de envío corta: las 3 más baratas y el resto en "Ver más opciones"; la más barata va preseleccionada (como hoy).
3. Medición completa del embudo: `add_shipping_info` al mostrar tarifas y `add_payment_info` al iniciar el pago (Stripe o PayPal).

## Archivos involucrados

- `app/routes/checkout.tsx`
- `app/lib/analytics.ts`
- `app/components/PayPalButton.tsx` (solo avisar que se inició el pago)

## Restricciones específicas de esta tarea

- Diseño aprobado intocable: mismas clases/tokens (rounded-xl bg-bone, text-muted, border-line, btn btn-clay), sin colores ni tipografías nuevas.
- El total mostrado es antes de un código de descuento escrito a mano (el servidor lo aplica en Stripe/PayPal): si hay código escrito, el botón NO muestra monto y se avisa que el descuento se aplica en el siguiente paso. Durante el Buen Fin los precios ya traen el 30% y no hay campo de código.
- No cambia nada de lo que se cobra: el servidor sigue recalculando precio, envío y descuento (`validateCheckout`).
- Los eventos de GA4 usan los helpers de `analytics.ts`, nunca `gtag()` suelto.

## Pasos sugeridos

1. Helpers `trackAddShippingInfo` y `trackAddPaymentInfo` en `analytics.ts`.
2. `checkout.tsx`: lista corta con "Ver más opciones", resumen con total, botón con monto, desplazamiento a las tarifas al cotizar, eventos.
3. `PayPalButton`: prop `onStart` llamada al crear la orden.
4. Probar en local (celular y escritorio), `npm run typecheck`.

## Criterios de aceptación

- [x] Con más de 3 tarifas solo se ven 3 y un botón "Ver más opciones (N)"; al abrirlo se ven todas; la más barata sigue preseleccionada.
- [x] El resumen muestra Subtotal, Envío (con transportista) y Total, y se actualiza al cambiar de tarifa.
- [x] El botón de Stripe dice "Pagar $X con tarjeta u OXXO" con X = subtotal + envío; con código de descuento escrito no muestra monto y avisa.
- [x] Al cotizar, en celular la pantalla baja sola a las tarifas.
- [x] `add_shipping_info` y `add_payment_info` llegan a GA4 (verificado en `dataLayer`).
- [x] `npm run typecheck` sin errores; sin cambios visuales fuera del checkout.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (checkout validado en servidor, descuentos de Buen Fin sin campo de código, GA4 con helpers, diseño sin cambios de color/tipografía)
- Regresiones encontradas: ninguna
- Requisitos nuevos agregados a `REQUISITOS.md`: sí (total visible/lista corta; eventos del embudo)

## Pruebas manuales

- `/checkout` a 375px y a escritorio: cotizar con CP 06600, abrir/cerrar "Ver más opciones", cambiar de tarifa y ver el total, escribir un código y ver el aviso, botón de PayPal sigue apareciendo.
- Estado de carga/error de la cotización sigue igual.

## Notas de progreso

- 2026-11-03: tarea creada y autorizada por la usuaria. Implementación en curso; nada subido a producción todavía (se sube solo con su "sí súbelo").
- 2026-11-03: implementado y verificado en local (375px y escritorio, `npm run typecheck` limpio): lista de 3 tarifas + "Ver más opciones (N)", resumen Subtotal/Envío/Total, botón "Pagar $X con tarjeta u OXXO" (sin monto si hay código escrito, con aviso), desplazamiento automático a las tarifas, `add_shipping_info` y `add_payment_info` (una vez por visita, también al iniciar PayPal) confirmados en `dataLayer`. Capturas antes/después en `~/Downloads/kinara-checkout-vista-previa/`. FALTA: la usuaria revisa y aprueba ("sí súbelo"), subir, repasar `REQUISITOS.md` y cerrar la tarea; después de subir, revisar en GA4 (Checkout journey) que los pasos de envío y pago empiecen a registrar datos.
- 2026-11-04: aprobada por la usuaria ("sí súbelo"), subida a producción. Pendiente: revisar en GA4 (Checkout journey) que `add_shipping_info`/`add_payment_info` empiecen a registrar datos.
