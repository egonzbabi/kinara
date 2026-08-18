---
id: 058
title: "Leyenda 'Tallas reducidas' como opción por producto (default prendida)"
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

En el detalle de producto (`app/routes/producto.$slug.tsx`), junto a "Talla" siempre aparecía fija la leyenda "· Tallas reducidas" para todos los productos, sin forma de quitarla en productos donde no aplica.

## Objetivo

La leyenda pasa a ser un campo por producto (`showReducedSizesNotice`), prendido por default en todos los productos (nuevos y ya existentes), que se puede apagar caso por caso desde `/admin/productos/:id` (y al crear uno nuevo en `/admin/productos/nuevo`).

## Archivos involucrados

- `supabase/migrations/20260817000000_product_reduced_sizes_notice.sql`: nueva columna `show_reduced_sizes_notice boolean not null default true` en `products`. Se aplicó a la base remota con `supabase db push` (confirmado con `supabase migration list`).
- `app/lib/supabase.types.ts`: se agregó la columna al tipo `Database["public"]["Tables"]["products"]["Row"]` (este archivo se mantiene a mano en este proyecto, no se regenera con el CLI).
- `app/data/products.ts`: `Product.showReducedSizesNotice?: boolean`.
- `app/lib/catalog.ts` (lectura pública, la que usa el detalle de producto): `ProductRow.show_reduced_sizes_notice` + mapeo en `mapRow`.
- `app/lib/admin-catalog.server.ts`: `AdminProductInput.showReducedSizesNotice`, `ProductRow.show_reduced_sizes_notice`, lectura en `getAdminProductById`, escritura en `createProduct` y `updateProduct` (mismo patrón que `isNew`/`isBestseller`/`isOnSale`).
- `app/components/admin/ProductForm.tsx`: nuevo checkbox "Mostrar leyenda 'Tallas reducidas'", con `useState(product?.showReducedSizesNotice ?? true)` — prendido por default tanto al crear un producto nuevo como al leer uno que todavía no tuviera el campo.
- `app/routes/admin.productos.$id.tsx` y `app/routes/admin.productos.nuevo.tsx`: parsean `form.get("showReducedSizesNotice") === "on"` igual que los otros checkboxes booleanos.
- `app/routes/producto.$slug.tsx`: la leyenda ahora es condicional — `{product.showReducedSizesNotice !== false && (...)}` (el `!== false` en vez de solo el valor, para que productos leídos desde datos viejos sin el campo sigan mostrando la leyenda por default, no la escondan por accidente).
- `scripts/migrate-parte2.ts` y `scripts/migrate-products.ts`: scripts históricos de migración de datos que insertan productos directamente — se les agregó `show_reduced_sizes_notice: true` a los inserts para que sigan compilando con el tipo `Insert` ahora más estricto (no se ejecutan de forma rutinaria, pero deben seguir tipando limpio).

## Restricciones específicas de esta tarea

- Default `true` en la base de datos, no solo en el código — así cualquier fila insertada directamente (scripts, Supabase Studio) también arranca con la leyenda prendida, sin depender de que el código de la app siempre mande el valor explícito.
- El checkbox del admin no toca badge/destacado — es un campo independiente, no compite con "Nuevo"/"Best-seller"/"Oferta".
- No se tocó el copy ni el estilo de la leyenda en sí (mismo texto, mismo color `text-clay`), solo si se muestra o no.

## Criterios de aceptación

- [x] Todos los productos existentes (38) quedaron con la leyenda prendida tras la migración (verificado, no requiere acción manual).
- [x] El detalle de producto muestra la leyenda por default.
- [x] Existe un checkbox en `/admin/productos/:id` (y en "nuevo") para apagar la leyenda en un producto puntual.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia paleta, tipografía ni el resto del layout del detalle de producto; el checkbox del admin sigue el mismo patrón visual que los ya existentes.
- Regresiones encontradas: ninguna — se verificó en el navegador que el detalle de NOVA TOP sigue mostrando "· Tallas reducidas" igual que antes (comportamiento sin cambios para el caso default).
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (es un campo de datos, no un estándar transversal de diseño/performance/SEO).

## Pruebas manuales

- Migración aplicada a la base remota real con `npx supabase db push` (`supabase migration list` confirma `20260817000000` con `remote` igual a `local`).
- Con un script de solo lectura contra la base real: `show_reduced_sizes_notice` viene `true` en los 38 productos existentes; `getAdminProductById` de un producto real devuelve `showReducedSizesNotice: true`.
- En el navegador (servidor de desarrollo local): `/producto/daily-top` (NOVA TOP) sigue mostrando "· Tallas reducidas" junto a "Talla", sin errores de consola ni de red relacionados con el cambio.
- `npm run typecheck` limpio.
- **No verificado en vivo**: el checkbox de `/admin/productos/:id` en el navegador — no se cuenta con credenciales de admin para iniciar sesión (y no corresponde crear una cuenta nueva). El checkbox usa el mismo patrón exacto (mismo componente, mismo `useState`, mismo `form.get(...) === "on"`) que "Nuevo"/"Best-seller"/"Oferta", ya probados y en producción. Se recomienda que el usuario confirme visualmente al usarlo por primera vez.

## Notas de progreso

- 2026-08-17: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario.
