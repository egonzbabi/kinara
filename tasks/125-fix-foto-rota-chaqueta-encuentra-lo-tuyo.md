---
id: 125
title: "Fix: foto rota de Chaqueta en 'Encuentra lo tuyo'"
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

El usuario reportó que la foto de la tarjeta "Chaqueta" en la sección "Encuentra lo tuyo" del home no se veía, y pidió revisar que todas las secciones tuvieran foto.

## Objetivo

Todas las fotos fijas del sitio (las que no vienen del catálogo dinámico de Supabase, sino hardcodeadas en `app/data/*.ts`/componentes) cargan correctamente.

## Archivos involucrados

- `app/data/categories.ts`

## Restricciones específicas de esta tarea

- Solo se corrige lo que está roto y visible en el sitio — no se toca el Lookbook (ver Notas de progreso), que ya está desactivado por decisión de una tarea anterior (101) y reactivarlo es una decisión aparte.

## Pasos sugeridos

1. Probar con `curl` el código HTTP de cada URL de foto hardcodeada en `app/data/categories.ts`, `app/data/looks.ts`, `app/data/images.ts`, `app/components/EditorialSplit.tsx`.
2. Para cualquier URL rota de una sección visible, buscar en `product_images` de Supabase una foto real y vigente del mismo producto/tipo para reemplazarla.
3. Verificar en el navegador que la imagen ya carga (`naturalWidth > 0`).

## Criterios de aceptación

- [x] La tarjeta "Chaqueta" de "Encuentra lo tuyo" muestra una foto real (JACKET FIT, Negro) — antes apuntaba a `product-images/x17aegeg.png`, un path que no corresponde a ningún archivo real (devolvía 400) y probablemente quedó de un reemplazo de fotos anterior (tarea 120).
- [x] Las otras 5 tarjetas de "Encuentra lo tuyo" (Top, Bottom, Legging, Enterizo, Set) se revisaron y cargan bien (200).
- [x] Foto/poster del video del hero y foto de "Nuestra filosofía" (EditorialSplit) revisadas — cargan bien.
- [x] `npm run typecheck` sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no se agrega ningún requisito nuevo (fix puntual de contenido, no un patrón de código).
- Regresiones encontradas: ninguna — solo se tocó la URL de una imagen.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno.

## Pruebas manuales

- Verificado con `curl -o /dev/null -w "%{http_code}"` que la nueva URL responde 200 (antes 400).
- Verificado en el navegador (`naturalWidth` de la imagen > 0, ya no es un `<img>` roto) en `http://localhost:5173`.

## Notas de progreso

- 2026-09-21: Encontradas y revisadas todas las fotos fijas del sitio. Solo la de "Chaqueta" estaba rota y visible — corregida. Se encontraron también 2 fotos rotas en `app/data/looks.ts` (Lookbook: `wk8gx3lz/rosa.jpg` y `dfp1c34z/rey.jpg`), pero esa sección ya está desactivada desde la tarea 101 y no se muestra en el sitio — se avisó al usuario, no se tocó (reactivarla implica buscar fotos nuevas, decisión aparte).
