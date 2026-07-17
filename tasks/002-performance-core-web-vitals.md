---
id: 002
title: "Performance y Core Web Vitals"
status: pending
---

<!--
Antes de trabajar esta tarea, Claude debe haber leído (en este orden):
1. ../CLAUDE.md
2. README.md (este directorio)
3. REQUISITOS.md (este directorio)
4. Este archivo completo
-->

## Contexto

El rendimiento del sitio afecta directamente el ranking en Google y la conversión. Hoy no hay ninguna optimización deliberada de imágenes, carga ni bundle.

## Objetivo

Que el sitio cumpla los objetivos de Core Web Vitals definidos en `CLAUDE.md` (LCP < 2.5s, INP < 200ms, CLS < 0.1, Lighthouse Performance ≥ 90) en mobile, en las rutas `_index`, `tienda` y `producto.$slug`.

## Archivos involucrados

- `app/root.tsx`
- `app/components/*` (especialmente `Hero.tsx`, `ProductGrid.tsx`, `ProductGallery.tsx`, `BestsellerRail.tsx`)
- `app/data/images.ts`
- `vite.config.ts`

## Restricciones específicas de esta tarea

- No cambiar copy, contenido ni layout visual — solo optimización técnica (formatos de imagen, lazy loading, code-splitting, orden de carga).
- No romper el carrito ni la navegación.

## Pasos sugeridos

1. Correr Lighthouse (mobile) en `/`, `/tienda` y `/producto/:slug` para tener una línea base.
2. Optimizar imágenes: formatos WebP/AVIF, `srcset` responsive, `loading="lazy"` para las que están fuera del viewport inicial, `width`/`height` explícitos.
3. Revisar que no haya JS/CSS bloqueante innecesario; usar `defer`/`async` donde aplique.
4. Revisar bundle con `npm run build` y recortar dependencias pesadas si las hay.
5. Re-correr Lighthouse y comparar contra la línea base.

## Criterios de aceptación

- [ ] Lighthouse Performance ≥ 90 (mobile) en las tres rutas.
- [ ] LCP < 2.5s, INP < 200ms, CLS < 0.1 en las tres rutas.
- [ ] `npm run typecheck` pasa sin errores.
- [ ] No hay regresión visual ni funcional (carrito, navegación, galería de producto).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí.
- Regresiones encontradas: -
- Requisitos nuevos agregados a `REQUISITOS.md`: los umbrales de Core Web Vitals logrados, con las métricas reales obtenidas.

## Pruebas manuales

- Lighthouse (Chrome DevTools, modo mobile) en `/`, `/tienda`, `/producto/:slug`.
- Navegar el sitio completo en conexión throttled (Fast 3G) y confirmar que se siente usable.

## Notas de progreso

- (vacío — se llena a medida que se trabaja)
