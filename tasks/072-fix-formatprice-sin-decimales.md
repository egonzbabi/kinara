---
id: 072
title: "Fix: formatPrice no mostraba siempre 2 decimales"
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

El usuario reportó, probando el checkout de descuento (tarea 070), que el total con descuento aplicado se veía como "854.1" en vez de "854.10" en el resumen de Stripe. Al revisar `formatPrice`, tenía `minimumFractionDigits: 0` — con `Intl.NumberFormat`, eso hace que un monto con un solo decimal significativo (como 854.10, que en realidad es 854.1) se muestre con 1 solo decimal en vez de 2, aunque el comentario del archivo ya documentaba (incorrectamente) que debía mostrar siempre 2.

## Objetivo

`formatPrice` muestra siempre exactamente 2 decimales, sin importar si el monto es un número entero o tiene decimales.

## Archivos involucrados

- `app/lib/formatPrice.ts`: cambiado `minimumFractionDigits: 0` a `minimumFractionDigits: 2` (se deja `maximumFractionDigits: 2` igual).

## Restricciones específicas de esta tarea

- `formatPrice` se usa en todo el sitio (tienda, producto, carrito, checkout, admin, correos) — el cambio es intencionalmente global, no se acotó a una sola pantalla, porque el bug (decimales inconsistentes) era el mismo en todos lados.

## Criterios de aceptación

- [x] `formatPrice(390)` → `"$390.00"` (antes: `"$390"`).
- [x] `formatPrice(854.1)` → `"$854.10"` (antes: `"$854.1"`).
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — es un fix de formato/consistencia, no toca paleta, tipografía ni layout.
- Regresiones encontradas: ninguna — se verificó visualmente `/tienda` completa (37 artículos), todos los precios muestran 2 decimales correctamente, incluyendo los que antes eran números enteros.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Verificado en Node directamente: `Intl.NumberFormat` con `minimumFractionDigits: 2` da `$390.00` y `$854.10` como se esperaba.
- Verificado visualmente en `/tienda` (servidor local): todos los precios (incluyendo ofertas con precio tachado) muestran 2 decimales.

## Notas de progreso

- 2026-08-25: Encontrado y corregido en la misma sesión en la que el usuario probaba el checkout de la tarea 070 — reportó "854.1" en vez de "854.10" en el total de Stripe.
