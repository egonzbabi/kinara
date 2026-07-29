---
id: 025
title: "Hero de home: collage → carrusel automático + 'universo' a 'mundo'"
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

Tarea 024 metió las 4 fotos nuevas como un collage (1 grande + 3 apiladas / 2×2 en mobile). El usuario probó el resultado y no le gustó cómo se veían las fotos así de recortadas/pequeñas — pidió que en vez de collage sea un carrusel que vaya cambiando de foto solo (automático). También pidió cambiar "universo" por "mundo" en el título.

## Objetivo

El hero de `/` muestra una sola foto a pantalla completa (como el hero original, antes de la tarea 024) que rota automáticamente entre las 4 fotos con un crossfade, en vez del grid de collage. El título pasa de "El universo de la mujer en movimiento" a "El mundo de la mujer en movimiento".

## Archivos involucrados

- `app/components/Hero.tsx`

## Restricciones específicas de esta tarea

- Respetar `prefers-reduced-motion` (mismo patrón que ya usa `AnnouncementBar`) — sin autoplay para quien lo tenga activado, mostrar la primera foto fija.
- Pausar el autoplay en hover/focus y al interactuar con los indicadores (no debe seguir cambiando de foto mientras alguien lee el texto con el mouse encima) — accesibilidad básica de carruseles con auto-avance (WCAG 2.2.2).
- Solo la foto visible inicialmente lleva `fetchPriority="high"` (LCP); no usar `loading="lazy"` en ninguna de las 4 ya que el carrusel las necesita listas para el crossfade, no solo cuando entren al viewport.

## Pasos sugeridos

1. Reemplazar el grid de 4 `<img>` de `Hero.tsx` por un contenedor con las 4 fotos apiladas (`absolute inset-0`), controlando opacidad por estado (`useState` + `useEffect`/`setInterval`) para el crossfade.
2. Agregar indicadores (puntos) clicables, pequeños y discretos, que también sirvan para pausar el autoplay al interactuar.
3. Cambiar "universo" por "mundo" en el H1.
4. Verificar en el navegador (desktop y mobile) que el carrusel cicla solo, que el hover lo pausa, y que el layout no rompe.

## Criterios de aceptación

- [x] El hero muestra una sola foto (no un grid) que cambia sola cada pocos segundos entre las 4 fotos, con transición de opacidad.
- [x] El título dice "El mundo de la mujer en movimiento." (con el mismo acento visual en "movimiento").
- [x] El autoplay se pausa en hover/focus del hero y respeta `prefers-reduced-motion`.
- [x] `npm run typecheck` pasa sin errores.
- [x] Verificado en el navegador desktop y mobile, sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — se mantiene `productImage()`/`productSrcSet()` para las 4 fotos (ya subidas a Supabase Storage en la tarea 024, se reusan las mismas URLs, sin subir nada nuevo).
- Regresiones encontradas: ninguna. Los botones y los puntos indicadores siguen siendo clicables (`pointer-events-auto` en los bloques de texto/controles, `pointer-events-none` solo en los wrappers decorativos).
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno — no se detectó un estándar nuevo que deba sobrevivir a futuras tareas más allá de lo ya exigido (tarea 002) sobre `productImage()`/`productSrcSet()`.

## Pruebas manuales

- Cargado `/` en desktop (1280px): la foto principal cambia sola cada ~5s (verificado esperando y comparando screenshots — pasó de la foto con audífonos a la del tapete de yoga), con crossfade suave y el punto indicador activo moviéndose en sincronía.
- Hover sobre el hero: confirmado que pausa el autoplay (mismo screenshot tras 6s con el mouse encima, sin cambio de foto ni de indicador).
- Mobile (375px): mismo comportamiento, foto a pantalla completa, sin overflow, indicadores visibles.
- Sin errores en consola en ningún caso.

## Notas de progreso

- 2026-07-29: Tarea creada a partir de feedback directo del usuario sobre el resultado de la tarea 024 (el collage no se veía bien) e implementada en la misma sesión. Se reescribió `Hero.tsx`: las 4 fotos (mismas URLs de Supabase de la tarea 024, sin volver a subir nada) ahora se apilan con `absolute inset-0` y se cruzan con `transition-opacity duration-1000`, controladas por un índice en `useState` que avanza con `setInterval` cada 5s (`useEffect`). El autoplay se salta por completo si `window.matchMedia("(prefers-reduced-motion: reduce)").matches`, y se pausa (`paused` state) en `onMouseEnter`/`onFocus` del contenedor, reanudando en `onMouseLeave`/`onBlur`. Se agregaron indicadores tipo puntos (clicables, con `aria-label`/`aria-current`) que saltan a una foto específica y pausan el autoplay permanentemente al hacer click, dando al usuario control real sobre el auto-avance (WCAG 2.2.2). Título cambiado de "El universo de la mujer en movimiento" a "El mundo de la mujer en movimiento", a pedido del usuario. Verificado con `npm run typecheck` y en el navegador (desktop 1280px, mobile 375px): la foto cambia sola, el hover la pausa, sin errores de consola. Tarea cerrada.
