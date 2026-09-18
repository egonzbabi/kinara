---
id: 117
title: "Home: el zoom del hero arranca desde la foto completa (sin recortar), no desde el recorte de cover"
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

La tarea 116 implementó un zoom Ken Burns, pero arrancaba desde el recorte normal de `object-cover` (que en un banner ancho ya recortaba buena parte del cuadro cuadrado del video). El usuario aclaró que no era eso lo que quería: reportó que "el video solo tiene las caras de las personas que están sentadas" — quería ver el cuadro **completo** del video al inicio, sin recortar nada, y que el acercamiento (zoom) empezara desde ahí.

## Objetivo

En reposo, el video se ve completo (sin recortar ningún borde) — con franjas del fondo café a los lados o arriba/abajo, según el ancho del banner. El zoom acerca desde ese estado hasta, como máximo, el mismo encuadre que `object-cover` habría mostrado (nunca más allá, para no salirse del cuadro real grabado).

## Archivos involucrados

- `app/components/Hero.tsx` — `object-cover` → `object-contain`; nuevo cálculo en vivo de `--kb-scale-end` (ResizeObserver sobre el contenedor).
- `app/app.css` — `@keyframes kenburns-fill` (reemplaza la variante fija `kenburns`/`.animate-kenburns-loop` de la tarea 116, que solo servía para saltar entre dos recortes de `cover`, no para partir de `contain`).

## Restricciones específicas de esta tarea

- El factor de zoom no puede ser un valor fijo en CSS: depende de la proporción real del contenedor (ancho/alto), que cambia con cada viewport — se calcula en JS (`Math.max(w,h)/Math.min(w,h)` vía `ResizeObserver`) y se pasa como variable CSS (`--kb-scale-end`) al `@keyframes`.
- Sigue respetando `prefers-reduced-motion` (mismo flag `playsVideo` de la tarea 090) — en ese caso el video queda fijo mostrando el cuadro completo, sin animar.

## Criterios de aceptación

- [x] En reposo (`scale(1)`), el video se ve completo — verificado que aparecen las franjas del fondo (`bg-espresso`) a los lados en desktop (banner ancho) y arriba/abajo en mobile (banner angosto).
- [x] El zoom llega exactamente al mismo punto que `object-cover` habría mostrado siempre (ni de más ni de menos) — validado con la fórmula `Math.max(ancho,alto)/Math.min(ancho,alto)` del contenedor real.
- [x] El cálculo se recalcula si cambia el tamaño del contenedor (`ResizeObserver`), no es un valor fijo que se rompa en otros anchos de pantalla.
- [x] `npm run typecheck` limpio, sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — mismo criterio de `prefers-reduced-motion` que el resto del sitio (tarea 090).
- Regresiones encontradas: ninguna — se reemplaza por completo el mecanismo de zoom de la tarea 116 (no coexisten ambas variantes).
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno nuevo.

## Pruebas manuales

- Verificado en el navegador (desktop 1024px y mobile 375px) que `--kb-scale-end` se calcula correctamente (`1.538` en desktop 921×599, `1.891` en mobile 335×633 — ambos coinciden con la fórmula esperada).
- Confirmado por captura que el video se ve completo con franjas del fondo visibles al inicio del ciclo de zoom, en ambas resoluciones.
- `npm run typecheck` limpio, sin errores de consola.
- Nota de la sesión: el panel de navegador automatizado usado para verificar a veces no compone el frame del `<video>` en la captura (se ve solo el fondo café sólido) tras manipular el video por JS o tras un rato sin interacción — es una limitación conocida de esa herramienta de pruebas, no del sitio; se confirmó el comportamiento real revisando `getComputedStyle` (transform/objectFit) y con capturas limpias justo después de navegar.

## Notas de progreso

- 2026-09-17: Implementado en la misma sesión que las tareas 115/116, tras la aclaración del usuario de que el zoom debía arrancar desde el cuadro completo, no desde un recorte.
