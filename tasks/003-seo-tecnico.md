---
id: 003
title: "SEO técnico y posicionamiento en Google"
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

Para posicionar en Google el sitio necesita metadatos únicos por página, datos estructurados, sitemap y robots.txt. No había nada de esto configurado (solo `title`/`description` básicos por ruta).

Antes de implementar se confirmó con el usuario el dominio real a usar en todas las URLs de SEO (canonical, Open Graph, JSON-LD, sitemap, robots.txt): el sitio hoy vive en `kinara-ecommerce.vercel.app`, pero el dominio propio de marca — ya usado para el correo (`contacto@kinarafit.com.mx`) y mencionado en el aviso de privacidad — es `www.kinarafit.com.mx`. El usuario eligió usar ese desde ya, para no tener que rehacer el SEO cuando conecte el dominio en Vercel.

## Objetivo

Que cada ruta pública tenga title/description únicos, Open Graph, Twitter Card, canonical, JSON-LD válido (`Organization` en home, `Product`/`Offer` en cada producto), y que exista `sitemap.xml` + `robots.txt` generados a partir del catálogo real de Supabase.

## Archivos involucrados

- `app/lib/seo.ts` (nuevo) — `SITE_URL`, `SITE_NAME`, `DEFAULT_OG_IMAGE`, `absoluteUrl()`, `seoMeta()` (helper compartido: title/description/canonical/OG/Twitter, con `noindex` opcional).
- `app/routes/_index.tsx` — `seoMeta()` + JSON-LD `Organization`.
- `app/routes/tienda.tsx` — `seoMeta()`, canonical fijo a `/tienda` sin query string.
- `app/routes/producto.$slug.tsx` — `seoMeta()` (`type: "product"`, imagen real del producto) + JSON-LD `Product`/`Offer`.
- `app/routes/contacto.tsx`, `aviso-de-privacidad.tsx`, `politica-de-cambios-y-devoluciones.tsx`, `politica-de-envios.tsx` — `seoMeta()`.
- `app/routes/checkout.tsx`, `checkout.success.tsx`, `checkout.cancelado.tsx` — `seoMeta()` con `noindex: true` (páginas transitorias/del carrito de cada visitante, no contenido a posicionar).
- `app/routes/sitemap.xml.tsx` (nuevo) — resource route (solo `loader`, sin componente) que genera el XML desde `getAllProducts()` + páginas estáticas.
- `app/routes.ts` — registra `route("sitemap.xml", "routes/sitemap.xml.tsx")`.
- `public/robots.txt` (nuevo).

## Hallazgo importante durante la implementación

React Router 7 **no concatena** el `meta()` de rutas anidadas — cada ruta que define su propio `meta()` reemplaza por completo el de sus ancestros (confirmado leyendo el código fuente de `<Meta />` en `react-router`: solo se usa el array de la ruta más profunda que define `meta`, sin merge). Como `root.tsx` y **todas** las rutas públicas ya definen su propio `meta()`, cualquier tag puesto solo en `root.tsx` nunca se renderiza en ninguna ruta pública. Por eso el JSON-LD de `Organization` se puso en `_index.tsx` (la home, lugar estándar para este schema), no en `root.tsx` como sugería el plan original de la tarea.

## Restricciones específicas de esta tarea

- No usar contenido duplicado ni "keyword stuffing" — cada `description` es real y específica (la del producto viene de `product.description`, ya redactada por tarea).
- El sitemap se genera desde Supabase (`getAllProducts()`, ya filtra `is_draft=false`), nunca desde `app/data/products.ts` (ese archivo solo define tipos, tarea 006).
- `/tienda` con cualquier combinación de filtros (`?tipo=`, `?cat=`, `?talla=`, `?color=`, `?sort=`) canonicaliza siempre a `/tienda` sin query string — son la misma página reordenada, no páginas nuevas (evita contenido delgado/duplicado). Por la misma razón, el sitemap no lista esas variantes con filtro, solo la base.
- Checkout (`/checkout`, `/checkout/success`, `/checkout/cancelado`) lleva `noindex` — son específicas del carrito/pedido de cada visitante, no contenido a posicionar; ya estaban fuera del sitemap y ahora también explícitamente fuera del índice de Google. `/admin/*` y `/api/*` se bloquean a nivel de crawler en `robots.txt` (además de requerir login, en el caso de `/admin/*`).

