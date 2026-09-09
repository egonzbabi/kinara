---
id: 085
title: "Permitir cargar el stock real al agregar un color/talla nueva a un producto existente"
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

El usuario reportó que, al agregar un color nuevo a un producto de talla única ya existente ("banda para cabello"), no podía escribirle las unidades — el campo aparecía bloqueado. Causa: la tarea 078 bloqueó el campo de existencias para **cualquier** talla al editar un producto ya existente, sin distinguir entre una talla que ya tenía stock real que proteger y una talla/color genuinamente nuevo que se agrega en esa misma edición y no tiene nada que proteger todavía.

## Objetivo

Al editar un producto: una talla que ya existía sigue bloqueada (solo se cambia por Movimientos, tarea 078 intacta). Una talla o color **nuevo**, agregado en esa misma edición, se puede cargar con su cantidad real directamente en el formulario — y esa carga queda igual de auditada, con su propio movimiento en el historial.

## Archivos involucrados

- `app/lib/admin-catalog.server.ts`:
  - `insertVariantsAndImages`: la talla se toma del formulario cuando su clave (`color|talla`) **no** está en `preserveStock` (es decir, nunca existió antes) — antes se forzaba a 0 siempre que se editaba un producto existente, sin importar si la talla era nueva o no. Cada fila ahora también trae `isNewVariant` (solo para el valor de retorno, no es columna real — se excluye antes del insert).
  - `updateProduct`: ahora recibe `admin: {adminId, adminName}` (igual que `createProduct`, tarea 079) y, tras guardar, registra un movimiento de "Entrada" (concepto "Carga inicial de color/talla nueva") por cada talla nueva que se guardó con stock > 0 — mismo criterio de auditoría completa que la carga inicial de un producto nuevo.
- `app/routes/admin.productos.$id.tsx`: pasa `adminId`/`adminName` (de `requireAdmin`, antes se descartaban) a `updateProduct`.
- `app/components/admin/ProductForm.tsx`:
  - Nuevo `originalTrackedKeys`: el conjunto de combinaciones `color|talla` que el producto YA tenía guardadas al abrir el formulario (calculado una sola vez, al montar).
  - El campo de existencias ahora se bloquea solo si esa combinación específica ya estaba en `originalTrackedKeys` (`isProtected`), no por el simple hecho de estar editando un producto existente — un color o talla nueva agregada en esta edición queda editable.
  - Nota de ayuda actualizada para explicar la distinción.

## Restricciones específicas de esta tarea

- La protección sigue siendo real del lado del servidor (no solo un campo deshabilitado en pantalla) — se verificó de nuevo contra la base real que una talla ya existente sigue sin poder manipularse aunque se mande otro número.
- Si el admin **renombra** un color ya existente (no agrega uno nuevo, cambia el nombre del que ya había), el sistema lo trata como "nuevo" (mismo comportamiento que ya tenía desde la tarea 078 por cómo se compara la clave `color|talla` por nombre) — no es un caso nuevo introducido aquí, ya era así.
- El concepto del movimiento automático para una talla nueva agregada al editar ("Carga inicial de color/talla nueva") es distinto al de un producto recién creado ("Carga inicial de producto", tarea 079) para poder distinguirlos en el historial.

## Criterios de aceptación

- [x] Agregar un color nuevo a un producto ya existente permite escribirle una cantidad de existencias real, y esa cantidad se guarda tal cual (no se fuerza a 0).
- [x] Esa carga queda registrada como un movimiento de "Entrada" en `/admin/inventario/movimientos`.
- [x] Una talla que YA existía sigue completamente bloqueada (ni el campo se puede editar, ni el servidor acepta un valor distinto aunque se fuerce).
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no se tocó paleta, tipografía ni layout; el mismo campo ya existente ahora solo cambia CUÁNDO se deshabilita.
- Regresiones encontradas: ninguna — se repitió la prueba de manipulación de la tarea 078 (mandar un stock distinto para una talla ya existente) contra la base real y se confirmó que se sigue ignorando correctamente.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Prueba de punta a punta contra un producto real (revertido por completo al terminar):
  - Se agregó un color nuevo con talla S y stock 7 → se guardó con stock 7 (no 0), y se generó su movimiento de "Carga inicial de color/talla nueva" en el historial (folio correcto).
  - Una talla ya existente del mismo producto (Rosa/S) no se movió.
  - Repetición de la prueba de manipulación de la tarea 078 (mandar 9999 para una talla ya existente): el stock real se mantuvo intacto, sin cambios.

## Notas de progreso

- 2026-09-08/09: Encontrado y corregido en la misma sesión, tras reportar el usuario que no podía cargar unidades al agregar un color nuevo a un producto de talla única ya existente ("banda para cabello").
