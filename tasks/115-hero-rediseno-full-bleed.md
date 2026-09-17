---
id: 115
title: "Home: rediseño del hero a full-bleed con un solo titular (inspirado en Lululemon/Vuori/Gymshark/Alo)"
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

El usuario no estaba convencido del diseño del hero (video en tarjeta flotante + 5 bloques de texto apilados: frase de 2 renglones, "KINARA", tagline con corazón, 2 botones — resultado de las tareas 090-096, 111, 114). Pidió revisar sitios premiados/premium del mismo giro para comparar.

Se revisaron en vivo: Alo Yoga, Vuori, Gymshark y Lululemon. Patrón consistente encontrado: un solo titular corto (una línea), como mucho una línea de apoyo, 1-2 botones, y el video/foto casi siempre **full-bleed** (borde a borde) con degradado de legibilidad — nunca una tarjeta de video flotante confinada a un lado con varios bloques de texto compitiendo por espacio. Lululemon en particular usa exactamente el mismo recurso que ya teníamos (scrim + texto abajo-izquierda + 2 botones) pero sin tarjeta: el video llena todo.

El usuario eligió explícitamente la opción "Full-bleed + un solo titular corto (recomendado)" y pidió combinar las dos frases existentes ("Tu fuerza no tiene edad..." + "El mundo de las mujeres.") en una sola oración.

## Objetivo

El hero del home sigue el patrón de las referencias: video full-bleed (sin tarjeta flotante), un solo `<h1>` corto, dos botones — sin agregar bloques de texto nuevos ni volver a la versión anterior.

## Archivos involucrados

- `app/components/Hero.tsx` — reescrito.
- `app/routes/_index.tsx` — `links()` ya no precarga `HERO_BG_IMAGE` (el fondo ambiental desenfocado ya no existe, el video es la única capa visual).

## Restricciones específicas de esta tarea

- Rediseño explícitamente autorizado por el usuario para este componente puntual — no es una licencia general para rediseñar el resto del sitio.
- El video fuente es cuadrado (recortado cabeza-a-pies para la tarjeta de la tarea 092) — en un banner ancho `object-cover` recorta arriba/abajo; se usó `object-[center_20%]` para conservar la cara en cuadro a costa de parte de las piernas. Esto es una limitación del archivo existente, no algo que el código pueda resolver sin un video nuevo recortado para banner ancho.

## Criterios de aceptación

- [x] Video full-bleed (`absolute inset-0 object-cover`), sin tarjeta flotante ni fondo ambiental desenfocado separado.
- [x] Un solo `<h1>`: "El mundo de las mujeres no tiene edad." + corazón — combina las dos frases anteriores en una sola oración, como pidió el usuario.
- [x] Sin "KINARA" repetido en el hero (ya está en el logo del header).
- [x] Texto anclado abajo-izquierda en mobile y desktop por igual (ya no hay tarjeta que esquivar con `top` distinto por breakpoint).
- [x] Se mantienen los 2 botones ("Comprar la colección" / "Ver Mujer") y el tinte cálido de marca sobre el video.
- [x] `HERO_BG_IMAGE` eliminado de `Hero.tsx` y de `_index.tsx` (ya no se usa).
- [x] Lighthouse Accessibility = 100/100 en home (sin regresión).
- [x] `npm run typecheck` limpio, sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — se mantiene `prefers-reduced-motion` (autoplay condicional) y la animación de entrada existente, solo cambia el layout y el copy.
- Regresiones encontradas: ninguna en accesibilidad (100/100 antes y después). Verificado visualmente en desktop y mobile que el texto es legible sobre el video en todo momento gracias al scrim.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno nuevo — no se introduce un patrón reutilizable distinto a los ya documentados.

## Pruebas manuales

- Verificado en el navegador (desktop 1024px y mobile 375px): el video llena todo el banner, el titular se lee en una sola oración, los botones no se solapan con nada.
- Confirmado que el video reproduce de verdad (`currentTime` avanzando), no solo el poster estático.
- Lighthouse Accessibility: 100/100 en home tras el cambio.
- `npm run typecheck` limpio, sin errores de consola en ninguna de las dos resoluciones probadas.

## Notas de progreso

- 2026-09-17: Implementado tras revisión comparativa en vivo de Alo Yoga, Vuori, Gymshark y Lululemon (a pedido del usuario), con su aprobación explícita de la dirección ("Full-bleed + un solo titular corto") y del titular combinado.
