---
id: 011
title: "Fotos por color de LULU TOP (080924 y 2315) — producto omitido de tareas 009/010"
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

Al igual que ocurrió con AIRLIFT SHORT (0605, corregido al final de la tarea 010), los dos productos "LULU TOP" (080924 — top tipo bra, y 2315 — crop top de manga corta) quedaron completamente fuera de las tareas 009 y 010: ninguno tenía ninguna foto por color, solo la genérica. El usuario lo pidió explícitamente ("ahora lulu top").

## Objetivo

Para cada uno de los dos productos LULU TOP, verificar 1:1 contra su foto de referencia ya usada en el sitio, recortar cualquier watermark/marketing del proveedor, subir a Storage, y registrar en `product_images` con su `color_name` — mismo estándar que tareas 009/010.

## Archivos involucrados

- `scripts/upload-color-images-batch3.ts` (nuevo)
- `package.json` (nuevo script `upload:color-images-3`)
- Imágenes recortadas en scratchpad, luego subidas a Storage

## Restricciones específicas de esta tarea

- Mismo criterio de siempre: no subir ninguna foto sin confirmar visualmente el diseño contra la referencia (`producto_2.png` para 080924, `producto_10.png` para 2315), limpiar watermarks, verificar color por muestreo RGB contra el hex, y comparar resolución contra el baseline (umbral 50%).

## Pasos sugeridos

1. Confirmar en la base que ninguno de los dos productos tenía fotos por color.
2. Identificar el grupo de imágenes candidatas del catálogo del proveedor para cada uno (grupo "BRA" imágenes 96-120 para 080924; grupo "CROP-TOP" imágenes 136-151 para 2315).
3. Verificar diseño 1:1 contra la referencia, limpiar watermarks, verificar color contra hex, comparar resolución.
4. Subir y registrar en `product_images`.
5. Probar en el navegador.

## Criterios de aceptación

- [x] LULU TOP (080924): 5/5 colores (Hueso, Rey, Lila, Marino, Negro) con foto real verificada.
- [x] LULU TOP (2315): 6/7 colores con foto real verificada (falta P.De Rosa, sin candidato confiable en el catálogo disponible — queda oculto del swatch, comportamiento correcto).
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — mismo estándar que tareas 009/010 (verificación 1:1, limpieza de watermarks, muestreo de color contra hex, comparación de resolución contra baseline, cobertura completa de productos).
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno nuevo — esta tarea es una aplicación directa de los ya existentes (incluido el de "verificar cobertura completa" agregado en la tarea 010, que fue precisamente lo que detectó este caso).

## Resultado final por producto

| Producto | Colores en Excel | Colores con foto real | Faltantes (ocultos del swatch) |
|---|---|---|---|
| LULU TOP (080924) | 5 | 5: Hueso, Rey, Lila, Marino, Negro | — completo |
| LULU TOP (2315) | 7 | 6: Lila, Rojo, Negro, Rey, Mulberry, Rosafresa | P.De Rosa (sin candidato disponible en el catálogo para este diseño) |

## Pruebas manuales

- [x] `/producto/lulu-top`: recorrido de los 5 colores, foto cambia correctamente y coincide con cada color (incluida verificación de que ninguna trae watermark "VETEGA ACTIVEWEAR" residual).
- [x] `/producto/lulu-top-2315`: recorrido de los 6 colores disponibles, foto cambia correctamente; P.De Rosa confirmado ausente del swatch (comportamiento esperado, no hay foto verificada).

## Notas de progreso

- 2026-07-14: Todo el grupo "BRA" (imágenes 96-120 del catálogo, candidatas para 080924) resultó tener el watermark semitransparente "VETEGA ACTIVEWEAR" superpuesto en la esquina superior derecha — no detectado en tareas anteriores porque este producto no se había tocado. Se ajustó el recorte por imagen (fracciones de ancho entre 0.62 y 0.70 según la composición) verificando visualmente en cada caso que no quedara ningún resto de texto.
- 2026-07-14: Para "Marino" y "Lila" (080924), los únicos candidatos disponibles eran de resolución nativa 452×602; tras el recorte del watermark algunos quedaban justo por debajo del umbral del 50% vs. el baseline (`producto_2.png`, 506×672). Se ajustó la fracción de recorte al mínimo necesario para eliminar el watermark (en vez de aplicar siempre el mismo recorte agresivo) para maximizar la resolución retenida — Marino quedó en 56% del baseline, Lila en 51%, ambos por encima del umbral.
- 2026-07-14: Color "Lila" (080924) verificado con muestreo RGB: la prenda mostró la firma característica de un lila (R≈B, ambos mayores que G) distinguiéndola claramente de la muestra "Rosa" (R dominante sobre B), aunque bajo la iluminación del estudio se veía visualmente muy clara/desaturada.
- 2026-07-14: Grupo "CROP-TOP" (imágenes 136-151, candidatas para 2315) resultó estar libre de watermarks (fotografía sobre fondo blanco, sin marca superpuesta) — no requirió recorte.
- 2026-07-14: Se encontró una captura de página completa del proveedor (imagen 139/140) mostrando la barra de swatches de colores del producto original; se usó muestreo RGB de cada swatch contra los 7 hex de la base de datos para resolver la asignación color→imagen con precisión, en vez de adivinar por descripción. Esto permitió distinguir con confianza "Rosafresa" (rosa-coral, R dominante, G≈B) de "Mulberry" (magenta oscuro, R y B altos, G bajo) — dos colores que a simple vista podrían confundirse.
- 2026-07-14: No se encontró ningún candidato para "P.De Rosa" (2315) en el catálogo disponible (rosa pálido casi blanco) — se buscó también en el rango de imágenes 152-169 por si pertenecía a este producto, pero corresponden a un diseño distinto (top sin mangas, tirantes anchos). Color documentado como faltante, no oculto por error.
- 2026-07-14: 11 fotos subidas vía `scripts/upload-color-images-batch3.ts` (`npm run upload:color-images-3`), reutilizando el mismo patrón de las tareas anteriores (slug ASCII-safe, upsert con `onConflict: product_id,color_name,position`).
- 2026-07-14: Verificado en navegador: los 5 colores de `/producto/lulu-top` y los 6 colores disponibles de `/producto/lulu-top-2315` muestran su foto real correctamente; `npm run typecheck` sin errores.
- **TAREA COMPLETADA.**
