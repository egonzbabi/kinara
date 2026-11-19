---
id: 150
title: "Código QR con 20% de descuento por promotora (desde el 18 de noviembre de 2026)"
status: in-progress
---

## Contexto

La usuaria quiere ofrecer 20% de descuento a partir del 18 de nov de 2026 (el día que termina el Buen Fin) a quien tenga un QR. El QR se reparte en digital a las promotoras de la marca y ellas lo pasan a sus alumnas y conocidas. Decisiones confirmadas (2026-11-17):

1. Sin fecha de término (se apaga a mano).
2. Una vez por correo.
3. Solo productos sin precio tachado (`compare_at` nulo), igual que el Buen Fin. Nunca en el envío.
4. Un código por promotora (para medir cuántas ventas trae cada una): `KINARA<descuento>-IDENTIFICADOR` (ej. `KINARA20-ANA`). **El porcentaje es variable por promotora (decisión del 2026-11-19):** se elige al crear el código en `/admin/promotoras` y queda escrito en el código; no se edita después (otro porcentaje = código nuevo y se apaga el anterior). La usuaria no tiene nombres todavía: da de alta identificadores desde `/admin/promotoras` y llena el nombre cuando lo tenga (el nombre es opcional y editable).
5. No se suma con el Buen Fin (hasta el 17 de nov) ni con el código de bienvenida (un solo campo de código).

## Objetivo

Un enlace/QR por promotora que lleve a la tienda con el código ya cargado en `/checkout`, validado en el servidor, con 20% en los productos elegibles.

## Archivos involucrados

- `supabase/migrations/20261117000000_promoter_codes.sql` (tabla `promoter_codes`, la aplica la usuaria en el SQL Editor ANTES de subir)
- `app/lib/promoter-codes.server.ts` (buscar y validar el código)
- `app/lib/checkout-validation.server.ts` (ahora entrega `unitAmountCents` por línea; Stripe y PayPal lo usan)
- `app/routes/api.create-checkout-session.tsx`, `app/routes/api.create-paypal-order.tsx`
- `app/lib/promo-code-storage.ts`, `app/components/PromoCodeCapture.tsx`, `app/root.tsx`, `app/routes/checkout.tsx`, `app/routes/checkout.success.tsx` (guardar el `?codigo=` y prellenar el campo)
- `app/lib/discount-resolution.server.ts` (`resolveDiscount`: ÚNICA fuente de la regla de descuento; la usan el cobro y la vista previa), `app/routes/api.validate-code.tsx` (vista previa para /checkout)
- `app/lib/discount-constants.ts` (`PROMOTER_CODES_START`, porcentaje por defecto/mínimo/máximo y `PROMOTER_CODE_HEAD`)
- `app/components/CartDrawer.tsx`: en el carrito lateral muestra "Descuento de X%: −$Y en los productos sin precio tachado. Se aplica al pagar." cuando hay un código de promotora guardado (autorizado por la usuaria el 2026-11-19). El monto lo calcula el servidor con `previewPromoterDiscount` (sin pedir el correo; "una vez por correo" se revisa en `/checkout` y al cobrar)
- `app/routes/admin.promotoras.tsx` (alta de código, nombre editable, encender/apagar, ventas por código, copiar enlace, ver QR), `app/routes/admin.promotoras.qr.tsx` (descarga del QR en PNG), menú del admin y `app/routes.ts`
- Dependencia nueva: `qrcode` (+ `@types/qrcode`) para generar el QR en el servidor

## Restricciones específicas de esta tarea

- Sin cambios visuales: el código aparece en el campo de código que ya existe en `/checkout`.
- El descuento se calcula solo en el servidor; el navegador nunca decide el porcentaje.
- Antes de subir: la usuaria aplica la migración y se insertan los códigos. Si la tabla no existe, `findPromoterCode` no tumba el pago (registra el error y trata el código como de bienvenida).

## Criterios de aceptación

- [x] Migración aplicada por la usuaria (2026-11-19). Los códigos reales los crea ella desde `/admin/promotoras`; el de prueba ya se borró.
- [x] Un código válido, desde el 18 de nov 00:00 (México), da 20% en productos sin precio tachado y el envío queda igual (probar con una sesión de Stripe en modo test).
- [x] Antes del 18 de nov y durante el Buen Fin el código se rechaza con mensaje claro. (Durante el Buen Fin: probado el 17 con el reloj real. Antes del 18: solo por lectura de código, ya no se puede probar con el reloj real.)
- [x] Mismo correo no puede usar un segundo código de promotora.
- [x] Carrito solo con productos en oferta: el código se rechaza con mensaje claro.
- [x] El código de bienvenida sigue funcionando igual (10%, mínimo $799).
- [x] PayPal cobra el mismo total que Stripe.
- [x] Entrar con `?codigo=...` deja el código escrito en `/checkout`.
- [ ] Tras pagar, el código guardado se borra (`clearSavedCode` en `checkout.success.tsx`; no se probó de punta a punta porque el webhook no llega a localhost).
- [x] En `/checkout`, con el código escrito y el correo puesto, aparece "Código aplicado: 20%", la fila de descuento y el total ya rebajado; si el código no sirve, el motivo en rojo. El total mostrado coincide con el de Stripe/PayPal.
- [x] Carrito lateral: con código de promotora guardado muestra el aviso "se aplicará al pagar"; sin código o con código de bienvenida no muestra nada (escritorio y 375 px).
- [x] Typecheck sin errores.
- [ ] `/admin/promotoras`: crear un identificador, editar el nombre, apagar/encender, copiar enlace, ver y descargar el QR (probar con la tabla ya creada).

