---
id: 089
title: "Rediseño del hero: video como tarjeta flotante sobre fondo ambiental (sin barras de color)"
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

Con `object-contain` (tarea 088) el video ya no se recortaba, pero el resultado se veía como una solución técnica, no como un diseño: el video quedaba centrado con barras sólidas de color a los lados. El usuario pidió explícitamente rediseñar esa parte con criterio de marketing/UX profesional, buscando impacto visual — sin volver al recorte de la tarea 087/088 (perder cara o ropa).

## Objetivo

El hero se ve como una pieza diseñada a propósito, no como un video insertado a la fuerza en un espacio que no le queda: sin barras de color planas, sin recortar caras ni ropa, con jerarquía clara entre texto y video.

## Solución

Técnica ya usada por marcas como Apple o Spotify para el mismo problema (video/imagen vertical dentro de un marco horizontal): en vez de rellenar el espacio sobrante con un color sólido, se usa **el mismo video** como fondo ambiental.

- **Fondo**: una segunda copia del mismo `<video>`, agrandada (`scale-125`), desenfocada (`blur-2xl`) y oscurecida, en `object-cover` llenando todo el marco — le da color y movimiento reales al fondo (los tonos del video mismo) en vez de un bloque plano de marca. Tiene `aria-hidden` y `tabIndex={-1}` porque es puramente decorativo (el video con contenido real es el de la tarjeta nítida).
- **Primer plano**: el video nítido, con su `poster`, mostrado completo (sin recortar) — en mobile llena el marco como antes (`object-contain`); desde el punto de quiebre `md` se ancla como una tarjeta angosta a la derecha (`h-[86%]`, ancho automático según su propia proporción, esquinas redondeadas, sombra), dejando aire a la izquierda para el texto.
- El texto se recorta un poco de ancho en pantallas medianas/grandes (`md:max-w-lg`) para no competir con la tarjeta, y el degradado lateral se intensificó un poco en `md` para mantener buen contraste sobre el fondo desenfocado (que ahora tiene color variable, no un espresso plano).

## Archivos involucrados

- `app/components/Hero.tsx`: reescrito con los dos `<video>` (fondo ambiental + tarjeta nítida) y las clases responsivas descritas arriba.

## Restricciones específicas de esta tarea

- Ambos `<video>` cargan el mismo archivo (`HERO_COLLAGE.main.url`) — el navegador comparte la descarga (mismo recurso, no se duplica el peso de red), aunque sí se decodifican dos veces (costo de CPU/GPU aceptable para un clip corto y liviano como este).
- Se intentó agregar `fetchPriority="high"` al video nítido para priorizar su descarga, pero React (en su versión actual) marca esto como advertencia en consola para elementos `<video>` (el atributo solo está tipado/soportado oficialmente para `<img>`) — se quitó para no dejar ruido en consola; el beneficio era menor de cualquier forma, ya que el video ya no es el único elemento visual del hero.
- No se tocó la tipografía, paleta ni el texto/copy del hero — el cambio es puramente de composición visual del bloque de video, autorizado explícitamente por el usuario para esta tarea.

## Criterios de aceptación

- [x] No hay barras sólidas de color a los lados del video — el espacio se llena con una versión ambiental del mismo video.
- [x] El video nítido se ve completo (cara y ropa) tanto en mobile como en escritorio.
- [x] En escritorio, el video se ve como una tarjeta con esquinas redondeadas y sombra, no pegado a los bordes del bloque.
- [x] El texto se sigue leyendo con buen contraste, sin quedar tapado por la tarjeta.
- [x] Sin errores ni advertencias nuevas en consola.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — cambio de composición visual autorizado explícitamente por el usuario para esta tarea puntual; no se tocó paleta, tipografía ni copy.
- Regresiones encontradas: se detectó y corrigió en el camino un warning de consola (`fetchPriority` en `<video>`, no reconocido por React) que se había introducido en la tarea 088 — se quitó ese atributo.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- En el navegador: verificado en escritorio (1440×900) y mobile (375×812) — en escritorio se ve la tarjeta nítida a la derecha con sombra y esquinas redondeadas, fondo ambiental desenfocado con los propios tonos del video, texto legible a la izquierda sin superposición; en mobile el video nítido ocupa casi todo el ancho, con el fondo ambiental resolviendo el margen que sobra arriba.
- Confirmado por consola/DOM que el atributo `fetchpriority` ya no está presente en ningún `<video>` tras quitarlo.

## Notas de progreso

- 2026-09-09: Implementado en la misma sesión, a pedido explícito del usuario de rediseñar la composición del video con criterio profesional de marketing/UX, después de las tareas 087/088.
