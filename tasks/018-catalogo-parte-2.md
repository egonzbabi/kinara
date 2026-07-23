---
id: 018
title: "Catálogo parte 2 — 21 productos nuevos + completar YUCA BRA"
status: in-progress
---

<!--
Antes de trabajar esta tarea, Claude debe haber leído (en este orden):
1. ../CLAUDE.md
2. README.md (este directorio)
3. REQUISITOS.md (este directorio)
4. Este archivo completo
-->

## Contexto

El usuario tiene una segunda tanda de productos para agregar al catálogo. Los datos de inventario (nombre, modelo, color, stock por talla) están en `~/Documents/kinara/Laura2.xlsx`, y las fotos en `~/Downloads/Kinara Images/Kinara parte 2/` (152 archivos, sin nombres descriptivos).

## Objetivo

Los 22 productos de `Laura2.xlsx` (21 nuevos + 1 existente incompleto) quedan en Supabase con sus variantes color×talla y stock reales, y con foto real por color cuando exista una correspondencia clara en la carpeta de imágenes.

## Análisis del Excel (`Laura2.xlsx`, hoja "laura")

- 22 productos, ~90 combinaciones producto×color, 693 piezas en total (según el propio Excel).
- Columnas: `IMAGEN` (22 fotos de referencia embebidas, una por producto, no por color), `PRODUCTO`, `MODELO`, `COLOR`, `S`, `M`, `L`, `XL`. **Sin precio ni descripción.**
- **21 productos son nuevos** (no existen en Supabase por nombre): LEGGIN FELPADA, WRINKLE SHORT, ESSENTIAL SHIRT, SEATLE TOP, CONJUNTO CAMUFLAJE, CONJUNTO MESH, BOTTEE SET, ENTERIZO LARGO, LEISURE PANTS, BI COLOR SET, ZIPPER FALDA, CONJUNTO BI COLOR SHORT, NEWYORKLEGGIN, NEWYORK TOP, SOFT FLARE, ALL OUT PANTS, LEGGIN FLARE, SET ESSENTAL, CONJUNTO RIB, SEAMLESS SOFTESS, BUTTON.
- **YUCA BRA (modelo JV-028) ya existe** en Supabase (`id: njdfsa9b`) pero solo con una variante incompleta (Negro/S/stock 2). El Excel dice que debería tener 4 colores (NEGRO, IVORY, VERDE CLARO, ROSA) × 3 tallas (S/M/L, sin XL) con stock real — hay que completarlo, no duplicarlo.

## Análisis de las fotos (`Kinara parte 2/`)

- 152 archivos `IMG_XXXX.jpg/.JPG`, nombres sin significado.
- Dos orígenes distintos identificados por EXIF:
  - **83 fotos con `DateTimeOriginal`** (extensión `.jpg` minúscula, tomadas 2026-07-12 a 2026-07-14, en ráfagas — mismo patrón de sesión de fotos que se usó en las tareas 009-012 para "parte 1"): fotos de estudio propias.
  - **69 fotos sin EXIF** (`.JPG` mayúscula, recortadas cuadradas/verticales tipo 452×452, 600×800, 800×800, 339×452): fotos de catálogo del proveedor, mismo patrón que ya existía antes.
- Ninguna corresponde 1:1 por nombre de archivo a producto/color — hace falta inspección visual (comparar contra las 22 fotos de referencia embebidas en el Excel + muestreo de color hex, siguiendo el mismo método ya usado y documentado en `REQUISITOS.md` para las tareas 009-012).

## Archivos involucrados

- Nuevo script de migración (ej. `scripts/migrate-products-parte2.ts`), siguiendo el patrón de `scripts/migrate-products.ts` / `scripts/seed-data.ts`.
- Nuevo script de subida de fotos por color (ej. `scripts/upload-color-images-parte2.ts`), siguiendo el patrón de `scripts/upload-color-images*.ts`.
- Tablas Supabase `products`, `product_variants`, `product_images` (sin cambios de esquema).

