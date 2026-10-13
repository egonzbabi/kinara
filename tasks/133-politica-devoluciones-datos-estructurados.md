---
id: 133
title: "Política de devoluciones en los datos estructurados de cada producto"
status: in-progress
---

## Contexto

Se conectó Google Merchant Center (tarea 132). Google usa la política de devoluciones del `Offer` de cada producto (JSON-LD) en Shopping y en los resultados con precio, y la compara con lo declarado en Merchant Center y con las políticas del sitio.

## Objetivo

Agregar a la `Offer` del JSON-LD de `producto.$slug.tsx` `hasMerchantReturnPolicy` (sin devoluciones, enlazando a `/politica-de-cambios-y-devoluciones`). `shippingDetails` queda fuera a propósito: el costo de envío es variable (Skydropx) y Google espera un `shippingRate`; inventarlo sería falso y uno incompleto genera advertencias. El envío ya está declarado en Merchant Center.

## Archivos involucrados

- `app/lib/seo.ts`
- `app/routes/producto.$slug.tsx`

## Restricciones específicas de esta tarea

- Solo datos que ya dicen las políticas del sitio. NO se agrega `shippingDetails` (costo de envío variable, ver Objetivo).
- Sin cambios visuales.

## Pasos sugeridos

1. Helper `offerPolicies()` en `seo.ts`.
2. Usarlo en la `Offer` del producto.
3. Verificar el JSON-LD en local.

## Criterios de aceptación

- [x] El JSON-LD del producto incluye `hasMerchantReturnPolicy`.
- [x] No se agrega `shippingDetails`.
- [x] Typecheck sin errores y JSON-LD válido (JSON parseado de la página local).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (solo agrega un campo al JSON-LD; nada visual)
- Regresiones encontradas: ninguna
- Requisitos nuevos agregados a `REQUISITOS.md`: la política en el JSON-LD debe coincidir con la página de devoluciones y con Merchant Center

## Pruebas manuales

- Ver el JSON-LD de un producto en local y en producción.

## Notas de progreso

- 2026-10-12: tarea creada, se empieza a implementar.
- 2026-10-12: implementado `RETURN_POLICY_SCHEMA` en `seo.ts` y usado en la `Offer` de `producto.$slug.tsx`. Probado en local (`/producto/swift-leggin`): `hasMerchantReturnPolicy` con `MerchantReturnNotPermitted` + enlace a la política. Falta: subir a producción (pendiente de aprobación) y revisar "Mejoras" en Search Console en unos días.
