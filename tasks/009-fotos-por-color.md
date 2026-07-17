---
id: 009
title: "Fotos reales por color de producto"
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

Hoy cada producto tiene una sola foto en Supabase (Storage + `product_images`), y el swatch de color no cambia la imagen mostrada — se ve siempre la misma foto sin importar el color elegido. El usuario tiene un catálogo real del proveedor (`~/Documents/kinara/WeTransfer Image Jul 07 2026/`, exportado de WhatsApp, 219 imágenes) que incluye fotos del mismo diseño de prenda en varios colores. Se pidió: buscar en ese catálogo las fotos que correspondan a nuestros 16 productos/colores reales y subirlas a la base de datos, para que al elegir un color se vea la prenda en ese color de verdad (no solo el punto de color).

## Hallazgos del análisis (ver conversación)

- La carpeta mezcla el catálogo mayorista completo del proveedor (incluye accesorios que no vendemos: diademas, calcetines) con capturas de pantalla de un sitio web y una hoja de pedido escaneada. Se filtraron 173 imágenes "grandes" (no íconos) de 219 totales.
- Muchas fotos ya tienen escrito el nombre exacto de nuestro producto (ej. "BI CROSS FLARE", "CONJUNTO NUBE", "AIRLIFT SHORT", "DAILY TOP", "SWIFT LEGGIN", "CHAQUETA FIT", "PASTEL FALDA", "ALIGH HIGN RISE LEGGIN") — parece un lookbook preparado para Kinara, no un catálogo genérico.
- **Coincidencias confirmadas (nombre en la foto + colores calzan exacto con la base de datos):**
  - BICROSSFLARE: 7/7 colores (Negro=img11, Marino=img9, Cocoa=img2/3, Gris=img12, Azul Gris=img7, Verde Fresco=img5, Rosa=img10).
  - CONJUNTO NUBE: 6/6 colores (Negro=img19/20, Marino=img21, Botanica Verde=img22, Azul Gris=img23/24, Melon=img25, Mulberry=img26).
  - NO LIMITE SHORT: 2/2 colores (Negro=img14, Blanco=img15/17).
  - ACCOLADE HOODIE: 2/2 colores (Blanco=img189, Negro=img191) — es un hoodie oversize sin cierre, no confundir con el grupo "cropped zip hoodie" (206-212) que pertenece a TECNO PREMIUM/CHAMARRA NIKKA.
  - DAILY TOP: 2/4 colores confirmados (Blanco=img154/156/157, Negro=img159/160). Faltan Vino y Rosa — no están en el catálogo disponible.
- **Ambigüedad sin resolver todavía (mismo molde de prenda usado por el proveedor en más de un SKU nuestro):**
  - CHAQUETA FIT (JV001) vs LILIA CHAQUETA (JV024): ambas son "chamarra cuello mock, medio zíper" y hay ~25 fotos candidatas repartidas entre las dos (img28-37 y img80-95). Falta decidir qué color va a cuál SKU antes de subir nada.
  - TECNO PREMIUM (080225) vs CHAMARRA NIKKA (080624): ambas son "hoodie corto con cierre", candidatas en img206-212.
  - ZIPPER BRA, SWIFT LEGGIN, ALIGH LEGGIN, PASTEL FALDA: candidatas identificadas pero sin verificar 1:1 todavía.
- **Decisión del usuario sobre LULU TOP (080924):** la foto ya publicada (bra deportivo de espalda cruzada) no coincide con la descripción original del Excel ("crop top de manga corta y cuello redondo"). El usuario decidió: **dejar la foto tal cual y corregir la descripción/especificaciones** para que describan lo que realmente se ve en la foto (bra deportivo, no crop top de manga corta).
- **Decisión del usuario sobre colores sin foto verificada:** el swatch de color en el sitio debe mostrar **solo** los colores que tengan una foto real verificada; los demás colores se ocultan del swatch temporalmente (aunque su stock siga existiendo en `product_variants` por si se agregan fotos después).

## Objetivo

1. Extender el esquema para soportar una imagen por (producto, color), no solo una imagen genérica por producto.
2. Subir las imágenes confirmadas (BICROSSFLARE, CONJUNTO NUBE, NO LIMITE SHORT, ACCOLADE HOODIE, DAILY TOP parcial) a Supabase Storage, limpias de texto/badges superpuestos del proveedor donde aplique.
3. Que la página de producto cambie la foto mostrada al elegir un color (cuando exista foto real para ese color).
4. Que el swatch de color solo muestre los colores con foto real verificada.
5. Corregir descripción/especificaciones de LULU TOP (080924) para que coincidan con su foto real (bra deportivo).
6. Resolver la ambigüedad de CHAQUETA FIT/LILIA CHAQUETA y TECNO PREMIUM/CHAMARRA NIKKA antes de subir esos colores (queda pendiente, no bloquea el resto).

## Archivos involucrados

- nuevo `supabase/migrations/*_product_images_color.sql` (agregar columna `color_name` a `product_images`)
- `app/lib/supabase.types.ts`, `app/lib/catalog.ts` (tipo `Product` necesita imagen por color; `colors` filtrado a solo los que tienen foto)
- `app/routes/producto.$slug.tsx` (cambiar la imagen mostrada al seleccionar color)
- nuevo script de subida (extensión de `scripts/migrate-products.ts` o script nuevo) para las imágenes por color
- Supabase: `products.description`/`materials` de `080924` (vía SQL directo o script)

## Restricciones específicas de esta tarea

