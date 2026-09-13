---
id: 101
title: "Home: fotos reales del shooting en tiles de categoría, fix de fotos rotas del lookbook (desactivado por ahora) y limpieza de preload muerto"
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

Como parte de la revisión general del sitio pedida por el usuario tras cerrar la tarea 100 ("revisa que el resto del sitio se vea bien"), se encontraron varias fotos de `CATEGORY_TILES` (`app/data/categories.ts`) y de `LOOKS` (`app/data/looks.ts`) apuntando a archivos de Storage que ya no existen (404) — efecto colateral de la subida masiva de fotos de la tarea 098, que renombró archivos (`color.jpg` → `color-<timestamp>-N.jpg`) sin actualizar estas dos referencias sueltas fuera del catálogo de Supabase. También se encontró un `<link rel="preload">` en `_index.tsx` apuntando a una foto de Unsplash que ya no se renderiza en ningún lado desde que el hero pasó a ser un video (tarea 088).

## Objetivo

Los tiles de "Encuentra lo tuyo" muestran fotos reales del shooting (no genéricas ni rotas); la sección de lookbook queda desactivada (no eliminada) hasta que haya más fotos; no queda ningún preload de un recurso que no se usa.

## Archivos involucrados

- `app/data/categories.ts` — `CATEGORY_TILES` (Top, Bottom, Legging, Enterizo, Set).
- `app/data/looks.ts` — `LOOKS` (4 de 6 rutas corregidas; datos se dejan listos para cuando se reactive).
- `app/routes/_index.tsx` — se quita el render de `<LookbookBand />` y el preload muerto.
- `app/components/Hero.tsx` — se quita `HERO_WIDTHS`, export que solo existía para ese preload.

## Restricciones específicas de esta tarea

- No se tocó paleta, tipografía ni layout — solo referencias de imagen y una etiqueta de heading en otra tarea (102).
- El componente `LookbookBand` y sus datos NO se borraron, solo se dejó de renderizar — debe ser trivial reactivarlo cuando el usuario tenga más fotos.

## Criterios de aceptación

- [x] Tile "Top": NOVA TOP Negro (antes: foto rota, 404).
- [x] Tile "Bottom": MOVE SHORT Cocoa, recorte cerrado solo en el short (a pedido del usuario, para diferenciarse del tile de Top que usa la misma pose de cuerpo completo).
- [x] Tile "Legging": Barbie Glow Leggins Café (antes: foto rota, 404).
- [x] Tile "Enterizo": ONE MOTION JUMPSUIT Oxford (antes: foto rota, 404).
- [x] Tile "Set": SCULPT SET Rosa (antes: foto genérica de proveedor).
- [x] Tile "Chaqueta": sin cambios (no se pidió y no estaba rota).
- [x] Las 4 fotos rotas de `LOOKS` (Verde Fresco, Vino, Camuflaje Rosa, Lila) corregidas a la ruta real vigente, aunque la sección esté desactivada.
- [x] `<LookbookBand />` ya no se renderiza en la home.
- [x] Preload de `PHOTO.heroPrimary` (Unsplash) eliminado de `_index.tsx`; export muerto `HERO_WIDTHS` eliminado de `Hero.tsx`.
- [x] `npm run typecheck` limpio en cada paso.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no se rompió el estándar de imágenes reales de Supabase Storage (se reforzó, de hecho, al quitar las últimas fotos de proveedor/rotas de estos dos archivos sueltos).
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (fix de contenido + limpieza puntual).

## Pruebas manuales

- Verificado por JS en el navegador que las 6 fotos de `CATEGORY_TILES` cargan (200, dimensiones reales).
- Verificado que la home ya no contiene texto "Look 0X" ni ningún link a `LookbookBand`.
- Verificado que no queda ningún `<link rel="preload">` apuntando a `images.unsplash.com`.
- Probado en desktop y mobile (375px), sin errores de consola.

## Notas de progreso

- 2026-09-13: Completado en una sola sesión, a partir de la revisión general post-tarea-100. El usuario pidió explícitamente desactivar el lookbook en vez de arreglar sus fotos ("mejor quita la sección de lookbook por ahora luego que tenga más fotos la rehabilitaremos") y luego pidió quitar el preload muerto de una vez.
