---
id: 076
title: "Fix: no se podía dar de alta un color/talla con 0 existencias (se perdía en silencio)"
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

Durante el conteo físico (tarea 075) el usuario encontró combinaciones de producto+color que no estaban en el catálogo del sistema. Las dio de alta desde `/admin/productos/:id` con 0 en existencias (todavía no tiene unidades, pero quiere que la combinación exista para poder compararla contra el conteo físico) — pero después no aparecían ni en `/admin/inventario` ni en la pantalla de conteo.

Causa: `insertVariantsAndImages` (usada tanto al crear como al editar un producto) descartaba cualquier talla con `stock === 0` antes de guardar en `product_variants` — sin importar si tenía SKU cargado o no. El formulario (`ProductForm`) siempre manda las 4 tallas de cada color en cada guardado (aunque el admin no las haya tocado), así que ese filtro existía para no llenar la base de tallas "vacías" que el admin nunca quiso ofrecer. Pero como efecto secundario, **no había ninguna forma de dar de alta a propósito una talla real con 0 existencias** — se guardaba el producto sin errores, pero esa talla simplemente desaparecía, sin ningún aviso.

## Objetivo

Una talla se guarda si tiene stock > 0, **o si tiene un SKU cargado** (aunque el stock esté en 0) — así el admin puede dar de alta un color/talla real que existe pero todavía no tiene unidades, con solo escribirle su SKU.

## Archivos involucrados

- `app/lib/admin-catalog.server.ts`: `insertVariantsAndImages` — el filtro pasó de `s.stock > 0` a `s.stock > 0 || Boolean(s.modelo?.trim())`.
- `app/components/admin/ProductForm.tsx`: se agregó una nota de ayuda debajo de los campos de talla/SKU explicando esta regla ("Una talla en 0 sin SKU no se guarda... para dar de alta un color/talla que existe pero todavía no tiene existencias, ponle su SKU aunque dejes el número en 0") — sin esto, la regla seguía siendo invisible para quien no lea el código.

## Restricciones específicas de esta tarea

- No se tocó el comportamiento para tallas sin SKU y sin stock — siguen sin guardarse, tal como ya funcionaba (evita llenar la base con las 3 tallas que el admin nunca quiso ofrecer para un color, solo porque el formulario las manda todas).
- No se agregó ningún checkbox ni campo nuevo — se aprovechó el campo de SKU que ya existía en el formulario como la señal de "esta talla sí existe, guárdala", en vez de rediseñar la UI.
- No afecta tallas que YA tenían stock > 0 — el comportamiento de esas es idéntico a antes.

## Criterios de aceptación

- [x] Una talla con SKU y stock 0 se guarda correctamente al editar un producto.
- [x] Una talla sin SKU y sin stock sigue sin guardarse (comportamiento previo intacto).
- [x] La talla guardada en 0 aparece en `/admin/inventario` y en `/admin/inventario/conteo` (ambas ya leen de `product_variants` sin filtrar por stock).
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no toca paleta, tipografía ni layout; el texto de ayuda agregado usa el mismo estilo (`text-muted`, tamaño pequeño) ya usado en otras notas de ayuda del mismo formulario.
- Regresiones encontradas: ninguna — se probó contra un producto real (guardado y restaurado a su estado original después) que las tallas con stock > 0 se comportan exactamente igual que antes.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Prueba de punta a punta contra la base real, con un producto real (ECLIPSE MESH SET), revertido al terminar:
  - Se agregó un color de prueba con 2 tallas: una con SKU y stock 0, otra sin SKU y sin stock.
  - Al guardar: solo la talla con SKU quedó en `product_variants` (confirmado vía `listInventory()`), con `stock: 0` — la otra no se guardó, tal como se esperaba.
  - Se restauró el producto a su estado original (mismos 3 colores de antes) y se confirmó que el color de prueba ya no aparece en `listInventory()`.

## Notas de progreso

- 2026-08-26/27: Encontrado al investigar por qué las combinaciones que el usuario "dio de alta sin existencia" no aparecían en el conteo físico (tarea 075) — no era un problema de la pantalla de conteo (que ya lee todo `product_variants` sin filtrar), sino que esas combinaciones nunca llegaron a guardarse en la base, en silencio, por este filtro.