## Restricciones específicas de esta tarea

- Nunca inventar una foto de color sin verificarla contra una referencia real (regla ya vigente en `REQUISITOS.md`, tareas 009-010) — mejor dejar un color sin foto que asignar la prenda equivocada.
- Todo precio/descripción/especificación que Claude redacte (el Excel no trae estos campos) debe marcarse `copySource: "claude_draft_approved"`, igual que en `scripts/seed-data.ts`, y presentarse al usuario para aprobación antes de publicarlo como definitivo.
- No tocar los 17 productos existentes salvo YUCA BRA (completar, no duplicar).

## Pasos sugeridos

1. Confirmar con el usuario: precios (propuesta de Claude vs. reales del usuario), y si el alcance de esta sesión es solo crear los productos con sus datos del Excel (sin fotos todavía, usando el fallback ya existente de "sin foto por color, se muestran todos los colores con stock") o si también se hace el emparejamiento de fotos ahora.
2. Redactar precio/descripción/especificaciones por producto (kind, categoría — todo el catálogo actual es `mujer`, salvo indicación contraria) y confirmarlos con el usuario antes de escribir a Supabase.
3. Crear/actualizar productos y variantes en Supabase.
4. (Si aplica) Emparejar fotos por color contra las 152 imágenes, subir a Storage, verificar con muestreo de color hex antes de asignar.
5. Verificar en el navegador: `/tienda` lista los productos nuevos, `/producto/:slug` muestra colores/tallas/stock correctos.

## Criterios de aceptación

- [x] Los 21 productos nuevos existen en Supabase con sus variantes color×talla y stock exactos del Excel.
- [x] YUCA BRA completo (4 colores, stock real, sin duplicar el producto — 16 filas de variantes, antes 1).
- [ ] Precio aprobado por el usuario y productos publicados — **pendiente**: por indicación explícita del usuario, quedan sin precio (`is_draft: true`) hasta que se defina el precio real.
- [x] Descripción/especificaciones/kind redactadas por Claude, marcadas `copySource: "claude_draft_approved"` — pendiente de que el usuario las revise (ver resumen en el chat).
- [x] Fotos asignadas solo donde hay correspondencia verificada — **los 22 productos ya tienen foto genérica real**, verificada 1:1 contra las fotos de referencia (recortadas para quitar texto/UI de marketing, según regla de tareas 009-010). 13 vienen de fotos de estudio propias (`Kinara parte 2/`, buena resolución); los otros 9 (ESSENTIAL SHIRT, SEATLE TOP, CONJUNTO MESH, BI COLOR SET, NEWYORKLEGGIN, NEWYORK TOP, SOFT FLARE, CONJUNTO RIB, LEGGIN FELPADA) solo tenían la foto de referencia del proveedor embebida en el Excel, de resolución más baja — usable pero **candidata a reemplazo** cuando haya una foto de estudio mejor. Foto por color: **9 de 22 productos completos** (todos sus colores tienen foto verificada) tras revisar las 152 fotos una por una — ver nota de progreso 2026-07-23. Los otros 13 quedan pendientes por falta de fotos disponibles en esta carpeta.
- [x] `npm run typecheck` sin errores.
- [x] Verificado en el navegador: `/tienda` sigue mostrando solo los 17 productos publicados (los 21 borradores no aparecen); `/producto/leggin-felpada` (borrador) da 404 limpio, sin exponer datos ni romper la ruta.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — aplica el patrón `copySource` (tarea 006) y RLS/`service_role` para toda escritura (tareas 006/015). El patrón de verificación de fotos (tareas 009-010) aplicará cuando se haga el emparejamiento de fotos, todavía pendiente.
- Regresiones encontradas: ninguna. Se revisó explícitamente que el cambio de esquema (`price` nullable + `is_draft`) no rompiera nada: `api.create-checkout-session.tsx` ahora trata un producto con `price == null` igual que uno inexistente (nunca se intenta cobrar `null`), y `admin-catalog.server.ts`/`admin.productos.tsx` muestran "Sin precio"/"Borrador" en vez de un `formatPrice(null)` silencioso.
- Requisitos nuevos agregados a `REQUISITOS.md`: el patrón `products.is_draft` + constraint `products_price_required_unless_draft` (ver sección "Datos (Supabase)").

