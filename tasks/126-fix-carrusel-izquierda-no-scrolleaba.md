---
id: 126
title: "Fix: el carrusel de fotos a la izquierda no hacía scroll con muchas fotos"
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

El usuario reportó que en el detalle de producto, la columna de miniaturas de la izquierda (tarea 121) no se podía "mover para abajo" — con un producto de muchas fotos, no se veían todas y no había forma de hacer scroll para verlas.

## Objetivo

La columna de miniaturas queda del mismo alto que la foto principal y hace scroll vertical propio cuando tiene más fotos de las que caben ahí, en vez de crecer sin límite.

## Archivos involucrados

- `app/components/ProductGallery.tsx`

## Restricciones específicas de esta tarea

- Causa raíz real (no la que se sospechó primero): en un contenedor flex-row sin alto explícito, el alto del contenedor sale del hijo MÁS ALTO — con muchas fotos, la columna de miniaturas (aunque tuviera `overflow-y-auto`) terminaba siendo ese hijo más alto, así que el contenedor crecía a su tamaño Y estiraba también a la foto principal a esa misma altura (dejando un espacio en blanco enorme debajo de la foto). Agregar `min-h-0` a la columna (primer intento) no alcanza: eso solo afecta el encogimiento por flex-shrink en el eje principal, no el cálculo de alto "auto" del contenedor en el eje cruzado.
- Fix real: sacar la columna de miniaturas del flujo normal (`position: absolute; inset-y-0`) dentro de un contenedor `relative` — así el alto del contenedor lo decide solo la foto principal (el único hijo que queda en flujo normal), y la columna de miniaturas se ajusta a esa altura ya fija vía `inset-y-0` y scrollea dentro de ella. La foto principal necesita un margen izquierdo (`ml-[76px] md:ml-[92px]`, ancho de la columna + el gap que antes daba `gap-3`) ya que la miniatura ya no le "cede" espacio como hermano flex.

## Pasos sugeridos

1. Diagnosticar con `getBoundingClientRect()`/`scrollHeight` vs `clientHeight` en un producto con muchas fotos (14, `barra-elastica-fuerza`) para confirmar que el contenedor completo (no solo la columna) crecía a una altura absurda.
2. Reestructurar `ProductGallery.tsx`: contenedor `relative`, miniaturas `absolute inset-y-0 left-0`, foto principal con margen izquierdo fijo en vez de ser hermano flex.
3. Verificar con el mismo método (`scrollHeight > clientHeight` en la columna, altura del contenedor = altura de la foto principal) en: producto con muchas fotos (scroll debe funcionar), con pocas (5, sin cambios visuales), y sin fotos extra (sin columna, foto a ancho completo) — mobile y desktop.

## Criterios de aceptación

- [x] Con un producto de muchas fotos (14), la columna de miniaturas queda exactamente del alto de la foto principal y `scrollHeight > clientHeight` (se puede hacer scroll) — verificado además moviendo `scrollTop` y confirmando que cambia.
- [x] Ya no se estira la foto principal a una altura absurda — su alto vuelve a ser el que le corresponde por su propio aspect ratio (4:5).
- [x] Un producto con pocas fotos (5) y uno sin fotos extra (0, sin columna) se ven igual que antes — sin regresión.
- [x] Se ve bien en mobile (~375px) y desktop.
- [x] `npm run typecheck` sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí.
- Regresiones encontradas: ninguna — el cambio es puro CSS/estructura, no toca la lógica de qué foto se muestra ni el cambio de color (que sigue exclusivamente en las bolitas de la derecha, tarea 121).
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno.

## Pruebas manuales

- Verificado en el navegador (mobile y desktop) con `barra-elastica-fuerza` (14 fotos, antes rota), `lulu-top-2315` (5 fotos) y `chaqueta-fit` (0 fotos extra) — los tres casos correctos.

## Notas de progreso

- 2026-09-21: Primer intento (`min-h-0` en la columna) no resolvió el problema — verificado con medición real en el navegador que el contenedor seguía creciendo a la altura del contenido de la columna. Diagnosticado el mecanismo real (altura "auto" de un contenedor flex-row la determina el hijo más alto) y corregido sacando la columna del flujo normal con `position: absolute`. Verificado en los tres escenarios (muchas/pocas/ninguna foto extra), mobile y desktop.
