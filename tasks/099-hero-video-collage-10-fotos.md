---
id: 099
title: "Hero: video actualizado a un collage de 10 fotos con Ken Burns y transiciones cruzadas"
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

El usuario pidió reemplazar el contenido del video del hero (el archivo real en Storage, no el componente) por una selección de 10 fotos nuevas del shooting, armadas como un video con movimiento real (no una sucesión estática de fotos) y con transiciones suaves entre cada una.

## Objetivo

El archivo `product-images/site/hero-video.mp4` (y su `hero-poster.jpg`) muestran un collage de 10 fotos del shooting, cada una con un zoom lento (efecto Ken Burns) y unidas entre sí con transición cruzada (crossfade), sin recortar ninguna foto de la selección ni acortar la duración total.

## Archivos involucrados

- Ningún archivo de código — el cambio es 100% de contenido (el archivo de video/poster en Supabase Storage). El componente `app/components/Hero.tsx` sigue apuntando a las mismas rutas (`HERO_COLLAGE.main.url`/`.poster` en `app/data/images.ts`), sin cambios.

## Restricciones específicas de esta tarea

- El usuario pidió explícitamente que se note movimiento real en cada foto ("que se vea movimiento"), no solo un cambio estático de imagen — se descartó una primera versión por parecer "una colección de fotos" sin zoom real.
- Transiciones entre fotos suavizadas a pedido del usuario ("que las transiciones... no se vean tan marcadas") — se pasó de corte directo a crossfade.
- No acortar el video ni quitar ninguna de las 10 fotos (restricción reafirmada en la tarea 100, que sí tocaba el mismo archivo por razones de performance).

## Pasos sugeridos

1. Selección y orden final de las 10 fotos (a partir de las fotos que el usuario fue subiendo/afinando en el chat).
2. Recorte a cuadrado de las fotos verticales (mismo criterio que el video ya usaba).
3. Zoom lento por foto vía `ffmpeg zoompan`, con una fórmula determinística basada en el índice de frame de salida (`z='1+0.12*on/65'`) — la forma ingenua (`z='min(zoom+0.0012,1.08)':d=1` con `-loop 1`) no acumula el zoom entre frames y produce un video sin movimiento real (bug encontrado y corregido en esta tarea).
4. Unión de los 10 clips con `xfade` (transición cruzada, 0.5s por transición, clips de 2.2s → 17.5s totales), calculando el offset de cada transición como la duración acumulada del encadenado menos la duración del fade.
5. Render final con `-pix_fmt yuv420p` explícito (sin este flag, `xfade` puede producir `yuvj444p`/4:4:4, no soportado de forma confiable por `<video>` HTML5 — bug encontrado y corregido en esta tarea).
6. Extracción de un frame como `hero-poster.jpg`.
7. Subida a Supabase Storage (`product-images/site/hero-video.mp4` y `.../hero-poster.jpg`, `upsert: true`).

## Criterios de aceptación

- [x] El video muestra las 10 fotos seleccionadas por el usuario, cada una con zoom lento visible (confirmado comparando frames al inicio/fin de cada clip — tamaños de archivo por clip y detalle visual distintos, no solo aparentemente estáticos).
- [x] Las transiciones entre fotos son crossfade, no corte directo.
- [x] Duración total 17.5s, sin recortar ninguna foto de la selección.
- [x] El archivo final es H.264 `yuv420p` estándar (no `yuvj444p`), reproducible en `<video>` sin problemas de compatibilidad.
- [x] Subido a Storage y verificado visualmente en el sitio (dev y ambiente en vivo).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no se tocó ningún componente ni estándar de código, solo contenido de un archivo ya existente en Storage con la misma ruta pública.
- Regresiones encontradas: ninguna relacionada con código. Dos bugs de proceso encontrados y corregidos antes de subir el archivo final (zoom no acumulado, pixel format no estándar) — ver "Pasos sugeridos".
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (operación de contenido puntual).

## Pruebas manuales

- Comparación visual de frames extraídos al inicio y fin de cada clip (confirma zoom real, no solo cambio de foto).
- Inspección del stream de salida (`ffprobe`) para confirmar `yuv420p` antes de subir.
- Verificado en el sitio (dev) que el video se reproduce con autoplay/loop y sin errores de consola.

## Notas de progreso

- 2026-09-13 (aprox., misma sesión que la tarea 100): completada. El usuario iteró varias veces sobre el resultado ("no parece video sino una colección de fotos", "que se vea movimiento", "las transiciones... no se vean tan marcadas") antes de aprobar la versión final. Ese mismo archivo fue luego optimizado en tamaño (sin tocar su contenido/duración) en la tarea 100 tras la auditoría de performance.
