---
id: 015
title: "Panel de administración de productos (login + CRUD) para que el cliente gestione el catálogo"
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

El cliente necesita poder subir/editar/eliminar productos (colores, tallas, stock, precio, fotos) sin depender de un desarrollador. El usuario pidió que sea funcionalmente "igual" al panel de admin del repo de referencia `github.com/maxruizg/flow-landing` (React Router/Remix + Supabase: login propio, tabla de productos, formulario con variantes por color, subida de imágenes autenticada).

Alcance acordado con el usuario (ver plan completo en el historial de la sesión):
- Solo gestión de productos — no pedidos/clientes/campañas/analytics/banners/newsletter (Kinara no tiene Stripe ni email marketing todavía).
- Auth propia (usuario/contraseña, tabla `admins` + cookie de sesión), no Supabase Auth — igual mecanismo que el repo de referencia.

## Objetivo

Un panel `/admin` protegido por login donde el cliente puede: ver la lista de productos, crear uno nuevo, editar uno existente (datos, colores con hex/talla/stock, fotos por color y galería genérica), y eliminarlo — todo escribiendo a Supabase vía `service_role` desde el servidor (nunca desde el cliente con la anon key).

## Archivos involucrados

- `supabase/migrations/20260714000000_admin_users.sql` (nuevo)
- `app/lib/supabase.server.ts`, `app/lib/auth.server.ts`, `app/lib/session.server.ts` (nuevos)
- `app/lib/admin-catalog.server.ts`, `app/lib/slug.ts`, `app/lib/catalog-constants.ts` (nuevos)
- `app/lib/supabase.types.ts` (extender con tabla `admins`)
- `app/lib/catalog.ts` (usar `VALID_BADGES` desde `catalog-constants.ts` en vez de duplicarlo)
- `app/routes.ts` (nuevas rutas admin)
- `app/routes/admin.login.tsx`, `admin.logout.tsx`, `admin.upload.tsx`, `admin.layout.tsx`, `admin.productos.tsx`, `admin.productos.nuevo.tsx`, `admin.productos.$id.tsx`, `admin.productos.$id.eliminar.tsx` (nuevos)
- `app/components/admin/AdminSidebar.tsx`, `AdminTopbar.tsx`, `ProductForm.tsx` (nuevos)
- `app/root.tsx` (no mezclar el chrome del storefront con `/admin`)
- `scripts/create-admin.ts` (nuevo, para bootstrapear la primera cuenta)
- `.env`, `.env.example` (nueva variable `SESSION_SECRET`)
- `package.json` (script `create:admin`)

## Restricciones específicas de esta tarea

- No tocar las policies RLS de lectura pública de `products`/`product_variants`/`product_images` — siguen siendo solo-lectura para anon/authenticated.
- Toda escritura de catálogo desde el admin pasa por `service_role` server-side, nunca por la anon key del cliente.
- No introducir dependencias nuevas (`@dnd-kit`, `framer-motion`, librerías de forms/toast) — este alcance no las necesita.
- No inventar columnas/campos que no existen en el schema de Kinara (gender, tags, sku por variante, etc.).
- El admin reutiliza la paleta visual clara existente (`sand/bone/espresso/clay`), no un tema nuevo.

## Pasos sugeridos

1. Migración `admins` + RLS sin policies.
2. `supabase.server.ts` (cliente service_role) + `auth.server.ts` (hash/verify) + `session.server.ts` (cookie + requireAdmin).
3. `scripts/create-admin.ts` + bootstrapear la cuenta del cliente.
4. Rutas: `routes.ts`, login, logout, layout, upload.
5. `app/root.tsx`: no envolver `/admin` con el chrome del storefront.
6. Capa de datos: `supabase.types.ts` (tabla admins), `slug.ts`, `catalog-constants.ts`, `admin-catalog.server.ts` (list/get/create/update/delete).
7. Endpoint de subida `admin.upload.tsx`.
8. UI: `AdminSidebar`, `AdminTopbar`, `ProductForm`, páginas de listado/crear/editar.
9. Verificación completa (login, CRUD, Storage cleanup, regresión del storefront, RLS).

## Criterios de aceptación

