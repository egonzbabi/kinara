---
id: 078
title: "Bloquear existencias: solo se cambian desde Movimientos, no al editar el producto"
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

Después de corregir 11 diferencias de stock encontradas al comparar contra el Excel original de inventario, el usuario pidió que el inventario quede "bloqueado" — que ya no se pueda modificar el número de existencias editando un producto en `/admin/productos/:id`, y que el único camino para cambiar stock sea `/admin/inventario/movimientos` (entradas/salidas con fecha y concepto, tarea 064). El objetivo es evitar errores: que alguien edite el precio o una foto de un producto y sin querer cambie (o el formulario reenvíe) un número de existencias desactualizado.

## Objetivo

Editar un producto ya existente nunca cambia su stock, sin importar qué número traiga el formulario al guardar — el stock real siempre se preserva del que ya había en la base. Crear un producto nuevo sigue permitiendo capturar el stock inicial con libertad (no hay nada que preservar todavía).

## Archivos involucrados

- `app/lib/admin-catalog.server.ts`:
  - `insertVariantsAndImages` ahora acepta un `preserveStock?: Map<string, number>` opcional — cuando se pasa, el stock de cada talla se toma de ahí (el real, ya guardado), **ignorando por completo** el número que venga en `input`. Una talla que no estaba en ese mapa (o sea, nueva) siempre arranca en 0.
  - `updateProduct` ahora lee el stock real de `product_variants` (color+talla → stock) **antes** de borrar las variantes viejas, arma ese mapa, y se lo pasa a `insertVariantsAndImages`. `createProduct` no cambia — no pasa `preserveStock`, así que un producto nuevo sí usa el stock que traiga el formulario.
  - Este bloqueo es a nivel de servidor, no solo de UI: aunque alguien mande una petición manipulada con otro número de stock, se ignora igual.
- `app/components/admin/ProductForm.tsx`: el campo numérico de existencias de cada talla ahora se deshabilita (`disabled`) cuando se está **editando** un producto ya existente (no al crear uno nuevo) — con un tooltip explicando por qué, fondo distinto para que se note que está bloqueado, y una nota debajo con link directo a Movimientos.

## Restricciones específicas de esta tarea

- El bloqueo aplica solo a **editar** (`updateProduct`) — crear un producto nuevo (`createProduct`) sigue permitiendo cargar el stock inicial libremente, porque ahí no hay ningún stock real previo que proteger.
- Dar de alta una talla nueva (con el checkbox "Existe sin stock", tarea 077) sigue funcionando igual — simplemente esa talla nueva siempre arranca en 0 (nunca tenía stock que preservar), y su stock real se carga después desde Movimientos, como cualquier otra entrada.
- No se tocó el mecanismo de Movimientos en sí (`register_inventory_movement`) — sigue siendo el único camino real para cambiar existencias, ahora reforzado porque el otro camino (editar producto) ya no puede.
- El checkout (`decrement_variant_stock`) tampoco se tocó — sigue bajando stock directo por su propio RPC atómico, es un mecanismo aparte y ya correcto.

## Criterios de aceptación

- [x] Editar un producto y guardar, sin tocar Movimientos, nunca cambia el stock de ninguna talla existente — aunque el formulario mande otro número.
- [x] Una talla nueva agregada al editar un producto siempre queda en 0, sin importar qué número traiga.
- [x] Crear un producto nuevo sigue permitiendo capturar el stock inicial normalmente.
- [x] El campo de existencias se ve deshabilitado en el formulario al editar un producto ya existente, con una nota que dirige a Movimientos.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — el campo deshabilitado reutiliza `bg-sand`/`text-muted`, ya usados en el sitio para estados inactivos; no se tocó paleta ni layout.
- Regresiones encontradas: ninguna — se probó contra un producto real (revertido al terminar) que el resto del guardado (nombre, precio, fotos, SKU, colores) sigue funcionando igual.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (regla operativa interna de admin).

## Pruebas manuales

- `npm run typecheck` limpio.
- Prueba de punta a punta contra la base real (producto real, revertido al terminar):
  - Se llamó `updateProduct` con un stock manipulado (9999) para una talla que ya tenía 2 unidades reales → el stock en la base siguió en 2, sin cambiar.
  - Se agregó un color/talla nueva con SKU y stock manipulado (777) → quedó guardada con stock 0, no 777.
  - Se restauró el producto a su estado original → el color de prueba desapareció y el stock de la talla real volvió a coincidir exactamente con el valor previo.

## Notas de progreso

- 2026-08-27: Implementado en la misma sesión, inmediatamente después de corregir 11 diferencias de stock contra el Excel original — el usuario pidió bloquear el inventario "porque esa debe ser la base desde donde partimos para lo demás", para que esas correcciones no se puedan perder por un edit accidental futuro.
