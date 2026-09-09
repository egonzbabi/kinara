---
id: 095
title: "Hero: corazón rojo al final de \"El mundo de las mujeres\" + comparativo de fuentes itálicas (se mantiene Fraunces)"
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

El usuario pidió agregar un corazón rojo al final de "El mundo de las mujeres" y ver opciones de una fuente itálica "más sofisticada" para ese texto (pidió explícitamente comparar antes de decidir, no solo que se implementara una).

## Solución

- **Corazón**: ícono SVG (no emoji, según la regla del proyecto de usar SVG en vez de emojis para íconos de UI) en rojo (`#e0303d`), alineado en línea con el texto, al final de "El mundo de las mujeres."
- **Comparativo de fuentes**: se usó la skill `ui-ux-pro-max` (dominio `typography`) para buscar opciones de serif itálica elegante/sofisticada. Se instalaron temporalmente 3 candidatas (`Playfair Display`, `Cormorant`, `Bodoni Moda`, todas vía Fontsource) y se renderizaron las 4 opciones (las 3 nuevas + la Fraunces actual) una debajo de otra, en vivo, para que el usuario las viera y comparara directamente en el navegador antes de decidir — en vez de solo describirlas por texto.
- El usuario eligió **mantener Fraunces** (la fuente de marca ya usada en todo el sitio). Se revirtió el código a un solo `<h1>` y se desinstalaron las 3 fuentes candidatas no elegidas (`@fontsource-variable/playfair-display`, `@fontsource-variable/cormorant`, `@fontsource-variable/bodoni-moda`) — no quedan como dependencias muertas.

## Archivos involucrados

- `app/components/Hero.tsx`: ícono de corazón SVG agregado al final del `<h1>`.
- `package.json`/`package-lock.json`: sin cambios netos (las 3 fuentes candidatas se instalaron y desinstalaron en la misma sesión, antes de commitear).

## Restricciones específicas de esta tarea

- No se dejó ninguna de las 3 fuentes candidatas instalada ni importada — el comparativo fue una herramienta de decisión en vivo, no un cambio a medias.
- El corazón es un color rojo puro (`#e0303d`), fuera de la paleta de marca ya aprobada — aceptable porque fue un pedido explícito y puntual del usuario para este elemento específico, no una reinterpretación de la paleta general.

## Criterios de aceptación

- [x] Aparece un corazón rojo (SVG, no emoji) al final de "El mundo de las mujeres."
- [x] La tipografía de esa frase sigue siendo Fraunces (decisión del usuario tras ver el comparativo).
- [x] No quedan dependencias ni imports de las fuentes candidatas no elegidas.
- [x] Sin errores en consola.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — cambio visual puntual autorizado explícitamente por el usuario.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- En el navegador: comparativo de las 4 opciones visto en vivo (escritorio, 1440×1000/1300) antes de decidir. Resultado final verificado en escritorio y mobile — corazón visible, sin errores de consola.

## Notas de progreso

- 2026-09-09: Implementado en la misma sesión. Se generó el comparativo en vivo (4 versiones del `<h1>` apiladas temporalmente) en vez de solo texto/descripciones, y se le preguntó al usuario cuál prefería (`AskUserQuestion`) — eligió Fraunces, la fuente ya usada en el sitio.
