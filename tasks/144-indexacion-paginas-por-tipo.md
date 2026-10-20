---
id: 144
title: "Ayudar a que Google indexe las páginas por tipo (enlaces internos + datos propios)"
status: in-progress
---

## Contexto

Search Console (2026-10-20) mostró 3 de las 6 páginas por tipo (`/tienda/enterizos-deportivos`, `/tienda/pants-deportivos`, `/tienda/tops-deportivos`) en "Crawled – currently not indexed" (rastreadas el 13 oct, no indexadas): contenido casi igual a /tienda, poco texto propio y un solo enlace interno (el del footer). Las 6 vistas filtradas de /tienda (`?tipo=`, `?cat=`) figuran como "Alternative page with proper canonical tag": es lo diseñado, no hay que corregirlo ni validar.

## Objetivo

1. Las tarjetas "Encuentra lo tuyo" del inicio (Top, Chaqueta, Enterizo, Set) enlazan a su página por tipo; Bottom y Vestido siguen al filtro de /tienda.
2. Cada página por tipo muestra un bloque "Sobre esta colección" con datos reales calculados del catálogo (modelos, rango de precios, tallas con stock, colores).

## Archivos involucrados

- `app/lib/shop-landings.ts` (`TILE_LANDING_SLUG`, `landingFacts`)
- `app/routes/tienda.$tipo.tsx`
- `app/components/CategoryTiles.tsx`
- `app/routes/_index.tsx`

## Restricciones específicas de esta tarea

- Las tarjetas se ven igual; solo cambia su destino, y solo si la página existe y tiene productos.
- El texto del bloque sale del catálogo (nada inventado); los colores se deduplican sin mayúsculas ni acentos.

## Criterios de aceptación

- [x] 4 tarjetas del inicio enlazan a `/tienda/<slug>`; Bottom y Vestido a `/tienda?tipo=`.
- [x] Las 6 páginas muestran el bloque con datos reales y sin colores repetidos.
- [x] Typecheck sin errores; un solo h1; sin overflow real.
- [ ] En 1–3 semanas: las 3 páginas pasan a "Indexed" en Search Console.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (canonical propio por página; las vistas filtradas siguen con canonical a /tienda)
- Regresiones encontradas: ninguna
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno

## Pruebas manuales

- Local: las 6 páginas y el inicio. Producción: Search Console → Inspeccionar URL → Solicitar indexación de las 3 páginas.

## Notas de progreso

- 2026-10-20: implementado y verificado en local. Falta subir (aprobación pendiente), solicitar indexación de las 3 páginas y esperar.
