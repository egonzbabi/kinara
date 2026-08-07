---
id: 036
title: "Hero de home: transición de foto tipo 'página' + zoom lento (Ken Burns)"
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

El usuario pidió explícitamente mejorar la transición entre fotos del carrusel del hero de home ("primera sección"), sugiriendo un efecto "como un libro" o, alternativamente, que se analizara una transición moderna y vistosa. Es un cambio visual puntual autorizado por el usuario para esta tarea (excepción explícita a la regla de diseño intocable de `CLAUDE.md`).

El carrusel (creado en la tarea 025) usaba un crossfade plano de opacidad (`transition-opacity duration-1000`), sin movimiento adicional.

## Objetivo

La transición entre fotos del hero evoca el gesto de pasar una página (giro sutil en 3D sobre el borde derecho, no un flip completo de 90°) combinado con un zoom lento continuo (Ken Burns) en la foto activa, para un efecto más cinematográfico y "vistoso" sin perder la elegancia ya aprobada del sitio.

## Archivos involucrados

- `app/components/Hero.tsx` — cada slide pasa de una sola capa `<img>` con crossfade de opacidad a un `<div>` envolvente (transform 3D: `rotateY` + `scale`, origen en el borde derecho) que contiene el `<img>` (que además lleva el zoom Ken Burns).
- `app/app.css` — nuevo `@keyframes kenburns` + clase `.animate-kenburns` en `@layer utilities`, junto a `@keyframes marquee` ya existente. Reutiliza el token de easing de marca `--ease-out-soft` (ya usado en `.reveal`), no se inventó uno nuevo.

## Restricciones específicas de esta tarea

- No se tocó el layout, tipografía, copy ni paleta del hero — solo el movimiento de la transición entre fotos.
- El giro 3D es sutil (8°), no un flip literal de 90°/180° — un flip completo mostraría el reverso de la imagen (en blanco) y se vería roto; el efecto "como un libro" se logra por la dirección y el origen del giro, no por una rotación completa.
- Respeta `prefers-reduced-motion`: el bloque global en `app.css` (`@media (prefers-reduced-motion: reduce)`) ya fuerza `animation-duration`/`transition-duration` casi a cero para todo el sitio, incluida esta animación nueva — no hizo falta código adicional. El `useEffect` del carrusel ya pausaba el avance automático en este caso desde antes.
- `overflow-hidden` en el contenedor del hero seguía recortando correctamente el zoom (`scale(1.045)`/Ken Burns) sin que la foto se saliera de las esquinas redondeadas — verificado visualmente.

## Pasos sugeridos

1. Envolver cada `<img>` del hero en un `<div>` con `perspective` en el contenedor padre y `transform-style: preserve-3d`.
2. Definir el estado activo/inactivo con `rotateY`/`scale`/`opacity` vía inline style (mismo patrón que ya usaba el componente para `opacity`).
3. Agregar `@keyframes kenburns` + clase utilitaria en `app.css`, aplicada solo al slide activo (se reinicia automáticamente al quitar/reponer la clase en cada ciclo).
4. Verificar en el navegador (desktop y mobile) que la transición se ve limpia, sin recortes ni artefactos, y que la animación Ken Burns/el giro se aplican solo al slide correcto.

## Criterios de aceptación

- [x] La transición entre fotos del hero tiene movimiento 3D direccional (no solo crossfade plano) + zoom lento continuo en la foto activa.
- [x] Ninguna foto se sale de las esquinas redondeadas del hero durante la transición.
- [x] `npm run typecheck` pasa sin errores; verificado en el navegador (desktop y mobile) sin errores de consola.
- [x] Respeta `prefers-reduced-motion` (heredado del bloque global ya existente).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no introduce ningún patrón nuevo que deba registrarse ahí (es una mejora de motion/CSS local al Hero, no un requisito estructural nuevo tipo dato/pago/accesibilidad). Se confirmó que `prefers-reduced-motion` sigue respetado.
- Regresiones encontradas: ninguna. El resto del hero (copy, botones, indicadores de slide) no se tocó.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Verificado por JS (`getComputedStyle`) que el slide activo tiene `opacity: 1`, `transform: rotateY(0deg) scale(1)`, y el resto `opacity: 0`, `transform: rotateY(-8deg) scale(1.045)`.
- Confirmado que `var(--ease-out-soft)` resuelve correctamente a `cubic-bezier(0.16, 1, 0.3, 1)` en el navegador.
- Confirmado que la clase `.animate-kenburns` se aplica solo a la foto activa y dispara `animation-name: kenburns`, `animation-duration: 6.5s`.
- Capturas en desktop (1280px) y mobile (375px): sin recortes, sin errores de consola.

## Notas de progreso

- 2026-08-07: Tarea creada e implementada en la misma sesión a pedido explícito del usuario. Se optó por un giro 3D sutil + Ken Burns en vez de un flip completo de página (que mostraría el reverso en blanco de la imagen y se vería roto) — es la interpretación más elegante y realizable de "transición como un libro" dado que son fotos, no páginas reales.
