---
id: 042
title: "Admin: sección de Inventario (tabla con fotos, imprimible y descargable)"
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

El usuario pidió una sección nueva en `/admin` para ver el inventario de productos con todos sus datos y fotos, en formato tabla, con opción de imprimir o descargar un archivo.

`/admin/productos` ya existe pero agrupa todo por producto (un renglón por producto, sin desglose de color/talla). Un inventario real necesita el detalle a nivel SKU (producto + color + talla), que es la unidad física que se cuenta/gestiona en una tienda de ropa — mismo criterio ya usado en la tabla de productos de un pedido (`/admin/pedidos`, tareas 027/039).

## Objetivo

Nueva página `/admin/inventario`, accesible desde el menú lateral, con una tabla (foto, producto, categoría/tipo, color, talla, SKU, stock, precio) — una fila por cada combinación producto+color+talla existente. Con buscador y filtro de categoría, botón para imprimir (usando el diálogo nativo del navegador, que permite "Guardar como PDF") y botón para descargar un CSV con los mismos datos.

## Archivos involucrados

- `app/lib/admin-catalog.server.ts` — nueva función `listInventory()` y tipo `InventoryRow`, una fila por SKU (reutiliza el mismo `SELECT`/`ProductRow` ya existente).
- `app/routes/admin.inventario.tsx` (nuevo) — tabla, buscador, filtro de categoría, botón "Imprimir" (`window.print()`) y botón "Descargar CSV" (genera el archivo en el navegador con `Blob` + link temporal, sin pedirle nada al servidor).
- `app/routes.ts` — registra `admin/inventario` dentro del layout de admin.
- `app/routes/admin.layout.tsx` — título de la página en el topbar.
- `app/components/admin/AdminSidebar.tsx` — nuevo link "Inventario" en el menú.
- `app/components/admin/AdminSidebar.tsx` / `AdminTopbar.tsx` — se les agregó `print:hidden`: necesario para que al imprimir desde `/admin/inventario` no salga el menú lateral ni la barra superior, solo la tabla — no cambia nada en pantalla normal (la clase `print:hidden` de Tailwind solo aplica bajo `@media print`).

## Restricciones específicas de esta tarea

- No se tocó `/admin/productos` ni su función `listAdminProducts` — el inventario es una vista nueva e independiente, no un reemplazo.
- La descarga de CSV es 100% del lado del cliente (no hay endpoint nuevo ni llamada a Supabase adicional) — usa los mismos datos ya cargados y filtrados en pantalla, incluye BOM UTF-8 para que Excel abra bien acentos/ñ.
- El CSV escapa comillas/comas/saltos de línea correctamente en cada celda.
- El cambio de `print:hidden` en `AdminSidebar`/`AdminTopbar` es invisible en pantalla (solo aplica al medio `print`) — no se cambió nada del diseño visual normal de ninguna otra página de admin.

## Criterios de aceptación

- [x] `/admin/inventario` muestra una tabla con foto, producto, categoría/tipo, color, talla, SKU, stock y precio — una fila por combinación color+talla real.
- [x] Buscador (por nombre, color o SKU) y filtro de categoría funcionan sobre la tabla.
- [x] Botón "Descargar CSV" genera un archivo sin errores, respetando los filtros activos.
- [x] Botón "Imprimir" dispara el diálogo de impresión nativo; el menú lateral y la barra superior quedan ocultos en la vista de impresión (verificado por clases `print:hidden` presentes en el DOM).
- [x] Nuevo link "Inventario" visible y funcional en el menú lateral de admin.
- [x] `npm run typecheck` pasa sin errores; sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — reutiliza el patrón ya establecido de "SKU = `product_variants.modelo`" (tareas 016/039/040) y el mismo `SELECT`/RLS de lectura ya usado en `admin-catalog.server.ts`, sin exponer nada nuevo a clientes no autenticados (`requireAdmin` protege la ruta y el loader).
- Regresiones encontradas: ninguna — se verificó que `/admin/productos` sigue funcionando igual.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (extiende patrones de datos/admin ya existentes).

## Pruebas manuales

- Con una cuenta de admin desechable (creada con `scripts/create-admin.ts`, eliminada al terminar): `/admin/inventario` cargó 481 artículos / 1173 unidades en stock, con foto real por color, SKU, stock y precio correctos para varios productos verificados a simple vista.
- Buscador: "NOVA" devolvió 24 filas (todas las combinaciones color+talla de ese producto); un término sin coincidencias mostró correctamente "No hay artículos que coincidan con los filtros" y el contador en 0.
- Botón "Descargar CSV": clic sin errores de consola ni de red.
- Confirmado por DOM que `<aside>` tiene la clase `print:hidden` y que existe el encabezado exclusivo de impresión ("Inventario · KINARA" + fecha) oculto en pantalla normal.
- `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-12: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario.
