---
id: 010
title: "Fotos por color restantes (chamarras ambiguas + colores faltantes)"
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

Continuación de la tarea 009. Ya están resueltos con foto real por color: BICROSSFLARE, CONJUNTO NUBE, NO LIMITE SHORT, ACCOLADE HOODIE (100%) y DAILY TOP (parcial, 2/4). Quedó pendiente resolver:

1. **CHAQUETA FIT (JV001) vs LILIA CHAQUETA (JV024)**: el proveedor usa el mismo molde de chamarra ("cuello mock, medio zíper") para ambas — hay ~25 fotos candidatas en el catálogo (`~/Documents/kinara/WeTransfer Image Jul 07 2026/`, imágenes 28-37 y 80-95) repartidas entre las dos, sin verificar cuál color va a cuál SKU.
2. **TECNO PREMIUM (080225) vs CHAMARRA NIKKA (080624)**: mismo problema — ambas son "hoodie corto con cierre", candidatas en imágenes 206-212.
3. **DAILY TOP (3322)**: faltan fotos de Vino y Rosa (no están en el catálogo disponible) — estos 2 colores siguen ocultos del swatch.
4. **ZIPPER BRA (2509), SWIFT LEGGIN (JV002), ALIGH LEGGIN (2420), PASTEL FALDA (JV014)**: candidatas identificadas en el catálogo (ver notas de progreso de la tarea 009) pero sin verificar 1:1 contra la foto de referencia ya usada en el sitio.

## Objetivo

Para cada producto de la lista, verificar 1:1 contra su foto de referencia ya usada en el sitio (evitar el error de mezclar el molde compartido entre dos SKUs), recortar el texto de marketing del proveedor, subir a Storage, y registrar en `product_images` con su `color_name` — siguiendo exactamente el mismo patrón que la tarea 009 (`scripts/upload-color-images.ts` se puede extender o reutilizar como base).

## Archivos involucrados

- `scripts/upload-color-images.ts` (extender con las nuevas entradas)
- Imágenes recortadas nuevas (scratchpad, luego Storage)
- `app/lib/catalog.ts` — ya soporta esto sin cambios adicionales (el filtro de colores es automático en cuanto haya `product_images.color_name`)

## Restricciones específicas de esta tarea

- No subir ninguna foto sin confirmar visualmente que el corte/diseño coincide con la foto de referencia actual del producto (mismo criterio que la tarea 009) — para las chamarras/hoodies ambiguos, comparar detalles específicos (largo de cuello, tipo de bolsillo, costuras) antes de asignar un color a un SKU.
- Si no se puede verificar con confianza para algún color, dejarlo fuera (oculto del swatch) en vez de adivinar.

## Pasos sugeridos

1. Releer `product_04_CHAQUETA_FIT.png` y `product_10_LILIA_CHAQUETA.png` (referencias ya usadas) y comparar contra cada candidata de las imágenes 28-37 y 80-95 uno por uno.
2. Repetir el mismo proceso para TECNO PREMIUM vs CHAMARRA NIKKA (imágenes 206-212).
3. Verificar candidatas de ZIPPER BRA, SWIFT LEGGIN, ALIGH LEGGIN, PASTEL FALDA contra sus referencias.
4. Recortar, subir, y registrar en `product_images` los colores confirmados.
5. Probar en el navegador cada producto tocado.

## Criterios de aceptación

- [x] CHAQUETA FIT y LILIA CHAQUETA tienen sus colores correctamente asignados (sin mezclar entre sí) y muestran foto real al cambiar de color.
- [x] TECNO PREMIUM y CHAMARRA NIKKA ídem — se descubrió que ambos productos ya tenían la foto/descripción correcta desde el principio (la etiqueta "CHAMARRA NIKKA" que el agente de catalogación reportó en la imagen 206 era un error suyo; verificado directamente por mí, esa imagen no tiene ningún texto).
- [x] ZIPPER BRA, SWIFT LEGGIN, ALIGH LEGGIN, PASTEL FALDA: los colores verificados muestran foto real; los no verificados quedan ocultos del swatch.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — mismo estándar que tarea 009 (no subir foto sin verificar 1:1, limpiar texto de marketing).
- Regresiones encontradas: se detectó y corrigió un error propio — `aligh_vino.jpg` se subió inicialmente sin recortar la galería de miniaturas/título que traía incrustados en los píxeles (a diferencia de las demás imágenes de la tarea, a esta se le olvidó aplicar el recorte). Corregido re-recortando y re-subiendo antes de cerrar la tarea.
- Requisitos nuevos agregados a `REQUISITOS.md`: ver abajo.

## Resultado final por producto

