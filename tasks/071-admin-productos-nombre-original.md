---
id: 071
title: "Admin/Productos: mostrar el nombre original (slug/URL) debajo del nombre actual"
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

El usuario pidió agregar a la lista de `/admin/productos` el "nombre anterior o url" de cada producto — el mismo concepto que en el Excel de inventario (tarea 047) se llama "Nombre original" (el slug, que a veces conserva el nombre viejo si el producto se renombró después). Pidió explícitamente que no fuera una columna nueva, sino una segunda línea debajo del nombre actual, en gris más tenue.

## Objetivo

Cada fila de la tabla de `/admin/productos` muestra, debajo del nombre del producto, su slug en `font-mono` gris tenue (`text-muted`) — mismo estilo ya usado para el mismo dato en `/admin/inventario`.

## Archivos involucrados

- `app/routes/admin.productos.tsx`: se agregó `<p className="font-mono text-[12px] text-muted">{p.slug}</p>` justo debajo del nombre del producto (antes de los puntos de color). `AdminProductListItem.slug` ya existía en `admin-catalog.server.ts`, no hizo falta tocar la capa de datos.

## Restricciones específicas de esta tarea

- Se muestra siempre (no condicionado a que difiera del nombre actual) — mismo criterio ya usado en el resto del sitio para este mismo dato (Excel, PDF de inventario), donde el slug es información de referencia útil independientemente de si cambió o no.
- Mismo estilo visual ya aprobado (`font-mono text-[12px] text-muted`), sin paleta ni tipografía nueva.

## Criterios de aceptación

- [x] Cada fila muestra el slug debajo del nombre, en gris tenue.
- [x] No se agregó columna nueva a la tabla.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — reutiliza un estilo ya aprobado, sin cambios de diseño.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-19: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario (pidió primero una columna, luego corrigió a "mejor abajo del nombre con letra gris más tenue").