- No subir ninguna foto a un color/SKU sin verificar 1:1 que el diseño de la prenda coincide con la foto ya usada como referencia del producto — mejor dejar un color sin foto (oculto del swatch) que mostrar la prenda equivocada.
- Limpiar/recortar texto de marketing del proveedor superpuesto en las fotos antes de publicarlas (no se ve profesional con texto en inglés/chino en el sitio de Kinara).
- No perder los colores sin foto de `product_variants` (siguen existiendo para inventario), solo se ocultan del swatch visible.

## Pasos sugeridos

1. Migración SQL: agregar `color_name text null` a `product_images`, ajustar unique constraint a `(product_id, color_name, position)`.
2. Recortar/limpiar las imágenes confirmadas (BICROSSFLARE, CONJUNTO NUBE, NO LIMITE SHORT, ACCOLADE HOODIE, DAILY TOP) quitando badges/texto superpuesto.
3. Subir esas imágenes a Storage y registrar en `product_images` con su `color_name`.
4. Actualizar `catalog.ts`: `colors` solo incluye colores con imagen propia; agregar mapa color→imagen al `Product`.
5. Actualizar `producto.$slug.tsx`: al hacer click en un color, si tiene imagen propia, mostrarla en la galería.
6. Corregir descripción/materiales de LULU TOP (080924) en Supabase.
7. Seguir resolviendo CHAQUETA FIT/LILIA CHAQUETA y TECNO PREMIUM/CHAMARRA NIKKA en una iteración siguiente.

## Criterios de aceptación

- [x] BICROSSFLARE, CONJUNTO NUBE, NO LIMITE SHORT, ACCOLADE HOODIE muestran foto real al cambiar de color (100% de sus colores, verificado en navegador).
- [x] DAILY TOP muestra foto real en Blanco y Negro; Vino y Rosa quedan ocultos del swatch (verificado: solo 2 botones de color presentes).
- [x] Ninguna imagen publicada tiene texto/badge del proveedor visible (recortadas con PIL, verificadas visualmente una por una antes de subir).
- [x] LULU TOP (080924): descripción y especificaciones coinciden con la foto real (bra deportivo) — actualizado en Supabase y en `scripts/seed-data.ts`.
- [x] `npm run typecheck` pasa sin errores.
- [x] El resto de los productos (sin cambios en esta iteración) se ven exactamente igual que antes — el filtro de colores solo aplica a productos con al menos una foto por color cargada; los demás siguen con su comportamiento previo intacto.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no debe romper RLS (tarea 006) ni el diseño aprobado (regla de UI/UX en `CLAUDE.md`, cambio de foto por color es aditivo, no un rediseño).
- Regresiones encontradas: -
- Requisitos nuevos agregados a `REQUISITOS.md`: soporte de imagen por color en el esquema; el swatch de color debe reflejar solo colores con foto verificada.

## Pruebas manuales

- [x] `/producto/bicrossflare`: click en Verde Fresco → foto cambia correctamente a la variante verde.
- [x] `/producto/conjunto-nube`: click en Mulberry → foto cambia correctamente a la variante borgoña.
- [x] `/producto/no-limite-short`: click en Blanco → foto cambia correctamente.
- [x] `/producto/accolade-hoodie`: ambos colores (Negro/Blanco) con foto propia confirmados.
- [x] `/producto/daily-top`: swatch solo muestra Blanco y Negro (Vino/Rosa ocultos, confirmado vía DOM).
- [x] `npm run typecheck` limpio en todo momento durante la implementación.

## Notas de progreso

- 2026-07-13: Catálogo del proveedor localizado y catalogado (agente general-purpose revisó las 173 imágenes grandes). Comparado contra fotos de referencia ya usadas en el sitio para resolver ambigüedades de nombres duplicados.
- 2026-07-13: Usuario decidió: (a) LULU TOP 080924 mantiene su foto actual, se corrige la descripción; (b) colores sin foto verificada se ocultan del swatch en vez de mostrarse con la foto genérica.
- 2026-07-13: Implementado y verificado end-to-end:
  - Migración `20260713000000_product_images_color.sql` aplicada (columna `color_name`, constraint actualizado).
  - 19 fotos recortadas (quitando texto/badges del proveedor con PIL) y subidas a Storage vía `scripts/upload-color-images.ts` (`npm run upload:color-images`): BICROSSFLARE 7/7, CONJUNTO NUBE 6/6, NO LIMITE SHORT 2/2, ACCOLADE HOODIE 2/2, DAILY TOP 2/4 (Vino y Rosa sin foto disponible en el catálogo).
  - `catalog.ts` actualizado: `colors` se filtra a solo colores con foto cuando el producto tiene al menos una; `colorImages` expuesto en `Product`.
  - `producto.$slug.tsx` actualizado: la galería cambia a la foto del color elegido (con `key={color}` para resetear el índice activo).
  - LULU TOP (080924): descripción/especificaciones corregidas en Supabase y en `scripts/seed-data.ts` para coincidir con la foto real.
  - Verificado en navegador: los 4 productos con fotos completas cambian de imagen correctamente al clickear cada color; DAILY TOP solo lista 2 colores; ningún otro producto cambió de comportamiento.
- **Pendiente para una iteración futura** (no bloquea el cierre de esta tarea): resolver la ambigüedad de CHAQUETA FIT vs LILIA CHAQUETA y TECNO PREMIUM vs CHAMARRA NIKKA (mismo molde de prenda del proveedor usado en más de un SKU nuestro) antes de subir esos colores. También faltan fotos de Vino/Rosa para DAILY TOP, y verificar ZIPPER BRA, SWIFT LEGGIN, ALIGH LEGGIN, PASTEL FALDA contra el catálogo.
