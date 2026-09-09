---
id: 097
title: "Admin/Productos: controles de reordenar fotos ya subidas, visibles y con mejor tamaño de clic"
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

El usuario pidió poder acomodar el orden de las fotos de producto después de subirlas. Al revisar el código, esa función **ya existía** (`moveColorImage`/`moveGalleryImage` en `ProductForm.tsx`, guardando `position` correctamente al guardar el producto — verificado en vivo: subir, reordenar, guardar, recargar y confirmar el orden en la base de datos, todo funcionó) — el problema real era que los controles (`↑ ↓ ✕` en texto plano, ~10px, sin fondo ni borde) eran casi imposibles de notar y de tocar, así que el usuario no sabía que existían.

## Objetivo

El reordenamiento de fotos ya subidas (tanto por color como en la galería genérica) es fácil de encontrar y de usar: botones visibles, con buen tamaño de clic y accesibles.

## Solución

- Nuevo componente compartido `PhotoOrderControls` en `ProductForm.tsx`: tres botones circulares (28×28px, antes ~10px de texto) con ícono SVG (flecha arriba, flecha abajo, X — antes glifos de texto `↑ ↓ ✕`), borde y fondo visibles, estado `disabled` claro (opacidad reducida) en los extremos, y `aria-label` descriptivo en cada uno (antes el único contenido accesible era el glifo mismo, sin texto real para lectores de pantalla — incumplía la regla de accesibilidad del proyecto de `aria-label` en botones de solo ícono).
- Se usa en los dos lugares que ya tenían esta función: "Fotos" por color y "Galería (fotos genéricas)" — mismo componente, sin duplicar el marcado.
- Se agregó una frase de ayuda visible ("usa las flechas debajo de cada foto para cambiar el orden") en ambas secciones, para que el control se note incluso antes de mirar las miniaturas de cerca.
- No se tocó la lógica de reordenar/guardar/quitar (`moveColorImage`, `moveGalleryImage`, `removeColorImage`, `handleGalleryImage`, etc.) — ya funcionaba correctamente, confirmado en vivo antes de tocar nada.

## Archivos involucrados

- `app/components/admin/ProductForm.tsx`: nuevo componente `PhotoOrderControls`; se reemplazan los botones de texto plano en ambas secciones de fotos; se agregan las frases de ayuda.

## Restricciones específicas de esta tarea

- Los botones quedan en 28×28px, no en el mínimo de 44×44px recomendado para touch — se documenta como excepción deliberada: la cuadrícula de miniaturas es densa (fotos de 64-96px) y un botón de 44px por control (3 por foto) no cabría sin rediseñar todo el layout de la galería; 28px ya es ~3× más grande que el original y usable con mouse (este panel es de escritorio en la práctica). Si en el futuro se usa mucho desde un celular, reconsiderar un layout distinto (ej. un modal de "reordenar fotos" a pantalla completa).
- No se cambió el comportamiento de guardado ni el esquema de `product_images`/`position` — la función ya era correcta.

## Criterios de aceptación

- [x] Cada foto ya subida (por color y en la galería genérica) muestra 3 botones circulares con ícono, visibles sin tener que buscar.
- [x] Cada botón tiene `aria-label` descriptivo.
- [x] El botón "subir" se deshabilita en la primera foto, "bajar" en la última (mismo comportamiento que antes).
- [x] Reordenar y guardar persiste el nuevo orden en `product_images.position` (verificado en vivo, ver Pruebas manuales).
- [x] Sin errores en consola.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no se tocó paleta ni tipografía; el ajuste es de tamaño/accesibilidad de controles ya existentes, dentro del estilo de marca (bone/clay/espresso ya usados en el resto del admin).
- Regresiones encontradas: ninguna — se verificó en vivo (con una cuenta de admin temporal, creada y borrada en esta misma sesión) que subir, reordenar con los nuevos botones, guardar y recargar preserva el orden correcto en la base de datos.
- Requisitos nuevos agregados a `REQUISITOS.md`: se agrega que los botones de solo ícono del admin deben llevar `aria-label` real (no solo el glifo/ícono como contenido) — ya era la regla general de accesibilidad del proyecto, pero no estaba explícita como checklist y este caso puntual la incumplía.

## Pruebas manuales

- `npm run typecheck` limpio.
- Verificado en vivo end-to-end con una cuenta de admin temporal (creada con `scripts/create-admin.ts`, borrada al terminar): en el producto `gzwlfygo` (color "Rosa", 10 fotos), se movió la primera foto a la segunda posición con el botón "bajar", se guardó el producto, y se confirmó directamente en Supabase (`product_images.position`) que el nuevo orden quedó guardado. Se repitió la prueba con los botones ya rediseñados (mismo resultado) y se restauró el orden original antes de cerrar la tarea.
- Confirmado sin errores de consola en una pestaña nueva.

## Notas de progreso

- 2026-09-09: Implementado en la misma sesión. Antes de escribir código se verificó en vivo que la función de reordenar YA existía y funcionaba (subir → reordenar → guardar → recargar → confirmar en DB) — el fix fue de descubribilidad/accesibilidad de los controles, no de lógica nueva.
