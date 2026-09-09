---
id: 092
title: "Hero: el archivo de video pasa a formato cuadrado (recortado, sin fondo blanco de sobra)"
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

En la tarea 091, la tarjeta de video de escritorio se hizo más ancha usando `object-contain` (el video seguía siendo vertical, 1080×1920, así que la tarjeta —de proporción distinta— dejaba un margen dentro de sí misma). El usuario notó que la tarjeta quedaba más grande que el video real y pidió cambiar el **formato del archivo** de vertical a cuadrado, aceptando explícitamente recortar arriba y abajo (donde sobraba fondo blanco de estudio) siempre que no se perdiera la imagen completa (cabeza y pies) de las modelos.

## Objetivo

El archivo de video en sí es cuadrado (1:1), sin el exceso de fondo blanco por arriba/abajo del original, y sigue mostrando el cuerpo completo (cabeza a pies) de las modelos en todo el clip.

## Solución

### El recorte (a nivel de archivo, con ffmpeg)

El video (16.2s, 30fps) no es una sola toma fija: son varias escenas distintas editadas juntas (grupo de 6, grupo de 4, grupo de 5 celebrando con los brazos arriba), cada una con un encuadre ligeramente distinto. Se extrajeron y revisaron cuadros de cada escena (con una cuadrícula de referencia por porcentaje de alto) para encontrar una sola ventana de recorte vertical que:

- Mantenga cabezas y pies completos en las escenas "en reposo" (la gran mayoría del clip).
- En el momento más exigente (brazos levantados celebrando), solo recorte el margen de fondo blanco por encima de las manos, nunca la cara ni el torso.

Ventana elegida: `crop=1080:1080:0:384` (recorta 384px arriba y 456px abajo de los 1920px originales, deja el ancho de 1080 intacto). Verificado visualmente en las 3 escenas principales del clip: cuerpo completo en las tres, sin fondo blanco de sobra.

Re-encodeado con el mismo patrón de la tarea 088 (`libx264 -preset slow -crf 20 -an -movflags +faststart`), resultando en 1080×1080, ~2.0 MB (antes 2.58 MB). Nueva portada (`hero-poster.jpg`) extraída del video ya recortado. Ambos archivos se subieron a la misma ruta de Supabase Storage (`product-images/site/hero-video.mp4` y `hero-poster.jpg`, sobrescritos — mismo patrón que la tarea 088), así que no hizo falta tocar `app/data/images.ts`.

### Simplificación del componente (`app/components/Hero.tsx`)

Con el archivo ya cuadrado, la tarjeta nítida ya no necesita fingir una proporción distinta a la del video (`object-contain` + ancho/alto asimétrico de la tarea 091) — ahora es un cuadrado real (`aspect-square`) y el video la llena exacto con `object-cover`, sin márgenes internos.

- **Escritorio**: sigue anclada a la derecha, ahora sizada por alto (`md:h-[92%]`, ancho automático vía `aspect-square`) — el resultado es un cuadrado grande, no la forma ancha-artificial de la tarea 091.
- **Mobile**: cambio de layout. Antes (tareas 087-091) el video llenaba el marco completo del hero (`h-full w-full object-contain`), lo cual funcionaba porque el video era vertical, parecido a la proporción del hero en un celular. Con un video cuadrado, hacer lo mismo (llenar el marco completo, alto y angosto) exigiría recortar los lados del cuadrado severamente. En su lugar, la tarjeta ahora es un cuadrado más pequeño anclado cerca del borde superior del hero (`top-[5%]`, `h-[36%]`, centrado horizontalmente), dejando aire debajo para el texto — el mismo concepto de "tarjeta flotante" de escritorio, adaptado a mobile en vez de forzar el video a ocupar todo el marco.
  - El centrado en mobile es solo horizontal (`-translate-x-1/2`) a propósito: centrar también verticalmente con `-translate-y-1/2` (sin prefijo de breakpoint) chocaría con el `translate-y` de la animación de entrada (tarea 090), que tampoco lleva prefijo — dos clases de Tailwind sin prefijo que tocan la misma propiedad CSS (`transform`) no se combinan, gana una sola. Por eso mobile usa `top-[valor]` (posición, no transform) en vez de `top-1/2 -translate-y-1/2`.
