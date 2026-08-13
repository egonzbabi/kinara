---
id: 041
title: "Footer: columna Tienda con las mismas opciones que el menú"
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

El usuario pidió que la columna "Tienda" del pie de página tuviera las mismas opciones que el menú principal (`SiteNav.tsx`), en vez de su propia lista independiente ("Mujer", "Accesorios", "Novedades").

## Objetivo

La columna "Tienda" del footer muestra exactamente los mismos enlaces que el menú principal (Tienda, Top, Bottom, Legging, Chaqueta, Enterizo, Set, Accesorios), y ambos quedan sincronizados automáticamente a futuro — si se agrega/quita un tipo de producto del menú, el footer lo refleja sin tener que tocar dos archivos.

## Archivos involucrados

- `app/components/SiteNav.tsx` — se exporta la constante `LINKS` (antes privada al módulo).
- `app/components/SiteFooter.tsx` — la columna "Tienda" de `COLS` usa `LINKS` importado de `SiteNav` en vez de su propio arreglo hardcodeado.

## Restricciones específicas de esta tarea

- No se tocaron las columnas "Ayuda" ni "Marca" del footer — solo "Tienda".
- No se duplicó la lista: se reutiliza la misma fuente de datos (`LINKS` de `SiteNav`) para evitar que footer y menú se desincronicen en el futuro.

## Criterios de aceptación

- [x] La columna "Tienda" del footer muestra los mismos 8 enlaces que el menú principal, con los mismos destinos (`href`).
- [x] `npm run typecheck` pasa sin errores; sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no introduce ningún patrón nuevo, es una sincronización de copy/navegación puntual.
- Regresiones encontradas: ninguna — las demás columnas del footer no se tocaron.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Confirmado por JS (`document.querySelector('footer').querySelectorAll('a')`) que la columna Tienda tiene exactamente: Tienda (`/tienda`), Top (`/tienda?tipo=Top`), Bottom (`/tienda?tipo=Bottom`), Legging (`/tienda?tipo=Legging`), Chaqueta (`/tienda?tipo=Chaqueta`), Enterizo (`/tienda?tipo=Enterizo`), Set (`/tienda?tipo=Set`), Accesorios (`/tienda?cat=accesorios`) — idéntico al menú principal.
- Sin errores de consola.
- `npm run typecheck` limpio.

## Notas de progreso

- 2026-08-10: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario.
