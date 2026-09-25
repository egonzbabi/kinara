---
id: 129
title: "Nuestra filosofía: carrusel de fotos reales de grupo"
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

La sección "Nuestra filosofía" (`EditorialSplit.tsx`) mostraba una sola foto fija del shooting (tarea 103). El usuario pidió un carrusel con las fotos que se habían usado para armar el video ANTERIOR del hero (tarea 118, reemplazado por el de tenis en la tarea 128) — 9 fotos reales de grupo del shooting, no fotogramas de ningún video.

Primer intento (descartado): se extrajeron fotogramas del video de tenis nuevo (tarea 128). El usuario aclaró que se refería al video anterior (el de las 15 fotos de grupo, tarea 118), y pidió mejor las fotos originales en vez de fotogramas. Las fotos originales de la tarea 118 ya no estaban en `~/Descargas` (limpiadas desde entonces); el usuario volvió a compartir 8 de esas fotos, más la foto final de grupo completo que solo sobrevivía dentro del video anterior (`hero-video.mp4`, todavía sin borrar en Supabase Storage).

## Objetivo

La sección "Nuestra filosofía" muestra un carrusel de 9 fotos reales de grupo (distintas mujeres, edades y combinaciones), en orden aleatorio (no cronológico), que van cambiando solas con un crossfade, respetando `prefers-reduced-motion`.

## Archivos involucrados

- `app/components/EditorialSplit.tsx` (carrusel `EditorialCarousel`)
- Supabase Storage, bucket `product-images/site/` (9 fotos nuevas: `editorial-grupo1..9-<timestamp>.jpg`)

## Restricciones específicas de esta tarea

- Mismo criterio de nombres con timestamp al subir a Storage (nunca sobrescribir), ya documentado en `REQUISITOS.md` (tarea 120).
- `prefers-reduced-motion`: si el usuario lo tiene activado, el carrusel no avanza solo (se queda en la primera foto) — mismo patrón que el autoplay del video del hero.
- No se toca el diseño/paleta/tipografía de la sección, solo la foto se vuelve carrusel.
- Orden de las fotos deliberadamente mezclado (a pedido explícito del usuario: "no las pongas en orden ponlas random"), no cronológico ni agrupado por tamaño de grupo.

## Pasos sugeridos

1. Ubicar las 8 fotos más recientes en `~/Descargas` (las que el usuario acababa de compartir) — 4912×7360, mismo formato que las de la tarea 118.
2. Para la novena (el grupo completo de ~10 personas, cierre del video anterior): descargar `hero-video.mp4` de Supabase Storage (todavía sin borrar) y extraer el último fotograma del "reveal" final (zoom completamente afuera, foto sin recortar salvo las franjas de letterbox ya existentes en el video).
3. Recortar las 8 fotos nuevas a proporción retrato (mismo ratio 1100:1200 que ya usaba la sección), centrando el recorte en el grupo — el encuadre original ya deja margen arriba/abajo, no corta cabezas ni pies.
4. Para la novena foto: recortar solo el contenido (sin las franjas del video), reescalar a ancho completo y volver a agregar franjas del color de marca (`#2b2118`, espresso) arriba/abajo para que quepa en el mismo lienzo 1100×1200 sin cortar a nadie de los lados.
5. Subir las 9 fotos a Supabase Storage con nombre nuevo (timestamp) y `cacheControl: "31536000"`; borrar las 6 fotos huérfanas del primer intento (fotogramas del video de tenis).
6. Actualizar `EDITORIAL_PHOTOS` en `EditorialSplit.tsx` con las 9 fotos, en orden mezclado.
7. `npm run typecheck` + verificar en el navegador (desktop y mobile) que cambia solo y no hay errores.

## Criterios de aceptación

- [x] La sección muestra 9 fotos reales de grupo (no fotogramas de video, no la foto única de antes).
- [x] Las fotos cambian solas (crossfade, ~4.5s de intervalo) sin interacción del usuario.
- [x] Orden mezclado, no cronológico.
- [x] Recorte a retrato correcto, grupo centrado, sin cabezas/pies cortados.
- [x] La foto de grupo completo (ex-video) muestra a las 10 mujeres sin cortar a nadie — el recorte a sangre (como las otras 8) cortaba gente de las orillas; como es horizontal (viene del video) y el espacio es vertical, no cabe completa sin dejar algo de margen, así que usa `object-contain` en vez de `object-cover` y el contenedor tiene fondo blanco (a sugerencia del usuario) para que el margen se funda con el fondo blanco del estudio de la propia foto, en vez de notarse como una franja de color distinto.
- [x] `prefers-reduced-motion` respetado (no autoplay del carrusel).
- [x] `alt` descriptivo por foto.
- [x] Fotos subidas con nombre nuevo (timestamp), `cache-control` de 1 año; fotos huérfanas del primer intento borradas de Storage.
- [x] `npm run typecheck` sin errores; verificado en navegador (desktop y mobile), sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — se sigue el requisito de nombres nuevos al reemplazar/agregar archivos de Storage, `cache-control` largo, `alt` descriptivo, y `prefers-reduced-motion`.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno nuevo (aplica los mismos ya existentes a un componente nuevo).

## Pruebas manuales

- Verificado en el navegador: las 9 imágenes cargan con el `alt` correcto, la opacidad va cambiando de una a otra sola con el tiempo. Revisado en mobile (375px): el recorte se ve bien, sin distorsión, layout sin romperse.
- Verificado que la foto de grupo completo (compuesta con franjas de marca) se ve simétrica: se confirmó pixel a pixel bajando la imagen final y en una página de prueba aislada con el mismo CSS del carrusel — un renderizado raro visto una vez en el navegador de pruebas fue un artefacto de la herramienta de captura, no del asset ni del CSS real.

## Notas de progreso

- 2026-09-24: Primer intento con fotogramas del video de tenis (tarea 128), descartado por el usuario ("no pero hablo del video anterior"). Segundo intento con fotogramas del video anterior (`hero-video.mp4`, el de las 15 fotos), también descartado a favor de las fotos originales cuando el usuario preguntó "tienes las fotos originales?". Implementación con 8 fotos recién compartidas por el usuario + 1 extraída del video anterior, en orden aleatorio.
- 2026-09-24 (ajuste 1): el usuario reportó que la foto de grupo completo se veía "fea" con las franjas de marca arriba/abajo, inconsistente con el resto del carrusel (sin franjas, a sangre). Se recortó esa foto igual que las demás (sin franjas), pero el recorte cortaba a la persona del extremo izquierdo.
- 2026-09-24 (ajuste 2): el usuario pidió que se viera completa (nadie cortado). Matemáticamente no caben ambas cosas (grupo completo Y sin ningún margen) porque la foto es horizontal y el espacio del carrusel es vertical — se le preguntó al usuario cómo prefería resolverlo (franjas más chicas / recorte con alguien cortado / quitar la foto), pero antes de responder esa pregunta sugirió una cuarta opción: que el margen sea blanco en vez de café de marca. Como el fondo del estudio de la foto ya es blanco, el margen (usando `object-contain` + fondo blanco del contenedor) se funde casi por completo y no se nota como una franja — resuelve el problema sin cortar a nadie.
