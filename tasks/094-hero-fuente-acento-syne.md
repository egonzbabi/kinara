---
id: 094
title: "Hero: fuente de acento (Syne) para la frase grande, \"El mundo de las mujeres\" pasa a texto secundario más chico"
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

Tras invertir el orden del texto (tarea 093: frase corta arriba, titular grande abajo), el usuario pidió además invertir la jerarquía de tamaños — la frase de arriba ("Tu fuerza no tiene edad...") pasa a ser la más grande, con una tipografía "llamativa y moderna", y "El mundo de las mujeres" pasa a un tamaño más chico/secundario — y pidió explícitamente que fuera **una fuente distinta**, no solo un ajuste de peso/cursiva sobre Fraunces (la fuente de marca ya usada en todo el sitio).

## Objetivo

La frase "Tu fuerza no tiene edad. Tu mejor versión está por comenzar..." es ahora el elemento tipográfico dominante del hero, en una fuente sans moderna y de carácter marcado, distinta a Fraunces; "El mundo de las mujeres." queda como mensaje secundario, más discreto, en la fuente de marca de siempre (Fraunces, cursiva).

## Solución

- Se usó la skill `ui-ux-pro-max` (dominio `typography`) para buscar parejas tipográficas "modernas, llamativas, editoriales, de moda" — de las opciones, se descartaron las orientadas a otros rubros (gaming, tech, brutalist) y se eligió **Syne** (`Fashion Forward`: "fashion, avant-garde, creative, bold, artistic, edgy"), un sans-serif geométrico con letterforms distintivos, pensado para marcas de moda — encaja con el pedido de "moderno y llamativo" sin desentonar con el tono editorial/cálido de Kinara.
- Instalada como variable font auto-hospedada vía `@fontsource-variable/syne` (mismo patrón que Fraunces/Hanken Grotesk, sin bloquear el render — requisito de performance ya establecido, tarea 002).
- Nuevo token de tema `--font-accent` en `app/app.css` (junto a `--font-sans`/`--font-display` ya existentes) — Tailwind v4 genera la utilidad `font-accent` automáticamente a partir de ese token, igual que ya pasaba con `font-sans`/`font-display`.
- **Alcance deliberadamente acotado**: `--font-accent`/Syne se usa únicamente en la frase grande del hero de home — no reemplaza `--font-display` (Fraunces sigue siendo la fuente de encabezados de todo el sitio) ni se propaga a ningún otro componente. Es una fuente de acento puntual, no un cambio de identidad tipográfica de marca.
- `app/components/Hero.tsx`: la frase "Tu fuerza no tiene edad..." pasa a `font-accent`, tamaño grande (`clamp(30px,5.2vw,58px)`), `font-bold`; "El mundo de las mujeres." baja a un tamaño secundario (`clamp(20px,2.4vw,30px)`), sigue en `font-display italic` pero ya sin el salto de línea manual de 3 renglones (innecesario a este tamaño, ahora cabe en una sola línea con normal wrap).

## Archivos involucrados

- `package.json`/`package-lock.json`: nueva dependencia `@fontsource-variable/syne`.
- `app/app.css`: import de Syne + nuevo token `--font-accent`.
- `app/components/Hero.tsx`: tamaños/fuente de la frase grande y del `<h1>` secundario.

## Restricciones específicas de esta tarea

- No se tocó la tipografía de marca en ningún otro lugar del sitio (headers, productos, checkout, admin) — Syne vive exclusivamente en este texto puntual del hero de home.
- El `<h1>` semántico de la página sigue siendo "El mundo de las mujeres." (mensaje de marca, para SEO/estructura) aunque visualmente ya no sea el elemento más grande — la frase grande de arriba es un `<p>`, no compite por la jerarquía semántica de encabezado.
- Se descartaron las sugerencias de paleta/color de la skill (no aplican, la paleta sigue intocable) — solo se tomó la recomendación de tipografía.

## Criterios de aceptación

- [x] La frase "Tu fuerza no tiene edad..." se ve notablemente más grande que "El mundo de las mujeres." y en una fuente visualmente distinta (sans moderno vs. serif cursiva).
- [x] "El mundo de las mujeres." sigue en la fuente de marca (Fraunces, cursiva), ahora en tamaño secundario.
- [x] Ningún otro texto del sitio cambia de tipografía.
- [x] Sin errores en consola.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — cambio de tipografía autorizado explícitamente por el usuario para esta tarea puntual (pidió dos veces una fuente "llamativa" y luego "un font diferente"), acotado a este texto del hero; no se tocó la tipografía del resto del sitio.
- Regresiones encontradas: ninguna — se confirmó que mobile, el orden de la tarea 093 y el resto del hero (tarjeta de video, animaciones, `prefers-reduced-motion`) siguen intactos.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (fuente de acento puntual, no un estándar nuevo de marca).

## Pruebas manuales

- `npm run typecheck` limpio.
- En el navegador: escritorio (1440×1000) y mobile (375×812) — la frase grande en Syne bold contrasta claramente con "El mundo de las mujeres." en Fraunces italic más chico, sin romper el layout ni los botones.
- Confirmado sin errores de consola en una pestaña nueva.

## Notas de progreso

- 2026-09-09: Implementado en la misma sesión, a pedido explícito del usuario, inmediatamente después de la tarea 093. Se usó la skill `ui-ux-pro-max` para elegir la fuente de acento (Syne, pareja "Fashion Forward"), descartando las sugerencias no aplicables a la marca.
