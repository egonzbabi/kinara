---
id: 073
title: "Reintento automático al enviar correos con Resend"
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

El usuario reportó que no le llegó el correo de confirmación de un pedido real (`ORD-MT9H5I83`) recién pagado. Al investigar: el pedido sí se creó bien (el webhook de Stripe funcionó, stock descontado, código de descuento marcado como usado), pero el envío del correo de confirmación falló una sola vez y, como no había reintento, el cliente nunca lo recibió — solo quedó un `console.error` en la terminal del servidor, sin ningún registro persistente. Al reintentar manualmente el mismo envío minutos después, funcionó sin problema — el patrón (falla la primera vez, funciona en un segundo intento) también se había visto antes con el correo de bienvenida (tarea 070), consistente con fallas puntuales de Resend (probablemente límite de envíos por minuto en la cuenta, dado el volumen de correos de prueba mandados en la misma sesión).

No fue posible confirmar el error exacto de ese envío porque: (1) no se guarda en ningún lado además de la consola del servidor, y (2) la `RESEND_API_KEY` está restringida a "solo enviar", así que no se puede consultar el historial de entregas vía API (se necesitaría entrar al dashboard de resend.com directamente).

## Objetivo

Los 3 correos transaccionales del sitio (contacto, confirmación de pedido, código de bienvenida) reintentan automáticamente una vez si el primer intento falla, antes de darse por vencidos — para que una falla puntual de Resend no le cueste el correo a un cliente real.

## Archivos involucrados

- `app/lib/resend.server.ts`: se agregó `sendWithRetry()`, un helper que envuelve la llamada a `resend.emails.send(...)`, reintenta hasta 2 veces en total con una pausa de 1.5s entre intentos, y devuelve `{sent:false, error}` con el error del último intento si ambos fallan. Las 3 funciones de envío (`sendContactEmail`, `sendOrderConfirmationEmail`, `sendWelcomeDiscountEmail`) ahora usan este helper en vez de un `try/catch` de un solo intento cada una.

## Restricciones específicas de esta tarea

- No cambia el comportamiento cuando el envío funciona a la primera (mismo resultado, solo más lento si tuvo que reintentar).
- No agrega persistencia de logs de correo (fuera de alcance) — sigue sin haber forma de consultar después si un correo específico falló o no, salvo mirar la consola del servidor en el momento o el dashboard de Resend.
- 2 intentos totales (1 reintento) fue la decisión tomada por default, sin pedírselo específicamente al usuario — es un número conservador para no demorar demasiado un webhook de Stripe (que tiene su propio timeout) ni la respuesta de `/api/newsletter-signup`.

## Criterios de aceptación

- [x] Si el primer intento de envío falla, se reintenta automáticamente una vez más antes de devolver `sent:false`.
- [x] Si el primer intento funciona, no hay reintento ni demora extra.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no toca UI ni copy, es un cambio de confiabilidad puramente server-side.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Probado el envío real con un correo destinatario inválido a propósito (`no-es-un-correo-valido`) para forzar el rechazo de Resend: se confirmó en el log que reintentó 2 veces (2 errores `422 validation_error` seguidos, con ~1.5s de pausa entre ellos) y al final devolvió `{sent:false, error:"Invalid \`to\` field..."}` con el error real, no un timeout ni un crash.
- Reenviado el correo de confirmación real del pedido `ORD-MT9H5I83` con los datos reales de la orden — funcionó a la primera (`sent:true`), sin necesitar el reintento.

## Notas de progreso

- 2026-08-25: Encontrado y corregido en la misma sesión en la que el usuario probó un pago real de la tarea 070 y no le llegó el correo de confirmación. El usuario pidió explícitamente el reintento ("si, agrégalo") tras la explicación de la causa raíz.
