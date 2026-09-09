---
id: 090
title: "Hero: crítica profesional del rediseño (089) y mejoras — motion, accesibilidad y acabado premium"
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

Con la tarjeta flotante (tarea 089) el hero ya no tenía barras de color ni recortaba nada, pero el usuario pidió explícitamente una crítica de diseño profesional adicional ("criticalo como diseñador profesional y mejoralo, quiero en verdad sorprender a mi cliente con el resultado"). Se usó la skill `ui-ux-pro-max` (dominio `ux`) para contrastar el hero actual contra reglas de accesibilidad/motion ya establecidas, filtrando explícitamente cualquier sugerencia de paleta/tipografía de la skill que entrara en conflicto con la marca ya aprobada (regla de `CLAUDE.md`: la skill se usa dentro del diseño aprobado, nunca para reemplazarlo).

### Hallazgos de la crítica

1. **Accesibilidad (severidad alta, real):** el autoplay de ambos `<video>` ignoraba por completo `prefers-reduced-motion` — un usuario con esa preferencia del sistema activada igual recibía movimiento automático continuo, sin alternativa.
2. **Fondo ambiental sin intención de marca:** el blur tomaba los tonos neutros/grises del estudio de foto del video, no los tonos cálidos de la marca (clay/espresso) — se veía como una solución técnica ("tapar el hueco"), no una decisión de diseño.
3. **Sin ningún momento de entrada:** todo aparecía de golpe al cargar, sin jerarquía temporal entre el video y el texto — se sentía estático/plano comparado con hero de marcas de referencia (Apple, Spotify) que sí usan una entrada sutil.
4. **CTA principal sin micro-interacción:** el botón "Comprar la colección" no comunicaba affordance más allá del cambio de color de fondo en hover.

## Objetivo

Corregir el gap de accesibilidad y añadir una capa de acabado (color grading de marca sobre el fondo, entrada de contenido escalonada y sutil, micro-interacción en el CTA) sin tocar paleta, tipografía, copy ni la estructura de composición ya aprobada en la tarea 089.

## Solución

- **`prefers-reduced-motion` respetado:** se lee una sola vez al montar (`window.matchMedia("(prefers-reduced-motion: reduce)").matches`, con `useEffect` para no romper SSR) y controla el `autoPlay` de ambos `<video>` — si el usuario prefiere menos movimiento, ninguno reproduce y cada uno cae a su `poster` estático. Las animaciones de entrada (ver abajo) también se saltan directamente al estado final para ese caso, en vez de quedar a medias.
- **Color grading de marca sobre el fondo ambiental:** capa `mix-blend-overlay` con un gradiente radial/diagonal en tonos clay/espresso sobre el video desenfocado — dejan pasar el detalle y movimiento reales del video pero tiñen el resultado hacia la paleta de marca en vez del gris neutro del estudio.
- **Resplandor cálido (glow) detrás de la tarjeta** (solo desde `md`, donde la tarjeta existe como elemento flotante): un óvalo `bg-clay/40` con `blur-[90px]`, le da profundidad y conecta visualmente la tarjeta con el fondo.
- **Entrada de contenido al cargar** (una sola vez, no en scroll — el hero ya está a la vista desde el primer frame): texto y tarjeta de video parten con opacidad 0 + leve desplazamiento/escala y transicionan a su estado final (`transition-all duration-700/900ms ease-out`) al montar, vía un flag `mounted` activado en el siguiente frame (`requestAnimationFrame`). Con `prefers-reduced-motion`, se salta directo al estado final sin transición.
- **Micro-interacción del CTA principal:** ícono de flecha SVG (no emoji) dentro del botón "Comprar la colección", que se desliza levemente a la derecha en `hover` (`group-hover:translate-x-1`, 200ms) — es decorativo/secundario (el botón ya es clicable y accesible sin pasar el mouse), no un requisito para completar la acción.
- **Hover sutil en la tarjeta de video** (desktop, `md:hover:scale-[1.015]`) — refuerzo decorativo de que es un elemento "vivo", sin desplazar layout ni depender de esto para ninguna acción.

## Archivos involucrados

