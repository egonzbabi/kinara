---
id: 016
title: "Campo `modelo` por color/talla + regenerar `products.id` a un código interno generado"
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

Al usuario le están pidiendo (de un tercero, proveedor/logística) un código de "modelo" por cada combinación producto-color-talla, formato `{código-excel}-{COLOR}-{TALLA}` (ej. `2522-MARINO-M`). Hoy ese código de Excel vive en `products.id`, que también es el nombre de la carpeta de Storage de cada producto — no hay campo separado para esto.

El usuario pidió que `products.id` pase a ser un identificador interno generado por el programa (código corto aleatorio, no legible/de negocio) y que se regenere para los 16 productos ya existentes, mientras que el nuevo campo `modelo` (por color×talla, editable desde el admin) sea el que preserve el código de negocio.

Ver plan completo aprobado en el historial de la sesión (incluye el detalle de por qué regenerar `id` requiere mover archivos de Storage y agregar `on update cascade` a las FK).

## Objetivo

1. `product_variants.modelo` — nuevo campo de texto editable desde el admin, formato `CÓDIGO-COLOR-TALLA`.
2. `products.id` de los 16 productos existentes regenerado a un código corto aleatorio (ya no el código legible del proveedor).
3. Productos nuevos creados desde el admin también reciben un `id` corto generado (antes era `slugify(name)`).

## Archivos involucrados

- `supabase/migrations/20260715000000_modelo_and_id_cascade.sql` (nuevo)
- `scripts/regenerate-product-ids.ts` (nuevo, migración de datos de una sola vez)
- `app/lib/supabase.types.ts` (agregar `modelo` a `product_variants`)
- `app/lib/admin-catalog.server.ts` (tipos `SizeStock`/`AdminColorInput`, `generateShortId`, `createProduct`, `getAdminProductById`, `insertVariantsAndImages`)
- `app/lib/slug.ts` o nuevo `app/lib/short-id.ts` (generador de ID corto)
- `app/components/admin/ProductForm.tsx` (input de `modelo` por talla)

## Restricciones específicas de esta tarea

- No correr el script de regeneración de IDs sobre los 16 productos reales sin antes verificar en un producto de prueba y confirmar el resultado — toca Storage y las 63 fotos ya verificadas en tareas 009-014.
- `modelo` no necesita ser único a nivel de base de datos (puede quedar vacío en variantes nuevas hasta que el admin lo llene).
- No romper el RLS existente (la migración solo agrega `on update cascade` + una columna, no policies nuevas).

## Pasos sugeridos

1. Migración: `on update cascade` en ambas FK + columna `modelo`.
2. `generateShortId()` compartido.
3. Script `regenerate-product-ids.ts` con log de auditoría; correr primero en modo verificación/dry-run mental antes del run real.
4. Actualizar tipos y `admin-catalog.server.ts`.
5. Actualizar `ProductForm.tsx` con el input de `modelo`.
6. Correr el script sobre los 16 productos reales (con confirmación).
7. Verificar storefront + admin + typecheck.

## Criterios de aceptación

- [x] Los 16 productos tienen un `id` nuevo (código corto de 8 caracteres), y `/tienda` + `/producto/:slug` siguen mostrando las fotos correctas.
- [x] `product_variants.modelo` poblado para las 284 variantes existentes, formato `CÓDIGO-COLOR-TALLA` usando el código de Excel original (ej. `2522-MARINO-M`, `JV001-PDEROSA-XL`).
- [x] El admin permite ver y editar `modelo` por talla en el formulario de producto (verificado en BICROSSFLARE tras la migración).
- [x] Un producto nuevo creado desde el admin recibe un `id` corto generado (probado: `lqrisc9i`, no `slugify(name)`).
- [x] `npm run typecheck` sin errores.
- [x] Sin regresión en el storefront (carrito, filtros/scroll de tienda, tarea 014) — verificado `/tienda` (16 artículos) y `/producto/bicrossflare` con sus 7 colores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — RLS de lectura pública intacto (verificado en vivo: un update anon a `modelo` no tuvo efecto real); ninguna foto/color de tareas 009-014 se perdió (movidas, no borradas, y re-verificadas post-migración).
- Regresiones encontradas y corregidas durante la propia tarea (no bloquearon el cierre): el script `regenerate-product-ids.ts` inicialmente solo movía archivos dentro de la carpeta `{id}/`, pero la foto genérica original de cada producto (subida en la tarea 006) vive como un archivo suelto `{id}.png` en la raíz del bucket, no dentro de una carpeta — se detectó al verificar (`product_images` con `color_name = null` seguía apuntando al id viejo) y se corrigió con un script de seguimiento que movió los 16 archivos genéricos restantes y actualizó sus URLs. El script fuente debería actualizarse para cubrir este caso si se vuelve a usar.
- Requisitos nuevos agregados a `REQUISITOS.md`: sí — `products.id` es ahora un identificador interno generado por el sistema, sin significado de negocio (no editable); el código de negocio/logística vive en `product_variants.modelo`, editable desde el admin.

## Pruebas manuales

