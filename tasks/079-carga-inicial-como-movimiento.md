---
id: 079
title: "El stock inicial de un producto nuevo también queda registrado en Movimientos"
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

Tras bloquear el stock al editar un producto (tarea 078, forzando todo cambio posterior por `/admin/inventario/movimientos`), quedaba una pregunta abierta: ¿debería el stock **inicial** de un producto nuevo también pasar por Movimientos, o está bien que se capture directo en el formulario de creación? Se analizó contra la práctica de inventario perpetuo/ledger (la misma que ya sigue el resto del sistema): la regla es que el stock nunca debería tener un origen sin registro, ni siquiera el primero. Pero obligar a crear un movimiento por cada talla al dar de alta un producto nuevo (hasta 16 por producto) sería un retroceso de UX. La solución fue separar ambas cosas: la captura sigue siendo rápida en el formulario, pero al guardar se genera automáticamente el registro correspondiente en Movimientos.

## Objetivo

Crear un producto nuevo con stock en algunas tallas genera automáticamente, para cada una, un movimiento de tipo "Entrada" con concepto "Carga inicial de producto" — sin que el admin tenga que hacer nada extra. El formulario de creación no cambia (sigue siendo tan rápido como antes).

## Archivos involucrados

- `app/lib/admin-catalog.server.ts`:
  - `insertVariantsAndImages` ahora devuelve las filas de variantes que insertó (antes no devolvía nada).
  - `createProduct` ahora recibe un segundo parámetro `admin: { adminId, adminName }`. Después de crear las variantes, inserta directo en `inventory_movements` un registro de "entrada" por cada talla con stock > 0 (cantidad = stock inicial, concepto "Carga inicial de producto", fecha de hoy). Es un insert directo, no vía `register_inventory_movement` — esa función espera una variante que YA existe para bloquearla y ajustarla; aquí la variante se acaba de crear con el stock ya puesto, no hay nada que ajustar ni condición de carrera que proteger.
- `app/routes/admin.productos.nuevo.tsx`: captura `adminId`/`adminName` de `requireAdmin` (antes se descartaban) y los pasa a `createProduct`.

## Restricciones específicas de esta tarea

- Solo aplica a `createProduct` — `updateProduct` no registra movimientos por su cuenta (sigue exactamente igual que en la tarea 078: el stock ahí se preserva o arranca en 0, nunca se "crea" con un número nuevo).
- Una talla en 0 (aunque tenga SKU, ver tarea 076/077) no genera movimiento — no tiene sentido un "Entrada de 0 unidades".
- No se usó el RPC atómico `register_inventory_movement` a propósito: ese mecanismo existe para ajustar una variante que ya existe de forma segura ante escrituras concurrentes; en la creación no hay ninguna variante previa que proteger, así que un insert directo es más simple y igual de correcto.

## Criterios de aceptación

- [x] Crear un producto con tallas con stock genera un movimiento de "Entrada" por cada una, con el concepto "Carga inicial de producto".
- [x] El movimiento queda con la cantidad, fecha y admin correctos, y aparece en el historial de `/admin/inventario/movimientos`.
- [x] Una talla en 0 no genera ningún movimiento.
- [x] Editar un producto ya existente sigue sin generar movimientos por su cuenta (sin cambios respecto a la tarea 078).
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no toca UI pública ni de admin más allá de lo ya aprobado; el historial de Movimientos ya sabía mostrar cualquier tipo de "entrada", no hizo falta tocar esa pantalla.
- Regresiones encontradas: ninguna — se probó contra un producto de prueba real (creado y borrado por completo al terminar, incluyendo sus movimientos) que el flujo completo de creación sigue funcionando igual.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Prueba de punta a punta contra la base real: se creó un producto con color "Negro" y tallas S (stock 5) y M (stock 3) → se confirmaron 2 movimientos de "Entrada" en `inventory_movements`, con cantidad y `resulting_stock` correctos (5 y 3), concepto "Carga inicial de producto", y el admin correcto. Se borró el producto y sus movimientos al terminar — no queda nada de prueba en la base real.

## Notas de progreso

- 2026-08-27: Implementado en la misma sesión, después de que el usuario pidiera analizar si la carga inicial debía pasar por Movimientos también (siguiendo el mismo razonamiento de "ledger" ya validado contra prácticas de la industria) — confirmó "sí, hazlo" tras la propuesta de mantener el formulario rápido pero generar el registro automáticamente.
