---
id: 091
title: "Hero: tarjeta de video más grande y con proporción menos vertical (cuerpo completo)"
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

Con la tarjeta flotante de las tareas 089/090, la tarjeta nítida de escritorio tomaba exactamente la proporción del video fuente (vertical, 1080×1920 ≈ 9:16): alta y angosta. El usuario pidió, en dos mensajes seguidos, que el video se viera "más grande" y "más ancho" manteniendo el cuerpo completo visible, y después pidió explícitamente cambiar la relación de aspecto de la tarjeta para que ya no fuera vertical.

## Objetivo

La tarjeta de video en escritorio es notablemente más grande y con una proporción ancha (casi cuadrada), mostrando el cuerpo completo de las modelos (cabeza a pies) sin recortar nada, y sin volver a las barras de color planas que ya se habían resuelto en la tarea 089.

## Solución

- **Bloque del hero más grande**: `h-[clamp(520px,82vh,860px)]` → `h-[clamp(560px,90vh,960px)]` — más alto en general, lo que da más espacio a la tarjeta.
- **Tarjeta desacoplada de la proporción del video fuente**: antes `md:h-[86%] md:w-auto md:object-cover` (el ancho se calculaba automáticamente a partir del alto y la proporción real del video, dando una tarjeta angosta). Ahora `md:h-[92%] md:w-[58%] md:object-contain` — la tarjeta tiene su propia proporción ancha, fija, independiente del video; `object-contain` asegura que el video se vea completo dentro de ella (sin recortar cuerpo), y como la tarjeta no tiene fondo propio, cualquier margen que quede dentro de ella se resuelve con el fondo ambiental ya existente detrás (mismo recurso de la tarea 089), no con una barra sólida.
- Mobile no se tocó — ya usaba `object-contain` a ancho completo desde la tarea 088/089 y no tenía este problema.

## Archivos involucrados

- `app/components/Hero.tsx`: clases de tamaño del bloque del hero y de la tarjeta de video en escritorio.

## Restricciones específicas de esta tarea

- No se tocó paleta, tipografía, copy, el video fuente ni la composición general (fondo ambiental + tarjeta anclada a la derecha) — solo el tamaño y la proporción de la tarjeta.
- Se verificó que el margen que deja `object-contain` dentro de la tarjeta (cuando la proporción del video no llena exactamente la nueva forma de la tarjeta) se resuelve visualmente con el fondo ambiental de la tarea 089 (mismo tono/blur), no con un color plano — confirmado visualmente, sin costura visible entre la tarjeta y el fondo.

## Criterios de aceptación

- [x] La tarjeta de video en escritorio es visiblemente más grande que en la tarea 090.
- [x] La tarjeta ya no tiene la proporción vertical angosta del video fuente — es notablemente más ancha.
- [x] El cuerpo completo de las modelos (cabeza a pies) se sigue viendo sin recortar.
- [x] No aparecen barras sólidas de color dentro o alrededor de la tarjeta.
- [x] Mobile no cambia respecto a la tarea 090.
- [x] Sin errores nuevos en consola (verificado en pestaña nueva).
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — cambio de tamaño/proporción autorizado explícitamente por el usuario para esta tarea puntual; no se tocó paleta, tipografía ni copy.
- Regresiones encontradas: ninguna — se confirmó que mobile, el respeto a `prefers-reduced-motion` (tarea 090) y la ausencia de `fetchpriority` (tarea 089) siguen intactos.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (es un ajuste de tamaño puntual, no un estándar nuevo).

## Pruebas manuales

- `npm run typecheck` limpio.
- En el navegador: verificado en escritorio (1440×900) — la tarjeta se ve notablemente más grande y ancha, con las 4 modelos completas (cabeza a pies) sin recorte y sin costura visible con el fondo ambiental.
- Verificado en mobile (375×812) — sin cambios respecto a la tarea 090.
- Confirmado sin errores de consola en una pestaña nueva.

## Notas de progreso

- 2026-09-09: Implementado en la misma sesión, a pedido explícito del usuario ("quiero el video mas grande pero que se vea cuerpo completo" / "mas ancho" / "puedes cambiar la relación del video que no sea vertical"), inmediatamente después de la tarea 090.
