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
