---
id: 056
title: "Excel de inventario: pie de página solo con 'Página X' (sin total)"
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

La tarea 054 agregó el pie de página "Página X de Y" (`&CPágina &P de &N`). El usuario reportó que al imprimir desde Google Sheets sale "Página 1 de" sin el número total. Se investigó: el archivo generado tiene el código correcto según el estándar de Excel (`&N` = total de páginas), pero Google Sheets no calcula el total de páginas al importar un pie de página personalizado desde un `.xlsx` — es una limitación de Google Sheets, no un error del archivo (confirmado abriendo el `.xlsx` real y revisando el XML crudo: `<oddFooter>&amp;CPágina &amp;P de &amp;N</oddFooter>`, sintaxis correcta). No hay forma de que el archivo generado fuerce a Google Sheets a calcular ese total.

## Objetivo

El usuario decidió, dado que no tiene arreglo del lado del archivo, quitar el "de Y" y dejar solo "Página X" — así se ve consistente sin importar qué programa se use para imprimir.

## Archivos involucrados

- `app/lib/admin-inventory-excel.server.ts`: `sheet.headerFooter` cambia de `"&CPágina &P de &N"` a `"&CPágina &P"` (oddFooter y evenFooter).

## Restricciones específicas de esta tarea

- No se tocó nada más del archivo (bordes, formato de moneda, anchos, título, etc. de tareas 043–055).

## Criterios de aceptación

- [x] El pie de página impreso muestra solo "Página X" (sin "de Y").
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia la fuente de datos ni otras columnas/formato.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-17: Tarea creada tras confirmar con el usuario (vía pregunta directa) que el visor problemático era Google Sheets, y que Google Sheets no soporta el cálculo de `&N` al importar un `.xlsx` ajeno — se investigó con una búsqueda web que confirma que Google Sheets solo calcula el total de páginas cuando el campo se configura desde su propio editor de encabezados/pies, no al leerlo de un archivo importado. El usuario eligió quitar el total en vez de pedir que se imprima desde otro programa.
