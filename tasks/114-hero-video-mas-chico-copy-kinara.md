---
id: 114
title: "Home: video del hero un poco más chico + KINARA antes de la última frase"
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

El usuario pidió dos cambios puntuales al hero de la home: achicar un poco el video, y cambiar el texto de la izquierda para que cada frase quede en su propio renglón, agregando "KINARA" justo antes de la última frase.

## Objetivo

- El video del hero se ve un poco más chico (no un rediseño, solo reducir el tamaño).
- "Tu fuerza no tiene edad." y "Tu mejor versión está por comenzar..." quedan cada una en su propio renglón (antes eran una sola oración corrida).
- "KINARA" aparece como línea propia justo antes de la última frase ("El mundo de las mujeres.").

## Archivos involucrados

- `app/components/Hero.tsx`

## Restricciones específicas de esta tarea

- Cambio de copy explícitamente pedido por el usuario — no es un rediseño de la identidad visual (tipografía, colores y layout general del hero quedan igual).
- El video sigue centrado/anclado igual (mobile arriba, desktop a la derecha), solo cambia su tamaño.

## Criterios de aceptación

- [x] Video: `h-[36%]` → `h-[32%]` en mobile, `md:h-[92%]` → `md:h-[84%]` en desktop — reducción moderada ("solo un poco"), mismo anclaje.
- [x] "Tu fuerza no tiene edad." y "Tu mejor versión está por comenzar..." en `<span className="block">` separados (cada uno su propio renglón).
- [x] Nueva línea "KINARA" (estilo `.label`, texto pequeño en versalitas espaciadas, `text-bone/70`) entre el párrafo grande y el `<h1>` ("El mundo de las mujeres.").
- [x] Verificado en desktop y mobile (375px): el texto se lee bien, sin solaparse con el video ni con los botones.
- [x] `npm run typecheck` limpio, sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no toca el `prefers-reduced-motion` ni la animación de entrada existentes, solo tamaño y copy.
- Regresiones encontradas: ninguna — verificado que la tarjeta de video sigue centrada/anclada igual, con la misma sombra y esquinas redondeadas, solo más chica.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno.

## Pruebas manuales

- Verificado en el navegador (desktop 1024px y mobile 375px): las tres líneas de texto ("Tu fuerza no tiene edad." / "Tu mejor versión está por comenzar..." / "KINARA" / "El mundo de las mujeres. ♥") se ven en el orden y salto de línea pedidos.
- Confirmado por `getBoundingClientRect()` que el video quedó más chico que antes, sin cambiar su posición de anclaje.
- `npm run typecheck` limpio.

## Notas de progreso

- 2026-09-17: Implementado y verificado en una sola sesión, a partir del pedido explícito del usuario.
- 2026-09-17 (ajuste): El usuario pidió, tras ver el resultado, que "KINARA" fuera más grande, que todas las frases subieran, y que el video se achicara un poco más. Cambios: "KINARA" pasó de `.label` (11px) a `font-display font-semibold text-[clamp(26px,4vw,44px)] tracking-[0.1em]` (mismo estilo del wordmark del header, mucho más presente); el bloque de texto subió de `top-[47%]`/`md:top-[30%]` a `top-[36%]`/`md:top-[20%]`; el video bajó de `h-[32%]`/`md:h-[84%]` a `h-[28%]`/`md:h-[76%]`. **Bug encontrado y corregido en el mismo cambio**: al subir el texto en desktop, su caja (`md:max-w-xl`, 576px) empezó a invadir horizontalmente el área del video (confirmado con `getBoundingClientRect()`: el borde derecho de la caja de texto quedaba 221px adentro del borde izquierdo del video) — texto blanco se veía encimado sobre la foto sin suficiente contraste. Se angostó a `md:max-w-md` (448px), verificado que ya no hay superposición visible en 1024px de ancho.
- 2026-09-17 (ajuste 2, tamaño de fuente): Al angostar la caja a `max-w-md`, la frase grande (`text-[clamp(28px,4.6vw,52px)]`, `max-w-[20ch]`) quedaba partida en muy pocas palabras por renglón ("Tu fuerza no" / "tiene edad."). El usuario pidió achicar la fuente para que quepan más palabras por línea. Se bajó a `text-[clamp(22px,3.4vw,38px)]` (antes 28-52px), `max-w-[24ch]` (antes 20ch) y `leading-[1.15]` (antes 1.05, más aire al ser más chica). Verificado en desktop y mobile: ahora caben 3-4 palabras por renglón en vez de 2.
