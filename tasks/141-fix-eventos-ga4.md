---
id: 141
title: "Fix: los eventos de GA4 (view_item, add_to_cart, begin_checkout, purchase) no llegaban"
status: in-progress
---

## Contexto

En Analytics (propiedad 554172835, flujo `kinarafit`, `G-CEGESQEH4Q`) había visitas pero `purchase` figuraba como "No stream data detected", y la usuaria necesita medir ventas antes de lanzar anuncios. Causa: `app/lib/analytics.ts` definía `gtag(...args)` y hacía `dataLayer.push(args)` (un arreglo). gtag.js solo procesa el objeto `arguments`; un arreglo se ignora. Resultado: `view_item`, `add_to_cart`, `begin_checkout`, `purchase` y el `consent update` (al aceptar cookies) nunca llegaron a GA4. Las visitas sí llegaban porque el script inline de `root.tsx` usa `dataLayer.push(arguments)` correctamente. Venía así desde la tarea 004.

## Objetivo

Que los eventos de e-commerce y el consentimiento lleguen a GA4.

## Archivos involucrados

- `app/lib/analytics.ts` (función `gtag`)

## Restricciones específicas de esta tarea

- Sin cambios visuales. Los eventos solo se envían con consentimiento (Consent Mode sigue en "denied" por defecto).
- Al arreglarlo, `consent update` también empieza a funcionar: aceptar cookies activa la analítica en la misma página.

## Criterios de aceptación

- [x] Las entradas que se empujan al `dataLayer` desde `analytics.ts` son objetos `Arguments` (verificado en local: `event:view_item` y `event:add_to_cart` aparecen como `Arguments`, igual que `config`).
- [x] Typecheck sin errores.
- [ ] En producción: tras una compra con cookies aceptadas aparece `purchase` en GA4 (Tiempo real / Eventos clave).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (solo cambia cómo se empuja al dataLayer; Consent Mode intacto)
- Regresiones encontradas: ninguna
- Requisitos nuevos agregados a `REQUISITOS.md`: ver abajo

## Pruebas manuales

- Local: aceptar cookies, abrir un producto y agregar al carrito; `window.dataLayer` debe terminar con `Arguments` de `view_item` y `add_to_cart`.
- Producción: Tiempo real en GA4 con cookies aceptadas.

## Notas de progreso

- 2026-10-17: arreglo aplicado y verificado en local. Falta subir (aprobación pendiente), y confirmar `purchase` con una compra real con cookies aceptadas.
