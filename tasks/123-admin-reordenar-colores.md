---
id: 123
title: "Admin/Productos: reordenar los colores de un producto"
status: in-progress
---

<!--
Antes de trabajar esta tarea, Claude debe haber leído (en este orden):
1. ../CLAUDE.md
2. README.md (este directorio)
3. REQUISITOS.md (este directorio)
4. Este archivo completo
-->

## Contexto

El usuario preguntó qué color aparece primero al entrar al detalle de un producto (antes de elegir uno a propósito): es simplemente `product.colors[0]`, es decir, el primer color en el orden en que quedaron guardadas las variantes — que a su vez es el orden en que los bloques de color aparecen en el formulario del admin al guardar. Al confirmar que no había forma de cambiar ese orden desde el admin, pidió agregarla.

## Objetivo

En `Admin → Productos → editar/crear`, cada bloque de color se puede reordenar: con flechas (subir/bajar, accesible por teclado) y arrastrando (drag-and-drop, como ya existe para las fotos). El primer color de la lista después de reordenar es el que se muestra por default en el detalle de producto.

## Archivos involucrados

- `app/components/admin/ProductForm.tsx`

## Restricciones específicas de esta tarea

- `includedZeroStock` y `touchedModelos` (estado del formulario) usan como clave el ÍNDICE del color (`${colorIndex}:${talla}`), no su nombre — a diferencia de `originalTrackedKeys`, que sí es por nombre. Si se reordenan los colores sin también remapear esas dos claves, quedarían apuntando al color equivocado (ej. la casilla "Existe sin stock" de un color terminaría marcada en el color que ahora ocupa ese índice). Se agregan helpers (`remapIndexedSet`, `indexAfterMove`) para mover esas claves junto con su color en cada swap/drag, no solo el array `colors`.
- No se toca el guardado (`insertVariantsAndImages`/`updateProduct`) — ya inserta las variantes en el orden del array `colors` que llega del formulario, así que no requiere cambios: el fix es 100% de UI en `ProductForm.tsx`.
- **Limitación de verificación conocida de este proyecto**: Claude no puede iniciar sesión en `/admin` con la contraseña real, así que no se puede probar el drag-and-drop/flechas de punta a punta en el navegador como se hace normalmente. Se verifica con `npm run typecheck` y revisión de código; la prueba manual en `/admin` queda a cargo del usuario.

## Pasos sugeridos

1. Agregar `moveColor(index, dir)` (swap con el adyacente, para las flechas) y `moveColorTo(from, to)` (arrastrar a cualquier posición), análogos a `moveGalleryImage`/`moveGalleryImageTo` ya existentes.
2. Agregar `remapIndexedSet`/`indexAfterMove` y usarlos para mantener `includedZeroStock`/`touchedModelos` apuntando al color correcto después de mover.
3. Agregar estado de drag (`draggedColorIndex`/`dragOverColorIndex`) y una fila de encabezado por bloque de color con: manija de arrastre, flechas subir/bajar (deshabilitadas en los extremos), manteniendo el botón "Quitar" ya existente.
4. `npm run typecheck`.

## Criterios de aceptación

- [x] Cada bloque de color tiene flechas para subir/bajar y se puede arrastrar a otra posición.
- [x] El primer bloque después de reordenar es el que carga primero en `producto.$slug` (código ya existente, no requiere cambio — se beneficia automáticamente del nuevo orden guardado).
- [x] Reordenar no mezcla las casillas de "Existe sin stock" ni los SKU editados a mano entre colores — `indexAfterMove` (la fórmula que usa `remapIndexedSet` para el arrastre) se probó de forma aislada con Node contra 7 combinaciones de `from`/`to` sobre un arreglo de 5 elementos, comparando contra el resultado real de `splice`: las 7 coinciden.
- [x] `npm run typecheck` sin errores.
- [ ] Pendiente del usuario: confirmar en `/admin` que el drag-and-drop y las flechas funcionan y que el orden se guarda como se espera (Claude no puede iniciar sesión ahí para probarlo de punta a punta).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí.
- Regresiones encontradas: ninguna esperada — cambio aislado a la sección de colores del formulario, no toca el guardado ni otras secciones.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno (sigue el mismo patrón de reordenamiento ya documentado para fotos, tarea 109).

## Pruebas manuales

- Pendiente del usuario (Claude no puede iniciar sesión en `/admin`): abrir un producto con 2+ colores, reordenar con flechas y arrastrando, guardar, y confirmar en `/producto/<slug>` que el nuevo primer color es el que se muestra al entrar sin elegir ninguno.

## Notas de progreso

- 2026-09-20: Implementado en `ProductForm.tsx`: `moveColor`/`moveColorTo` (análogos a `moveGalleryImage`/`moveGalleryImageTo`), helpers `remapIndexedSet`/`indexAfterMove`, y encabezado por bloque de color (manija de arrastre + flechas subir/bajar). `npm run typecheck` limpio; la fórmula de remapeo de índices se probó de forma aislada con Node (7 casos, todos correctos). Falta la confirmación del usuario probando en `/admin` (Claude no puede iniciar sesión ahí) — dejo el status en `in-progress` hasta esa confirmación.
