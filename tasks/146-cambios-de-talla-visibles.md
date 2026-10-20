---
id: 146
title: "Hacer visible el cambio de talla en la página de producto"
status: done
---

## Contexto

La política (`/politica-de-cambios-y-devoluciones`, puntos 3 y 6) sí permite cambio de talla (mismo modelo y color, según inventario, aviso dentro de 5 días naturales de la entrega) y el envío de ida y vuelta lo paga la clienta. Pero la página de producto solo enlazaba la política, y su acordeón decía "Cambios solo por defecto de fábrica", que contradice la política. Antes de pagar anuncios conviene que la clienta vea que puede cambiar la talla.

## Objetivo

1. Línea visible bajo el selector/botón de compra: "Cambios de talla dentro de 5 días de recibir tu pedido (el envío del cambio va por tu cuenta)".
2. Corregir el acordeón: "Cambios por talla o por defecto de fábrica".

## Archivos involucrados

- `app/routes/producto.$slug.tsx`

## Restricciones específicas de esta tarea

- Autorizado por la usuaria (2026-10-20): solo texto, mismo estilo que las otras líneas de la lista; sin cambios de diseño.
- Debe coincidir con la política: 5 días naturales, mismo modelo y color, envío a cargo de la clienta en cambios de talla.

## Criterios de aceptación

- [x] La línea aparece en la lista bajo el botón de compra, a 375 px sin romper el diseño.
- [x] El acordeón de envíos ya no dice "solo por defecto de fábrica".
- [x] Typecheck sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (solo texto; coincide con la política y con `RETURN_POLICY_SCHEMA`)
- Regresiones encontradas: ninguna
- Requisitos nuevos agregados a `REQUISITOS.md`: sí (el texto de cambios de la página de producto debe coincidir con la política)

## Notas de progreso

- 2026-10-20: implementada y verificada en local a 375 px. Falta subir a producción (requiere aprobación de la usuaria).
