---
id: 065
title: "Admin/Productos: agregar columna SKU a la lista"
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

La lista de `/admin/productos` mostraba Producto/Precio/Categoría/Stock, pero no el SKU — para verlo había que entrar a editar el producto o ir a `/admin/inventario`.

## Objetivo

La lista de productos del admin muestra el SKU original (base, sin `-COLOR-TALLA`) de cada producto, y el buscador también encuentra productos por SKU.

## Archivos involucrados

- `app/lib/admin-catalog.server.ts`: `AdminProductListItem.baseSku` (nuevo campo) — calculado en `listAdminProducts()` igual que en `listInventory()`/el Excel (primera variante con `modelo` cargado, pasada por `baseSkuFrom`). Se importó `baseSkuFrom` de `./slug`.
- `app/routes/admin.productos.tsx`: nueva columna "SKU" en la tabla (entre Producto y Precio, en `font-mono` para que se lea como código, igual que el resto del sitio muestra SKUs); el filtro de búsqueda ahora también compara contra `baseSku` (mismo criterio ya usado en `/admin/inventario`); el placeholder del buscador pasa de "Buscar producto…" a "Buscar producto o SKU…".

## Restricciones específicas de esta tarea

- Reutiliza `baseSkuFrom`, ya usado en 3 lugares del código (inventario, Excel, PDF) — no se inventó una lógica nueva de derivar el SKU.
- Producto sin ninguna variante con `modelo` cargado muestra "—" en la columna (mismo criterio visual ya usado en la tabla para "Sin precio").

## Criterios de aceptación

- [x] La tabla de `/admin/productos` tiene una columna SKU con el SKU original de cada producto.
- [x] Buscar por SKU en el campo de búsqueda encuentra el producto.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia paleta/tipografía, solo agrega una columna con el mismo estilo ya usado (`font-mono` para SKUs, ya visto en `/admin/inventario` y `/admin/productos/:id`).
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Se generó `listAdminProducts()` contra el catálogo real: los 38 productos devuelven un `baseSku` correcto (ninguno vacío), verificado contra una muestra (NOVA TOP → 3322, JACKET FIT → JV001, etc.).
- En el navegador: `/admin/productos` redirige correctamente a login sin errores de consola (no se cuenta con credenciales de admin para ver la tabla renderizada en vivo).

## Notas de progreso

- 2026-08-19: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario, enviado mientras se subía la tarea anterior (064).
