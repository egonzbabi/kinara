---
id: 151
title: "Checkout: la tarifa de envío elegida se identifica por transportista + servicio"
status: done
---

## Contexto

En `/checkout`, la tarifa elegida se guardaba solo por `serviceCode`. Varios transportistas comparten ese código (con CP 05110: Imile y DHL `express`; Afimex y DHL `standard`). Resultado: al elegir DHL Express se veían marcadas dos opciones (el navegador dejaba la radio de DHL, la última), pero el resumen, el cobro y la guía usaban la primera con ese código (Imile, $107.14). La clienta creía haber elegido DHL ($340.78) y no podía elegirlo. Detectado el 2026-11-19 mientras se probaba la tarea 150; no tiene relación con ella.

## Objetivo

Que lo que la clienta elige es lo que se ve, lo que se cobra y con lo que se compra la guía. Sin cambios visuales.

## Archivos involucrados

- `app/routes/checkout.tsx`: `rateKey()` (`providerName|serviceCode`) en el estado de selección, el `find`, la lista visible, el `key` de React y la radio. Las peticiones a Stripe/PayPal no cambian (ya mandaban `providerName` + `serviceCode`, y `validateCheckout` empareja por los dos).

## Criterios de aceptación

- [x] Al elegir DHL Express solo queda marcada esa opción y el resumen, el total y el botón de pago usan $340.78 (probado con CP 05110).
- [x] Igual con DHL Standard ($402.69), que compartía código con Afimex.
- [x] La pantalla de Stripe muestra "Envío · DHL · Express" con el mismo monto (sesión de prueba).
- [x] La opción por defecto sigue siendo la primera (la más barata), y es la única marcada.
- [x] Sin avisos de llaves duplicadas de React en la consola.
- [x] Typecheck sin errores.

## Verificación de requisitos anteriores

- Sin cambios en el cálculo del envío ni en la validación del servidor (`validateCheckout` sigue emparejando por `providerName` + `serviceCode`).
- Sin cambios visuales.

## Notas de progreso

- 2026-11-19: hecho y probado en local contra Skydropx sandbox (12 tarifas) y Stripe en modo test. Pendiente: subir con "sí súbelo".
