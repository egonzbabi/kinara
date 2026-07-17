---
id: 004
title: "Google Analytics 4 completo"
status: pending
---

<!--
Antes de trabajar esta tarea, Claude debe haber leído (en este orden):
1. ../CLAUDE.md
2. README.md (este directorio)
3. REQUISITOS.md (este directorio)
4. Este archivo completo
-->

## Contexto

No hay ninguna medición del sitio hoy. Se necesita GA4 completo, con eventos de e-commerce, para poder tomar decisiones de negocio y marketing.

## Prerrequisito (a cargo del usuario)

Claude no puede crear cuentas de Google. Antes de ejecutar esta tarea, el usuario debe:
1. Crear una property de GA4 en https://analytics.google.com.
2. Compartir el **Measurement ID** (formato `G-XXXXXXX`) para agregarlo como variable de entorno (`VITE_GA_MEASUREMENT_ID` en `.env`, que ya está en `.gitignore`).

## Objetivo

Integrar GA4 con Consent Mode y trackear el set estándar de e-commerce: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`.

## Archivos involucrados

- `app/root.tsx`
- nuevo `app/lib/analytics.ts`
- `app/context/CartContext.tsx` (disparar `add_to_cart`)
- `app/routes/producto.$slug.tsx` (disparar `view_item`)
- `.env` / `.env.example`

## Restricciones específicas de esta tarea

- No disparar ningún evento de analytics antes de que el usuario acepte cookies (Consent Mode por defecto en "denied").
- No hardcodear el Measurement ID en el código — siempre desde variable de entorno.

## Pasos sugeridos

1. Agregar `VITE_GA_MEASUREMENT_ID` a `.env.example` (sin valor real).
2. Cargar `gtag.js` en `root.tsx` con Consent Mode default denegado.
3. Implementar un banner simple de consentimiento de cookies que, al aceptar, actualiza el consent a "granted".
4. Crear `app/lib/analytics.ts` con helpers tipados para los eventos de e-commerce.
5. Disparar `view_item` al cargar producto, `add_to_cart` al agregar al carrito, `begin_checkout` al abrir el checkout, `purchase` al completar el pago (coordinar con la tarea 007 de Stripe cuando exista).

## Criterios de aceptación

- [ ] GA4 DebugView muestra los 4 eventos disparándose correctamente en cada flujo.
- [ ] Sin consentimiento, no se envía ningún hit a Google Analytics.
- [ ] El Measurement ID viene de variable de entorno, no está hardcodeado.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí.
- Regresiones encontradas: -
- Requisitos nuevos agregados a `REQUISITOS.md`: todo nuevo flujo de compra/producto debe disparar su evento GA4 correspondiente.

## Pruebas manuales

- Navegar el flujo completo (ver producto → agregar al carrito → iniciar checkout) con GA4 DebugView abierto.
- Rechazar cookies y confirmar que no se envían hits.

## Notas de progreso

- (vacío — se llena a medida que se trabaja)
