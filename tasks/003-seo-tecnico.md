---
id: 003
title: "SEO técnico y posicionamiento en Google"
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

Para posicionar en Google el sitio necesita metadatos únicos por página, datos estructurados, sitemap y robots.txt. Hoy no hay nada de esto configurado.

## Objetivo

Que cada ruta pública tenga title/description únicos, Open Graph, JSON-LD válido, y que exista `sitemap.xml` + `robots.txt` generados a partir del catálogo real.

## Archivos involucrados

- `app/root.tsx`
- `app/routes/_index.tsx`, `app/routes/tienda.tsx`, `app/routes/producto.$slug.tsx`
- `public/robots.txt` (nuevo)
- nueva ruta/recurso para `sitemap.xml` (generado dinámicamente desde `app/data/products.ts` o Supabase si la tarea 006 ya se completó)

## Restricciones específicas de esta tarea

- No usar contenido duplicado o "keyword stuffing"; el copy de metadatos debe ser real y específico de cada producto/página.
- Si la tarea 006 (Supabase) ya está `done`, el sitemap debe generarse desde Supabase, no desde `app/data/products.ts`.

## Pasos sugeridos

1. Definir función `meta` por ruta con title, description, Open Graph y Twitter Card.
2. Agregar JSON-LD `Product`/`Offer` en `producto.$slug.tsx` y `Organization` en `root.tsx`.
3. Crear `public/robots.txt` apuntando al sitemap.
4. Crear una ruta/loader que genere `sitemap.xml` dinámicamente listando todas las rutas de producto y categoría.
5. Validar con Google Rich Results Test.

## Criterios de aceptación

- [ ] Cada ruta pública tiene `title` y `description` únicos y relevantes.
- [ ] JSON-LD de producto pasa Google Rich Results Test sin errores.
- [ ] `sitemap.xml` accesible y lista todas las páginas de producto/categoría actuales.
- [ ] `robots.txt` accesible y referencia el sitemap.
- [ ] Un solo `<h1>` por página.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí.
- Regresiones encontradas: -
- Requisitos nuevos agregados a `REQUISITOS.md`: obligatoriedad de metadatos únicos y JSON-LD válido para toda página/producto nuevo.

## Pruebas manuales

- Ver "view-source" de `/`, `/tienda` y un producto, confirmar meta tags y JSON-LD.
- Pegar el HTML de una página de producto en Google Rich Results Test.
- Abrir `/sitemap.xml` y `/robots.txt` directamente en el navegador.

## Notas de progreso

- (vacío — se llena a medida que se trabaja)
