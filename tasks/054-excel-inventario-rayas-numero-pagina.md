---
id: 054
title: "Excel de inventario: rayas tenues en todos los renglones + número de página"
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

Sobre el Excel de `/admin/inventario` (tareas 043–053), el usuario pidió dos ajustes más de impresión: líneas tenues visibles en todos los renglones, y número de página en cada hoja impresa.

## Objetivo

- Todas las celdas (encabezado, filas de datos y la fila de total) tienen un borde delgado gris claro — se ve como una cuadrícula tenue tanto en pantalla como al imprimir, sin depender de que el visor tenga activadas las líneas de cuadrícula nativas de Excel (que no siempre se imprimen por defecto).
- El pie de cada página impresa muestra "Página X de Y", centrado.

## Archivos involucrados

- `app/lib/admin-inventory-excel.server.ts`:
  - `sheet.headerFooter = { oddFooter: "&CPágina &P de &N", evenFooter: "&CPágina &P de &N" }` — sintaxis de Excel para pie de página: `&C` centra, `&P` es el número de página actual, `&N` el total de páginas.
  - Después de armar todas las filas (incluida la de total), un bucle recorre de la fila 3 (encabezado) hasta la última fila y aplica un borde delgado (`thin`, color `#D9D9D9`) en los 4 lados de cada celda de cada columna.

## Restricciones específicas de esta tarea

- En las columnas combinadas por producto (Foto, SKU original, Producto, Nombre original, Tipo, Precio, Estado), el borde se aplica igual a todas las celdas del bloque combinado — Excel solo dibuja visualmente el marco exterior del bloque (no líneas falsas partiendo un dato que en realidad es uno solo), que es el comportamiento correcto: esas columnas no deben verse divididas por renglón porque su valor es el mismo para todo el bloque.
- El borde se aplica desde la fila 3 (encabezado) en adelante — las filas 1 y 2 (título y fecha de emisión) se dejan sin borde, son un banner, no una tabla.
- No se cambió la fuente de datos ni ninguna otra columna/ancho/alineación de tareas anteriores.

## Criterios de aceptación

- [x] Todas las celdas de datos y el encabezado tienen un borde delgado gris claro visible en los 4 lados.
- [x] El pie de página impreso muestra "Página X de Y".
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia la fuente de datos ni las columnas ya definidas.
- Regresiones encontradas: ninguna — se generó el Excel real de NOVA TOP y se confirmó el borde en una celda del encabezado, una celda no combinada (Talla) y dos celdas del mismo bloque combinado (Producto, filas 4 y 5), todas con el mismo borde tenue consistente.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Se generó el Excel de NOVA TOP y se leyó `sheet.headerFooter`: `oddFooter`/`evenFooter` = `"&CPágina &P de &N"`.
- Se confirmó el borde delgado gris (`FFD9D9D9`) en las 4 celdas revisadas (encabezado, Talla no combinada, Producto combinado en dos filas distintas del mismo bloque).
- `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-17: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario en dos mensajes seguidos (rayas tenues, luego número de página).
