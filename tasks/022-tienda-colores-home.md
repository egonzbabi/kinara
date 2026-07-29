---
id: 022
title: "Limpieza de /tienda, colores exactos, quitar Hombre, rediseño de home"
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

Continuación directa de la tarea 021. El usuario pidió, en un solo pedido: quitar la etiqueta "Tienda · SS26" y el filtro "Tipo" de `/tienda` (redundante con el menú principal ya rediseñado); arreglar que los círculos de color del filtro no coincidieran con el color real de las fotos; arreglar que el filtro de color "no funciona bien"; quitar todo rastro de "Hombre" que quedara en el sitio; rediseñar "Encuentra lo tuyo" de la home con los tipos de producto (con foto real en cada tile); rediseñar el Lookbook con fotos reales; quitar la sección de suscripción (para una etapa futura); y quitar "Hecho con cuidado en España" del footer.

## Objetivo

`/tienda` queda con un filtro simple y con hexadecimales de color reales; no queda ningún "Hombre" visible en el sitio; la home muestra tipos de producto reales con foto verificada y un Lookbook con fotos/productos reales; no hay newsletter ni mención a España.

## Archivos involucrados

- `app/routes/tienda.tsx` — quitó la etiqueta "Tienda · SS26" y el bloque de filtro "Tipo" (y `allTypes`, ya sin uso); el `<h1>` ahora refleja el tipo activo (`?tipo=`) cuando aplica, no solo la categoría.
- `app/data/categories.ts` — reescrito: de tiles "Mujer/Hombre/Accesorios" a tiles por tipo real (Top/Bottom/Legging/Chaqueta/Enterizo/Set), cada uno con una foto real ya subida.
- `app/components/CategoryTiles.tsx` — usa `productImage`/`productSrcSet` (fotos reales de Supabase) en vez de `img()` (stock); linkea a `/tienda?tipo=X`.
- `app/data/looks.ts` — reescrito: de "looks" con fotos de stock a 6 fotos reales de estudio ya verificadas, cada una con el nombre real del producto/color y su slug.
- `app/components/LookbookBand.tsx` — cada tile ahora es un link a `/producto/:slug` real, con `productImage`/`productSrcSet`.
- `app/routes/_index.tsx` — quitó `<Newsletter />` (el componente NO se borró, queda listo para reactivar en la siguiente etapa).
- `app/components/SiteFooter.tsx` — quitó el link "Hombre" de la columna Tienda; quitó "· Hecho con cuidado en España" de la línea de copyright.
- `app/data/images.ts` — limpieza: `heroSecondary`, `categoryMujer/Hombre/Accesorios`, `lookbookA-D` quedaron sin uso tras los cambios de arriba, se borraron (código muerto).
- Datos en Supabase (`product_variants.color_name`, `.color_hex`) — ver sección de datos abajo.

## Restricciones específicas de esta tarea

- No se tocó `app/components/admin/ProductForm.tsx` (el `<option value="hombre">` del selector de categoría) ni `Category`/`CATEGORY_LABELS` en `app/data/products.ts` — "hombre" sigue siendo un valor válido de categoría a nivel de esquema/admin, por si algún día se agrega un producto de esa categoría; lo que se pidió quitar era la presencia visible en el sitio público, no la capacidad técnica del admin.
- No se borró el componente `Newsletter.tsx` — el usuario pidió dejarlo para la siguiente etapa, no eliminarlo.

## Corrección de datos: nombres de color duplicados (bug del filtro)

El filtro de color de `/tienda` mostraba ~40 círculos con muchos casi-duplicados por inconsistencia de formato entre productos del catálogo original (17) y los de la tarea 018 (22 nuevos) — ej. "Azul Gris" vs "Azulgris", "Palo De Rosa" vs "P.De Rosa", "Rojo-Vino" vs "Vino", "Rosa"+"Fresa" mezclados en "Rosafresa", "Turquesa" vs "Azul-Turquesa". Se confirmó por **hex idéntico** que eran el mismo color con formato distinto (ej. "Azul-Turquesa" y "Turquesa" comparten hex `#30BFBF` exacto) antes de fusionar — nunca por nombre solo. Se actualizó `product_variants.color_name` y `product_images.color_name` para las 5 fusiones, bajando de 40 a 35 nombres distintos:

- Azulgris → Azul Gris
- Azul-Turquesa → Turquesa
- P.De Rosa → Palo De Rosa
- Rojo-Vino → Vino
- Rosafresa → Fresa

## Corrección de datos: `color_hex` muestreado de la foto real

Para las 160 combinaciones (producto, color) que ya tienen una foto real verificada, se escribió un script de muestreo (Python + Pillow, sin dependencias externas) que:

1. Recorta el centro de la foto (donde suele estar la prenda, no el fondo) en 3 niveles de zoom progresivos.
2. Cuantiza esa región a sus colores dominantes (`Image.quantize`, MEDIANCUT).
3. Descarta clusters de fondo (baja saturación) y de piel (rango de matiz/saturación/valor típico de tono de piel), salvo en colores donde el nombre ya implica un tono piel (Café, Cocoa, Camel, Hueso, Melón — ahí no se descarta piel).
4. Toma el cluster restante más frecuente como el color de la prenda.
5. Aplica una validación final: si el resultado es implausible para el nombre (ej. "Negro" saliendo claro, "Blanco" saliendo oscuro/saturado, un nombre de familia clara —Rosa, Lila, Ivory...— saliendo muy oscuro, o cualquier color no-piel saliendo con pinta de piel), **rechaza el muestreo y deja el hex anterior sin cambios** en vez de forzar un valor peor.