## Verificación de requisitos anteriores

- Pendiente de revisar contra `REQUISITOS.md` al cerrar.

## Notas de progreso

- 2026-11-17: implementado en local (sin subir). Typecheck limpio. Falta: que la usuaria dé los nombres de las promotoras, aplicar la migración, insertar los códigos, probar con fechas simuladas y generar los QR.
- 2026-11-17 (2): la usuaria no tiene nombres: se agregó `/admin/promotoras` (alta por identificador, nombre opcional y editable, ventas por código, enlace y QR). `promoter_name` ahora tiene default ''. Typecheck limpio; falta aplicar la migración y probar la pantalla.
- 2026-11-17 (3): la usuaria pidió mostrar el descuento en /checkout (autoriza el cambio visual mínimo: mensaje bajo el campo, fila "Descuento" y total rebajado). Se extrajo `resolveDiscount` y se agregó `/api/validate-code`. Typecheck limpio. Probado en local solo el rechazo durante el Buen Fin (reloj real del 17 de nov) y la validación de datos; falta probar el camino del código de promotora (necesita la tabla creada + fecha simulada después del 18 de nov) y el checkout en pantalla.
- 2026-11-17 (4): **EN PAUSA por decisión de la usuaria**: espera a que su clienta regrese de viaje antes de lanzar las promotoras. La migración `20261117000000_promoter_codes.sql` NO se ha corrido y nada de esta tarea está subido. Al retomar: (1) confirmar con la clienta; (2) ajustar `PROMOTER_CODES_START` y `PROMOTER_CODES_START_LABEL` en `app/lib/discount-constants.ts` si el 18 de nov ya no aplica; (3) correr la migración; (4) hacer las pruebas pendientes de arriba; (5) subir solo con "sí súbelo".
- 2026-11-19: la usuaria retomó la tarea y corrió la migración. Probado en local con la fecha real: `/api/validate-code` (6 casos), sesión de Stripe en modo test (2 × $899 → $719.20 c/u, envío sin descuento; carrito mixto $719.20 + $849 + envío), orden de PayPal sandbox con el mismo total ($1,718.20), una vez por correo (con un pedido temporal ya borrado), bienvenida 10% intacto (con un alta temporal ya borrada), `?codigo=` guardado y prefill en `/checkout` en escritorio y 375 px (total $1,545.54 = $1,798 − $359.60 + $107.14). Código de prueba `KINARA20-PRUEBA` borrado de la tabla. Falta: probar `/admin/promotoras` (requiere el login de la usuaria), crear los códigos reales, y subir con "sí súbelo". Aparte, se vio un bug previo (no de esta tarea) en `/checkout`: la tarifa de envío se identifica solo por `serviceCode`, y Imile/DHL comparten `express` (y Afimex/DHL `standard`), así que al elegir DHL se cobra la tarifa de Imile.
- 2026-11-19 (2): a petición de la usuaria se agregó el aviso en el carrito lateral (`CartDrawer.tsx`). Verificado en escritorio y celular; typecheck limpio. Sigue pendiente: que la usuaria pruebe `/admin/promotoras`, crear los códigos reales y subir con "sí súbelo".
- 2026-11-19 (3): a petición de la usuaria, (a) el carrito muestra el descuento aplicable en pesos en lugar de "tu código" (nuevo `previewPromoterDiscount`; `/api/validate-code` acepta peticiones sin correo solo para códigos de promotora) y (b) el porcentaje es variable por promotora: campo "Descuento (%)" al crear (1–90, por defecto 20), el código queda `KINARA<%>-ID`, la fila muestra su porcentaje, y se quitó el 20 fijo del código. Probado con códigos temporales de 30% y 5% (ya borrados) y con el `KINARA20-ANA01` de la usuaria; typecheck limpio. Pendiente: que la usuaria cree un código desde el formulario nuevo, ver el aviso del carrito en pantalla, y "sí súbelo".
- 2026-11-19 (4): a petición de la usuaria, la pantalla de Stripe ahora desglosa el descuento (antes se veía el producto ya rebajado). `api.create-checkout-session.tsx` manda cada producto a precio completo, un cupón de monto fijo (`amount_off`, nombre = el código) por lo descontado, y el envío como `shipping_options` (Stripe no rebaja los envíos con cupones). Probado en modo test: sin código $1,948; con KINARA20-ANA01 y 2 × $899 → subtotal $1,798, descuento −$359.60, envío $150, total $1,588.40 (igual que antes); carrito mixto $2,437.40; se vio en la pantalla de Stripe. El webhook no lee las líneas de la sesión (usa `metadata`), así que no cambia. Cada pago con código crea un cupón de un solo uso en Stripe (no estorba).
- 2026-11-19 (5): PayPal igualado a Stripe: `api.create-paypal-order.tsx` manda los productos a precio completo y el descuento en `breakdown.discount` (`createPaypalOrder` recibe `discountCents`). Verificado contra PayPal sandbox leyendo la orden creada: sin código $1,948.00; KINARA20-ANA01 con 2 × $899 → items $1,798, envío $150, descuento $359.60, total $1,588.40; carrito mixto $2,437.40 — los mismos totales que Stripe. No se probó aprobar y capturar un pago en sandbox (requiere el login de una cuenta compradora de prueba); el total que se guarda en `pending_checkouts` no cambió.
