---
id: 038
title: "Slogan de marca siempre visible (header fijo)"
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

El usuario pidió agregar el slogan de KINARA — "Hecha para moverte. Creada para brillar." — visible en todas las secciones y páginas del sitio, con un diseño cuidado ("muy bonito diseño"). Es un cambio visual/de copy puntual autorizado explícitamente por el usuario (excepción a la regla de diseño intocable de `CLAUDE.md`).

**Primer intento (revertido dentro de esta misma tarea):** se colocó el slogan en el pie de página (`SiteFooter.tsx`), razonando que el footer también es global (vive en el layout raíz) sin sumarle altura permanente al header `sticky`. El usuario aclaró que no era eso lo que quería: "quiero que siempre se vea el slogan y solo si hago scroll se ve" — es decir, visible sin necesidad de bajar hasta el pie de página. Se revirtió el bloque del footer y se movió al header (que sí es `sticky top-0`, visible en todo momento).

Después de esa primera versión en el header (tipografía pequeña, muy pegada al logo), el usuario pidió: "haz el slogan un poco más grande y no tan pegado al título, diseña algo muy bonito, analiza bien" — se ajustó tamaño y espaciado con más cuidado (ver Decisión de diseño).

## Objetivo

El slogan está siempre visible, en cualquier punto de scroll de cualquier página, con un tratamiento tipográfico elegante y con suficiente aire respecto al logo — sin que el header se sienta abultado.

## Decisión de diseño

- Se colocó dentro de `SiteNav.tsx`, debajo del wordmark "KINARA", dentro del mismo `<header>` `sticky top-0` — así hereda la visibilidad permanente sin crear un segundo elemento sticky independiente.
- El logo y el slogan se agruparon en un `flex flex-col items-center` (antes el wordmark era un `<Link>` suelto directamente en la fila); la fila del header pasó de una altura fija `h-20` a `py-3` (alto por contenido) para acomodar las dos líneas sin recortar.
- Tipografía: `font-display` (Fraunces, itálicas) en `text-[clamp(12px,2.8vw,15px)]` — más grande que el primer intento (`11px`/`12px` fijos) y responsivo. Separación del logo con `mt-2` (antes `mt-0.5`, se sentía pegado). Segunda mitad de la frase ("Creada para brillar.") en `text-clay`, mismo patrón ya usado en el Hero para la palabra "movimiento".
- `whitespace-nowrap`: la frase completa siempre cabe en una sola línea, incluso en mobile (375px), verificado visualmente.

## Archivos involucrados

- `app/components/SiteNav.tsx` — wordmark + slogan agrupados en `flex flex-col items-center`, fila del header cambiada de `h-20` a `py-3`.
- `app/components/SiteFooter.tsx` — revertido a su estado original (sin el bloque de slogan del primer intento).

## Restricciones específicas de esta tarea

- No se tocó la navegación (`LINKS`), el menú móvil, el carrito ni ningún otro elemento del header — solo el bloque del wordmark.
- No se dejó ningún rastro del primer intento (footer) — `SiteFooter.tsx` quedó exactamente como estaba antes de esta tarea.
- Reutiliza tokens de diseño ya existentes (`font-display`, `text-clay`, `text-muted`) — no se inventó ninguna paleta ni tipografía nueva.

## Criterios de aceptación

- [x] El slogan es visible en todo momento, sin necesidad de hacer scroll, en cualquier página (vive en el header `sticky`).
- [x] Tamaño y espaciado con suficiente aire respecto al logo (ajustado tras feedback explícito del usuario).
- [x] La frase no se corta ni desborda en mobile (375px) ni en desktop.
- [x] El header sigue fijo (`sticky`) correctamente al hacer scroll, con el slogan siempre encima.
- [x] `npm run typecheck` pasa sin errores; sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no introduce ningún patrón nuevo que deba registrarse ahí (cambio de copy/diseño puntual, ya autorizado explícitamente por el usuario).
- Regresiones encontradas: ninguna — el resto del header (navegación, carrito, menú móvil, botón volver) se conserva igual; `SiteFooter.tsx` quedó igual que antes de esta tarea.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Confirmado por JS (`getBoundingClientRect` del `<header>`) que se mantiene fijo en `top: 0` después de hacer scroll varios miles de píxeles hacia abajo, en dos pestañas distintas.
- Capturas en desktop (1280px) y mobile (375px), en distintas posiciones de scroll: logo + slogan siempre visibles, sin corte de texto, buen espaciado tras el ajuste de tamaño.
- Sin errores de consola en ningún punto.

## Notas de progreso

- 2026-08-10: Tarea creada. Primer intento en el footer, revertido tras aclaración del usuario de que lo quería siempre visible. Movido al header `sticky`. Ajustado tamaño (`clamp(12px,2.8vw,15px)`, antes fijo y más pequeño) y espaciado (`mt-2`, antes `mt-0.5`) tras un segundo pedido explícito del usuario de hacerlo "un poco más grande y no tan pegado al título". Verificado el resultado final en desktop y mobile, con scroll.