## Criterios de aceptación

- [x] Cada ruta pública tiene `title` y `description` únicos y relevantes (ya existían por ruta; ahora además canonical + Open Graph + Twitter Card).
- [x] JSON-LD de producto (`Product`/`Offer`) es JSON válido, verificado parseándolo (no solo a ojo) — incluye `name`, `description`, `image` (hasta 4 fotos reales vía `productImage()`), `sku`, `brand`, y `offers` con `price`/`priceCurrency: "MXN"`/`availability` (`InStock`/`OutOfStock` según `product.sizes.length`).
- [x] `sitemap.xml` accesible (`/sitemap.xml`) y lista las 6 páginas estáticas de contenido + todos los productos publicados, generado desde Supabase en cada request (con `Cache-Control` de 1 día).
- [x] `robots.txt` accesible (`/robots.txt`), permite todo salvo `/admin`, `/checkout`, `/api`, y referencia el sitemap con la URL absoluta correcta.
- [x] Un solo `<h1>` por página — revisado con `grep` en todas las rutas/componentes; el único archivo con dos `<h1>` (`checkout.success.tsx`) los tiene en ramas condicionales mutuamente excluyentes (estado "cargando" vs. "confirmado"), nunca los dos a la vez en el DOM — no es una violación real.
- [x] `npm run typecheck` limpio.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no hay conflicto con ningún requisito de datos/código existente; se agrega un requisito nuevo (ver abajo).
- Regresiones encontradas: ninguna — verificado con `curl` en local que `/`, `/tienda`, `/tienda?tipo=Top`, `/producto/:slug` y `/checkout` siguen sirviendo su HTML normal, con los tags nuevos agregados y sin romper el `title`/`description` que ya tenían.
- Requisitos nuevos agregados a `REQUISITOS.md`: toda ruta pública nueva debe usar `seoMeta()` de `app/lib/seo.ts` (no armar `title`/`description` sueltos) para no perder canonical/OG/Twitter por accidente; toda página transitoria/específica de usuario (como un futuro flujo de cuenta) debe pasar `noindex: true`; el dominio de SEO es `SITE_URL` en `app/lib/seo.ts` (`https://www.kinarafit.com.mx`) — actualizar ahí, no hardcodeado en cada ruta, el día que el dominio real quede conectado en Vercel.

## Pruebas manuales

- `curl localhost:5173/` , `/tienda`, `/tienda?tipo=Top`, `/producto/conjunto-rib`, `/checkout`: confirmado por `grep` que cada uno trae `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph, Twitter Card, y (producto/home) el `<script type="application/ld+json">` correspondiente.
- El JSON-LD de `Product` de `/producto/conjunto-rib` se parseó con `python3 -m json` para confirmar que es JSON válido, no solo visualmente correcto.
- `curl localhost:5173/sitemap.xml` y `/robots.txt`: ambos responden con el contenido esperado.
- Sin errores de consola en `/` ni en una página de producto.
- **Pendiente para cuando el usuario tenga tiempo**: pegar el HTML de una página de producto en [Google Rich Results Test](https://search.google.com/test/rich-results) una vez que el sitio esté en el dominio real (`www.kinarafit.com.mx`) — no es indispensable antes de esto porque el JSON-LD ya se validó como válido, pero es la validación "oficial" que pide el criterio original de la tarea.

## Notas de progreso

- 2026-09-14/15: Implementado en una sola sesión. Confirmado con el usuario el dominio a usar (`www.kinarafit.com.mx`, vía pregunta directa) antes de escribir ninguna URL. Encontrado y documentado el comportamiento real de merge de `meta()` en React Router 7 (no concatena), que cambió dónde vive el JSON-LD de `Organization` respecto al plan original de la tarea.
