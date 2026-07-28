---
id: 021
title: "Menú principal y filtros de /tienda: quitar Hombre, tipos de producto"
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

El usuario pidió quitar "Hombre" del menú principal (todo el catálogo publicado es hoy categoría `mujer`, no hay productos `hombre` en vivo) y reemplazar el link genérico "Mujer" por accesos directos a los tipos de producto reales del catálogo.

## Objetivo

El menú principal (desktop y mobile) muestra: Tienda, Top, Bottom, Legging, Chaqueta, Enterizo, Set, Accesorios — usando el filtro `?tipo=` que ya existe en `/tienda`. Ya no aparece "Mujer" ni "Hombre".

## Archivos involucrados

- `app/components/SiteNav.tsx` — array `LINKS` (desktop + mobile menu comparten el mismo array).
- `app/routes/tienda.tsx` — quitó los chips de categoría (Todo/Mujer/Hombre/Accesorios), ahora redundantes con el menú principal; reajustó el espaciado entre el `<h1>` y la barra de filtros sticky.

## Restricciones específicas de esta tarea

- No se tocó la sección "Compra por categoría" de la home (`app/data/categories.ts`), que también menciona "Hombre" — señalado como posible follow-up, el usuario no lo pidió todavía.

## Pasos sugeridos

1. Confirmar con el usuario qué tipos de producto van en el menú (preguntado: se detectó que "Set", la categoría con más productos, no estaba en la lista inicial que dio el usuario — confirmó que sí quería incluirla).
2. Reemplazar el array `LINKS` en `SiteNav.tsx`.
3. Verificar en el navegador (desktop y mobile).

## Criterios de aceptación

- [x] El menú (desktop) muestra: Tienda, Top, Bottom, Legging, Chaqueta, Enterizo, Set, Accesorios.
- [x] El menú mobile muestra los mismos 8 links y cada uno navega a `/tienda?tipo=X` (o `?cat=accesorios`) y cierra el menú al hacer click.
- [x] `npm run typecheck` sin errores.
- [x] Verificado visualmente en desktop (1280px) y mobile (375px).
- [x] `/tienda` ya no muestra los chips de categoría (Todo/Mujer/Hombre/Accesorios), redundantes con el menú principal — el filtro `cat` sigue funcionando vía URL (linkeado desde "Accesorios" en el menú) y "Limpiar filtros" lo resetea igual.
- [x] La barra de filtros (Talla/Tipo/Color/Ordenar) quedó con suficiente espacio respecto al `<h1>` del título — ya no se ve pegada/a la misma altura.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí, no aplica ningún punto en conflicto.
- Regresiones encontradas: sí, una — **no introducida por este cambio, pre-existente**: el menú mobile (`MobileMenu`) vivía dentro del `<header>`, y `<header>` tiene `backdrop-blur-md` (un `backdrop-filter`). Por regla de CSS, cualquier ancestro con `backdrop-filter`/`filter`/`transform` crea un nuevo containing block para descendientes `position: fixed` — el panel del menú mobile quedaba mal posicionado/recortado en vez de cubrir el viewport completo (se veía transparente/mezclado con el contenido de fondo). Se corrigió moviendo `<MobileMenu />` fuera del `<header>` (como hermano, dentro de un fragment). Se verificó que esto no afecta el layout del header ni el resto del sitio.
- Requisitos nuevos agregados a `REQUISITOS.md`: sí — ver sección "UI/UX y accesibilidad".

## Pruebas manuales

- Desktop (1280px): confirmar que los 8 links aparecen y cada uno filtra `/tienda` correctamente.
- Mobile (375px): abrir el menú hamburguesa, confirmar que el panel se ve opaco y cubre correctamente (sin el bug del containing block), que un click en "Legging" navega a `/tienda?tipo=Legging` con el chip activo y cierra el menú.

## Notas de progreso

- 2026-07-26: Implementado y verificado. Al probar el menú mobile se encontró un bug real de CSS (containing block por `backdrop-filter`) no relacionado con este cambio pero que afectaba directamente la función que se estaba modificando — se corrigió en el mismo commit por ser mínimo y estar directamente en el camino de verificación.
- 2026-07-26 (continuación): El usuario pidió además quitar los chips de categoría de `/tienda` (seguían con "Hombre") y corregir que la barra de filtros quedaba muy pegada al título tras quitarlos. Se eliminó el bloque de chips y la función `Chip`/`setCat` (quedaron sin uso), y se ajustó el espaciado: el `<h1>` pasa de `border-b pb-7` a solo `pb-8` (sin borde propio), y la barra de filtros usa su propio `border-y` como única línea divisoria — antes había redundancia de dos bordes con los chips en medio. Verificado en desktop y mobile: jerarquía visual clara, sin doble borde, filtro `cat` por URL (ej. `?cat=accesorios` desde "Accesorios" del menú) y "Limpiar filtros" siguen funcionando igual. Pendiente para el usuario: la sección "Compra por categoría" de la home (`app/data/categories.ts`) sigue mencionando "Hombre" — no se tocó, no se pidió todavía.
