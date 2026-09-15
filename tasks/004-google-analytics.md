---
id: 004
title: "Google Analytics 4 completo"
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

No había ninguna medición del sitio. El usuario dio de alta la property de GA4 y compartió el Measurement ID (`G-CEGESQEH4Q`).

## Objetivo

GA4 integrado con Consent Mode (nada se manda sin que el visitante acepte cookies) y el set estándar de e-commerce: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`.

## Archivos involucrados

- `app/lib/analytics.ts` (nuevo) — `GA_MEASUREMENT_ID`, helpers de consentimiento (`getStoredConsent`/`setStoredConsent`) y de eventos tipados (`trackViewItem`, `trackAddToCart`, `trackBeginCheckout`, `trackPurchase`).
- `app/components/CookieConsentBanner.tsx` (nuevo) — banner de cookies, no existía nada antes.
- `app/root.tsx` — script inline de Consent Mode (default "denied", o "granted" si ya se había aceptado antes) + carga de `gtag.js` (solo si `VITE_GA_MEASUREMENT_ID` está configurado), y renderiza `<CookieConsentBanner />`.
- `app/context/CartContext.tsx` — dispara `add_to_cart` dentro de `add()` (un solo punto de entrada al carrito en todo el sitio).
- `app/routes/producto.$slug.tsx` — dispara `view_item` al montar (una vez por producto, no por cada cambio de color/talla).
- `app/routes/checkout.tsx` — dispara `begin_checkout` una vez por visita, cuando el carrito ya hidrató y no está vacío.
- `app/routes/checkout.success.tsx` — dispara `purchase` cuando `loaderData.status === "paid"` (ya verificado server-side contra Stripe antes de llegar aquí).
- `.env` / `.env.example` — `VITE_GA_MEASUREMENT_ID`.

## Restricciones específicas de esta tarea

- Ningún evento se manda con datos reales antes de que el visitante acepte cookies — `analytics_storage` arranca en "denied" (script inline en `root.tsx`, corre antes que `gtag.js`); solo cambia a "granted" cuando el visitante hace clic en "Aceptar" del banner, vía `gtag('consent','update',...)`.
- El Measurement ID nunca está hardcodeado — siempre `import.meta.env.VITE_GA_MEASUREMENT_ID` (`GA_MEASUREMENT_ID` en `analytics.ts`). Si la variable no está configurada, el script de GA4 simplemente no se agrega al `<head>` (nada rompe en un entorno sin la variable).

## Hallazgo/decisión durante la implementación

React Router 7 no permite un `noindex`/`meta` extra sin afectar esto, pero sí importa un detalle de Consent Mode: el script inline lee `localStorage` **antes** de que React hidrate — por eso es un `<script>` plano con `dangerouslySetInnerHTML` en el `<head>` del `Layout`, no un efecto de React (que correría demasiado tarde, después de que `gtag.js` ya hubiera arrancado sin bandera de consentimiento).

## Criterios de aceptación

- [x] Los 4 eventos se disparan correctamente — verificado leyendo `window.dataLayer` directamente en el navegador (no solo por inspección de código) en cada flujo: `view_item` al entrar a un producto, `add_to_cart` al agregarlo con color/talla reales, `begin_checkout` al entrar a `/checkout` con el carrito ya hidratado. `purchase` se verificó por revisión de código (usa datos de la orden ya confirmados contra Stripe en el loader) — no se simuló un pago real de Stripe en esta sesión.
- [x] Sin consentimiento, no se manda ningún hit con datos reales — confirmado que `analytics_storage` arranca "denied" y que "Rechazar" lo deja así explícitamente (`gtag('consent','update',{analytics_storage:'denied'})`).
- [x] El Measurement ID viene de `VITE_GA_MEASUREMENT_ID`, no está hardcodeado en ningún archivo.
- [x] Banner de cookies: aparece solo cuando no hay elección guardada, desaparece y persiste la elección al aceptar/rechazar (verificado en desktop y mobile 375px).
- [x] `npm run typecheck` limpio.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no hay conflicto con ningún requisito existente; se agrega uno nuevo (ver abajo), pedido explícitamente por el objetivo original de esta tarea ("todo nuevo flujo de compra/producto debe disparar su evento GA4 correspondiente").
- Regresiones encontradas: ninguna — verificado que `/`, un producto, `/checkout` y el flujo de agregar al carrito siguen funcionando igual (visualmente sin cambios salvo el banner nuevo), sin errores de consola.
- Requisitos nuevos agregados a `REQUISITOS.md`: todo flujo nuevo de producto/compra debe disparar su evento GA4 vía los helpers de `app/lib/analytics.ts` (nunca `gtag()` suelto a mano en un componente); toda página nueva no debe asumir que hay consentimiento — los helpers de `analytics.ts` ya son no-op sin `VITE_GA_MEASUREMENT_ID`, pero el propio Consent Mode de Google es quien filtra si el hit se manda con datos reales o anonimizados.

## Pruebas manuales

- Verificado en el navegador (local, tab nueva para evitar buffer de consola obsoleto) que `gtag.js` carga con el Measurement ID correcto y que el script de consentimiento por defecto usa "denied".
- Leído `window.dataLayer` en vivo para confirmar la forma exacta de cada evento (`view_item`, `add_to_cart`, `begin_checkout`) con `currency: "MXN"`, `value`, e `items` en el formato de GA4 Enhanced Ecommerce.
- Aceptar/Rechazar en el banner: confirmado que persiste en `localStorage` y dispara `gtag('consent','update',...)` con el valor correcto en ambos casos.
- Probado en mobile (375px): el banner se ve y funciona igual, con botones de tamaño cómodo para tocar.
- `npm run typecheck` limpio, sin errores de consola en home, producto y checkout.
- **Pendiente para el usuario**: abrir GA4 → DebugView (o Informes en tiempo real, unas horas después) para confirmar que los eventos llegan a la property real — Claude no tiene acceso a la cuenta de Google Analytics del usuario para verlo directamente.

## Notas de progreso

- 2026-09-15: Implementado y verificado en una sola sesión, con el Measurement ID (`G-CEGESQEH4Q`) dado por el usuario en el chat.
