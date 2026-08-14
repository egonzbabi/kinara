---
id: 044
title: "Rediseño de /admin/inventario: tarjetas de resumen + agrupado por producto"
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

El usuario pidió mejorar el diseño de `/admin/inventario` (tareas 042/043): "que se vea moderno con la mejor experiencia para el usuario y no una simple lista". La versión anterior era una tabla plana HTML con una fila por cada combinación producto+color+talla — con 481 SKUs reales en el catálogo, eso son 481 filas repitiendo el nombre del producto una y otra vez, muy poco escaneable.

Es un cambio visual/UX puntual autorizado explícitamente por el usuario para esta página de admin (no forma parte del sitio público cuyo diseño está bajo la regla de intocabilidad de `CLAUDE.md`).

Se consultó la skill `ui-ux-pro-max` (dominio `ux`) para patrones de tablas de datos densas: confirma que en mobile conviene layout de tarjetas en vez de tabla ancha, y que un dashboard debe llevar tarjetas KPI (4-6 máximo) arriba con headers pegajosos y hover de fila — se aplicó directamente a este rediseño.

## Objetivo

`/admin/inventario` se ve como un panel de inventario moderno:

1. Fila de tarjetas de resumen arriba (Productos, SKUs, Unidades en stock, Sin stock — esta última en color de alerta si hay algo en 0).
2. Filtros: buscador, tipo, y nuevo filtro de estado de stock (Cualquiera / Con stock / Sin stock).
3. En vez de una fila por SKU, cada producto es una tarjeta con su foto, nombre, slug, tipo, stock total y precio — y dentro, una matriz compacta Color × Talla (S/M/L/XL) con el stock de cada combinación (o "—" si esa talla no existe para ese color), con foto pequeña por color y el SKU visible al pasar el cursor (`title`).

## Archivos involucrados

- `app/routes/admin.inventario.tsx` — reescrito: `groupByProduct()` arma la estructura agrupada a partir de las mismas filas planas de `listInventory()` (sin tocar el backend/`admin-catalog.server.ts`); nuevo componente `StatCard`; nuevo filtro de estado de stock.

## Restricciones específicas de esta tarea

- No se tocó `listInventory()` ni `buildInventoryExcel()` (tareas 042/043) — el agrupado por producto se hace en el cliente, a partir de los mismos datos ya usados para el Excel/CSV anterior.
- Los botones "Descargar Excel" e "Imprimir" y la vista de impresión (`print:hidden`/encabezado exclusivo de impresión) se mantienen igual que en la tarea 042 — el Excel de la tarea 043 sigue reflejando los filtros activos en pantalla (search/kind), el nuevo filtro de stock no se envía al Excel porque es solo un filtro visual de esta pantalla (no se pidió que afecte la descarga).
- Se reutilizan únicamente tokens de diseño ya existentes de la marca (`font-display`, `bg-bone`, `text-clay`, `text-sage`, `text-muted`, `label`) — nada de paleta o tipografía nueva.

## Criterios de aceptación

- [x] Tarjetas de resumen (Productos, SKUs, Unidades en stock, Sin stock) arriba de la página, con la de "Sin stock" en color de alerta cuando hay artículos en 0.
- [x] Los productos aparecen agrupados en tarjetas (no una fila plana por SKU), con foto, nombre, slug, tipo, stock total y precio.
- [x] Cada tarjeta de producto muestra una matriz Color × Talla con el stock por combinación, foto pequeña por color, y "—" para tallas que ese color no tiene.
- [x] Buscador, filtro de tipo y nuevo filtro de estado de stock funcionan sobre la vista agrupada (verificado: "NOVA" → 2 productos; "Sin stock" → 6 SKUs, incluyendo los 2 productos borrador ya conocidos sin precio).
- [x] Se ve bien y sin overflow horizontal en mobile (375px) y desktop.
- [x] `npm run typecheck` pasa sin errores; sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no introduce ningún patrón nuevo de datos (reutiliza `InventoryRow` de la tarea 042 tal cual); es un cambio de presentación/UX puntual ya autorizado por el usuario.
- Regresiones encontradas: ninguna — se verificó que "Descargar Excel" e "Imprimir" siguen funcionando igual que en las tareas 042/043.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Con una cuenta de admin desechable (creada y luego eliminada): carga inicial con 38 productos / 481 SKUs / 1173 unidades / 6 sin stock.
- Buscador "NOVA": 2 productos (24 SKUs, 64 unidades), tarjetas correctas con matriz color×talla.
- Filtro "Sin stock": 6 SKUs, mostrando correctamente los 2 productos borrador ya documentados en `tasks/PRODUCCION.md` (NEWYORKLEGGIN, NEWYORK TOP) con su badge "Borrador" y celdas en 0 resaltadas.
- Verificado en desktop (1280px) y mobile (375px): sin overflow horizontal, tarjetas de resumen en grid 2×2 en mobile, filtros apilados verticalmente.
- Sin errores de consola en ningún punto.
- `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-13: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario ("mejorame el diseño... que se vea moderno... no una simple lista"). Se consultó la skill `ui-ux-pro-max` para validar el patrón de agrupado/tarjetas antes de implementar.
