---
id: 002
title: "Performance y Core Web Vitals"
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

- [x] `npm run typecheck` pasa sin errores.
- [x] No hay regresión visual ni funcional (verificado en navegador: Hero, grid, PDP, carrito idénticos; imagen LCP confirmada como `image/webp` de 21.6KB vía `fetch()` en runtime, antes servía PNG/JPEG sin comprimir de 300-400KB+).
- [x] CLS < 0.1 en las tres rutas (medido: 0.001–0.004, ya estaba bien).
- [x] TBT (proxy de INP en Lighthouse lab) = 0ms en las tres rutas.
- [x] Auditorías de imagen (`modern-image-formats`, `uses-responsive-images`, `uses-optimized-images`, `prioritize-lcp-image`) — score perfecto (1) en las tres rutas.
- [x] Lighthouse Performance ≥ 90 (mobile) en las tres rutas — **aceptado con salvedad por el usuario**: no se garantizó ≥90 en el 100% de las corridas locales (0.81–0.93 según ruta y corrida), por ruido de medición en esta laptop; el usuario decidió cerrar la tarea con la mejora lograda en vez de perseguir el último tramo (cache/servidor). Re-medir contra Vercel real cuando esté desplegado.
- [x] LCP < 2.5s en las tres rutas — **aceptado con la misma salvedad** (mejora de 6.8s→~4.1s en `/`, 15.3s→~3.7s en `/tienda`, 3.9s→2.7-3.9s en el PDP; el PDP ya cruza el umbral en algunas corridas).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: patrón obligatorio de `productImage()`/`productSrcSet()` (`app/lib/productImage.ts`) para cualquier imagen nueva servida desde Supabase Storage; fuentes auto-hospedadas vía `@fontsource-variable/*`, nunca volver a un `<link>` de Google Fonts.

## Pruebas manuales

- Lighthouse (mobile, `--throttling-method=simulate`) corrido contra el **build de producción** (`npm run build` + `npm run start`, puerto 3000) — no contra `npm run dev`, que es ~10x más lento y no representa producción.
- Verificado en navegador (Chrome vía Browser pane): Hero, grid de `/tienda`, PDP y carrito se ven idénticos al diseño aprobado; imagen principal del PDP confirmada como WebP de 21.6KB con `fetch()` desde la consola.

## Notas de progreso

- **2026-07-22 — Diagnóstico inicial (línea base, build de producción, mobile simulado):**

  | Ruta | Score | LCP | CLS | TBT |
  |---|---|---|---|---|
  | `/` | 0.68 | 6.8s | 0 | 0ms |
  | `/tienda` | 0.65 | 15.3s | 0 | 0ms |
  | `/producto/daily-top` | 0.86 | 3.9s | 0.001 | 0ms |

  CLS y TBT ya eran excelentes — **todo el problema era LCP por imágenes sin comprimir**: las fotos de producto son PNG/JPEG crudos de Supabase Storage (300-400KB+) sin ningún parámetro de tamaño/formato, y el Hero pedía una imagen fija de 2000×2000 a todos los viewports.

- **Cambios hechos:**
  1. `app/lib/productImage.ts` (nuevo) — convierte URLs públicas de Supabase Storage al endpoint `/render/image/public/...`, que redimensiona y sirve WebP automáticamente según el `Accept` header del navegador (confirmado por prueba directa: un PNG de 369KB baja a **9KB** en WebP). Aplicado en `ProductCard.tsx`, `ProductGallery.tsx` y `CartDrawer.tsx`, con `srcSet`/`sizes` donde aplica.
  2. `app/data/images.ts` — `imgSrcSet()` nuevo, para que las imágenes de Unsplash (Hero) también pidan un ancho según el viewport en vez de una imagen fija de escritorio para todos.
  3. Fuentes auto-hospedadas: se reemplazó el `<link rel="stylesheet">` de Google Fonts (bloqueante, dos orígenes externos) por `@fontsource-variable/fraunces` + `@fontsource-variable/hanken-grotesk`, importados en `app.css` — mismo tipo de letra, mismos pesos, ahora desde el propio origen. Se actualizaron las variables `--font-sans`/`--font-display` a los nombres de familia correspondientes (`"Fraunces Variable"`/`"Hanken Grotesk Variable"`).
  4. `app/root.tsx` — se quitaron los `preconnect` a Google Fonts (ya no se usan) y se agregó uno al dominio de Supabase Storage.
  5. Preload de la imagen LCP: `_index.tsx` usa el `links()` estático de React Router (el Hero es siempre la misma foto); `producto.$slug.tsx` usa `preload()` de `react-dom` dentro del componente (React Router 7 `links()` **no** recibe `loaderData` en esta versión, así que no se puede generar el preload dinámico ahí — se optó por la API nativa de React 19).

- **Resultado (mismo build de producción, mismo método):**

  | Ruta | Score | LCP |
  |---|---|---|
  | `/` | 0.81 | ~4.1s |
  | `/tienda` | 0.85 | ~3.7s |
  | `/producto/daily-top` | 0.83–0.93 | 2.7–3.9s (varía entre corridas) |

  Mejora real y grande en las tres rutas (`/tienda` bajó de 15.3s a ~3.7s de LCP). Todas las auditorías de imagen ya dan perfecto. Lo que queda para llegar a <2.5s/≥90 de forma consistente **ya no es de imágenes**: en `/` y `/tienda` domina el "Render Delay" simulado (CPU throttling de Lighthouse mobile, no JS real — `bootup-time` y `mainthread-work-breakdown` ya dan perfecto); en el PDP a veces domina el tiempo de transferencia de la imagen (probablemente cache-miss del endpoint de transformación de Supabase en la primera solicitud de cada combinación de tamaño). Se observó bastante ruido de medición corriendo Lighthouse en esta laptop (una pestaña de navegador abierta al lado cambiaba los números en varios segundos) — los números de producción real (Vercel, CDN, sin contención de recursos) muy probablemente sean mejores que estos.
  - Pendiente de decisión del usuario: ¿cerrar la tarea con esta mejora (criterios de imagen/CLS/TBT cumplidos al 100%, LCP/score con mejora grande pero no garantizado <2.5s/≥90 en todas las corridas), o seguir con optimizaciones de otra capa (cache-control en los loaders, memoización de las consultas a Supabase) para atacar el tiempo de respuesta del servidor, que es la próxima palanca real?
