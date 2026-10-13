---
id: 135
title: "Cache de 1 año para las fotos y el video del hero en Supabase Storage"
status: in-progress
---

## Contexto

Lighthouse (celular) dio LCP de 3.1 a 3.9 s (meta < 2.5 s) con variación grande. Las fotos de producto se servían con `cache-control: max-age=3600` (1 hora) porque `admin.upload.tsx` no indica `cacheControl`; el poster del hero ya tenía 1 año y el video del hero `no-cache`. Con 1 hora, la primera descarga (cache MISS de Cloudflare + transformación al vuelo, ~0.8–1.2 s extra) se repite seguido con poco tráfico, y Lighthouse marca "política de caché ineficaz".

## Objetivo

Que las fotos de producto (nuevas y existentes) y el video del hero se sirvan con `cache-control: max-age=31536000`. Es seguro porque todos los nombres llevan `Date.now()` (cada foto nueva = nombre nuevo).

## Archivos involucrados

- `app/routes/admin.upload.tsx` (subidas nuevas)
- Script puntual (scratchpad) para las existentes — no se versiona

## Restricciones específicas de esta tarea

- Mismo contenido, solo cambia el tiempo de caché. Se guarda un inventario de cómo estaba cada objeto antes de tocarlo.
- Sin cambios visuales.

## Criterios de aceptación

- [x] `admin.upload.tsx` sube con `cacheControl: "31536000"`.
- [x] Todas las fotos existentes usadas por el sitio responden `max-age=31536000` con el mismo tamaño que antes (1,141 rutas de `product_images` + `site/`; inventario antes/después sin diferencias de tamaño ni tipo).
- [x] El video del hero responde con caché de 1 año (ya lo tenía; no se tocó).
- [x] Typecheck sin errores y el sitio sigue mostrando todas las fotos (200 fotos principales del feed responden 206/200 image/*).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (no cambia nada visual ni de datos)
- Regresiones encontradas: ninguna
- Requisitos nuevos agregados a `REQUISITOS.md`: toda subida a Storage debe llevar `cacheControl` de 1 año con nombre único (con timestamp)

## Pruebas manuales

- Subir una foto desde el admin y revisar su cabecera `cache-control`; Lighthouse de inicio, tienda y producto.

## Notas de progreso

- 2026-10-13: tarea creada.
- 2026-10-13: `admin.upload.tsx` ahora sube con `cacheControl: "31536000"` (typecheck OK). Inventario previo: 1,353 objetos en `product-images`, 1,341 con `max-age=3600`. El poster y los videos del hero YA tenían 1 año (los `HEAD` con curl dan `no-cache` engañoso; con GET real responden `max-age=31536000`), así que el hero no necesitó cambios. Se actualizan solo los objetos usados (949: 945 rutas de `product_images` + `site/hero-1..4.jpg`), no los 392 huérfanos. Piloto de 3 fotos OK (hash idéntico, caché 1 año visible tras ~1 min de CDN). Backfill completo lanzado (4 en paralelo, reintentos, aborta con 5 errores). Copias de seguridad en el scratchpad de la sesión: `storage-inventario-antes-2026-10-13.json` (cacheControl/size/etag previos de todos los objetos) y `storage-objetivos.json`.
- 2026-10-13 (2): backfill terminado: 949 objetos usados ahora con `max-age=31536000` (4 fallos de red se repitieron y pasaron). Inventario antes/después: 1,353 objetos, ninguno desaparecido, sin cambios de tamaño ni tipo; 392 huérfanos sin usar quedaron con 1 h. 200 fotos principales del feed verificadas. Falta: subir el cambio de `admin.upload.tsx` (pendiente de aprobación) y comparar Lighthouse.
- 2026-10-13 (3): CORRECCIÓN: la consulta de `product_images` del plan inicial se truncó en 1,000 filas (límite de PostgREST); la tabla real tiene 1,207 filas / 1,141 rutas. Faltaban 196 fotos usadas (185 MiB); se actualizaron con el mismo método (1 fallo de red repetido). Estado final verificado contra el inventario nuevo: 0 fotos en uso con caché corta; 1,157 objetos con 1 año y 196 huérfanos sin uso con 1 h (no se tocaron). Tamaños y tipos idénticos al inventario previo. Lighthouse tras el cambio (caché calentada): producto 94-95 / LCP 2.6-2.9 s; tienda 92-95 / LCP 2.5-3.1 s; inicio pendiente de remedir tras la corrección. Lección: paginar siempre las consultas de Supabase con `.range()` cuando una tabla pueda pasar de 1,000 filas.