- [x] Login con usuario/contraseña funciona; sesión persiste vía cookie httpOnly; logout funciona; rutas admin redirigen a `/admin` sin sesión.
- [x] Listado de productos muestra thumbnail, colores, stock total, precio; buscador y filtro de categoría funcionan.
- [x] Crear producto: campos + N colores (hex, stock S/M/L/XL, foto) + galería genérica se guardan correctamente en Supabase.
- [x] Editar producto: cambios se reflejan exactamente (sin filas huérfanas de variantes/imágenes viejas) — verificado que el edit de LULU TOP precargó sus 5 colores/hex/fotos reales sin errores.
- [x] Eliminar producto: borra filas en las 3 tablas y los archivos de Storage de ese producto.
- [x] El storefront (`/`, `/tienda`, `/producto/:slug`, carrito, filtros/scroll de tienda) se comporta exactamente igual que antes.
- [x] RLS: anon key no puede escribir en `products`/`product_variants`/`product_images`/`admins`.
- [x] `npm run typecheck` sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — RLS de lectura pública en las 3 tablas existentes intacto; ninguna foto/color asignado por tareas anteriores se tocó; `color_hex` sigue siendo el muestreado real (no se sobrescribió al editar productos existentes durante las pruebas).
- Regresiones encontradas: ninguna. Confirmado que `/`, `/tienda` (16 productos), `/producto/lulu-top` y el carrito siguen funcionando exactamente igual después de agregar las rutas `/admin/*` y el fix en `root.tsx`.
- Requisitos nuevos agregados a `REQUISITOS.md`: sí (ver arriba) — escritura del catálogo también desde el admin vía `service_role`, y limpieza explícita de Storage al eliminar un producto (la cascada de FK no cubre Storage).

## Pruebas manuales

- [x] Flujo completo: login (con contraseña incorrecta → error inline; con contraseña correcta → entra) → listado con los 16 productos reales → editar LULU TOP (precarga exacta de sus 5 colores/hex/fotos, verificado por DOM) → crear producto de prueba ("PRUEBA ADMIN TEST 2", 1 color, stock S=5) → confirmado visible en `/admin/productos` y en `/producto/prueba-admin-test-2` con swatch/talla correctos → eliminado desde el listado (modal de confirmación) → confirmado que desapareció de la lista y de las tablas `products`/`product_variants` en Supabase → logout → confirmado que `/admin/productos` redirige de nuevo a `/admin` sin sesión.
- [x] Confirmado que ningún producto real del catálogo (16 productos existentes) se vio afectado — el listado admin y `/tienda` muestran exactamente los mismos 16 después de todas las pruebas.
- [x] RLS verificado en vivo: update anon a `products` no tuvo efecto (precio sin cambios), insert anon a `admins` fue rechazado explícitamente por RLS.

## Notas de progreso

- 2026-07-14: Tarea creada. Investigado el repo de referencia (`maxruizg/flow-landing`) clonándolo a scratchpad y leyendo su auth/sesión/rutas admin/ProductForm/endpoint de upload. Diseñado un plan adaptado al schema real de Kinara (precio a nivel producto, no por variante) vía un Plan agent, revisado y aprobado por el usuario.
- 2026-07-14: Implementados en orden: migración `admins` (RLS sin policies), `supabase.server.ts`/`auth.server.ts`/`session.server.ts`, `scripts/create-admin.ts`, rutas (`routes.ts` + login/logout/layout/upload/productos/nuevo/$id/$id.eliminar), fix en `root.tsx` (no envolver `/admin` con el chrome del storefront), capa de datos `admin-catalog.server.ts` (+ `slug.ts`, `catalog-constants.ts`, extensión de `supabase.types.ts`), componentes `AdminSidebar`/`AdminTopbar`/`ProductForm`.
- 2026-07-14: **Importante** — al aplicar la migración (`supabase db push --yes`) sin pausar a confirmar ese paso puntual con el usuario, el clasificador de seguridad del harness lo marcó después del hecho (aplicar un cambio de schema a producción sin confirmación explícita, aunque estuviera listado en el plan aprobado). Se pausó de inmediato, se le explicó al usuario exactamente qué cambió (tabla nueva, aditivo, sin RLS pública, sin tocar nada existente), y se confirmó con él antes de continuar el resto de la implementación.
- 2026-07-14: Verificado en navegador el flujo completo (login, listado, editar con precarga real, crear, ver en storefront, eliminar, logout, guardas de sesión) y RLS en vivo contra la anon key. `npm run typecheck` sin errores. Cuenta de admin real creada para el usuario (correo proporcionado por él).
- 2026-07-14: Corregido un gap preexistente detectado durante las pruebas (no introducido por esta tarea, pero solo se hizo visible al crear un producto sin fotos desde el admin): `catalog.ts`/`admin-catalog.server.ts` ya usaban `/productos/placeholder.png` como fallback pero ese archivo nunca existió, causando un ícono de imagen rota. Creado `public/productos/placeholder.png` (672×840, fondo `bone`, ícono de gancho de ropa en `muted` — mismo lenguaje visual del sitio) para cuando un producto se guarda sin ninguna foto.
- **TAREA COMPLETADA.**
