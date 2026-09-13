---
id: 109
title: "Admin/Productos: arrastrar y soltar para reordenar fotos (sin borrar y volver a subir)"
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

A pedido explícito del usuario: "en la edición de los productos quiero poder mover el orden de las fotos sin tener que borrarlas y volver a cargarlas".

Ya existían controles de reordenar (flechas arriba/abajo debajo de cada foto, tarea 097) tanto para las fotos por color como para la galería genérica, y sí persistían correctamente al guardar (`ProductForm.tsx` → `colors_json`/`gallery_json` → `insertVariantsAndImages` en `admin-catalog.server.ts`, que escribe `position` según el índice del arreglo). El problema es de experiencia de uso: mover una foto varios lugares con flechas de a una posición a la vez es tedioso, y aparentemente no lo bastante evidente — de ahí que el flujo real terminara siendo borrar y volver a subir.

## Objetivo

El admin puede arrastrar una foto directamente a la posición donde la quiere, en una sola acción — sin tener que hacer clic repetido en flechas ni borrar/resubir nada.

## Archivos involucrados

- `app/components/admin/ProductForm.tsx` — grilla de fotos por color y galería genérica.

## Restricciones específicas de esta tarea

- El drag-and-drop nativo (HTML5) es un complemento, no un reemplazo de las flechas de `PhotoOrderControls` — no funciona en touch/mobile ni es accesible por teclado, así que las flechas se quedan intactas para esos casos.
- No se tocó cómo se guarda el orden (`colors_json`/`gallery_json` → `position` por índice) — ya funcionaba bien; el cambio es 100% de interacción en el cliente.
- `<img draggable={false}>` en cada foto — sin esto, el navegador arrastra la imagen misma (para copiarla/abrirla en otra pestaña) en vez de disparar el reordenamiento del contenedor.

## Criterios de aceptación

- [x] Cada foto (por color y de la galería genérica) se puede arrastrar y soltar sobre otra para moverse a esa posición exacta, en cualquier dirección (no solo intercambiar con la adyacente).
- [x] Feedback visual: la foto que se arrastra baja su opacidad; la foto sobre la que se suelta muestra un anillo mientras se arrastra encima.
- [x] Las flechas de `PhotoOrderControls` (arriba/abajo/quitar) siguen funcionando exactamente igual que antes — nada se quitó.
- [x] `npm run typecheck` limpio.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no aplica ningún requisito de datos nuevo; el guardado de `position` por índice de arreglo ya estaba cubierto por el comportamiento existente de `insertVariantsAndImages`, sin cambios.
- Regresiones encontradas: ninguna esperada — las funciones nuevas (`moveColorImageTo`, `moveGalleryImageTo`) son aditivas, no reemplazan `moveColorImage`/`moveGalleryImage` (que siguen alimentando las flechas).
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (mejora de interacción puntual).

## Pruebas manuales

- `npm run typecheck` limpio.
- **Pendiente de confirmación visual del usuario**: no fue posible probar el flujo end-to-end en el navegador porque requiere iniciar sesión de admin con contraseña real, algo que Claude tiene prohibido hacer por política de seguridad (nunca ingresa credenciales, ni siquiera las del propio usuario) — se verificó por revisión de código y tipos, siguiendo el mismo patrón ya probado de las flechas existentes (mismo estado `colors`/`gallery`, mismo mecanismo de guardado).

## Notas de progreso

- 2026-09-13: Implementado en la misma sesión que las tareas 100-108. El usuario debe probarlo en vivo (iniciar sesión de admin, editar un producto con varias fotos, arrastrar una a otra posición, guardar y confirmar que el orden nuevo persiste al recargar) — avisar si algo no se siente bien para ajustar.