Resultado: 145 de 160 colores actualizados con su hex real muestreado de la foto; 15 quedaron con su hex anterior (mayormente "Negro" en fotos donde el recorte no logró aislar bien la prenda del fondo, y 2-3 fotos con capas superpuestas — ej. una chamarra clara sobre un top oscuro — donde el muestreo confundía la capa interior con el color del producto). Verificado visualmente con dos lotes de spot-check (36 combinaciones al azar comparadas foto vs. swatch) antes de aplicar a la base de datos completa.

**Limitación conocida, no resuelta en esta tarea**: el muestreo automático no es 100% preciso — es una mejora sustancial sobre los hex aproximados anteriores (basados en el nombre del color, no en la foto), pero no equivale a una verificación manual foto-por-foto como se hizo en las tareas 009-010 para el emparejamiento de fotos. Si se detecta un color visiblemente incorrecto en el futuro, corregirlo puntualmente (no hay forma de detectarlos todos sin revisión manual una por una).

## Pasos sugeridos

1. Quitar etiqueta y filtro "Tipo" de `tienda.tsx`, ajustar el `<h1>` para reflejar `?tipo=`.
2. Auditar `product_variants.color_name` (distinct + hex + productos) para encontrar duplicados por formato inconsistente; fusionar solo los confirmados por hex idéntico.
3. Escribir y calibrar el script de muestreo de color (ver arriba), validar con spot-checks visuales antes de aplicar en bloque.
4. Quitar "Hombre" de `SiteFooter.tsx` (nav ya se hizo en tarea 021).
5. Rediseñar `categories.ts` + `CategoryTiles.tsx` con tipos reales y fotos reales.
6. Rediseñar `looks.ts` + `LookbookBand.tsx` con fotos/productos reales, linkeando a la página real.
7. Quitar `<Newsletter />` de la home (sin borrar el componente) y "Hecho con cuidado en España" del footer.
8. Limpiar `images.ts` de constantes ya sin uso.

## Criterios de aceptación

- [x] `/tienda` no muestra "Tienda · SS26" ni el filtro "Tipo".
- [x] El `<h1>` de `/tienda` muestra el tipo activo cuando se llega vía `?tipo=` (ej. "Top"), no siempre "Toda la colección".
- [x] El filtro de color bajó de 40 a 35 nombres (fusionados los duplicados de formato) y 145/160 colores con foto real tienen su hex muestreado de esa foto.
- [x] No queda "Hombre" visible en el menú, en `/tienda`, en la home ni en el footer (sí sigue existiendo como opción de categoría en el admin, ver restricciones).
- [x] "Encuentra lo tuyo" muestra 6 tipos reales (Top, Bottom, Legging, Chaqueta, Enterizo, Set) cada uno con una foto real y link a `/tienda?tipo=X`.
- [x] El Lookbook muestra 6 fotos reales de producto, cada una linkeando a su página real (`/producto/:slug`).
- [x] La home ya no muestra la sección de suscripción (el componente sigue existiendo, sin usar).
- [x] El footer ya no dice "Hecho con cuidado en España".
- [x] `npm run typecheck` sin errores.
- [x] Verificado en el navegador (vía DOM/network, ver notas de progreso — la herramienta de screenshot tuvo fallos intermitentes en esta sesión).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí.
- Regresiones encontradas: ninguna nueva. Se re-confirmó que `getAllProducts`/`getProductBySlug` (tarea 018) no se tocaron — el cambio de `color_name`/`color_hex` es solo de datos, no de esquema ni de lógica de lectura.
- Requisitos nuevos agregados a `REQUISITOS.md`: sí — regla de nombres de color consistentes (nunca crear un nombre nuevo con formato distinto a uno ya existente sin verificar por hex si es el mismo color) y la metodología de muestreo de `color_hex` desde foto real.

## Pruebas manuales

- `/tienda`: confirmar que no aparece la etiqueta ni el filtro Tipo, que el `<h1>` cambia según `?tipo=`, y que el filtro de color muestra ~35 swatches con colores creíbles.
- Home: confirmar "Encuentra lo tuyo" con 6 tipos + foto real cada uno, Lookbook con 6 productos reales (clic navega a `/producto/:slug` correcto), sin sección de suscripción.
- Footer: confirmar que no dice "Hombre" ni "España".

## Notas de progreso

- 2026-07-28: Implementado completo en una sesión (múltiples partes del mismo pedido del usuario). La herramienta de screenshot del navegador tuvo fallos intermitentes (capturas en blanco) durante la verificación final — se verificó en su lugar por DOM (`querySelector`, `img.complete`/`naturalWidth`, `fetch` directo a las URLs de Supabase) y por texto de página, confirmando que todo carga y renderiza correctamente pese a no poder capturar una screenshot limpia en el momento.
