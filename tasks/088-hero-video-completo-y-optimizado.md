---
id: 088
title: "Hero: mostrar el video completo (sin recortar ropa) y optimizarlo para carga rápida"
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

Tras corregir el recorte de caras del video del hero (tarea 087, `object-[center_30%]`), el usuario pidió también poder ver la ropa completa, no solo las caras. Con `object-cover` esto no tiene solución perfecta: el video es vertical (1080×1920) dentro de una franja horizontal ancha, así que cualquier punto de recorte fijo sacrifica algo (cara o ropa) — la única forma de mostrar el cuadro completo es no recortar. Además, el usuario pidió mejorar la calidad del video y que cargara más rápido, porque tardaba en aparecer.

## Objetivo

El hero muestra el video completo (caras y ropa, de pies a cabeza, sin recortar nada), y el archivo de video está optimizado para bajar y empezar a reproducirse lo antes posible.

## Archivos involucrados

- `app/components/Hero.tsx`:
  - `object-cover` → `object-contain`: ya no se recorta nada del video; el contenedor (`bg-espresso`, mismo tono ya usado en el degradado de encima) rellena el espacio sobrante a los costados, ya que el video es más angosto que la franja horizontal del hero.
  - Se agregó `poster={HERO_COLLAGE.main.poster}` — muestra un cuadro real del video de inmediato, en vez de una caja vacía/negra mientras el archivo todavía está bajando.
  - Se agregó `fetchpriority="high"` en el `<video>` (con un `@ts-expect-error` puntual porque el tipo de React para `<video>` todavía no declara este atributo, aunque es válido en HTML y lo soportan los navegadores basados en Chromium) — le pide al navegador que priorice la descarga de este archivo sobre otros recursos de la página.
- `app/data/images.ts`: `HERO_COLLAGE.main` ahora incluye `poster` (imagen fija subida a Supabase Storage).
- Video re-codificado con `ffmpeg` (vía el binario que trae la librería de Python `imageio-ffmpeg`, no había `ffmpeg` instalado en el sistema) y vuelto a subir a la misma ruta de Storage (`product-images/site/hero-video.mp4`, mismo nombre — se sobrescribió):
  - `-c:v libx264 -preset slow -crf 20`: misma resolución (1080×1920), mejor eficiencia de compresión que la codificación original (el archivo pesa un poco menos: 2.75 MB → 2.58 MB).
  - `-an`: se quitó la pista de audio — el video siempre se reproduce `muted`, así que no tiene sentido bajar datos de audio que nunca se van a escuchar.
  - `-movflags +faststart`: mueve el índice del archivo (`moov atom`) al principio — permite que el navegador empiece a reproducir antes de haber bajado el archivo completo, en vez de tener que esperar todo el archivo primero.
  - Nueva imagen `product-images/site/hero-poster.jpg` (153 KB): un cuadro real extraído del propio video (segundo 1), usado como `poster`.

## Restricciones específicas de esta tarea

- No se subió resolución ni se "inventó" detalle que no estaba en el video original — la calidad no puede superar a la fuente; lo que se hizo fue una recodificación más eficiente (mejor relación calidad/peso) y se quitó lo que no hacía falta (audio), no una mejora mágica de nitidez.
- `object-contain` dentro de un contenedor con `overflow-hidden` y bordes redondeados ya existentes — no se tocó el tamaño ni la forma del bloque del hero, solo cómo se acomoda el video adentro.
- El color del relleno lateral (`bg-espresso`) ya era parte de la paleta aprobada (se usa en el degradado que va encima del video) — no se introdujo un color nuevo.

## Criterios de aceptación

- [x] El video se ve completo (cabeza a pies, ropa incluida) en escritorio y en mobile, sin recortar nada.
- [x] Aparece una imagen de portada de inmediato al cargar la página, no una caja vacía.
- [x] El archivo de video pesa menos que el original y no incluye una pista de audio inútil.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — coincide con el objetivo de rendimiento del sitio (imágenes/video optimizados, sin bloquear el render); no se tocó paleta ni layout aprobado.
- Regresiones encontradas: ninguna — se confirmó en el navegador (escritorio y mobile) que el texto, botones y degradados encima del video se siguen viendo igual.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Video re-codificado y confirmado con `ffmpeg -i` que quedó en H.264, 1080×1920, sin pista de audio, con el flag de faststart aplicado.
- Video y portada subidos a Supabase Storage, confirmados accesibles públicamente vía `curl -I` (video: 2,704,553 bytes, `content-type: video/mp4`; portada: 156,543 bytes, `content-type: image/jpeg`, ambos HTTP 200 con `accept-ranges: bytes`).
- En el navegador: confirmado en escritorio y mobile que el video se ve completo (sin recorte), con las barras de relleno del color de marca a los lados, y sin errores de consola.

## Notas de progreso

- 2026-09-09: Implementado en la misma sesión, inmediatamente después de la tarea 087, a partir de dos pedidos seguidos del usuario ("que también se vea la ropa" + "mejora la calidad y que cargue rápido"). No había `ffmpeg` instalado en el sistema — se usó el binario que trae la librería de Python `imageio-ffmpeg`, ya presente en el entorno.
