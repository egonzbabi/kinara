---
id: 156
title: "QR de promotoras con la marca KINARA y el texto «Descuento exclusivo para las clientas de…»"
status: in-progress
---

## Contexto

La usuaria (2026-11-26) generó los QR de las promotoras (tarea 150) y quiere que el QR que se descarga lleve arriba un texto tipo "Descuento exclusivo para las clientas de la Doctora Connie…" y la marca KINARA, para que quien lo reciba sepa que es la tienda. Las promotoras actuales: "Dra. Connie Gutiérrez", "Consutorio 670", "Sports World" (los artículos cambian según el nombre, por eso el texto es "…las clientas de" + el nombre en su propio renglón).

## Objetivo

Que "Descargar QR" en `/admin/promotoras` entregue una imagen PNG con: KINARA (con su lema), "Descuento exclusivo para las clientas de <nombre de la promotora>", el porcentaje, el QR, "kinarafit.com.mx" y el código.

## Archivos involucrados

- `app/lib/promoter-card.ts` (nuevo; arma la imagen en el navegador con canvas)
- `app/routes/admin.promotoras.tsx` (el botón "Descargar QR" usa la tarjeta)
- `app/routes/admin.promotoras.qr.tsx` (descarga del QR plano; queda sin enlace en pantalla)

## Restricciones específicas de esta tarea

- Solo cambia la imagen descargable del admin; nada del sitio público. Colores y tipografías de la marca (Fraunces, Hanken Grotesk, bone/espresso/clay).
- El QR y el enlace con UTM no cambian: se sigue escaneando igual.
- El nombre sale del campo "Nombre de la promotora" (editable en el admin).

## Criterios de aceptación

- [x] La imagen muestra marca, texto, nombre, porcentaje, QR, URL y código, bien alineados con nombres cortos y largos.
- [ ] El QR de la imagen se escanea y lleva a `/tienda?codigo=…`.
- [x] El botón descarga `qr-<codigo>.png`; en error muestra un mensaje.
- [x] Typecheck sin errores.

## Verificación de requisitos anteriores

- Revisado: el QR y su enlace con UTM no cambian (`promoterLink` intacto); el endpoint `/admin/promotoras/qr` sigue existiendo; el código de promotora y sus reglas no se tocaron; typecheck limpio.

## Notas de progreso

- 2026-11-26: implementado en local, sin subir. Falta revisar la imagen con datos reales y que la usuaria apruebe el diseño antes de subir.
- 2026-11-26 (2): probado en el navegador con datos de ejemplo (nombres corto, medio y de 3 renglones): marca, texto, nombre, porcentaje, QR, URL y código bien alineados. Typecheck limpio. Falta: que la usuaria pruebe "Descargar QR" en /admin/promotoras con su sesión (local), escanee el PNG con su teléfono y apruebe el diseño; luego subir con su "sí súbelo". Dato: una promotora está guardada como "Consutorio 670" (falta la «l»); se corrige renombrándola en el admin.
- 2026-11-26 (3): pie de la tarjeta cambiado a petición de la usuaria: «Escanéalo para activar tu descuento en kinarafit.com.mx» + «o escribe el código <CÓDIGO> al pagar». Motivo: entrar a kinarafit.com.mx sin escanear NO carga el código, así que no puede decir «escanéalo o compra».
- 2026-11-26 (4): pie reescrito otra vez: «Escanéalo y tu descuento se aplica solo en kinarafit.com.mx» y debajo «¿Lo ves en tu celular? Escribe el código <CÓDIGO> al pagar». Motivo: con el QR el código ya llega cargado en /checkout (no hay que escribirlo); el código escrito es para quien recibe la imagen en el mismo teléfono y no puede escanearla.
- 2026-11-26 (5): línea final cambiada a «¿No puedes escanearlo? Usa el código <CÓDIGO> al pagar» (la anterior, «¿Lo ves en tu celular?», no se entendía).
- 2026-11-26 (6): pie con la redacción de la usuaria: «Escanéalo y te lleva directo a la página con tu descuento incluido» (2 renglones), kinarafit.com.mx, y «¿No puedes escanearlo? Usa el código <CÓDIGO> al pagar». Revisado en pantalla, typecheck limpio.
- 2026-11-26 (7): pie redactado por Claude a partir de la idea de la usuaria: «Escanea el QR y entra a la tienda con tu descuento ya aplicado» (en negrita) / «¿No puedes escanearlo? Entra a» kinarafit.com.mx «y usa el código <CÓDIGO> al pagar» (código en negrita). Revisado en pantalla; typecheck limpio.
- 2026-11-26 (8): primera línea del pie cambiada porque parecía que la clienta tenía que entrar a la página: «Solo escanea el QR: se abre la tienda con tu descuento ya aplicado».
- 2026-11-26 (9): «se abre la tienda» sonaba mal; ahora «Escanea el QR y compra directo con tu descuento ya aplicado».
- 2026-11-26 (10): la usuaria pidió un texto profesional y muy claro. Pie final: «Escanea el código con la cámara de tu celular / y tu descuento se aplica automáticamente al pagar» · «¿No puedes escanearlo? Compra en» kinarafit.com.mx «e ingresa el código <CÓDIGO> al pagar» · letra chica «Válido en productos sin precio rebajado · Un uso por correo» (son las reglas reales del código de promotora). Revisado en pantalla; typecheck limpio.
- 2026-11-27: la usuaria aprobó y dijo «sí súbelo». Se sube con la tarea 155 (solo notas). Queda abierta únicamente la prueba de escanear el PNG descargado con el teléfono (criterio 2) y corregir el nombre «Consutorio 670» en el admin; al confirmarlas se cierra.
