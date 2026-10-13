---
id: 136
title: "Páginas propias por tipo de prenda (SEO)"
status: in-progress
---

## Contexto

Hoy todas las vistas filtradas de `/tienda` (`?tipo=`, `?cat=`…) tienen canonical a `/tienda`, así que Google solo conoce una página de tienda y ninguna pensada para búsquedas como "leggings deportivos mujer". Se aprobó crear páginas propias por tipo de prenda.

## Objetivo

Seis páginas indexables, con su propio título, H1, texto introductorio y productos: `/tienda/conjuntos-deportivos`, `/tienda/tops-deportivos`, `/tienda/leggings-deportivos`, `/tienda/chamarras-y-sudaderas-deportivas`, `/tienda/enterizos-deportivos`, `/tienda/pants-deportivos` ("pants", no "pantalones", a pedido del usuario). Shorts (3 productos), vestido (1) y accesorios quedan fuera por ahora (contenido muy delgado).

## Archivos involucrados

- `app/lib/shop-landings.ts` (definición de las páginas y su filtro)
- `app/routes/tienda.$tipo.tsx` (nueva)
- `app/routes.ts`
- `app/routes/sitemap.xml.tsx`

## Restricciones específicas de esta tarea

- Mismo diseño que `/tienda` (títulos, cuadrícula, tarjetas); sin cambiar el menú principal.
- Los textos solo usan datos que ya dicen las descripciones de los productos; no se inventan características.
- Una página sin productos devuelve 404 y no entra al sitemap.
- Enlaces en el pie de página: aprobados por el usuario; van en una columna nueva "Por tipo" (no dentro de "Tienda", que ya tiene 11 enlaces).

## Pasos sugeridos

1. Definir las páginas y su filtro en `shop-landings.ts`.
2. Ruta con loader, `meta`, JSON-LD (BreadcrumbList + ItemList) y vista.
3. Agregarlas al sitemap.
4. Verificar en local (desktop y 375px).

## Criterios de aceptación

- [x] Las 6 páginas responden 200 con un solo `<h1>`, título y descripción únicos y canonical propio.
- [x] Cada una muestra solo los productos de su tipo.
- [x] Un slug inexistente da 404 (también `/tienda/shorts-deportivos`, no definida).
- [x] Están en `sitemap.xml` (6 URLs nuevas).
- [x] Typecheck sin errores. En 375px el único desborde medido es del encabezado del sitio (botón Carrito), el mismo que ya tiene `/tienda` en la vista emulada; el contenido de las páginas nuevas no se sale.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (páginas nuevas, `/tienda` y su canonical a `/tienda` no cambian; menú sin cambios)
- Regresiones encontradas: ninguna
- Requisitos nuevos agregados a `REQUISITOS.md`: las páginas por tipo viven en `shop-landings.ts` y solo se listan/sitemapean si tienen productos

## Pruebas manuales

- Abrir cada página en local y comparar con `/tienda`.

## Notas de progreso

- 2026-10-13: tarea creada; se empieza a implementar.
- 2026-10-13 (2): implementado y verificado en local. Productos por página: conjuntos 11, tops 9, leggings 5, chamarras/sudaderas 5, enterizos 4, pants 4 (38 de 43 prendas; quedan fuera shorts 3, falda 1 y AURA SKIRT). Cada página: 1 H1, title/description/canonical propios, JSON-LD BreadcrumbList + CollectionPage/ItemList, enlaces "Explora más" entre ellas. Sitemap incluye las 6. Falta: decidir con el usuario los enlaces en el pie de página, subir a producción (pendiente de aprobación) y pedir indexación en Search Console.
- 2026-10-13 (3): el usuario aprobó los enlaces del footer y subir todo. Columna nueva "Por tipo" en `SiteFooter.tsx` (solo páginas con productos, calculadas en el loader de `root.tsx`); la grilla pasa de 3 a 4 columnas solo cuando hay páginas. Verificado en local: 4 columnas parejas, sin overflow en desktop. No se pudo sacar captura (el panel del navegador no estaba visible); medido por JS. Falta: pedir indexación en Search Console de las 6 URLs nuevas.
