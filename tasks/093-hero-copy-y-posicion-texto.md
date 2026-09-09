---
id: 093
title: "Hero: nuevo copy (\"El mundo de las mujeres\"), se quita el párrafo de tejidos y el texto sube de posición"
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

El usuario pidió cambiar el copy principal del hero, quitar por completo el párrafo de "Tejidos técnicos...", subir la posición del bloque de texto (antes vivía pegado abajo) y revisar una tipografía "elegante pero llamativa" para el titular.

## Objetivo

El hero muestra el nuevo mensaje de marca, sin el párrafo anterior, en una posición más alta y equilibrada dentro del bloque, con un tratamiento tipográfico con más carácter — todo dentro de la fuente de marca ya aprobada (Fraunces Variable), sin introducir una familia tipográfica nueva.

## Solución

### Copy

- Título: "El mundo de las mujeres." (antes "El mundo de la mujer en movimiento.") — con salto de línea explícito en 3 renglones cortos ("El mundo" / "de las" / "mujeres.") en vez de dejar que el navegador decida dónde envolver el texto: a 92px (tamaño máximo del `clamp` en escritorio) la frase completa no cabe en una sola línea dentro del ancho disponible (columna izquierda, compitiendo con la tarjeta de video anclada a la derecha desde la tarea 091/092) — en vez de un ajuste automático potencialmente feo, se controla la composición a propósito, con "mujeres" en el tono clay/durazno de acento (mismo tratamiento que tenía "movimiento" antes).
- Párrafo debajo del título: se reemplaza por completo — el texto anterior ("Tejidos técnicos con tacto de segunda piel...") se borra, ya no queda rastro de él. Nuevo texto: "Tu fuerza no tiene edad. Tu mejor versión está por comenzar."

### Tipografía del título

Se revisó si convenía una fuente distinta para verse "elegante pero llamativa", pero cambiar la familia tipográfica del título sería un cambio de marca más amplio (la misma fuente de display, Fraunces Variable, se usa en encabezados de todo el sitio) y no fue lo que se pidió puntualmente. En su lugar, se le sacó más partido a la misma fuente ya aprobada: de `font-medium` sin cursiva a **`font-semibold italic`** en todo el titular (antes la cursiva solo se usaba en la palabra de acento) — Fraunces está diseñada específicamente para lucir más expresiva en cursiva y pesos altos a tamaños grandes, así que el resultado es más llamativo sin salirse de la identidad ya aprobada.

### Posición del texto (más arriba, sin encimarse con la tarjeta)

El bloque de texto vivía dentro de un contenedor `flex flex-col justify-end` (pegado siempre al borde inferior del hero). Se probó primero centrar todo el bloque (`justify-center`), pero en mobile la tarjeta de video vive arriba (tarea 092) y centrar el texto en el alto completo del hero lo hacía caer encima de la tarjeta.

Solución final: el texto ya no se posiciona con flexbox ni con `transform: translateY` (una vez más, por la misma razón que la tarjeta de video en la tarea 092: un `translate-y` sin prefijo de breakpoint chocaría con el `translate-y` de la animación de entrada) — se posiciona con `top` en porcentaje, relativo al alto real del contenedor del hero: `top-[47%]` en mobile (deja aire después de la tarjeta, que termina en 41%) y `top-[28%]` desde `md` (donde no hay tarjeta arriba, así que puede subir más). Sube claramente respecto a la posición anterior en ambos tamaños, sin encimarse con la tarjeta de video ni cortar los botones fuera de la vista.

## Archivos involucrados

- `app/components/Hero.tsx`: título, párrafo, clases de tipografía y el contenedor de posición del bloque de texto.

## Restricciones específicas de esta tarea

- No se cambió la familia tipográfica del sitio (sigue siendo Fraunces Variable / Hanken Grotesk) — el "font elegante pero llamativo" pedido se logró explotando la cursiva + peso semibold de la misma fuente ya aprobada, no agregando una nueva.
- No se tocó paleta, layout general del hero (fondo ambiental, tarjeta de video, botones) ni ningún otro texto del sitio — cambio acotado al título y párrafo del hero y a la posición de ese bloque.

## Criterios de aceptación

- [x] El título dice "El mundo de las mujeres." con "mujeres" en el tono de acento.
- [x] El párrafo "Tejidos técnicos..." ya no existe en ningún lado del código.
- [x] Nuevo párrafo: "Tu fuerza no tiene edad. Tu mejor versión está por comenzar."
- [x] El bloque de texto está visiblemente más arriba que antes, tanto en mobile como en escritorio.
- [x] En mobile, el texto no se encima con la tarjeta de video.
- [x] Los botones siguen siendo visibles sin necesidad de hacer scroll en una ventana de escritorio típica (1440×900).
- [x] Sin errores en consola.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — cambio de copy/tipografía/posición autorizado explícitamente por el usuario para esta tarea puntual.
- Regresiones encontradas y corregidas en el camino: el primer intento de subir el texto (`justify-center` en todo el bloque) lo hacía encimarse con la tarjeta de video en mobile — corregido con `top` en porcentaje en vez de centrado flexbox. El primer intento de línea (`El mundo de las mujeres.` en una sola línea con salto manual) seguía envolviendo mal en escritorio por el tamaño de fuente — corregido con el salto explícito de 3 líneas.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (cambio de copy/composición puntual, no un estándar nuevo).

## Pruebas manuales

- `npm run typecheck` limpio.
- En el navegador: escritorio (1440×900 y 1440×1050) — título en 3 líneas cortas, cursiva semibold, buena separación de la tarjeta, botones visibles. Mobile (375×812) — texto claramente separado de la tarjeta (que vive arriba), sin overlap, botones visibles.
- Confirmado sin errores de consola en una pestaña nueva.

## Notas de progreso

- 2026-09-09: Implementado en la misma sesión, a pedido explícito del usuario, con varias iteraciones en vivo (copy, quitar el párrafo viejo, subir la posición, ajustar el salto de línea del título) hasta llegar al resultado final verificado arriba.
