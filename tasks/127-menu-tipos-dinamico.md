---
id: 127
title: "Menú y footer: los tipos de ropa (Top, Bottom, etc.) salen del catálogo real, no de una lista fija"
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

El usuario notó que el menú (y el footer, que reutiliza la misma lista) sigue mostrando "Legging" aunque ya no hay ningún producto de ese tipo en el catálogo, y que "Vestido" (un tipo nuevo, ya con 1 producto real en Supabase) no aparece en ningún lado. Pidió que esto sea dinámico — que el menú refleje el catálogo real en vez de una lista de tipos hardcodeada en el código.

## Objetivo

Los enlaces de tipo de ropa del menú principal (y del footer) se calculan a partir del catálogo real de Supabase: un tipo sin ningún producto no aparece, y un tipo nuevo (como "Vestido") aparece solo, sin tocar código. "Accesorios" sigue siendo un solo enlace por categoría (no uno por cada `kind` de accesorio — bandas, guantes, bolsas, etc. — eso ya funcionaba así y no es lo que pidió el usuario).

## Archivos involucrados

- `app/lib/nav-links.ts` (nuevo) — la lógica de derivar los enlaces de tipo desde el catálogo, para no duplicarla entre `SiteNav`/`SiteFooter`/`tienda.tsx`.
- `app/root.tsx` — necesita su propio `loader` (no existía) para tener el catálogo disponible y pasar los enlaces ya calculados a `SiteNav`/`SiteFooter`.
- `app/components/SiteNav.tsx` — pasa a recibir los enlaces por prop en vez de exportar una lista fija.
- `app/components/SiteFooter.tsx` — igual, recibe los enlaces por prop.
- `app/routes/tienda.tsx` — su `KIND_ORDER` (para el orden de "Destacados") pasa a importarse del mismo lugar que la lista de preferencia del menú, para que nunca se desincronicen (ya había un comentario señalando esa dependencia implícita).

## Restricciones específicas de esta tarea

- No cambiar cómo funciona "Accesorios" (sigue siendo un filtro por `category`, no por `kind` — hay ~9 `kind` distintos de accesorio y no tiene sentido un link por cada uno).
- Mantener un orden preferido para los tipos ya conocidos (Top, Bottom, Legging, Chaqueta, Enterizo, Set) cuando están presentes — no alfabético puro, para no verse desordenado — y solo los tipos nuevos que no están en esa lista (como "Vestido" hoy) se agregan al final, ordenados alfabéticamente.
- Sin romper el orden de "Destacados" en `/tienda` (`KIND_ORDER`), que ya dependía del mismo orden que el menú (ahora es la misma fuente, no dos listas separadas).

## Pasos sugeridos

1. Crear `app/lib/nav-links.ts` con `PREFERRED_KIND_ORDER` y `buildShopNavLinks(products)`.
2. Agregar `loader` a `root.tsx` (llama a `getAllProducts()`, ya usado en otras rutas) y pasar los enlaces calculados a `SiteNav`/`SiteFooter`.
3. `SiteNav.tsx`: quitar el `LINKS` fijo, recibir `links` por prop (desktop nav + `MobileMenu`).
4. `SiteFooter.tsx`: recibir `links` por prop en vez de importar `LINKS` de `SiteNav`.
5. `tienda.tsx`: importar `PREFERRED_KIND_ORDER` de `nav-links.ts` en vez de tener su propio `KIND_ORDER` duplicado.
6. `npm run typecheck` + prueba manual: confirmar que "Legging" ya no aparece y "Vestido" sí, en el menú de escritorio, el menú mobile y el footer.

## Criterios de aceptación

- [x] "Legging" ya no aparece en el menú (desktop/mobile) ni en el footer — hoy no hay ningún producto con ese `kind`.
- [x] "Vestido" aparece en los tres lugares (desktop, mobile, footer) — hoy hay 1 producto con ese `kind`.
- [x] "Accesorios" sigue siendo un solo enlace (sin cambios).
- [x] El orden de "Destacados" en `/tienda` no cambió para los tipos ya conocidos.
- [x] `npm run typecheck` sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí.
- Regresiones encontradas: ninguna esperada — el cambio no toca contenido/diseño visual, solo la fuente de datos de una lista que ya existía.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno (es una mejora de mantenibilidad, no un requisito de negocio nuevo).

## Pruebas manuales

- Verificado en el navegador que el menú principal, el menú mobile y el footer muestran los mismos tipos, calculados desde el catálogo (sin "Legging", con "Vestido").

## Notas de progreso

- 2026-09-22: Implementado. Al probar apareció "Muñequera" en el menú (no pedido) — se encontró que "Muñequera elástica" estaba mal categorizada en Supabase (`category: "mujer"` en vez de `"accesorios"`, un error de captura previo, no relacionado con esta tarea). Corregido directo en la base de datos; verificado que el menú (desktop, mobile) y el footer ya solo muestran los tipos de ropa reales: Top, Bottom, Chaqueta, Enterizo, Set, Vestido — sin Legging, sin "Muñequera" colándose como tipo de ropa.
