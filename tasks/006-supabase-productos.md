---
id: 006
title: "Migrar catálogo de productos e imágenes a Supabase"
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

Los productos y sus especificaciones hoy están hardcodeados (datos reales) en `app/data/products.ts`, `categories.ts`, `looks.ts` e `images.ts`. Deben vivir en Supabase (Postgres + Storage) para poder gestionarlos sin tocar código y escalar el catálogo.

## Prerrequisito (a cargo del usuario)

Claude no puede crear cuentas. Antes de ejecutar esta tarea, el usuario debe:
1. Crear un proyecto en https://supabase.com.
2. Compartir la **Project URL** y la **anon key** (públicas, van al cliente) para agregarlas a `.env` como `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. Guardar la **service_role key** solo en el propio Supabase / variable de entorno de servidor — nunca pegarla en el chat ni commitearla.

## Objetivo

Diseñar el esquema de base de datos, migrar todos los datos reales existentes (sin pérdida) e imágenes a Supabase Storage, y hacer que las rutas consuman el catálogo desde ahí en vez de los archivos estáticos.

## Archivos involucrados

- `app/data/products.ts`, `categories.ts`, `looks.ts`, `images.ts` (origen de la migración, se eliminan al final)
- nuevo `app/lib/supabase.ts` (cliente)
- nuevo `supabase/migrations/*.sql` (esquema)
- nuevo script de migración de datos (`scripts/migrate-products.ts` o similar)
- `app/routes/tienda.tsx`, `app/routes/producto.$slug.tsx`, `app/routes/_index.tsx` (loaders)

## Restricciones específicas de esta tarea

- No perder ningún producto ni campo existente en la migración — verificar 1:1 contra los datos actuales.
- Row Level Security activo desde el día uno: lectura pública del catálogo, cualquier escritura restringida (sin policy de insert/update/delete para el rol `anon`).
- La `service_role key` nunca se usa en código que corre en el cliente.

## Pasos sugeridos

1. Diseñar esquema: tablas `products`, `categories`, `product_images` (o campo array), relaciones y tipos (precio, stock, variantes, slug).
2. Crear las migraciones SQL y activar RLS con policy de solo lectura pública.
3. Escribir un script que lea `app/data/*.ts` y haga upsert en Supabase, subiendo las imágenes referenciadas a Supabase Storage.
4. Reemplazar los loaders de `tienda.tsx`, `producto.$slug.tsx` y `_index.tsx` para leer de Supabase en vez de los archivos estáticos.
5. Verificar 1:1 que cada producto migrado coincide con el original (nombre, precio, descripción, categoría, variantes, imágenes).
6. Eliminar los archivos estáticos ya migrados.

## Criterios de aceptación

- [x] Todos los productos, categorías e imágenes están en Supabase y coinciden exactamente con los datos originales (16/16, mergeados desde el Excel real + metadata existente, 0 advertencias).
- [x] `tienda.tsx`, `producto.$slug.tsx` y `_index.tsx` leen de Supabase, no de `app/data/*.ts`.
- [x] RLS activo: un `update` desde el cliente con la anon key no modifica nada (verificado: precio de `3322` sigue en 390 tras el intento).
- [x] Ninguna `service_role key` aparece en código de cliente ni en el repo (solo en `.env`, ignorado por git).
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (en particular, no regresar el Performance/SEO logrados en 002/003 al cambiar de dónde vienen los datos — el sitemap de la tarea 003 debe seguir funcionando con datos de Supabase).
- Regresiones encontradas: -
- Requisitos nuevos agregados a `REQUISITOS.md`: el catálogo vive en Supabase con RLS; toda nueva fuente de datos de producto debe pasar por ahí, no volver a hardcodear.

## Pruebas manuales

- [x] Recorrido en navegador: `/` (Lo nuevo con precios reales), `/tienda` (16 artículos, precios reales), `/producto/conjunto-nube` (imagen real de Storage, 6 colores con hex correcto, tallas S/M/L sin XL por stock 0, descripción aprobada).
- [x] Flujo de carrito probado end-to-end: seleccionar color/talla → añadir a la bolsa → drawer muestra "CONJUNTO NUBE, Negro, Talla M, 999€", envío gratis activado, subtotal correcto.
- [x] Escritura directa contra Supabase con la anon key (`update products set price=1`) confirmada sin efecto — RLS activo.

## Notas de progreso

- 2026-07-12: Proyecto Supabase creado por el usuario. URL: `https://njvfxzmbyckktygeiwhi.supabase.co`. Publishable/anon key recibida y guardada en `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- 2026-07-12: Fuente real de datos localizada: `~/Documents/kinara/Laura Spreadsheet.xlsx` (16 productos reales con precio, descripción, especificaciones, color y stock por talla S/M/L/XL). Extraída a JSON + imágenes en scratchpad para revisión.
- 2026-07-12: Confirmado que `public/productos/producto_0.png` … `producto_15.png` ya son exactamente las imágenes del Excel (hash idéntico) — no hace falta volver a extraer/subir desde el Excel, se reusan esos 16 archivos ya presentes en el repo.
- 2026-07-12: 5 productos sin descripción/especificaciones en el Excel (TECNO PREMIUM, CHAMARRA NIKKA, BICROSSFLARE, LILIA CHAQUETA, CONJUNTO NUBE) — usuario aprobó borradores redactados a partir de la imagen de cada producto. Estos 5 quedan marcados como copy generado por Claude, no del cliente original.
- 2026-07-12: Decisiones de ejecución: (a) esquema SQL se aplica con Supabase CLI (`supabase db push`), instalada por Claude pero ejecutada/logueada por el usuario; (b) migración de datos/imágenes a Storage usa `SUPABASE_SERVICE_ROLE_KEY` que el usuario agrega directo a `.env` (nunca compartida por chat).
- 2026-07-12: Hallazgo — varios componentes (`BestsellerRail.tsx`, `app/routes/_index.tsx`) importan la constante `PRODUCTS` directamente en vez de recibir productos por props desde el loader de la ruta. Para migrar a Supabase sin romper el diseño, hay que convertir esos imports directos a props pasadas desde el loader (cambio de plomería de datos, no visual).
- 2026-07-12: Merge de datos completado (Excel + metadata de `products.ts` + 5 borradores aprobados) — 0 advertencias, los 16 productos cuadran 1:1 (colores/hex, slugs, kind, badge, imagen local ya existente).
- 2026-07-12: Implementado:
  - `npm install @supabase/supabase-js`, `-D supabase tsx dotenv`.
  - `supabase/migrations/20260712000000_init_catalog.sql` — tablas `products`, `product_variants` (color+talla+stock), `product_images`, RLS de solo-lectura pública, bucket de Storage `product-images`.
  - `.env` con `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` ya cargados; `SUPABASE_SERVICE_ROLE_KEY` queda vacío para que el usuario lo pegue directo ahí.
  - `app/lib/supabase.ts`, `app/lib/supabase.types.ts` (cliente + tipos), `app/lib/catalog.ts` (`getAllProducts`, `getProductBySlug`, `relatedProducts` — mapean las tablas al mismo tipo `Product` que ya usaban los componentes).
  - `app/data/products.ts` — se eliminó el array `PRODUCTS` hardcodeado y `getProduct`/`relatedProducts`; solo quedan los tipos y `CATEGORY_LABELS`.
  - `scripts/seed-data.ts` (dataset mergeado, con `copySource` marcando qué es del Excel y qué es borrador aprobado) + `scripts/migrate-products.ts` (sube imágenes a Storage e inserta todo, usa `SUPABASE_SERVICE_ROLE_KEY`). Comando: `npm run migrate:products`.
  - Rutas actualizadas a loaders async contra Supabase: `app/routes/_index.tsx`, `app/routes/tienda.tsx`, `app/routes/producto.$slug.tsx`.
  - `BestsellerRail` ahora recibe `products` por prop en vez de importar la constante.
  - `npm run typecheck` pasa sin errores.
- 2026-07-13: Usuario corrió `supabase login` + `supabase link --project-ref njvfxzmbyckktygeiwhi` + `supabase db push` (esquema aplicado) y pegó `SUPABASE_SERVICE_ROLE_KEY` en `.env`.
- 2026-07-13: `npm run migrate:products` corrido con éxito — 16/16 productos migrados (imágenes subidas a Storage, variantes con stock real insertadas).
- 2026-07-13: Verificado en navegador (dev server): `/`, `/tienda`, `/producto/conjunto-nube` — datos reales, imágenes de Storage, colores/tallas correctos. Flujo de carrito (seleccionar color/talla → añadir a la bolsa) probado end-to-end con éxito.
- 2026-07-13: RLS verificado con un intento real de `update` vía anon key — sin efecto.
- **TAREA COMPLETADA.** Pendiente decisión del usuario: ¿borrar `scripts/seed-data.ts` y `scripts/migrate-products.ts` ahora que los datos ya están en Supabase, o dejarlos como registro de la migración? (ver conversación).
