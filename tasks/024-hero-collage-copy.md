---
id: 024
title: "Hero de home: collage de 4 fotos + nuevo copy del título"
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

El usuario pidió, por chat, reemplazar la foto única del hero de home (actualmente una foto de stock de Unsplash de un hombre levantando pesas) por un collage de 4 fotos nuevas que compartió (mujeres estirando/con yoga mat en exteriores, ropa deportiva neutra) y cambiar el título principal por algo más sofisticado que "mundo de la mujer" pero que siga refiriendo al producto (ropa deportiva para mujer). Eligió, de 3 opciones propuestas: **"El universo de la mujer en movimiento"**.

Las 4 fotos las tenía descargadas en `~/Downloads/` (`Woman Stretching Outdoors.jpg`, `Fitness Woman Workout Park.jpg`, `Woman Tying Sneakers.jpg`, `Smiling Asian Girl Stretching in Park.jpg`), no en el chat como archivos accesibles — se confirmaron 1:1 contra las imágenes pegadas en el chat antes de usarlas.

## Objetivo

El hero de `/` muestra un collage de las 4 fotos (una principal + 3 de apoyo) en vez de una sola imagen, con el nuevo título "El universo de la mujer en movimiento" (acento en "movimiento", mismo tratamiento visual que tenía "calma"). El subtítulo y los botones no cambian.

## Archivos involucrados

- `app/components/Hero.tsx`
- `app/data/images.ts` (o un nuevo archivo si conviene separar fotos editoriales de producto)
- `scripts/upload-hero-collage.ts` (nuevo, sigue el patrón de `scripts/upload-*-images*.ts`)
- Bucket `product-images` de Supabase Storage (subcarpeta `site/`, ya que no hay bucket separado para imágenes editoriales)

## Restricciones específicas de esta tarea

- No tocar el resto del contenido de home (TrustStrip, categorías, productos destacados, filosofía, etc.) ni el subtítulo/botones del hero.
- Las fotos deben optimizarse antes de subir (los originales pesaban 9-15 MB) — se redujeron a máx. 1800px de lado largo, JPEG calidad 85 (~600-900 KB), y de ahí en adelante Supabase Storage transform (`app/lib/productImage.ts`) se encarga de servir WebP y los tamaños responsive reales.
- Mantener `fetchPriority="high"` solo en la imagen principal del collage (LCP), las 3 de apoyo con `loading="lazy"`.

## Pasos sugeridos

1. Confirmar las 4 fotos contra las del chat (hecho).
2. Redimensionar/comprimir con `sips` (no hay `sharp`/`cwebp` instalado localmente).
3. Subir a Supabase Storage (`product-images/site/hero-collage-N.jpg`) con un script nuevo.
4. Reestructurar `Hero.tsx`: grid de 4 imágenes (1 grande + 3 apiladas en desktop, 2×2 en mobile) dentro del mismo contenedor `rounded-[28px]` con el mismo scrim/overlay de texto que ya existía.
5. Cambiar el H1 al nuevo copy.
6. Verificar en el navegador desktop y mobile (~375px), `npm run typecheck`.

## Criterios de aceptación

- [x] El hero de `/` muestra las 4 fotos nuevas en formato collage, no la foto de Unsplash anterior.
- [x] El título dice "El universo de la mujer en movimiento" con el mismo tratamiento visual de acento que antes.
- [x] El resto del hero (subtítulo, botones, overlay/legibilidad del texto) sigue funcionando igual.
- [x] Layout responsivo correcto en desktop y mobile (~375px), sin imágenes cortadas de forma extraña.
- [x] `npm run typecheck` pasa sin errores.
- [x] Verificado en el navegador sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — el requisito de Performance (origen: tarea 002) exige que "toda imagen nueva que venga de Supabase Storage" pase por `productImage()`/`productSrcSet()`; se siguió al pie de la letra aunque las fotos del hero no son de producto, subiéndolas al mismo bucket `product-images` (prefijo `site/`) en vez de servirlas crudas desde `public/`.
- Regresiones encontradas: ninguna. Los botones "Comprar la colección"/"Ver Mujer" siguen siendo clicables pese al overlay `absolute inset-0` (se usó `pointer-events-none` en el overlay y `pointer-events-auto` solo en el bloque de texto/botones) — verificado con `read_page` tras el cambio.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno — el requisito ya existente de tarea 002 cubre este caso sin necesitar una entrada nueva.

## Pruebas manuales

- Cargado `/` en desktop (1280px): collage de 1 foto grande + 3 apiladas a la derecha, título nuevo legible sobre la foto grande, botones funcionales.
- Cargado `/` en mobile (375px, resize_window): grid 2×2 con las 4 fotos, título y botones legibles sobre el collage, sin overflow ni imágenes rotas.
- Sin errores en consola del navegador en ninguno de los dos tamaños.

## Notas de progreso

- 2026-07-29: Tarea creada e implementada en la misma sesión. Fotos ubicadas en `~/Downloads/` (`Woman Stretching Outdoors.jpg`, `Fitness Woman Workout Park.jpg`, `Woman Tying Sneakers.jpg`, `Smiling Asian Girl Stretching in Park.jpg`), confirmadas 1:1 contra las pegadas en el chat, redimensionadas con `sips -Z 1800 -s formatOptions 85` (de 9-15 MB a 600-900 KB cada una) y subidas a Supabase Storage (`product-images/site/hero-{1..4}.jpg`) con `scripts/upload-hero-collage.ts`. Se agregó `HERO_COLLAGE` (`main` + `support[3]`) a `app/data/images.ts` con las URLs y alt text. Se reescribió `Hero.tsx`: grid `grid-cols-2 grid-rows-2` (mobile, 2×2 parejo) que pasa a `sm:grid-rows-3` con la foto principal en `sm:row-span-3` (desktop, 1 grande + 3 apiladas), usando `productImage()`/`productSrcSet()` de `~/lib/productImage` para servir WebP redimensionado — la foto principal (`hero-4.jpg`, mujer sonriente con top blanco estirando) con `fetchPriority="high"` para LCP, las 3 de apoyo con `loading="lazy"`. Título cambiado a "El universo de la / mujer en *movimiento*." (elegido por el usuario entre 3 opciones sofisticadas propuestas, evitando el "mundo de la mujer" literal mientras sigue refiriendo al producto/audiencia). El overlay de texto se ajustó a `pointer-events-none` con el bloque de texto/botones en `pointer-events-auto` para no bloquear el resto del collage. Verificado con `npm run typecheck` y en el navegador (desktop 1280px, mobile 375px), sin errores de consola. Tarea cerrada.