- `app/components/Hero.tsx`: se agregó estado `mounted`/`reducedMotion`, el gating de `autoPlay` en ambos `<video>`, la capa de color grading y el glow detrás de la tarjeta, las clases de entrada con transición en el bloque de texto y en la tarjeta de video, y el ícono SVG de flecha dentro del CTA principal.

## Restricciones específicas de esta tarea

- No se tocó paleta, tipografía, copy ni la composición general (fondo ambiental + tarjeta flotante) ya aprobada en la tarea 089 — todo lo agregado es motion/accesibilidad/acabado sobre esa misma estructura.
- Las sugerencias de paleta/tipografía que trajo la skill `ui-ux-pro-max` (ej. negro+dorado, otras familias tipográficas) se descartaron por completo — se usó solo su guía de motion/accesibilidad (`prefers-reduced-motion`, duración de micro-interacciones, "no depender de hover para acciones primarias").
- Las animaciones de entrada duran 700–900ms (más que el rango de 150–300ms recomendado para micro-interacciones) de forma deliberada: es un evento único de carga de página, no una micro-interacción repetida — el propio hero de referencia (Apple/Spotify) usa duraciones similares para estos momentos de entrada.
- Se re-verificó que `fetchpriority` siga ausente de ambos `<video>` (ya se había quitado en la tarea 089) — un `read_console_messages` sobre una pestaña que llevaba varias recargas seguía reportando ese warning; se confirmó con `document.querySelectorAll('video')...getAttribute('fetchpriority')` (devolvió `null` en ambos) y con una pestaña nueva (sin warnings) que era un buffer de consola obsoleto de la herramienta de navegador, no una regresión real.

## Criterios de aceptación

- [x] Con `prefers-reduced-motion: reduce` activado, ningún video reproduce automáticamente (se ve el `poster` estático) y el contenido aparece directo en su estado final, sin animación de entrada.
- [x] Sin esa preferencia activada, el video autoplay funciona igual que antes (tarea 089).
- [x] El fondo ambiental se ve con tinte cálido de marca (clay/espresso), no gris neutro de estudio.
- [x] Al cargar la página, el texto y la tarjeta de video entran con una transición sutil (opacidad + desplazamiento/escala), una sola vez.
- [x] El botón "Comprar la colección" muestra un ícono de flecha que se desliza levemente en hover.
- [x] Sin errores ni warnings nuevos en consola (verificado en pestaña nueva, sin buffer obsoleto).
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — cambio de motion/accesibilidad/acabado autorizado explícitamente por el usuario para esta tarea puntual; no se tocó paleta, tipografía ni copy.
- Regresiones encontradas: ninguna — la composición de la tarea 089 (fondo ambiental + tarjeta flotante, comportamiento mobile/desktop) se mantiene intacta; se confirmó que `fetchpriority` sigue ausente.
- Requisitos nuevos agregados a `REQUISITOS.md`: se agrega el respeto a `prefers-reduced-motion` en cualquier elemento con autoplay/animación como estándar general del sitio (origen: tarea 090), ya que hasta ahora no estaba explícito como checklist.

## Pruebas manuales

- `npm run typecheck` limpio.
- En el navegador: verificado en escritorio (1440×900) — resplandor clay detrás de la tarjeta visible, ícono de flecha en el CTA principal, texto legible, estado final de la animación de entrada correcto.
- Verificado en mobile (375×812) — video nítido ocupa el ancho, tinte cálido de marca visible en el margen superior, texto y botones legibles sobre el scrim.
- Confirmado en una pestaña nueva (sin buffer de consola obsoleto) que no hay errores ni warnings.
- Confirmado por DOM (`getAttribute('fetchpriority')` → `null` en ambos `<video>`) que ese atributo sigue ausente.

## Notas de progreso

- 2026-09-09: Implementado en la misma sesión, a pedido explícito del usuario de una crítica de diseño profesional sobre el rediseño de la tarea 089, usando la skill `ui-ux-pro-max` (dominio `ux`) como insumo de motion/accesibilidad — filtrando sus sugerencias de paleta/tipografía por no aplicar al diseño ya aprobado.
