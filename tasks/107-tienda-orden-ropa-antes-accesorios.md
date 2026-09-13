---
id: 107
title: "Tienda: orden por defecto — toda la ropa agrupada por tipo, accesorios al final"
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

A pedido explícito del usuario: en `/tienda` (con el orden "Destacados", el que se ve por defecto sin elegir nada en el selector "Ordenar"), la ropa debe salir toda antes que los accesorios, y la ropa debe agruparse por tipo (Top, Bottom, Legging, etc.) en vez de mezclarse.

Antes, "Destacados" solo ordenaba por `isBestseller` (best-sellers primero, el resto en el orden que vino de la base de datos) — sin ninguna agrupación por tipo ni por ropa/accesorio, así que un accesorio best-seller podía aparecer antes que una prenda.

## Objetivo

El orden por defecto de `/tienda` (sort = "destacados", el que se ve al entrar sin tocar el selector) muestra: toda la ropa agrupada por tipo (mismo orden que el menú principal — Top, Bottom, Legging, Chaqueta, Enterizo, Set) y, dentro de cada tipo, best-sellers primero; los accesorios siempre al final.

## Archivos involucrados

- `app/routes/tienda.tsx` — `KIND_ORDER` (nuevo) + el `case` `default` del `switch (sort)`.

## Restricciones específicas de esta tarea

- Solo se tocó el orden por defecto ("Destacados") — los otros 3 (Novedades, Precio: menor a mayor, Precio: mayor a menor) siguen siendo un orden global puro por esos criterios, sin agrupar por tipo/accesorio (el usuario pidió esto para "cuando muestres la colección", que es la vista por defecto — no para cuando el usuario elige explícitamente ordenar por precio, donde probablemente espere un orden de precio real, no interrumpido por categoría).
- `KIND_ORDER` reusa el mismo orden ya establecido en el menú principal (`SiteNav.tsx` → `LINKS`), no uno inventado aparte.
- Un producto con un `kind` que no está en `KIND_ORDER` (ej. "Muñequera", categoría `mujer` pero no es una prenda de las 6 listadas) cae al final de la ropa, antes de los accesorios reales (`category === "accesorios"`) — no rompe ni el orden de los tipos conocidos ni la regla de "accesorios al final".

## Criterios de aceptación

- [x] Con "Destacados" (por defecto, sin tocar el selector): las 39 prendas (Top 7, Bottom 9, Legging 6, Chaqueta 5, Enterizo 2, Set 10) aparecen antes que los 11 accesorios — verificado contando las tarjetas en el navegador.
- [x] Dentro de la ropa, el orden es exactamente Top → Bottom → Legging → Chaqueta → Enterizo → Set (mismo orden que `SiteNav.tsx` → `LINKS`).
- [x] Dentro de cada tipo, los best-sellers de ese tipo aparecen primero (se conserva el criterio original de "Destacados").
- [x] `npm run typecheck` limpio.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no aplica ningún requisito de datos/código existente a este cambio de orden puro en el cliente.
- Regresiones encontradas: ninguna — los demás sorts (Novedades, Precio asc/desc) no se tocaron.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (comportamiento de UI puntual, no un estándar de datos).

## Pruebas manuales

- Verificado por JS en el navegador (`textContent` de los `<h3>` de cada tarjeta, en orden) que la secuencia completa de 50 productos sigue exactamente Top(7)→Bottom(9)→Legging(6)→Chaqueta(5)→Enterizo(2)→Set(10)→Muñequera(1, kind desconocido)→accesorios(11).
- `npm run typecheck` limpio, sin errores de consola.

## Notas de progreso

- 2026-09-13: Completada en la misma sesión que las tareas 100-106.
