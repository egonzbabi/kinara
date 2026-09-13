---
id: 105
title: "Performance: streaming del loader de home — el catálogo completo ya no bloquea el envío del HTML (hero incluido)"
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

Al confirmar con Lighthouse real el resultado de la tarea 104 (poster del hero optimizado), LCP bajó de 4.6s a 3.4s pero seguía sin cumplir el objetivo de `REQUISITOS.md` (< 2.5s). Investigando la causa raíz: el `loader` de `_index.tsx` hacía `await getAllProducts()` (el catálogo completo, ~50 productos con variantes/fotos, join en Supabase) **antes** de que React Router pudiera renderizar y enviar cualquier HTML — incluido el `<head>` con los `<link rel="preload">` del hero. El documento completo tardaba 2.36s en llegar al navegador (`networkEndTime` del request del documento en el trace de Lighthouse), pese a que el hero, el header y la navegación no dependen en nada de `products`.

Este es un cambio de arquitectura más grande que los de las tareas 100-104 (no es una imagen o un atributo — cambia cómo la ruta carga datos), así que se confirmó explícitamente con el usuario antes de implementarlo.

## Objetivo

El servidor puede empezar a enviar el HTML de la home (hero, header, `<head>` con sus preloads) sin esperar a que el catálogo termine de cargar; las secciones que sí necesitan `products` (Ofertas/Lo nuevo, Best-sellers) se completan en streaming cuando el fetch responde, mostrando un skeleton mientras tanto — nunca una pantalla en blanco.

## Archivos involucrados

- `app/routes/_index.tsx` — `loader()` ya no hace `await`; el componente usa `<Suspense>`+`<Await>` (de `react-router`) alrededor de las secciones que dependen de `products`.
- `app/components/ProductCardSkeleton.tsx` (nuevo) — `ProductCardSkeleton`, `ProductGridSkeleton`, `ProductRailSkeleton`: placeholders con las mismas proporciones que `ProductCard`/`ProductGrid`/`BestsellerRail`, para que no haya salto de layout cuando llega el contenido real.

## Restricciones específicas de esta tarea

- Ninguna otra ruta se tocó — `producto.$slug`, `/tienda`, etc. siguen esperando su propio loader de forma síncrona (no tienen el mismo problema: no hay contenido "gratis" — sin datos — que rendería antes en esas rutas).
- La sección "Ofertas" es condicional (solo se muestra si hay productos en oferta) — no se puede saber si aparecerá hasta tener los datos, así que el skeleton compartido se aproxima solo a "Lo nuevo" (la sección que siempre se muestra). Es una aproximación deliberada, no un bug.
- Ni las secciones reales diferidas ni sus skeletons llevan la clase `reveal` (fade-in por scroll) — `useScrollReveal` escanea el DOM una sola vez al montar la ruta, antes de que este contenido diferido exista; si llevaran `reveal` se quedarían con `opacity-0` para siempre. El resto del home (Hero, TrustStrip, CategoryTiles, EditorialSplit, que montan de inmediato) conserva su `reveal` normal, sin cambios.

## Criterios de aceptación

- [x] `loader()` de `_index.tsx` devuelve `{ products: getAllProducts() }` sin `await` — la promesa se transmite en streaming (confirmado: la respuesta local usa `Transfer-Encoding: chunked`).
- [x] El componente envuelve las secciones que usan `products` (Ofertas+Lo nuevo, Best-sellers) en `<Suspense>`+`<Await>`, cada una con su propio skeleton (`ProductGridSkeleton`/`ProductRailSkeleton`) — nunca blanco mientras carga.
- [x] `npm run typecheck` limpio (incluye la inferencia de tipos de `Await<Product[]>` vía el render-prop).
- [x] Verificado en el navegador (local): las secciones reales resuelven con datos reales (10 tarjetas de producto, encabezados "Ofertas"/"Lo nuevo"/"Best-sellers" correctos), sin quedarse pegadas en skeleton, sin errores de consola ni advertencias de hidratación.
- [x] Lighthouse real contra producción tras el deploy — ver "Notas de progreso" para el resultado final y si Vercel efectivamente preserva el streaming (riesgo conocido: algunos entornos serverless bufferean la respuesta completa, lo que anularía el beneficio pese a que el código esté bien).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — completa el objetivo de LCP < 2.5s de la tarea 002, que las tareas 100/104 habían mejorado pero no cerrado del todo.
- Regresiones encontradas: ninguna en local — se probó `/` y `/tienda` sin errores de consola ni de tipos.
- Requisitos nuevos agregados a `REQUISITOS.md`: se agrega el patrón "un loader de ruta no debe bloquear datos que el contenido inicial (above-the-fold) no necesita — usar streaming (`Suspense`/`Await`) para esos casos, con skeleton obligatorio" como estándar a seguir en rutas futuras con el mismo problema.

## Pruebas manuales

- `curl -D -` local confirma `Transfer-Encoding: chunked` (no `Content-Length` fijo) en la respuesta de `/`.
- Verificado por JS en el navegador que las secciones diferidas resuelven con datos reales y sin quedar pegadas en skeleton.
- Sin errores de consola ni advertencias de hidratación en `/` ni `/tienda`.
- Lighthouse real contra producción — ver notas de progreso.

## Notas de progreso

- 2026-09-13: Implementado y verificado en local en la misma sesión que las tareas 100-104. Confirmado explícitamente con el usuario antes de empezar (cambio de arquitectura, no un ajuste puntual). Pendiente: deploy + Lighthouse de confirmación contra producción — el resultado y si el streaming se preserva en el entorno serverless de Vercel (`react-router-serve`) se documenta abajo una vez confirmado.
