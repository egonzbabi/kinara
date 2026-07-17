---
id: 008
title: "Actualizar copy de envíos/devoluciones a pesos mexicanos"
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

- [ ] Ninguna mención de "€" ni "península" en el sitio.
- [ ] El umbral de envío gratis coincide con el valor real en pesos que dio el usuario.
- [ ] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí.
- Regresiones encontradas: -
- Requisitos nuevos agregados a `REQUISITOS.md`: -

## Pruebas manuales

- Revisar la barra de anuncios y la página de producto en el navegador, confirmar que todo el copy de envíos está en pesos y es coherente.

## Notas de progreso

- 2026-07-13: Detectado al hacer el cambio de precios a MXN (ver conversación) — usuario pidió dejarlo pendiente por ahora y que se le recuerde antes de dar la página por terminada.