| Producto | Colores en Excel | Colores con foto real | Faltantes (ocultos del swatch) |
|---|---|---|---|
| CHAQUETA FIT (JV001) | 6 | 5: Negro, Marino, Café, Azulgris, Lila | P.De Rosa (candidatas eran rojo/magenta saturado, no el rosa pálido del hex) |
| LILIA CHAQUETA (JV024) | 2 | 2: Rey, Negro | — completo |
| TECNO PREMIUM (080225) | 4 | 4: Negro, Blanco, Café, Rosa | — completo |
| CHAMARRA NIKKA (080624) | 4 | 3: Negro, Hueso, Rosa | Café (no disponible en el catálogo para este diseño de anorak) |
| ZIPPER BRA (2509) | 3 | 2: Negro, Rey | Vino (candidatas eran rojo brillante, no vino) |
| SWIFT LEGGIN (JV002) | 8 | 8: todos | — completo |
| PASTEL FALDA (JV014) | 3 | 3: todos | — completo |
| ALIGH LEGGIN (2420) | 3 | 1: Vino | Negro y Rey (solo existían como miniaturas diminutas de WhatsApp, no en resolución usable) |

**Hallazgo importante confirmado:** la sospecha inicial de que TECNO PREMIUM y CHAMARRA NIKKA podían tener su foto/descripción cruzada resultó ser falsa — ambas ya estaban correctamente asignadas desde antes (verificado comparando la etiqueta "TECNO PREMIUM" impresa en la imagen 212 contra el diseño con capucha, y confirmando que CHAMARRA NIKKA es el diseño de anorak sin capucha en imágenes 202-205).

## Pruebas manuales

- [x] Recorrido en navegador de los 8 productos tocados (CHAQUETA FIT, LILIA CHAQUETA, TECNO PREMIUM, CHAMARRA NIKKA, ZIPPER BRA, SWIFT LEGGIN, PASTEL FALDA, ALIGH LEGGIN): click en cada color disponible, confirmado que la foto corresponde al color real.
- [x] Confirmado que ALIGH LEGGIN, tras corregir el recorte faltante, ya no muestra la galería de miniaturas del proveedor incrustada en la imagen.

## Notas de progreso

- 2026-07-13: Creada a partir del cierre de la tarea 009, con todo el contexto de investigación ya hecho (ver notas de progreso de esa tarea).
- 2026-07-13: Resuelta la ambigüedad CHAQUETA FIT/LILIA CHAQUETA comparando contra las fotos de referencia ya usadas en el sitio + muestreo de color (RGB) contra los valores hex exactos de cada color en la base, en vez de confiar solo en descripciones de texto.
- 2026-07-13: Resuelta la ambigüedad TECNO PREMIUM/CHAMARRA NIKKA — no había tal ambigüedad, ambos productos ya estaban bien desde el principio.
- 2026-07-13: 28 fotos nuevas subidas vía `scripts/upload-color-images-batch2.ts` (`npm run upload:color-images-2`). Tuvo que corregirse el slugificador de nombres de Storage para quitar tildes (Supabase Storage rechaza claves con caracteres no-ASCII como "café").
- 2026-07-13: Detectado y corregido un error propio en `aligh_vino.jpg` (imagen sin recortar, con galería/título del proveedor incrustados) — re-subida corregida y verificada en navegador antes de cerrar la tarea.
- 2026-07-14: Usuario pidió auditar calidad/resolución de las 47 fotos subidas contra el estándar real del Excel (no solo contra un umbral arbitrario). Se descargaron las 47 fotos y se comparó el área en píxeles de cada una contra la foto original de ese producto en `public/productos/producto_N.png`. Resultado: 46/47 igualan o superan la resolución del Excel; la única excepción real es BICROSSFLARE/Azul Gris (25% del área original — el único candidato disponible en el catálogo era una miniatura pequeña). Se corrigió además un resto de texto "Ex..." visible en esa misma foto (recorte más agresivo, la resolución bajó un poco más pero quedó limpia).
- 2026-07-14: Al revisar PASTEL FALDA/Rosa se detectó un problema de encuadre (solo piernas, sin torso) distinto al de resolución — no se encontró mejor alternativa en el catálogo para esa combinación producto/color.
- 2026-07-14: **Resuelto** — el usuario indicó usar directamente la foto de referencia original del producto (`public/productos/producto_11.png`, ya aprobada) para PASTEL FALDA/Rosa en vez de la candidata del catálogo con el problema de encuadre, y lo mismo para CHAMARRA NIKKA/Hueso (`public/productos/producto_5.png`) — ambas fotos de referencia ya mostraban exactamente ese color con encuadre completo. Se re-subieron como la foto de ese color específico (mismo mecanismo de Storage) y se recalculó su `color_hex` muestreando la nueva foto (ver tarea 012). Verificado en navegador (`/producto/pastel-falda`, `/producto/chamarra-nikka`).
- 2026-07-14: **Hallazgo importante** — AIRLIFT SHORT (0605) se había quedado completamente fuera de las tareas 009/010 (no tenía ninguna foto por color, solo la genérica). Corregido: se identificaron y subieron sus 5 colores (Ivory, Rey, Lila, Marino, Negro) desde el catálogo, aplicando el mismo estándar de verificación (diseño 1:1 contra `producto_1.png`, muestreo de color contra el hex, comparación de resolución contra el baseline). Para "Marino" se descartó el primer candidato encontrado (339×452px, solo 34% del baseline) y se sustituyó por uno mejor (640×647px, 93% del baseline) tras buscar una segunda opción en el catálogo.
- Todas las fotos de este batch adicional verificadas en el navegador (`/producto/airlift-short`, swatch completo, foto cambia correctamente por color).
- **TAREA COMPLETADA.**
