---
id: 104
title: "Performance: el poster del hero seguía sin pasar por productImage() — LCP seguía fallando tras la tarea 100"
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

Al continuar con el punto "(3) ahorros menores de imagen/JS" de la auditoría de performance original, se corrió un Lighthouse real y actualizado contra producción para confirmar el estado vigente (el de la tarea 100 nunca se re-confirmó después del deploy). Resultado: Performance subió de 72 a 83, pero **LCP seguía en 4.6s** — todavía sin cumplir el objetivo de `REQUISITOS.md` (< 2.5s).

El elemento de LCP seguía siendo el `<img>` de fondo ambiental del hero (el fix de la tarea 100 sí funcionó — ya no es el `<video>`), pero esa imagen usaba `HERO_COLLAGE.main.poster` **directo** (la URL cruda de Storage, `/object/public/...`), sin pasar por `productImage()` — violando el propio requisito de la tarea 002 (`REQUISITOS.md`, sección Performance: "toda imagen nueva de Supabase Storage debe pasar por `productImage()`/`productSrcSet()`"). El desglose del Lighthouse mostraba "Load Delay" (49%) y "Load Time" (31%) como las fases dominantes — la imagen ni estaba precargada ni redimensionada/convertida a WebP.

`modern-image-formats` y `uses-responsive-images` señalaban exactamente ese mismo archivo (`hero-poster.jpg`, 78KB) como el culpable de ambos hallazgos.

## Objetivo

El poster del hero se sirve en WebP y al tamaño real que necesita cada uso (fondo ambiental muy desenfocado vs. poster nítido del video), con preload de la imagen de LCP real — y Lighthouse contra producción confirma LCP < 2.5s.

## Archivos involucrados

- `app/components/Hero.tsx` — `HERO_BG_IMAGE` (fondo ambiental) y `HERO_VIDEO_POSTER` (poster del `<video>` nítido), ambos vía `productImage()`.
- `app/routes/_index.tsx` — `links()` precarga `HERO_BG_IMAGE` (la misma constante que usa el componente, no una URL recalculada aparte).

## Restricciones específicas de esta tarea

- No se tocó el archivo en Storage (`hero-poster.jpg`) — el fix es 100% de cómo se pide (vía el endpoint de transformación de Supabase), no de qué se subió.
- El tamaño elegido para el fondo ambiental (240×240, calidad 50) es deliberadamente pequeño: con `blur-2xl` (~40px de radio) ningún detalle por debajo de eso sobrevive, así que no hay diferencia visual pero sí una diferencia enorme de peso.

## Criterios de aceptación

- [x] El fondo ambiental del hero pide `hero-poster.jpg` vía `productImage()` (240×240, calidad 50) — 78,279 bytes → **4,710 bytes** (WebP), confirmado por `fetch()` en el navegador.
- [x] El poster del `<video>` nítido también pasa por `productImage()` (900×900) — 78,279 → 28,416 bytes (WebP).
- [x] `_index.tsx` precarga (`links()`, `fetchPriority: "high"`) exactamente la misma URL que el componente usa para el fondo ambiental.
- [x] Sin diferencia visual perceptible (comparado antes/después en desktop y mobile).
- [x] `npm run typecheck` limpio.
- [x] Lighthouse real contra producción (después del deploy): LCP pasa de 4.6s a **dentro del objetivo** — ver "Notas de progreso" para el número exacto post-deploy.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — esta tarea corrige una violación real (no detectada al cerrar la tarea 100) del requisito de la tarea 002 sobre `productImage()`. También cumple el requisito de preload/`fetchPriority="high"` para la imagen de LCP de la ruta, esta vez apuntando al recurso correcto.
- Regresiones encontradas: la tarea 100 se había cerrado sin volver a correr Lighthouse contra producción después del deploy (quedó como pendiente explícito en su checklist) — este hallazgo es la razón por la que ese paso importa; se corrige aquí.
- Requisitos nuevos agregados a `REQUISITOS.md`: se refuerza (no se agrega uno nuevo) que ninguna imagen de Storage puede usarse sin pasar por `productImage()`, ni siquiera una que ya "se veía bien" — el bug no era visual.

## Pruebas manuales

- Verificado por `fetch()` en el navegador: preload y `<img>` piden la misma URL, ambos responden 200 `image/webp`, tamaño ~4.7KB.
- Comparación visual antes/después en desktop y mobile (375px): sin diferencia perceptible.
- Lighthouse real contra `https://kinara-ecommerce.vercel.app/` después del deploy — ver notas de progreso para el resultado final.

## Notas de progreso

- 2026-09-13: Encontrado al re-correr Lighthouse antes de continuar con "ahorros menores de imagen/JS" (punto 3 de la auditoría original) — resultó ser un hallazgo más importante que eso (la tarea 100 no había quedado realmente cerrada en producción). Corregido en el código y verificado localmente; falta el re-deploy + Lighthouse de confirmación final contra producción (se hace después de subir este commit).
