---
id: 039
title: "Cambiar la etiqueta 'Modelo' por 'SKU' en el admin"
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

El usuario pidió cambiar todo lo que dice "Modelo" por "SKU". Se interpretó como el texto visible en pantalla (etiquetas, encabezados, placeholders) — no el nombre interno del campo en la base de datos ni en el código (`product_variants.modelo`, `OrderItem.modelo`, funciones como `modeloColorCode`/`guessModeloBase`), ya que renombrar la columna real implicaría una migración de esquema y tocar múltiples archivos (Stripe metadata, correos, checkout, tipos generados de Supabase) sin que el usuario lo haya pedido — el cambio se limitó a lo que el usuario ve en pantalla.

"Modelo" solo aparecía en dos pantallas de `/admin` (nunca se le mostraba a un cliente):

- `/admin/productos/:id` (`ProductForm.tsx`): encabezado de sección, texto de ayuda, placeholder y `title` del input de código por talla.
- `/admin/pedidos` (detalle de pedido expandido): encabezado de columna de la tabla de productos.

## Objetivo

En toda pantalla de `/admin` donde antes decía "Modelo" (o "modelo" en placeholder/ayuda), ahora dice "SKU". El campo interno (`modelo` en la base de datos, tipos, y toda la lógica de negocio) no cambia de nombre.

## Archivos involucrados

- `app/components/admin/ProductForm.tsx` — encabezado de sección ("Modelo" → "SKU"), texto de ayuda, `placeholder`/`title` del input por talla.
- `app/routes/admin.pedidos.tsx` — encabezado de columna de la tabla de productos del pedido.

## Restricciones específicas de esta tarea

- No se tocó ningún nombre de columna, tipo, función o variable interna (`modelo`, `modeloBase`, `updateModelo`, `guessModeloBase`, `modeloColorCode`, `OrderItem.modelo`) — solo el texto visible.
- No se tocó nada fuera de `/admin` — "modelo" no aparecía en ninguna pantalla pública (tienda, producto, checkout, correos).

## Criterios de aceptación

- [x] `/admin/productos/:id`: la sección muestra "SKU" como encabezado, en el texto de ayuda, y el input por talla tiene placeholder/title con "SKU".
- [x] `/admin/pedidos`: la columna de la tabla de productos del detalle de pedido dice "SKU".
- [x] El campo interno sigue llamándose `modelo` en base de datos y código — no se rompió nada de la lógica de negocio.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no introduce ningún patrón nuevo, es un cambio de copy puntual.
- Regresiones encontradas: ninguna — se verificó en el navegador (cuenta de admin desechable, luego eliminada) que ambas pantallas siguen funcionando y muestran "SKU" correctamente, incluyendo un pedido real con SKU cargado (`JV014-NEGRO-M`).
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Se creó una cuenta de admin desechable (`scripts/create-admin.ts`), se inició sesión, y se verificó por DOM (`document.querySelectorAll`) y visualmente que:
  - `/admin/productos/:id` muestra el encabezado "SKU", el texto de ayuda con "SKU", y el input por talla con `title="Código de SKU (código-color-talla)"`.
  - `/admin/pedidos`, al expandir un pedido, la tabla de productos muestra la columna "SKU" con su valor real.
- Se eliminó la cuenta de admin desechable al terminar.
- `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-10: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario.
