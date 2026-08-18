---
id: 057
title: "Excel de inventario: fecha usa hora de México, no UTC del servidor"
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

El usuario reportó que el archivo descargado traía fecha 18 de agosto siendo todavía 17 de agosto en México. Causa: Vercel corre los servidores en UTC, y dos lugares del código tomaban la fecha directamente del reloj del sistema sin fijar la zona horaria de México (UTC-6 todo el año, México eliminó el horario de verano en 2022). Cualquier descarga hecha después de las ~6pm hora de CDMX cae después de medianoche UTC, así que el servidor "ya está" en el día siguiente aunque en México no.

## Objetivo

Tanto el nombre del archivo descargado como la fecha/hora que aparece impresa dentro de la hoja ("Fecha de emisión: …") reflejan siempre la fecha/hora real de México, sin importar en qué zona horaria corra el servidor.

## Archivos involucrados

- `app/routes/admin.inventario.excel.tsx`: el nombre del archivo pasó de `new Date().toISOString().slice(0, 10)` (fecha UTC) a `new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City", year, month, day }).format(new Date())` (locale `en-CA` da formato `YYYY-MM-DD` directamente, ya en hora de México).
- `app/lib/admin-inventory-excel.server.ts`: el `Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeStyle: "short" })` de la fecha de emisión (tarea 053) ahora incluye `timeZone: "America/Mexico_City"` explícito — antes usaba la zona horaria default del proceso (UTC en Vercel, la del desarrollador en local, por eso no se había notado antes: las pruebas se corrieron en una máquina ya en hora de México).

## Restricciones específicas de esta tarea

- Zona horaria fija en código (`America/Mexico_City`), no configurable — la tienda opera solo en México, no hace falta soporte multi-zona.
- No se tocó el formato visual de la fecha (mismo estilo `dateStyle: "long", timeStyle: "short"` de la tarea 053), solo la zona horaria de referencia.

## Criterios de aceptación

- [x] El nombre del archivo descargado usa la fecha de México, no UTC.
- [x] La fecha/hora dentro de la hoja usa la fecha/hora de México, no UTC.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia datos ni formato visual, solo corrige la zona horaria de referencia.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Se simuló, con `TZ=UTC` y una fecha fija (`Date.UTC(2026, 7, 18, 4, 0, 0)` = 18 de agosto 04:00 UTC = 17 de agosto 22:00 hora de CDMX — el caso exacto que reportó el usuario), el cálculo de ambos valores:
  - Nombre de archivo con el código viejo (UTC): `2026-08-18` (incorrecto, un día adelantado).
  - Nombre de archivo con el código nuevo (México): `2026-08-17` (correcto).
  - Fecha/hora de la hoja con el código nuevo: "17 de agosto de 2026, 10:00 p.m." (correcto).
- `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-17: Tarea creada e implementada en la misma sesión, a partir del reporte del usuario ("porque tiene el nombre con fecha del 18 de agosto?"). Se identificó como bug de zona horaria del servidor, no algo pedido como feature nuevo.
