---
id: 052
title: "Excel de inventario: alinear los títulos arriba, con la foto"
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

Después de las tareas 050/051 (foto de tamaño fijo, anclada cerca del borde superior de su bloque), el texto de las columnas combinadas por producto (SKU original, Producto, Nombre original, Tipo, Precio, Estado) seguía centrado verticalmente (`vertical: "middle"`) dentro del bloque. En productos con muchos colores/tallas (bloques altos), eso dejaba el texto muy por debajo de la foto, que está arriba — se veían desalineados. El usuario pidió alinear los títulos con la foto, arriba.

De paso, el usuario preguntó por qué SOFT FLARE PANTS y ALLURE LEG PANTS se ven con la misma foto — se investigó descargando y comparando ambas imágenes (URLs distintas, archivos con distinto tamaño/hash) y resultó ser la misma foto de stock de proveedor (mismo modelo, pose y encuadre) subida para dos productos distintos — un tema de contenido/catálogo, no un bug de código. Ver nota abajo.

## Objetivo

El texto de SKU original, Producto, Nombre original, Tipo, Precio y Estado se alinea arriba (`vertical: "top"`) en vez de al centro, para quedar visualmente a la altura de la foto (que también está anclada cerca de arriba desde la tarea 051).

## Archivos involucrados

- `app/lib/admin-inventory-excel.server.ts` — nuevas constantes `topCenter`/`topLeft` (antes `middleCenter`/`middleLeft` para estas columnas); se aplican a B (SKU original), C (Producto), D (Nombre original), E (Tipo), F (Precio) y L (Estado). La columna Color (G), que se combina en bloques más chicos (por color, no por todo el producto), se dejó centrada — no tenía el mismo problema de desalineación.

## Restricciones específicas de esta tarea

- No se tocó el tamaño ni la posición de la foto (tareas 050/051) — solo la alineación vertical del texto.
- El hallazgo de la foto duplicada entre SOFT FLARE PANTS y ALLURE LEG PANTS no se "corrige" en código — es contenido real del catálogo (dos productos con la misma foto de proveedor) que le corresponde resolver al usuario/equipo de catálogo, subiendo una foto propia para alguno de los dos.

## Criterios de aceptación

- [x] El texto de SKU original, Producto, Nombre original, Tipo, Precio y Estado queda alineado arriba en su bloque combinado, coincidiendo con la posición de la foto.
- [x] La columna Color conserva su alineación centrada (dentro de su propio sub-bloque, más chico).
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia la fuente de datos ni el tamaño/posición de la foto de las tareas 050/051.
- Regresiones encontradas: ninguna — se generó el Excel real de NOVA TOP y se confirmó que las 6 columnas ahora tienen `vertical: "top"`.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Se generó el Excel de NOVA TOP y se leyó la alineación de cada celda combinada (B, C, D, E, F, L): las 6 confirmaron `vertical: "top"` (antes `"middle"`).
- Se investigó la pregunta sobre SOFT FLARE PANTS / ALLURE LEG PANTS: se confirmó que usan URLs de foto distintas (carpetas de Storage distintas, archivos con distinto tamaño y hash MD5), pero al descargar y ver ambas imágenes, resultaron ser la misma foto de stock de proveedor (mismo modelo/pose/encuadre) — no un bug de selección de foto en el código, sino contenido de catálogo duplicado entre dos productos.
- `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-15: Tarea creada e implementada en la misma sesión. Se dejó documentado el hallazgo de la foto compartida entre SOFT FLARE PANTS y ALLURE LEG PANTS como un pendiente de catálogo (no de código) — conviene agregarlo a `tasks/PRODUCCION.md` si el usuario confirma que quiere reemplazar una de las dos fotos.