- El resplandor cálido detrás de la tarjeta (tarea 090) se ajustó a `aspect-square` para acompañar la nueva forma cuadrada de la tarjeta.

## Archivos involucrados

- Video y portada re-subidos a Supabase Storage (`product-images/site/hero-video.mp4`, `hero-poster.jpg`, mismo path, sobrescritos).
- `app/components/Hero.tsx`: clases de la tarjeta nítida (escritorio y mobile) y del resplandor detrás de la tarjeta.

## Restricciones específicas de esta tarea

- No se tocó paleta, tipografía, copy, el fondo ambiental (mismo video, blur+tinte de marca de la tarea 089/090) ni el respeto a `prefers-reduced-motion` (tarea 090) — todos siguen intactos.
- El recorte del video se decidió revisando escenas concretas del clip (no solo el primer cuadro) precisamente porque el archivo tiene varias tomas con encuadres distintos — evita el error de optimizar el recorte para la escena "fácil" y romper una escena posterior más exigente (brazos levantados).
- El video pesa menos que antes (2.0 MB vs 2.58 MB) por ser cuadrado en vez de vertical — no perjudica el requisito de carga rápida ya establecido (tarea 088).

## Criterios de aceptación

- [x] El archivo de video es 1080×1080 (cuadrado real, no simulado con CSS).
- [x] Cabeza y pies completos de las modelos en las 3 escenas principales del clip, sin recorte de cuerpo.
- [x] Sin fondo blanco de estudio sobrante por arriba/abajo del sujeto (a diferencia del video vertical original).
- [x] La tarjeta de escritorio se llena exacta con el video, sin márgenes internos.
- [x] En mobile, la tarjeta (ahora más chica y anclada arriba) no se encima con el texto.
- [x] Sin errores en consola (verificado en pestaña nueva).
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — cambio de formato/composición autorizado explícitamente por el usuario para esta tarea puntual; no se tocó paleta, tipografía ni copy. Se preservó el respeto a `prefers-reduced-motion` (tarea 090, ahora en `REQUISITOS.md`).
- Regresiones encontradas y corregidas en el camino: el primer intento de adaptar mobile centraba la tarjeta también verticalmente, lo que la hacía encimarse con el texto de abajo — corregido anclándola cerca del borde superior en vez de centrarla.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (ajuste de asset/composición puntual, no un estándar nuevo).

## Pruebas manuales

- `npm run typecheck` limpio.
- Video verificado con `ffmpeg -i`: 1080×1080, H.264, sin audio, faststart.
- Escenas revisadas cuadro por cuadro (grupo de 6, grupo de 4, grupo de 5 con brazos arriba) antes y después del recorte — cuerpo completo confirmado en las tres.
- En el navegador: escritorio (1440×1000) — tarjeta cuadrada grande anclada a la derecha, sin márgenes internos, cuerpo completo. Mobile (375×812) — tarjeta cuadrada cerca del borde superior, separación clara del texto de abajo, sin overlap.
- Confirmado sin errores de consola en una pestaña nueva.

## Notas de progreso

- 2026-09-09: Implementado en la misma sesión, a pedido explícito del usuario ("quiero que el video sea cuadrado, se puede recortar arriba y abajo, sobra mucho fondo blanco, sin perder la imagen completa"), inmediatamente después de la tarea 091. Video y portada re-subidos a Supabase Storage; layout de mobile rediseñado como tarjeta anclada arriba en vez de video a pantalla completa, tras detectar que el centrado vertical inicial se encimaba con el texto.
