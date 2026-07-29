---
id: 008
title: "Actualizar copy de envíos/devoluciones a pesos mexicanos"
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

Al migrar los precios de EUR a MXN (ver tarea 006 y ajustes posteriores), quedó pendiente el copy de envíos/devoluciones, que todavía está en euros y hace referencia a España:

- Barra de anuncios y textos sueltos: "Envío gratis desde 60 €".
- Página de producto, sección "Envíos y devoluciones": "Entrega en 24-48 h en península. Envío gratis desde 60 €. Devoluciones gratuitas durante 30 días."

Esto ya no tiene sentido con precios en pesos mexicanos (productos entre $300–$999 MXN activarían "envío gratis" casi siempre con el umbral de 60, que además está en la moneda equivocada).

## Objetivo

Que todo el copy de envíos, devoluciones y moneda sea consistente con México/MXN: monto real de envío gratis en pesos, tiempo de entrega real, y sin referencias a España/"península".

## Prerrequisito (a cargo del usuario)

El usuario debe indicar:
- Monto real (en MXN) para envío gratis.
- Tiempo de entrega real.
- Política real de devoluciones (si sigue siendo 30 días o cambia).

## Archivos involucrados

- `app/components/AnnouncementBar.tsx`
- `app/routes/producto.$slug.tsx` (sección "Envíos y devoluciones" del Accordion, y el texto bajo el botón "Añadir a la bolsa")
- Buscar además cualquier otra mención de "€" o "península" en `app/`.

## Restricciones específicas de esta tarea

- No inventar montos ni tiempos de entrega — deben venir del usuario.

## Pasos sugeridos

1. Preguntar al usuario los datos reales (monto de envío gratis en MXN, tiempo de entrega, política de devoluciones).
2. `grep -rn "€\|península" app/` para encontrar todas las menciones a reemplazar.
3. Actualizar todos los textos encontrados.

## Criterios de aceptación

- [x] Ninguna mención de "€" ni "península" en el sitio.
- [x] No hay ninguna promesa de envío gratis ni umbral de envío gratis (el usuario confirmó que no existe: el envío siempre se cobra según la cotización real de Skydropx) — sustituye al criterio original ("el umbral coincide con el valor en pesos"), que ya no aplicaba tras la respuesta del usuario.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — el punto de Skydropx (tarea 017, sección Pagos) ya establecía que el envío se cotiza en tiempo real sin umbral gratis; este cambio lo hace consistente en todo el copy visible.
- Regresiones encontradas: ninguna. `FREE_SHIPPING_THRESHOLD` no se usaba fuera de `CartDrawer.tsx`, así que se eliminó sin afectar otros componentes.
- Requisitos nuevos agregados a `REQUISITOS.md`: sí — "no promocionar envío gratis ni devoluciones gratis en ningún copy" (sección Pagos, origen: tarea 008).

## Pruebas manuales

- Verificado en el navegador (`/`, `/producto/daily-top`): AnnouncementBar, TrustStrip y EditorialSplit ya mostraban el copy correcto (corregido en un commit previo, 2026-07-24, `7fba5d7`). El accordion "Envíos y devoluciones" del detalle de producto ya no menciona "24-48 h en península". El carrito (`CartDrawer`) ya no muestra el medidor de progreso "te faltan $X para envío gratis". Sin errores en consola.

## Notas de progreso

- 2026-07-13: Detectado al hacer el cambio de precios a MXN (ver conversación) — usuario pidió dejarlo pendiente por ahora y que se le recuerde antes de dar la página por terminada.
- 2026-07-29: Retomada. El usuario confirmó los 3 datos pendientes: (1) no hay envío gratis — el envío siempre se cobra según la cotización real de Skydropx (ya integrado en la tarea 017); (2) el tiempo de entrega es el que calcule Skydropx, no un número fijo en el copy; (3) no hay devoluciones gratuitas — de hecho no se aceptan devoluciones. Se encontró que `AnnouncementBar.tsx`, `TrustStrip` y `EditorialSplit` ya se habían corregido en un commit anterior (`7fba5d7`, 2026-07-24) fuera de esta tarea, dejándola con la tabla de README desactualizada (seguía en `pending`). Quedaban 2 puntos sueltos: `app/routes/producto.$slug.tsx` (el accordion "Envíos y devoluciones" seguía con "Entrega en 24-48 h en península", aunque el texto corto arriba del botón ya estaba correcto) y `app/components/CartDrawer.tsx` (medidor de progreso "te faltan $X para el envío gratis" con la barra visual, construido sobre `FREE_SHIPPING_THRESHOLD = 60` en `CartContext.tsx`, un remanente del copy en euros). Se corrigió el texto del accordion y se eliminó por completo el medidor de envío gratis del carrito (JSX + la constante `FREE_SHIPPING_THRESHOLD`, que no se usaba en ningún otro lugar). Verificado con `npm run typecheck` y en el navegador (home, detalle de producto, carrito abierto) sin errores de consola. Tarea cerrada.
