---
id: 087
title: "El hero de home es un solo video (sin carrusel de fotos)"
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

El usuario pidió cambiar la foto principal del hero de home por un video que proporcionó (`kinara_video.mp4`, ~2.75 MB). Primer intento: se agregó el video como una diapositiva más dentro del carrusel existente (rotando junto con las 3 fotos de apoyo). El usuario aclaró que no quería eso — quería que el video **reemplace por completo** el carrusel (sin las fotos anteriores, sin rotación), y que se viera centrado para que se alcancen a ver todas las caras del video.

## Objetivo

El hero de home muestra únicamente el video, siempre visible (sin rotar a otras fotos), centrado (`object-center`) para que no se recorten las caras de arriba.

## Archivos involucrados

- Video subido a Supabase Storage: `product-images/site/hero-video.mp4` (mismo bucket/carpeta que las fotos que reemplazó).
- `app/data/images.ts`: `HERO_COLLAGE` se simplificó a solo `{ main: { url, alt } }` — se quitó `support` (las 3 fotos de apoyo) y el discriminador `type`, ya no hace falta distinguir foto/video porque ya no conviven en el mismo carrusel.
- `app/components/Hero.tsx`: reescrito para quitar todo el carrusel — sin `active`/`prevActive`/`paused`, sin el efecto de rotación cada 5s, sin los puntos indicadores, sin el clic para avanzar de foto. Ahora solo renderiza un `<video autoPlay muted loop playsInline>` a pantalla completa del contenedor, con `object-center` (antes `object-[center_62%]`, que recortaba la parte de arriba). El texto/botones encima se mantienen exactamente igual.

## Restricciones específicas de esta tarea

- `HERO_WIDTHS` se dejó exportado desde `Hero.tsx` aunque ya no se usa internamente — `_index.tsx` todavía lo importa para el `preload` de una foto distinta (`PHOTO.heroPrimary`, sin relación con el hero real); quitarlo hubiera sido un cambio fuera de alcance de esta tarea.
- El video no pasa por transformación de imágenes (eso es solo para fotos) — se sirve tal cual se subió.
- Las 3 fotos de apoyo (`hero-1.jpg`, `hero-2.jpg`, `hero-3.jpg`) se quitaron del código (`HERO_COLLAGE.support`) pero no se borraron de Supabase Storage — si ya no se van a usar en ningún lado, se pueden borrar aparte más adelante.

## Criterios de aceptación

- [x] El hero muestra solo el video, sin rotar a ninguna otra foto.
- [x] No quedan puntos indicadores ni la interacción de "clic para avanzar" (ya no aplica, solo hay un elemento).
- [x] El video se ve centrado (`object-center`), mostrando todas las caras sin recortar arriba.
- [x] El texto, botones y degradados encima del video se ven exactamente igual que antes.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — cambio pedido explícitamente por el usuario; no se tocó nada más del diseño aprobado (tipografía, paleta, texto, botones).
- Regresiones encontradas: ninguna — se confirmó en el navegador que el resto del home (Ofertas, Lo nuevo, etc.) sigue igual; no se tocó nada fuera de `Hero.tsx`/`images.ts`.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Video subido a Supabase Storage y confirmado accesible públicamente (`content-type: video/mp4`, HTTP 200).
- En el navegador: 2 capturas seguidas confirmaron que el video se reproduce (mismo cuadro de apertura sostenido, con las 6 mujeres del clip completamente visibles y centradas, sin recorte), sin carrusel ni puntos indicadores, y sin errores de consola.

## Notas de progreso

- 2026-09-09: Implementado en la misma sesión — primer intento con el video dentro del carrusel existente, corregido de inmediato tras la aclaración del usuario ("quiero que se quede el video como imagen principal, solo el video, quita las fotos anteriores" + "centra el video para que se vean todas las caras").
