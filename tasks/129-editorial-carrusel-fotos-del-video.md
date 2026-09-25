---
id: 129
title: "Nuestra filosofía: carrusel de fotos extraídas del video del hero"
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

La sección "Nuestra filosofía" (`EditorialSplit.tsx`) mostraba una sola foto fija del shooting (tarea 103). El usuario pidió usar en su lugar fotos sacadas del video del hero (mujeres en distintas actividades: tenis, liga elástica, yoga, box, meditación, retrato) como fotos fijas, no como video, y que vayan cambiando solas.

## Objetivo

La sección "Nuestra filosofía" muestra un carrusel de 6 fotos (fotogramas del video original, recortados a retrato) que van cambiando solas con un crossfade, respetando `prefers-reduced-motion`.

## Archivos involucrados

- `app/components/EditorialSplit.tsx` (carrusel nuevo, `EditorialCarousel`)
- Supabase Storage, bucket `product-images/site/` (6 fotos nuevas)

## Restricciones específicas de esta tarea

- Mismo criterio de nombres con timestamp al subir a Storage (nunca sobrescribir), ya documentado en `REQUISITOS.md` (tarea 120) y aplicado también a assets del hero (tarea 128).
- `prefers-reduced-motion`: si el usuario lo tiene activado, el carrusel no avanza solo (se queda en la primera foto) — mismo patrón que el autoplay del video del hero.
- No se toca el diseño/paleta/tipografía de la sección, solo la foto se vuelve carrusel.

## Pasos sugeridos

1. Extraer fotogramas candidatos del video original (1920x1080, fuente sin comprimir) en varios timestamps con `ffmpeg`.
2. Elegir 6 fotogramas diversos (distintas mujeres/actividades/edades), evitar los que tengan texto de marca visible en la escena.
3. Recortar cada uno a proporción retrato (990x1080, mismo ratio 1100:1200 que usaba la foto anterior), centrando el recorte en el sujeto.
4. Subir las 6 fotos a Supabase Storage con nombre nuevo (timestamp) y `cacheControl: "31536000"`.
5. Construir `EditorialCarousel`: fotos apiladas en `position: absolute`, crossfade por opacidad, `setInterval` para avanzar, contenedor con `aspect-ratio` explícito (evita CLS ya que las imágenes absolutas no reservan alto por sí solas).
6. `npm run typecheck` + verificar en el navegador (desktop y mobile) que cambia solo y no hay errores.

## Criterios de aceptación

- [x] La sección muestra 6 fotos (fotogramas del video), no la foto única de antes.
- [x] Las fotos cambian solas (crossfade, ~4.5s de intervalo) sin interacción del usuario.
- [x] Recorte a retrato correcto, sujeto centrado, sin caras cortadas ni texto de marca visible en la escena.
- [x] `prefers-reduced-motion` respetado (no autoplay del carrusel).
- [x] `alt` descriptivo por foto.
- [x] Fotos subidas con nombre nuevo (timestamp), `cache-control` de 1 año.
- [x] `npm run typecheck` sin errores; verificado en navegador (desktop y mobile), sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — se sigue el requisito de nombres nuevos al reemplazar/agregar archivos de Storage, `cache-control` largo, `alt` descriptivo, y `prefers-reduced-motion`.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno nuevo (aplica los mismos ya existentes a un componente nuevo).

## Pruebas manuales

- Verificado en el navegador: las 6 imágenes cargan (`naturalWidth` correcto, sin error), la opacidad va cambiando de una a otra sola con el tiempo (confirmado con dos capturas separadas por 5s mostrando fotos distintas). Revisado en mobile (375px): el recorte se ve bien, sin distorsión, layout sin romperse.

## Notas de progreso

- 2026-09-24: Implementado y verificado en una sola sesión, a partir del mismo video fuente usado para el hero (tarea 128/130).
