---
id: 140
title: "Títulos descriptivos en el feed de Merchant Center"
status: in-progress
---

## Contexto

Los productos ya están aprobados en Merchant Center pero no salen en la pestaña Shopping. Los títulos del feed eran `{nombre} - {color} - {talla}` (ej. `AURA LEGGIN - Negro - S`): nombres de marca que no dicen qué es la prenda ni para quién, así que Google los relaciona poco con búsquedas como "legging deportivo mujer".

## Objetivo

Títulos con el formato que recomienda Google: marca + nombre + tipo de prenda + para quién + color + talla. Ej.: `Kinara Fit AURA LEGGIN - Legging deportivo para mujer - Lila - Talla S` (la marca va como "Kinara Fit" para coincidir con búsquedas de "kinara" y de "kinara fit"; el atributo `brand` sigue siendo KINARA).

## Archivos involucrados

- `app/routes/feed.xml.tsx` (`garmentNoun`, `feedTitle`)

## Restricciones específicas de esta tarea

- Solo cambia el `<g:title>` del feed; no se ve en el sitio ni cambia los nombres reales de los productos.
- El tipo de prenda se deduce del `kind` del catálogo y del nombre (un "Bottom" puede ser legging, pants, short o falda). Un producto nuevo con un tipo no reconocido cae en "Ropa deportiva".

## Criterios de aceptación

- [x] Los 579 títulos son únicos y miden menos de 150 caracteres (máx. 84).
- [x] Cada título incluye marca, nombre, tipo de prenda, "para mujer", color y talla.
- [x] Typecheck sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (el feed sigue solo con ropa; sin cambios visuales)
- Regresiones encontradas: ninguna
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno

## Pruebas manuales

- Ver `/feed.xml` en local y en producción, y comparar la lectura de Merchant Center a las 24–72 h.

## Notas de progreso

- 2026-10-16: implementado y verificado en local (43 productos, 579 variantes). Falta subir (aprobación pendiente) y esperar la siguiente lectura de Merchant Center (o "Obtener ahora").
- 2026-10-16 (2): marca del título cambiada de "KINARA" a "Kinara Fit" a pedido de la usuaria; verificado en local (579 únicos).
- 2026-10-16 (3): los leggings pasan de "Legging deportivo" a "Leggins deportivos" (ortografía más buscada en México) a pedido de la usuaria, porque la búsqueda genérica "leggins" no los mostraba. Verificado en local. Falta subir (aprobación pendiente).
