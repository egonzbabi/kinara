---
id: 048
title: "Inventario: quitar la tarjeta 'Sin stock' y unificar el color de celdas sin talla"
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

El usuario preguntó qué significaba la tarjeta "Sin stock: 6" en `/admin/inventario` (tarea 044). Al investigar se confirmó que contaba solo combinaciones producto+color+talla que **existen como variante con 0 unidades** — no las que nunca se dieron de alta como variante (que se muestran como "—" en la matriz). El usuario dio un ejemplo real (DUO SPRINT SET, color Magenta, sin variante de talla S ni XL) y explicó que para él "0" y "—" significan lo mismo: esa talla no se puede vender, sin importar la razón. Se corrigió el conteo para unificarlos — pero después el usuario pidió directamente quitar la tarjeta por completo en vez de seguir ajustando el número.

## Objetivo

La tarjeta de resumen "Sin stock" ya no aparece en `/admin/inventario`. Se conserva, como mejora de la investigación previa, que las celdas de la matriz sin talla disponible ("—") se vean con el mismo tono de alerta (clay) que las celdas en 0 — es información real y correcta independientemente de si hay o no una tarjeta de resumen arriba.

## Archivos involucrados

- `app/routes/admin.inventario.tsx` — se quitó la tarjeta `StatCard label="Sin stock"` y su cálculo (`outOfStockCount`); la cuadrícula de resumen vuelve a 4 tarjetas (`sm:grid-cols-4`, antes 5 con `lg:grid-cols-5`); las celdas de la matriz sin talla disponible ahora comparten el mismo estilo (`bg-clay/10 text-clay`) que las celdas en 0, con un `title` explicando "Talla no disponible en este color" al pasar el cursor.

## Restricciones específicas de esta tarea

- El filtro desplegable "Sin stock" / "Con stock" / "Cualquier stock" (que opera sobre las filas reales del inventario, no sobre la matriz completa) se dejó igual — el usuario pidió quitar la tarjeta de resumen, no el filtro.
- No se tocó `listInventory()` ni el resto del backend — cambio acotado a la presentación en `/admin/inventario`.

## Criterios de aceptación

- [x] La tarjeta "Sin stock" ya no aparece en el resumen de `/admin/inventario`.
- [x] El resumen muestra 4 tarjetas (Productos, SKUs, Unidades en stock, Valor de inventario) sin huecos ni desalineación.
- [x] Las celdas "—" de la matriz (talla sin variante) se ven con el mismo tono de alerta que las celdas en 0.
- [x] `npm run typecheck` pasa sin errores; sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — cambio de presentación puntual, no rompe ningún patrón de datos existente.
- Regresiones encontradas: ninguna — se verificó que el resto de la página (buscador, filtros, Excel, imprimir) sigue funcionando igual.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Con una cuenta de admin desechable (creada y luego eliminada): confirmado que el resumen ahora muestra 4 tarjetas, sin "Sin stock".
- Confirmado visualmente que las celdas XL de NOVA TOP (sin variante en ese producto) se ven con el mismo tono clay que una celda en 0 estaría.
- Sin errores de consola. `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-15: Tarea creada e implementada en la misma sesión. Primero se corrigió el conteo de "Sin stock" para incluir tallas sin variante (a partir de un ejemplo real que dio el usuario, DUO SPRINT SET / Magenta), y luego, en el mismo hilo, el usuario pidió quitar la tarjeta directamente en vez de seguir ajustando el número — se dejó la mejora visual de la matriz (mismo color para "—" y "0") porque sigue siendo información correcta y útil sin necesidad de un número agregado arriba.
