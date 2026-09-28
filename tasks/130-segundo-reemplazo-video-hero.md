---
id: 130
title: "Home: segundo reemplazo del video del hero + fix de imagen OG desactualizada"
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

El usuario mandó un video nuevo para el hero (mismo comercial que el de la tarea 128, un corte ligeramente distinto — 84.29s vs 82.69s, mismas escenas). Pidió aplicar el mismo tratamiento de optimización que ya se le había hecho al anterior (compresión, variante mobile, poster).

## Objetivo

El hero muestra el video nuevo, con el mismo pipeline de optimización de las tareas 128/130 (bitrate bajo, variante mobile más liviana, poster real, `preload="metadata"`), sin tocar el componente `Hero.tsx` (ya soporta esta estructura).

## Archivos involucrados

- `app/data/images.ts` (URLs del video/poster)
- `app/lib/seo.ts` (fix del bug encontrado, ver abajo)
- Supabase Storage, bucket `product-images/site/` (archivos nuevos + limpieza de huérfanos)

## Restricciones específicas de esta tarea

- Mismo criterio de siempre: nombre nuevo (timestamp) al subir, nunca sobrescribir; `cacheControl: "31536000"`.
- `Hero.tsx` no necesitó ningún cambio de código — ya tenía `preload="metadata"` y la estructura de `<source>` responsive de la tarea 130 anterior; esta vez solo cambian los datos en `images.ts`.

## Bug encontrado y corregido de paso

`app/lib/seo.ts` tenía `DEFAULT_OG_IMAGE` (imagen de Open Graph/Twitter de todo el sitio) apuntando a un archivo fijo `hero-poster.jpg` (sin timestamp) que nunca se actualizó en las rondas anteriores de reemplazo del video (tareas 128/130/131 de la sesión pasada) — la imagen que se compartía al mandar un link del sitio llevaba varias rondas desactualizada. Se corrigió importando `HERO_COLLAGE.main.poster` desde `~/data/images` en vez de tener una URL duplicada a mano, así que ya no puede volver a desincronizarse la próxima vez que cambie el video del hero.

## Pasos sugeridos

1. Inspeccionar el video nuevo con `ffmpeg`, elegir un fotograma bueno para poster (misma escena de tenis que ya funcionaba bien).
2. Recomprimir: desktop 1280x720 ~900kbps, mobile 854x480 ~500kbps, sin audio, `+faststart`.
3. Subir los 3 archivos nuevos (desktop, mobile, poster) con timestamp nuevo.
4. Actualizar `HERO_COLLAGE.main` en `images.ts`.
5. `npm run typecheck` + verificar en el navegador (desktop y mobile) que cambia el video, reproduce, sin errores.
6. Buscar referencias a los nombres de archivo viejos en todo `app/` antes de borrarlos de Storage (así se encontró el bug de `seo.ts`).
7. Borrar de Storage todos los archivos huérfanos: el video/poster original pre-sesión (`hero-video.mp4`, `hero-poster.jpg`) y los de la ronda anterior (tarea 128/130 de la sesión pasada).

## Criterios de aceptación

- [x] El hero muestra el video nuevo, completo, con el mismo tratamiento de optimización (bitrate bajo, variante mobile, poster real).
- [x] `preload="metadata"`, sin cambios de código en `Hero.tsx`.
- [x] `npm run typecheck` sin errores; verificado en navegador (desktop y mobile): video correcto por viewport, reproduce, sin errores de consola.
- [x] Imagen de Open Graph corregida para no volver a desincronizarse (ahora importa del mismo lugar que `Hero.tsx`).
- [x] Todos los archivos huérfanos (video/poster viejo y pre-sesión) borrados de Storage.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — nombres con timestamp, `cache-control` largo, limpieza de huérfanos (tarea 120).
- Regresiones encontradas: sí, una — la imagen de Open Graph llevaba desactualizada desde hace varias rondas de reemplazo del hero (no se había notado porque no afecta la vista normal del sitio, solo previews de links). Corregida en esta misma tarea (ver arriba).
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno nuevo — se refuerza el ya existente de nombres con timestamp/no sobrescribir, ahora también aplicado a que la imagen de OG derive del mismo dato en vez de duplicarse.

## Pruebas manuales

- Verificado en el navegador: `video.currentSrc` correcto por viewport (desktop → `hero-video-1790637000902.mp4`, mobile → `hero-video-mobile-1790637000902.mp4`), `readyState: 4`, sin `error`, reproduce. `meta[property="og:image"]` apunta al poster nuevo tras recargar.
- Confirmado por `grep` que ningún archivo de `app/` seguía referenciando los nombres viejos antes de borrarlos de Storage.

## Notas de progreso

- 2026-09-28: Implementado y verificado en una sola sesión.
