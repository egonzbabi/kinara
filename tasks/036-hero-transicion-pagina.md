---
id: 036
title: "Hero de home: transición de foto tipo 'libro que se abre'"
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

El usuario pidió mejorar la transición entre fotos del carrusel del hero de home ("primera sección"). Es un cambio visual puntual autorizado por el usuario para esta tarea (excepción explícita a la regla de diseño intocable de `CLAUDE.md`).

**Primer intento (revertido dentro de esta misma tarea):** un giro 3D sutil (`rotateY` + `perspective` + `transform-style: preserve-3d`) combinado con zoom lento (Ken Burns). El usuario reportó que se veía **peor que el original**, con dos bugs concretos:

1. Al cambiar de foto aparecía primero un cuadro sin foto (fondo vacío) antes de que se viera la nueva imagen.
2. El texto del hero (eyebrow "Nueva colección · SS26", título, párrafo y botones) desaparecía después de la primera transición y ya no volvía a aparecer.

**Causa raíz de ambos bugs:**

1. El cuadro en blanco: la combinación de `perspective` + `transform-style: preserve-3d` + `overflow-hidden` en el contenedor es una combinación conocida por dar problemas de compositing/recorte en algunos navegadores — el giro 3D real (aunque sutil) no es seguro para este layout.
2. El texto desaparecido: al agregar `zIndex: isActive ? 2 : 1` a cada foto (para controlar cuál queda encima durante el giro), las fotos activas quedaban con `z-index: 2`, y el contenedor del texto/degradados **nunca tenía `z-index` explícito** (quedaba en `auto`, equivalente a nivel 0 de apilamiento). Como 2 > 0, la foto activa se pintaba **encima** del texto, tapándolo por completo — no era un problema de contenido sino de una regla de apilamiento CSS.

## Objetivo (solución final)

La transición entre fotos del hero se ve como un libro que se abre desde el centro: la foto nueva se revela desde una línea vertical central hacia los dos lados, cubriendo a la anterior — sin que jamás se vea un cuadro sin foto — y el texto permanece siempre visible encima, sin importar el estado de la transición. Además, hacer clic sobre la foto (fuera del texto/botones) avanza manualmente a la siguiente.

## Solución implementada

- **Técnica de transición:** `clip-path: inset()` en vez de transformaciones 3D. Cada foto tiene dos estados: `CLOSED` (`inset(0% 50% 0% 50%)`, una línea de 0px en el centro — como el lomo de un libro cerrado) y `OPEN` (`inset(0% 0% 0% 0%)`, foto completa). La foto activa anima de `CLOSED` a `OPEN`; la que estaba activa justo antes se queda en `OPEN` sin animar, sirviendo de fondo visible mientras la nueva se revela encima. Así **nunca hay un cuadro vacío**: en todo momento hay una foto real detrás de la que se está abriendo.
- **z-index explícito en todo:** las fotos usan `z-index: 0/1/2` (según estén ocultas / de fondo / activas), y el texto + los degradados de legibilidad ahora tienen `z-10` explícito — por encima de cualquier z-index que puedan tener las fotos, sin importar el estado de la transición.
- **Clic para avanzar:** el contenedor del hero tiene `onClick` que avanza a la siguiente foto (`cursor-pointer`). El texto y la fila de puntos indicadores llevan `onClick={(e) => e.stopPropagation()}` para que un clic en un botón/enlace/punto no dispare además el avance del contenedor.
- Se quitó el zoom Ken Burns de esta iteración (reduce riesgo/complejidad después de que el primer intento ya había fallado; se puede retomar en una tarea aparte si se quiere).

## Archivos involucrados

- `app/components/Hero.tsx` — reescrito: `clip-path` en vez de `rotateY`/`perspective`; `z-10` en degradados y texto; `onClick` de avance manual + `stopPropagation` en las zonas de texto/puntos; se agregó estado `prevActive` para saber qué foto sirve de fondo visible durante la transición.
- `app/app.css` — se dejó el `@keyframes kenburns`/`.animate-kenburns` de la primera iteración (sin uso por ahora, no se quitó porque no estorba y se puede reutilizar).

## Restricciones específicas de esta tarea

- No se tocó el layout, tipografía, copy ni paleta del hero — solo el mecanismo de transición entre fotos y la interacción de clic.
- Nada de transformaciones 3D (`perspective`/`preserve-3d`/`rotateY`) — fueron la causa del bug del cuadro en blanco.
- Todo elemento con z-index explícito debe quedar documentado y verificado contra los demás — el bug del texto desaparecido fue exactamente por no hacer esto la primera vez.
- Respeta `prefers-reduced-motion` (heredado del bloque global ya existente en `app.css`).

## Criterios de aceptación

- [x] Al cambiar de foto nunca se ve un cuadro sin foto — siempre hay una imagen real visible.
- [x] El texto del hero (eyebrow, título, párrafo, botones, puntos) permanece visible en todo momento, incluida la primera transición y todas las siguientes.
- [x] Clic en la foto (fuera de texto/botones/puntos) avanza a la siguiente foto sin duplicar el avance.
- [x] Clic en un punto indicador avanza exactamente a esa foto (no salta una extra por el clic del contenedor).
- [x] `npm run typecheck` pasa sin errores; verificado en el navegador (desktop y mobile) sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no introduce ningún patrón nuevo que deba registrarse ahí (mejora de motion/interacción local al Hero).
- Regresiones encontradas: sí, las dos causadas por el primer intento de esta misma tarea (cuadro en blanco + texto tapado) — corregidas dentro de esta misma tarea antes de cerrarla, no se dejó nada roto.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Confirmado por `getComputedStyle` que la foto activa tiene `clip-path: inset(0%)` (abierta) y `z-index: 2`; la foto base (la anterior) tiene `clip-path: inset(0%)` y `z-index: 1`; el resto `clip-path: inset(0% 50%)` (cerradas) y `z-index: 0`.
- Confirmado por `aria-current` de los puntos indicadores que el estado activo coincide con lo mostrado.
- Clic en la foto: avanza correctamente de la foto 1 a la 2. Clic directo en el punto "Ver foto 4 de 4" desde la foto 2: llega exactamente a la 4 (no a la 1 por doble avance).
- Capturas en desktop (1280px) y mobile (375px), incluida una captura a mitad de transición: se ve una foto real revelándose desde el centro sobre la foto anterior (nunca fondo vacío), y el texto completamente legible encima en todo momento.
- Sin errores de consola en ningún punto de las pruebas.

## Notas de progreso

- 2026-08-07: Primer intento con giro 3D (`rotateY`) + Ken Burns, verificado en el momento pero sin que el usuario lo hubiera visto en uso real todavía.
- 2026-08-07 (mismo día): el usuario reportó en producción/dev que se veía peor que el original — cuadro en blanco antes de cada foto y texto que desaparecía después del primer cambio y no volvía. Pidió además un efecto de "libro que se abre" al hacer clic. Se diagnosticó la causa raíz de ambos bugs (ver arriba) y se reescribió la transición con `clip-path` en vez de 3D, se corrigió el z-index del texto, y se agregó el clic para avanzar manualmente. Verificado que ambos bugs ya no ocurren y que el nuevo efecto cumple lo pedido.
