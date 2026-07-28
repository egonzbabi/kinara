---
id: 021
title: "Menú principal: quitar Hombre, reemplazar Mujer por tipos de producto"
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

## Restricciones específicas de esta tarea

- Alcance limitado al "menú principal" (SiteNav) — no se tocó el filtro de categoría dentro de `/tienda` (chips "Todo/Mujer/Hombre/Accesorios") ni la sección "Compra por categoría" de la home (`app/data/categories.ts`), que también mencionan "Hombre". Quedan señalados como posible follow-up, no se asumió que había que tocarlos.

## Pasos sugeridos

1. Confirmar con el usuario qué tipos de producto van en el menú (preguntado: se detectó que "Set", la categoría con más productos, no estaba en la lista inicial que dio el usuario — confirmó que sí quería incluirla).
2. Reemplazar el array `LINKS` en `SiteNav.tsx`.
3. Verificar en el navegador (desktop y mobile).

## Criterios de aceptación

- [x] El menú (desktop) muestra: Tienda, Top, Bottom, Legging, Chaqueta, Enterizo, Set, Accesorios.
- [x] El menú mobile muestra los mismos 8 links y cada uno navega a `/tienda?tipo=X` (o `?cat=accesorios`) y cierra el menú al hacer click.
- [x] `npm run typecheck` sin errores.
- [x] Verificado visualmente en desktop (1280px) y mobile (375px).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí, no aplica ningún punto en conflicto.
- Regresiones encontradas: sí, una — **no introducida por este cambio, pre-existente**: el menú mobile (`MobileMenu`) vivía dentro del `<header>`, y `<header>` tiene `backdrop-blur-md` (un `backdrop-filter`). Por regla de CSS, cualquier ancestro con `backdrop-filter`/`filter`/`transform` crea un nuevo containing block para descendientes `position: fixed` — el panel del menú mobile quedaba mal posicionado/recortado en vez de cubrir el viewport completo (se veía transparente/mezclado con el contenido de fondo). Se corrigió moviendo `<MobileMenu />` fuera del `<header>` (como hermano, dentro de un fragment). Se verificó que esto no afecta el layout del header ni el resto del sitio.
- Requisitos nuevos agregados a `REQUISITOS.md`: sí — ver sección "UI/UX y accesibilidad".

## Pruebas manuales

- Desktop (1280px): confirmar que los 8 links aparecen y cada uno filtra `/tienda` correctamente.
- Mobile (375px): abrir el menú hamburguesa, confirmar que el panel se ve opaco y cubre correctamente (sin el bug del containing block), que un click en "Legging" navega a `/tienda?tipo=Legging` con el chip activo y cierra el menú.

## Notas de progreso

- 2026-07-26: Implementado y verificado. Al probar el menú mobile se encontró un bug real de CSS (containing block por `backdrop-filter`) no relacionado con este cambio pero que afectaba directamente la función que se estaba modificando — se corrigió en el mismo commit por ser mínimo y estar directamente en el camino de verificación. Pendiente para el usuario: decidir si también quiere quitar "Hombre" de los chips de categoría dentro de `/tienda` y de la sección "Compra por categoría" de la home (`app/data/categories.ts`) — no se tocaron, fuera del alcance pedido ("menú principal").