## Pruebas manuales

- Navegar `/tienda`, filtrar y confirmar que los productos nuevos aparecen con precio/colores/tallas correctos.
- Abrir cada producto nuevo en `/producto/:slug` y confirmar stock por talla.

## Notas de progreso

- 2026-07-22: Tarea creada. Excel confirmado (`Laura2.xlsx`, 22 productos, 693 piezas). Detectado que YUCA BRA ya existe parcialmente en Supabase (mismo modelo JV-028) — hay que completarlo, no duplicarlo. Fotos identificadas (152 archivos, 2 orígenes por EXIF) pero sin emparejar todavía a producto/color. Pendiente: confirmar con el usuario precios y si el emparejamiento de fotos se hace en esta misma sesión o después.
- 2026-07-22 (continuación): El usuario confirmó: sin precio por ahora ("se los ponemos después"), Claude redacta la descripción. Se agregó migración `20260722000000_product_draft_price.sql` (`products.price` nullable + columna `is_draft` + constraint `products_price_required_unless_draft`), aplicada con `supabase db push`. Se actualizó `app/lib/catalog.ts` (filtra `is_draft=false` en las dos queries públicas), `app/lib/admin-catalog.server.ts` y `app/routes/admin.productos.tsx` (muestran "Sin precio"/badge "Borrador"), y `app/routes/api.create-checkout-session.tsx` (nunca intenta cobrar un precio nulo). Se creó `scripts/seed-data-parte2.ts` (los 22 productos con kind/descripción/materiales redactados por Claude, `copySource: "claude_draft_approved"`, colores con hex aproximado — **pendiente de re-muestrear contra foto real cuando se haga el emparejamiento**, igual que exige la tarea 012 para el resto del catálogo) y `scripts/migrate-parte2.ts` (`npm run migrate:parte2`), corridos exitosamente: 21 productos nuevos creados como borrador (`is_draft: true`, sin precio) + YUCA BRA completado (pasó de 1 a 16 filas de variantes). Verificado en el navegador: `/tienda` sigue mostrando exactamente los 17 productos publicados; `/producto/leggin-felpada` (un borrador) da 404 limpio.
- **Pendiente para cerrar la tarea**: (1) el usuario define precios reales y publica cada producto desde `/admin/productos` (editar → poner precio → guardar ya marca `is_draft: false` automáticamente), o pide a Claude que los publique vía script cuando tenga la lista de precios; (2) emparejar fotos reales por color (no solo genérica) contra las 152 imágenes de `Kinara parte 2/`; (3) una vez con fotos reales por color, re-muestrear `color_hex` desde la foto verificada (regla de la tarea 012), ya que los hex actuales son aproximaciones por nombre de color; (4) conseguir foto de estudio propia (mejor resolución) para los 9 productos que hoy solo tienen la foto de referencia del proveedor: ESSENTIAL SHIRT, SEATLE TOP, CONJUNTO MESH, BI COLOR SET, NEWYORKLEGGIN, NEWYORK TOP, SOFT FLARE, CONJUNTO RIB, LEGGIN FELPADA.
- 2026-07-22 (fotos): Se extrajeron las 22 fotos de referencia embebidas en `Laura2.xlsx` y se revisaron las 152 fotos de `Kinara parte 2/` (agrupadas por sesión de cámara vía EXIF). Se encontraron y corrigieron 2 errores de catalogación descubiertos al ver las fotos reales: **BUTTON** es un enterizo corto con botonadura (no un top — `kind` cambiado a "Enterizo"), y **ZIPPER FALDA** es en realidad un vestido tipo tenis con zíper y falda integrada (no solo una falda — descripción corregida). Se subió una foto genérica real (recortada, sin texto de proveedor) para 12 productos con foto de estudio propia: WRINKLE SHORT, CONJUNTO CAMUFLAJE, BOTTEE SET, ENTERIZO LARGO, LEISURE PANTS, ZIPPER FALDA, CONJUNTO BI COLOR SHORT, ALL OUT PANTS, LEGGIN FLARE, SET ESSENTAL, SEAMLESS SOFTESS, BUTTON (más YUCA BRA, que ya tenía la suya). El usuario preguntó por qué los otros 9 se habían quedado sin foto si el Excel trae una referencia para todos — se reconsideró: esas 9 referencias (de menor resolución/con logos de proveedor) sí eran usables recortando el logo, así que se subieron también: ESSENTIAL SHIRT, SEATLE TOP, CONJUNTO MESH, BI COLOR SET, NEWYORKLEGGIN, NEWYORK TOP, SOFT FLARE, CONJUNTO RIB, LEGGIN FELPADA. **Los 22 productos de la parte 2 ya tienen foto genérica real** (`scripts/upload-parte2-generic-photos.ts`). Verificado en `/admin/productos` (cuenta de prueba temporal, luego eliminada): ESSENTIAL SHIRT (una de las 9 de menor resolución) muestra su foto correctamente junto con el badge "Borrador" y "Sin precio".
- 2026-07-23 (fotos por color): A raíz de un bug reportado por el usuario (subir la foto rosa del vestido ZIPPER FALDA duplicaba la genérica en blanco y no guardaba la rosa), se encontraron y corrigieron dos causas reales: (1) el índice único `(product_id, color_name, position)` no protegía contra duplicados cuando `color_name` es `NULL` (semántica estándar de SQL) — se agregó el índice único parcial `product_images_generic_position_key` (migración `20260723000000_product_images_generic_unique.sql`); (2) el botón "Guardar producto" del admin no esperaba a que terminaran las subidas de imagen en curso — se agregó un contador `pendingUploads` en `ProductForm.tsx` que deshabilita el botón mientras haya una subida activa. Al revisar el color Marino de LEGGIN FELPADA (subido manualmente por alguien más, probablemente Laura, en paralelo a esta sesión) se confirmó que la foto no correspondía a la prenda (un top, no un legging) — el usuario pidió entonces que Claude mismo revisara las 152 fotos y asignara solo colores verificados contra la lista de colores del Excel, para evitar este tipo de error. Se revisaron las 152 fotos una por una (las 83 con EXIF agrupadas por ráfaga de cámara, más las 69 sin EXIF) y se subieron fotos por color verificadas para 9 productos que quedan **completos** (todas sus variantes de color tienen foto real): YUCA BRA (4/4), WRINKLE SHORT (5/5), CONJUNTO CAMUFLAJE (4/4), CONJUNTO RIB (3/3, reemplazando también su genérica de baja resolución por una foto de estudio real), ENTERIZO LARGO (3/3), LEGGIN FLARE (7/7), BOTTEE SET (3/3), SEAMLESS SOFTESS (8/8), BUTTON (2/2). Además quedaron parciales: LEGGIN FELPADA (4/5, falta Marino — la foto incorrecta ya no existe, mejor sin foto que la equivocada), ZIPPER FALDA (3/4, falta Negro), ALL OUT PANTS (3/4, falta Gris), ESSENTIAL SHIRT (1/8) y SEATLE TOP (1/7). Se agotaron las 152 fotos disponibles sin encontrar correspondencia para: CONJUNTO MESH, SET ESSENTAL, LEISURE PANTS, BI COLOR SET, CONJUNTO BI COLOR SHORT, NEWYORKLEGGIN, NEWYORK TOP, SOFT FLARE (0 fotos por color cada uno, solo su genérica) — estos necesitarán fotos nuevas de estudio para completarse.
