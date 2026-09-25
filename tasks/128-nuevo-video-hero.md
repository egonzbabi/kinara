---
id: 128
title: "Home: reemplazar el video del hero (mujer jugando tenis)"
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

El usuario mandó un video nuevo para el hero del home (mujer jugando tenis). El archivo original pesaba 161 MB (1:22 min, 1920x1080, ~15.5 Mbps, con audio sin usar — el video del hero siempre está en `muted`) — subirlo tal cual habría sido un salto enorme de peso (el video anterior pesaba 3.77 MB) justo cuando el usuario recibió un aviso de Supabase por exceder la cuota de ancho de banda de su plan.

## Objetivo

El hero muestra el video nuevo completo (el usuario pidió mantener los 1:22 min, no recortarlo), comprimido a un peso razonable, con una portada (poster) nueva sacada del mismo video.

## Archivos involucrados

- `app/data/images.ts` (URLs del video/poster)
- Supabase Storage, bucket `product-images/site/` (archivos nuevos)

## Restricciones específicas de esta tarea

- **Nunca sobrescribir el mismo nombre de archivo** al reemplazar el video/poster del hero — mismo problema de caché del endpoint de transformación de imágenes de Supabase ya documentado en `REQUISITOS.md` (tarea 120): se sube con nombre nuevo (timestamp) y se actualiza `app/data/images.ts`, no se toca `hero-video.mp4`/`hero-poster.jpg` in situ.
- El usuario decidió explícitamente mantener el video completo (1:22) en vez de recortarlo, después de que se le explicara el trade-off de peso/velocidad.
- El usuario decidió explícitamente dejar los archivos en Supabase Storage (no moverlos a `public/`/Vercel) porque va a pasar al plan Pro de Supabase — el tema de la cuota de Supabase se resuelve por ese lado, no por esta tarea.
- Aprovechando que se subía de todos modos, se subió con `cacheControl: "31536000"` (1 año) — el video anterior tenía `cache-control: no-cache`, lo que forzaba una re-descarga completa en cada visita nueva (encontrado al investigar el aviso de cuota de Supabase). Esto no estaba pedido explícitamente pero es una mejora directa sin costo, aplicada al subir el archivo de todos modos.

## Pasos sugeridos

1. Instalar `ffmpeg-static` on-demand (no viene preinstalado) para comprimir/inspeccionar el video.
2. Recomprimir: quitar audio (`-an`, no se usa), reescalar a 1280x720, bitrate ~1.2 Mbps, `+faststart` — de 161MB a ~11.9MB.
3. Extraer 2-3 fotogramas candidatos a distintos segundos y elegir el mejor como poster (evitar fotogramas con la cara tapada por la raqueta o fuera de cuadro).
4. Subir video + poster a Supabase Storage con nombres nuevos (timestamp) y `cacheControl: "31536000"`.
5. Actualizar `app/data/images.ts` con las nuevas URLs.
6. `npm run typecheck` + verificar en el navegador que el video carga, tiene las dimensiones correctas, sin errores, y reproduce.

## Criterios de aceptación

- [x] El hero muestra el video nuevo completo (1:22, sin recortar).
- [x] El archivo de video pesa ~11.9 MB (vs. 161 MB original) — sin audio, 1280x720, bitrate limitado.
- [x] La portada (poster) es un fotograma real del video nuevo, elegido a mano (rostro visible, buena composición).
- [x] Video y poster subidos con nombre nuevo (timestamp), no sobrescribiendo los archivos anteriores.
- [x] `cache-control` de 1 año en los archivos nuevos (mejora sobre el `no-cache` del video anterior).
- [x] `npm run typecheck` sin errores; video verificado en el navegador (carga, dimensiones correctas, reproduce sin error).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — se sigue al pie de la letra el requisito ya documentado (tarea 120) de nunca sobrescribir el mismo path al reemplazar un archivo de Storage.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno (el requisito de nombres nuevos al reemplazar ya estaba documentado; esta tarea solo lo aplica también a video/poster del hero, no solo a fotos de producto).

## Pruebas manuales

- Verificado en el navegador: `video.currentSrc`/`video.poster` apuntan a los archivos nuevos, `readyState: 4` (listo), `videoWidth/videoHeight: 1280x720`, sin `error`, reproduce al llamar `.play()`. Confirmado visualmente por screenshot que el video se ve bien con el degradado/titular existentes encima.

## Notas de progreso

- 2026-09-24: Implementado y verificado en una sola sesión. El usuario recibió un aviso de Supabase por exceder la cuota de ancho de banda justo antes de esta tarea — se investigó (ver conversación) que el video anterior no tenía caché de navegador (`no-cache`), lo que probablemente contribuía; se corrigió ese detalle de paso al subir los archivos nuevos. El usuario decidió pagar el plan Pro de Supabase en vez de mover los assets a Vercel, así que esta tarea no cambia dónde vive el video (sigue en Supabase Storage).