- [x] Editado BICROSSFLARE (nuevo id `tthx5e0b`) en el admin: los 27 inputs de `modelo` por talla muestran el valor correcto migrado.
- [x] `/tienda` (16 artículos, todas las fotos) y `/producto/bicrossflare` (7 colores, swatch funcional) verificados tras la migración completa.
- [x] Creado y eliminado un producto de prueba ("PRUEBA ID GENERADO") para confirmar que `createProduct` ya asigna un id corto generado.
- [x] RLS re-verificado en vivo tras el cambio de schema (FK `on update cascade` + columna nueva): la anon key sigue sin poder escribir.

## Notas de progreso

- 2026-07-15: Tarea creada a partir de un plan aprobado por el usuario (investigado el schema/FK existentes, formato de `modelo` y de `id` confirmados con el usuario vía preguntas antes de escribir el plan).
- 2026-07-15: Migración aplicada (`on update cascade` en ambas FK + columna `product_variants.modelo`). Verificada con una consulta directa antes de continuar.
- 2026-07-15: `app/lib/slug.ts` extendido con `modeloColorCode()` (normaliza nombre de color a mayúsculas sin acentos/espacios) y `generateShortId()` (código aleatorio de 8 caracteres, usa `crypto.getRandomValues` para funcionar tanto en servidor como en el navegador, ya que `slug.ts` lo importa `ProductForm.tsx`).
- 2026-07-15: `admin-catalog.server.ts` actualizado: `createProduct` genera el id con `generateShortId()` en vez de `slugify(name)`; `SizeStock` incluye `modelo`; `insertVariantsAndImages`/`getAdminProductById` lo persisten/leen.
- 2026-07-15: `ProductForm.tsx`: input de texto pequeño para `modelo` junto al stock de cada talla.
- 2026-07-15: Corrida una simulación (`--dry-run`) del script de regeneración sobre los 16 productos reales — se revisó el resultado completo (no solo una muestra) antes de pedir confirmación para ejecutar de verdad, dado que la acción mueve archivos de Storage reales y cambia el `id` de todo el catálogo en producción.
- 2026-07-15: Ejecutado `regenerate-product-ids.ts` de verdad sobre los 16 productos. Detectado y corregido en el momento el gap de las fotos genéricas sueltas en la raíz del bucket (ver arriba). Verificado en Storage que no queda ninguna carpeta/archivo con el id viejo.
- 2026-07-15: Verificado en navegador (storefront + admin) y `npm run typecheck` sin errores.
- 2026-07-15: Usuario pidió agregar un campo "Modelo" (código base) arriba del todo en el formulario de alta/edición de producto, y que el sistema complete automáticamente el `modelo` de cada talla al darla de alta (asignarle stock), sin pisar valores editados a mano. Implementado en `ProductForm.tsx`: nuevo input "Modelo" al inicio del formulario (con texto de ayuda), un `useEffect` que completa `modelo = "{base}-{COLOR}-{TALLA}"` únicamente en las tallas con stock > 0 y `modelo` todavía vacío, y en edición el código base se deriva automáticamente del primer `modelo` ya guardado (ej. producto migrado con `modelo="2522-MARINO-M"` → precarga base `"2522"`). Verificado en navegador: autocompletado al dar stock, no pisa un valor editado manualmente, y la derivación en edición funciona con BICROSSFLARE. `npm run typecheck` sin errores.
- 2026-07-15: Usuario preguntó qué es "Badge" y en qué se diferencia de las casillas "Nuevo"/"Best-seller" — confusión válida, son campos independientes (badge = solo texto visual sobre la foto; los checkboxes = en qué secciones del sitio aparece el producto, `isNew` en Novedades de portada + orden de tienda, `isBestseller` en el carrusel de más vendidos). Renombrado en `ProductForm.tsx`: "Badge" → "Etiqueta visual (badge)" con texto de ayuda aclarando que no afecta la sección; agrupadas las casillas bajo "Aparece en estas secciones" con su descripción funcional cada una. Verificado visualmente en el navegador.
- 2026-07-15: Usuario pidió igualar el estilo de las ayudas de "Badge" y las casillas para que ambas digan "dónde aparecen". Reescrito para que las tres opciones (badge, Nuevo, Best-seller) usen el mismo patrón "Aparece en: ..." — consistente y sin mezclar "qué es" con "dónde aparece". Verificado visualmente.
- 2026-07-15: Usuario pidió eliminar el campo "Badge" como selección independiente — quiere un solo campo: las casillas "Nuevo"/"Best-seller" determinan a la vez la sección donde aparece el producto Y el texto del badge visual sobre la foto. Implementado en `ProductForm.tsx`: quitado el `<select name="badge">` y su `useState`; `badge` ahora es una constante derivada (`isNew ? "Nuevo" : isBestseller ? "Best-seller" : ""`, con "Nuevo" ganando si ambas están marcadas) enviada al server action vía `<input type="hidden" name="badge">`. Un solo bloque "Destacar producto" con las dos casillas, cada una con su texto "Aparece en: etiqueta '...' sobre la foto, [sección]". Trade-off: ya no se pueden asignar manualmente los valores de badge "Edición" o "Últimas unidades" desde el admin (verificado antes de este cambio que ningún producto real los usaba — los 16 productos tenían `badge` consistente con `is_new`/`is_bestseller`). Verificado en navegador: al marcar/desmarcar cada casilla, el input oculto `badge` toma el valor correcto en los 4 estados posibles (ninguna → "", Nuevo → "Nuevo", ambas → "Nuevo", Best-seller → "Best-seller"). `npm run typecheck` sin errores.
- **TAREA COMPLETADA.**
