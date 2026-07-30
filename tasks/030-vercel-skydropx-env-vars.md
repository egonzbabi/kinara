---
id: 030
title: "Fix: faltaban las 11 variables de entorno de Skydropx en Vercel (producción)"
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

El usuario reportó que `/checkout` en el sitio en producción (`kinara-ecommerce.vercel.app`) siempre mostraba "Envío estándar · $150" sin importar el código postal, incluso con un CP (`10710`) que localmente sí devolvía tarifas reales de Skydropx.

## Causa raíz

`vercel env ls production` mostró que **ninguna de las 11 variables `SKYDROPX_*`** (`SKYDROPX_BASE_URL`, `SKYDROPX_CLIENT_ID`, `SKYDROPX_CLIENT_SECRET`, `SKYDROPX_ORIGIN_*` ×8) estaba configurada en Vercel — solo existían `STRIPE_*`, `SESSION_SECRET` y `SUPABASE_*`. Sin esas variables, `requireConfig()` (`skydropx.server.ts`) lanza un error inmediatamente, `getShippingRates()` lo atrapa (`try/catch` ya documentado en `REQUISITOS.md`, tarea 017) y devuelve `[]`, y `api.shipping-quote.tsx` cae siempre al fallback `SHIPPING_FEE_MXN = 150` — exactamente el síntoma reportado, el 100% de las veces, sin importar el CP.

Esto no es un bug de código: es que nunca se habían cargado esas variables en Vercel (el checklist de `tasks/PRODUCCION.md` ya tenía un ítem pendiente para esto, nunca ejecutado).

## Qué se hizo

Se le preguntó al usuario qué credenciales usar en Vercel (dado que Stripe en producción sigue en modo test — el sitio no cobra dinero real todavía) y eligió usar las mismas credenciales de **sandbox** que ya están en `.env` local, por consistencia con el resto del sitio en modo de pruebas.

Se agregaron las 11 variables a Vercel (Production) con `vercel env add` y se disparó un redeploy (`vercel deploy --prod`) para que tomaran efecto.

## Hallazgo adicional: el sandbox de Skydropx es intrínsecamente poco confiable

Tras el fix, se volvió a probar el mismo CP `10710` en producción y **siguió devolviendo el fallback de $150** — pero esta vez por una razón distinta y confirmada en los logs de Vercel: la cotización se crea correctamente (las credenciales sí funcionan) pero `is_completed` nunca pasa a `true` dentro de los 30 intentos (~30s) que espera `pollQuotation()`, así que se agota el tiempo y cae al fallback.

Se investigó directamente contra el sandbox (`sb-pro.skydropx.com`) y se confirmó que **esto le pasa también localmente, de forma intermitente**:
- La misma cotización, revisada varios minutos después, seguía con `is_completed: false` a pesar de ya tener 35 tarifas calculadas internamente (`rates` no vacío) — se quedó atorada indefinidamente, no es cuestión de esperar más.
- 3 cotizaciones nuevas creadas seguidas, con la misma dirección que sí había funcionado minutos antes, **ninguna completó en 10 intentos**.
- Ya se había detectado antes (ver conversación) que el sandbox devuelve **0 tarifas** para varios CP de ciudades reales (Guadalajara, Mérida, Puebla) mientras que para otros (CDMX, Monterrey, Tijuana) sí responde con tarifas variadas y reales.
- Todas las cotizaciones probadas (exitosas y atoradas) traen `requires_origin_verification: true` — coincide con que `SKYDROPX_ORIGIN_STREET1` es literalmente el placeholder `"Pendiente de confirmar"` (ya documentado como pendiente en `CLAUDE.md`), aunque no se pudo confirmar que sea la causa exacta del atoramiento (cotizaciones con el mismo origen sí completaron otras veces).

**Conclusión**: el fallback de $150 va a seguir apareciendo de vez en cuando mientras se use el sandbox — es una limitación del ambiente de pruebas de Skydropx, no algo corregible desde este código. El código ya hace lo correcto (nunca bloquea el checkout, cae a un envío estándar razonable). Debería ser mucho más confiable en producción real (`pro.skydropx.com`) una vez que además se corrija la dirección de origen real (pendiente ya anotado en `CLAUDE.md`).

## Archivos involucrados

- Ninguno en el repo — el fix fue 100% configuración de Vercel (`vercel env add` ×11 + `vercel deploy --prod`). No hay diff de código que commitear para esta tarea.

## Criterios de aceptación

- [x] Las 11 variables `SKYDROPX_*` existen en Vercel → Production (verificado con `vercel env ls production`).
- [x] Redeploy disparado y confirmado (`vercel deploy --prod`, alias `kinara-ecommerce.vercel.app` actualizado).
- [x] Diagnosticada y documentada la causa de que el fallback de $150 siga apareciendo a veces incluso ya con las variables correctas (flakiness del sandbox, no bug de código).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — el patrón de "$150 es solo fallback, nunca el precio por defecto" (tarea 017) sigue intacto; este fix hace que el camino feliz (tarifas reales) sea alcanzable en producción, que antes era imposible al 100% de las veces.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (es un fix de configuración de infraestructura, no un patrón de código nuevo).

## Notas de progreso

- 2026-07-29: Diagnosticado y corregido en la misma sesión. Usuario reportó el síntoma ("$150 siempre con CP 10710"), se reprodujo primero localmente (funcionó) y luego en `kinara-ecommerce.vercel.app` (falló), lo que aisló el problema a configuración de entorno específica de Vercel. `vercel env ls production` confirmó que faltaban las 11 variables de Skydropx. Usuario autorizó usar credenciales de sandbox (consistente con Stripe test). Se agregaron con `vercel env add` y se redesplegó. Verificación posterior reveló un segundo problema (flakiness del sandbox de Skydropx, documentado arriba) que no es corregible desde el código — se agregó como contexto a `CLAUDE.md` junto a los otros pendientes de cuenta de Skydropx.
