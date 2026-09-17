---
id: 116
title: "Home: zoom Ken Burns continuo en el video del hero + calidad del video"
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

Tras el rediseño full-bleed del hero (tarea 115), el usuario pidió dos cosas más: que el video "abarque toda la foto completa y luego haga zoom" (efecto cinematográfico de acercamiento continuo), y que se mejorara la calidad visual del video (se veía comprimido/borroso al ocupar toda la pantalla).

## Objetivo

- El video del hero hace un zoom-in lento y continuo (Ken Burns), sin saltos ni cortes, respetando `prefers-reduced-motion`.
- El archivo de video se ve nítido a pantalla completa, no solo en la tarjeta chica de antes.

## Archivos involucrados

- `app/components/Hero.tsx` — clase de animación condicional en el `<video>`.
- `app/app.css` — nueva clase `.animate-kenburns-loop` (reutiliza el `@keyframes kenburns` ya existente de una versión anterior del hero, tarea 099).
- Asset en Supabase Storage: `product-images/site/hero-video.mp4` (re-subido, sin cambio de código).

## Restricciones específicas de esta tarea

- El zoom debe desactivarse si el usuario tiene activado "menos movimiento" — mismo criterio que el autoplay del video (tarea 090), no una excepción nueva.
- No se reemplaza el video por uno distinto — es el mismo archivo/encuadre, solo re-codificado a mayor calidad.

## Criterios de aceptación

- [x] Zoom continuo aplicado (`animation: kenburns 22s ease-in-out infinite alternate`) — arranca en el encuadre normal de `object-cover` y acerca lento, sin saltos (va y viene con `alternate`, no se sincroniza a fuerza con el loop del video de 17.5s para evitar un corte visible).
- [x] Zoom desactivado cuando `prefers-reduced-motion: reduce` está activo (mismo flag `playsVideo` que ya controla el autoplay).
- [x] Video re-codificado: de 681 kbps a 1105 kbps (misma resolución 1080×1080, mismo encuadre/recorte) — subido al mismo path en Storage, sin cambios de código porque la URL no cambia.
- [x] `npm run typecheck` limpio, sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — respeta el requisito de `prefers-reduced-motion` para todo autoplay/animación continua (tarea 090).
- Regresiones encontradas: ninguna — verificado que el zoom no revela bordes vacíos ni descuadra el video (el contenedor tiene `overflow-hidden`, el zoom solo agranda dentro de esos límites).
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno nuevo.

## Pruebas manuales

- Verificado en el navegador que la clase `animate-kenburns-loop` se aplica al `<video>` y que `getComputedStyle` reporta la animación activa (`kenburns`, `22s`).
- Verificado saltando a la mitad de la animación (`animationDelay` negativo) que el encuadre a mitad de zoom se ve bien, sin cortar cabezas ni verse forzado.
- Confirmado que el archivo de video servido desde Storage cambió de 1.5MB (681 kbps) a 2.4MB (1105 kbps) en la misma URL.
- `npm run typecheck` limpio.

## Notas de progreso

- 2026-09-17: Implementado en la misma sesión que el rediseño full-bleed (tarea 115), a pedido explícito del usuario tras ver el resultado.
