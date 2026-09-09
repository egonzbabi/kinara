---
id: 096
title: "Hero: corazón más grande + fuente sofisticada (Bodoni Moda) para la frase grande, reemplaza a Syne"
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

El usuario pidió agrandar el corazón de la tarea 095 y cambiar la fuente de la frase grande de arriba ("Tu fuerza no tiene edad...", en Syne desde la tarea 094) por algo "sofisticado" — de nuevo pidiendo ver opciones en vivo antes de decidir, como en la tarea 095.

## Solución

- **Corazón**: de `h-[0.75em] w-[0.75em]` a `h-[1.15em] w-[1.15em]` (con el `align`/`margin` ajustados para que siga alineado con el texto) — notablemente más grande.
- **Comparativo de fuente**: se usó de nuevo la skill `ui-ux-pro-max` (dominio `typography`) para buscar opciones "sofisticadas, bold, editoriales, de lujo". Se instalaron temporalmente `Bodoni Moda`, `Playfair Display` y `Cormorant` y se renderizaron junto a la Syne actual, una debajo de otra, en vivo, con el mismo tamaño/peso para comparar en igualdad de condiciones.
- El usuario eligió **Bodoni Moda** (serif de altísimo contraste entre trazos gruesos y finos, el look "revista de moda" más dramático de las 4 opciones). Se actualizó el token `--font-accent` en `app/app.css` de Syne a Bodoni Moda, y se desinstalaron `@fontsource-variable/syne`, `@fontsource-variable/playfair-display` y `@fontsource-variable/cormorant` (ninguna quedó en uso).

## Archivos involucrados

- `app/app.css`: `--font-accent` ahora apunta a Bodoni Moda (antes Syne); import actualizado.
- `app/components/Hero.tsx`: tamaño del ícono de corazón; comentario de la frase grande actualizado.
- `package.json`/`package-lock.json`: `@fontsource-variable/syne` sale, `@fontsource-variable/bodoni-moda` entra (Playfair Display y Cormorant se instalaron y desinstalaron en la misma sesión, antes de commitear).

## Restricciones específicas de esta tarea

- `--font-accent` sigue siendo una fuente de acento acotada a esta frase puntual del hero — no se propaga a ningún otro componente ni reemplaza `--font-display` (Fraunces, usado en el resto del sitio, incluyendo "El mundo de las mujeres" en la misma sección).
- No quedan dependencias muertas: se verificó que Syne, Playfair Display y Cormorant no se usan en ningún otro lado antes de desinstalarlas.

## Criterios de aceptación

- [x] El corazón se ve notablemente más grande que en la tarea 095.
- [x] La frase grande ("Tu fuerza no tiene edad...") usa Bodoni Moda, no Syne.
- [x] "El mundo de las mujeres." sigue en Fraunces, sin cambios.
- [x] No quedan imports ni dependencias de Syne/Playfair Display/Cormorant.
- [x] Sin errores en consola.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — cambio visual puntual autorizado explícitamente por el usuario.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- En el navegador: comparativo de las 4 opciones visto en vivo (escritorio, 1440×1400) antes de decidir. Resultado final verificado en escritorio (1440×1100) y mobile (375×812) — corazón grande, Bodoni Moda en la frase superior, sin errores de consola.

## Notas de progreso

- 2026-09-09: Implementado en la misma sesión, a pedido explícito del usuario, con el mismo flujo de comparación en vivo de la tarea 095 (`AskUserQuestion` tras mostrar las 4 opciones renderizadas). Eligió Bodoni Moda.
