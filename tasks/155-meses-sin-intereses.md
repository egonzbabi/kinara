---
id: 155
title: "Meses sin intereses (3 MSI) en el pago con tarjeta"
status: in-progress
---

## Contexto

La usuaria (2026-11-26) quiere activar la opción de 3 meses sin intereses en el cobro con tarjeta. Stripe México lo soporta en Checkout con `payment_method_options.card.installments.enabled`. Solo aplica a tarjetas de crédito de consumo emitidas en México (bancos admitidos), en MXN, y sobre el mínimo de cada plan (3 meses: MXN 300). Stripe cobra una comisión extra al comercio: 5% por 3 meses, sumada a la comisión normal de tarjeta (3.6% + MXN 3).

## Objetivo

Que en la página de pago de Stripe aparezca la opción de 3 meses sin intereses cuando la tarjeta lo permita, sin cambiar nada más del flujo de pedido.

## Archivos involucrados

- `app/routes/api.create-checkout-session.tsx` (Checkout Session)
- Dashboard de Stripe (a cargo de la usuaria): habilitar MSI y dejar solo el plan de 3 meses.

## Restricciones específicas de esta tarea

- Stripe en producción es live: probar solo con claves/sesiones de modo test; ninguna compra real hasta que ella lo decida.
- Diseño y copy del sitio intocables: no se agrega ningún texto/banner de MSI sin permiso de la usuaria.
- PayPal no ofrece MSI; el pedido y el webhook no cambian.

## Criterios de aceptación

- [x] La Checkout Session se crea con `installments.enabled` (verificado en modo test).
- [x] En la página de Stripe (test) aparece el plan de 3 meses con una tarjeta de prueba mexicana.
- [ ] Usuaria habilita MSI en el Dashboard de Stripe (producción) y deja solo 3 meses.
- [ ] El pedido pagado a meses queda igual en el webhook/orden (total cobrado completo).
- [ ] Typecheck y build sin errores.

## Verificación de requisitos anteriores

- Pendiente al cerrar.

## Notas de progreso

- 2026-11-26: la usuaria pidió activar 3 MSI. Hecho en local, sin subir: `payment_method_options.card.installments.enabled = true` en la Checkout Session. Falta: probar en modo test, que ella active MSI en el Dashboard de Stripe de producción (solo 3 meses) y subir con su "sí súbelo".
- 2026-11-26 (2): probado en modo test (sesión `cs_test_`, sin pagar): Stripe devuelve `payment_method_options.card.installments.enabled: true` y, con la tarjeta de prueba mexicana, la página muestra "Pay in installments (meses sin intereses)" con 3 pagos de MX$283 (total MX$849) y también 6 pagos: en modo test el Dashboard tiene habilitado también el plan de 6 meses. Para dejar solo 3 meses hay que configurarlo en el Dashboard de Stripe (producción), a cargo de la usuaria. Typecheck limpio. Falta: ese ajuste del Dashboard, y subir con su "sí súbelo".
- 2026-11-26 (3): la usuaria dice que ya configuró MSI en el Dashboard. Repetida la prueba en modo test (sesión nueva, tarjeta de prueba mexicana, sin pagar): sigue ofreciendo 3 y 6 pagos. Esto indica que el ajuste no está en el entorno de pruebas (sandbox), o que lo hizo en producción, que desde aquí no se puede verificar (el .env local solo tiene clave test y no se hacen cobros reales). Falta: confirmar en qué modo lo configuró; la verificación en producción es con su "sí súbelo" y una revisión de la página de pago real sin completar el pago.
