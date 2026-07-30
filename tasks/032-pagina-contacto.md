---
id: 032
title: "Página de Contacto (formulario por email) + link en el menú"
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

El usuario pidió una forma de que los visitantes puedan mandar un correo con preguntas (formulario de contacto), y que se agregue "Contacto" al menú de utilidades arriba a la derecha (junto a Buscar/Carrito).

El sitio no tenía ningún servicio de envío de correo integrado. Se le preguntó al usuario por el servicio (Resend, recomendado — gratis hasta 3,000 correos/mes, funciona bien con Vercel) y el correo destino; pidió apuntar ambos como pendientes (no tiene la cuenta de Resend lista ni el correo real del cliente todavía), pero quiere la función construida ya.

## Objetivo

`/contacto` tiene un formulario (nombre, email, mensaje) que guarda el mensaje de forma duradera en Supabase (nunca se pierde, aunque el email no esté configurado todavía) y, si `RESEND_API_KEY`/`CONTACT_EMAIL_TO` ya están configurados, también lo manda por correo real vía Resend. "Contacto" aparece en el menú de utilidades (desktop y mobile).

## Archivos involucrados

- `supabase/migrations/20260730000000_contact_messages.sql` (nuevo)
- `app/lib/resend.server.ts` (nuevo) — wrapper mínimo sobre la API de Resend.
- `app/routes/contacto.tsx` (nuevo)
- `app/routes.ts` — registrar la ruta.
- `app/components/SiteNav.tsx` — link "Contacto" en utilidades (desktop) y en el menú mobile.
- `.env.example` — `RESEND_API_KEY`, `CONTACT_EMAIL_TO`, `CONTACT_EMAIL_FROM`.

## Restricciones específicas de esta tarea

- El mensaje del visitante **siempre** se guarda en `contact_messages` primero — el envío de email es un "además", nunca la única forma de no perder el mensaje. Si Resend falla o no está configurado, el visitante igual ve confirmación de que su mensaje se recibió (porque sí se guardó), no un error.
- No inventar un correo destino ni una API key — quedan como variables de entorno vacías/pendientes hasta que el usuario las dé.
- No se construye una vista de administración de mensajes en este alcance (no se pidió) — se deja anotado como pendiente/sugerencia para cuando se necesite.

## Pasos sugeridos

1. Migración: tabla `contact_messages` (id, name, email, message, created_at, email_sent, email_error).
2. `resend.server.ts`: función `sendContactEmail()` que llama a la API REST de Resend (o el SDK ya instalado), no lanza si faltan las env vars — devuelve un resultado que el caller decide cómo manejar.
3. `contacto.tsx`: loader vacío, action que valida, inserta en `contact_messages`, intenta el email si está configurado, y responde éxito con base en si se guardó el mensaje (no en si se mandó el correo).
4. `SiteNav.tsx`: agregar "Contacto" a utilidades (desktop, junto a Buscar) y al menú mobile.
5. Verificar en el navegador: enviar el formulario sin `RESEND_API_KEY` configurado (estado real actual) y confirmar que el mensaje se guarda en la base y el visitante ve confirmación.

## Criterios de aceptación

- [x] `/contacto` tiene un formulario funcional (nombre, email, mensaje) con validación básica.
- [x] Enviar el formulario guarda el mensaje en `contact_messages` siempre, incluso sin `RESEND_API_KEY` configurado.
- [x] Con `RESEND_API_KEY`/`CONTACT_EMAIL_TO` configurados, además se manda el correo real (no se pudo probar extremo a extremo por falta de credenciales reales — sí se verificó que el código maneja ambos casos sin romperse).
- [x] "Contacto" aparece en el menú de utilidades arriba a la derecha (desktop) y en el menú mobile.
- [x] `npm run typecheck` pasa sin errores; verificado en el navegador sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — sigue el patrón de RLS restrictivo + acceso server-side vía `service_role` (mismo patrón que `admins`/`orders`/`postal_codes`).
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (patrón ya cubierto por requisitos existentes de RLS/service_role).

## Pruebas manuales

- Enviado el formulario de `/contacto` sin `RESEND_API_KEY` configurado (estado real actual): el mensaje se guardó en `contact_messages` con `email_sent: false` y `email_error: "RESEND_API_KEY o CONTACT_EMAIL_TO no configurados"`, y el visitante vio la confirmación de éxito ("Recibimos tu mensaje..."). Mensaje de prueba borrado al terminar.
- Confirmado que "Contacto" aparece y funciona en el menú de utilidades desktop (junto a Buscar/Carrito) y en el menú mobile (abajo, junto a Buscar).
- Corregido de paso el link "Contacto" del footer, que apuntaba a `/tienda` como placeholder — ahora apunta a `/contacto`.
- Sin errores de consola.

## Notas de progreso

- 2026-07-30: Tarea creada e implementada en la misma sesión. Usuario pidió apuntar como pendientes: (1) crear cuenta de Resend y dar el API key, (2) el correo real del cliente al que deben llegar los mensajes — ambos documentados en `CLAUDE.md`. Se instaló el paquete `resend`, se creó la tabla `contact_messages` (migración), `app/lib/resend.server.ts` (nunca lanza si faltan las env vars, devuelve `{sent, error}`), y `app/routes/contacto.tsx` (guarda el mensaje primero, intenta el correo después, el éxito visible al usuario depende de que se haya guardado, no de que el correo haya salido). Se agregó "Contacto" a `SiteNav.tsx` (utilidades desktop + menú mobile) y se corrigió el link placeholder del footer. Verificado en el navegador: envío del formulario sin Resend configurado guarda el mensaje y muestra confirmación correctamente (con el error de configuración registrado en la fila, no mostrado al visitante); "Contacto" funciona en ambos menús. `npm run typecheck` sin errores.
