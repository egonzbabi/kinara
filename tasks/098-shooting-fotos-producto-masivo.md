---
id: 098
title: "Catálogo: subida masiva de fotos del shooting profesional (reemplazo por color, ~30 productos)"
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

El usuario compartió un .zip (`Kinara Product Photos.zip`, 1.4 GB, ~1000 archivos) con el shooting profesional de fotos de producto, organizado en carpetas por producto con archivos nombrados "PRODUCTO - Color N.ext". Pidió subir todas las fotos al catálogo, indicando que cada archivo trae el nombre del artículo y su color.

## Objetivo

Cada color de producto que tenga fotos nuevas en el shooting muestra esas fotos profesionales en el sitio, reemplazando la(s) foto(s) genérica(s)/de proveedor que tenía antes.

## Proceso

1. **Extracción y catalogado**: el zip se extrajo a un directorio de trabajo temporal (con `ditto`, no `unzip`, por problemas de codificación de nombres con tildes). Se exportó el catálogo real (productos, variantes, imágenes) desde Supabase para comparar contra las carpetas del shooting.
2. **Emparejamiento carpeta → producto**: de 38 carpetas bajo "Pre Done", 31 coincidieron exactamente con el nombre de un producto ya existente; 5 tenían un error de tipeo en el nombre de la carpeta pero se identificaron con confianza (`Duo Sprint Set ERROR`→DUO SPRINT SET, `Duo Morion Set`→DUO MOTION SET, `Power Camouflaje Set`→POWER CAMUFLAJE SET, `Sculpt Flare Leggins`→SCULPT FLARE LEGGING, `Seamless Softness`→SEAMLESS SOFTESS); 2 no correspondían a ningún producto existente (`Barbi Legins`, `Felty Pants`).
3. **Emparejamiento archivo → color**: dentro de cada carpeta, el color se detectó comparando el nombre de archivo contra los `color_name` reales de las variantes de ese producto (evita depender de un solo patrón de guiones/espacios, que no era consistente entre carpetas).
4. **Decisiones consultadas con el usuario antes de subir nada** (ver "Notas de progreso" para el detalle):
   - Reemplazar las fotos viejas por las nuevas (no dejarlas ambas).
   - AURA TOP (Rojo, Verde) y ONE MOTION JUMPSUIT (Negro): colores nuevos sin variante todavía en el catálogo → no se subieron en este pase.
   - `Barbi Legins` y `Felty Pants`: no son productos existentes → ignorados en este pase.
   - 5 fotos de "Duo Morion Set" sin nombre útil (`hf_2026...jpg`) → confirmadas como color Negro por el usuario.
   - `Accesorios` (64 fotos) y `Extras/Caras` + `Extras/Group` (90 fotos): nombres de cámara sin producto/color → ignorados en este pase (no siguen el patrón que describió el usuario).
5. **Control de calidad antes de subir (crítico)**: se detectó que algunas carpetas mezclaban, sin subcarpeta separada, fotos de referencia/catálogo de otra marca junto con las fotos reales del shooting — un archivo `BUTTON - Negro.jpg` resultó ser una foto de un producto de otra marca ("Palazzo Enterizo Alo"), no de KINARA. Se identificaron y excluyeron todos los archivos con ese patrón (nombre corto sin número ni palabra de ángulo, tamaño muy por debajo del resto de fotos del mismo color) tras verificarlos visualmente uno por uno.
6. **Subida**: para cada (producto, color) con fotos nuevas confirmadas, se subieron todas las fotos nuevas a Storage primero, luego se borraron las filas viejas de `product_images` de ese color (y sus archivos huérfanos en Storage), y se insertaron las filas nuevas con `position` 0..N-1 en el orden de los archivos (numérico si el nombre trae número, alfabético si no).

## Archivos involucrados

- Ningún archivo de código se modificó — esta tarea es 100% de datos/contenido (Supabase Storage + tabla `product_images`).
- Scripts usados para el proceso (temporales, ya borrados del repo al cerrar la tarea): export de catálogo, emparejamiento producto/color, subida masiva.

## Restricciones específicas de esta tarea

- **Pérdida de datos irreversible, ya ocurrida**: durante una prueba inicial con un solo grupo (BUTTON/Negro) antes de descubrir el problema de fotos contaminadas, se reemplazó y luego se intentó revertir la foto vieja de BUTTON/Negro — pero el archivo viejo ya se había borrado de Storage como parte del reemplazo, y no se pudo recuperar. **BUTTON/Negro se quedó sin foto** tras esta tarea (antes tenía una foto genérica de placeholder). El usuario debe subir una foto real para ese color desde `/admin/productos` cuando tenga una disponible.
- No se subieron fotos para: AURA TOP (Rojo, Verde), ONE MOTION JUMPSUIT (Negro) — colores sin variante en el catálogo todavía (decisión explícita del usuario: no crear el color sin stock por ahora).
- No se subieron fotos para: `Barbi Legins`, `Felty Pants` (no son productos existentes), `Accesorios`, `Extras/Caras`, `Extras/Group` (154 fotos sin producto/color identificable en el nombre) — quedan pendientes de una revisión aparte si el usuario las quiere usar.
- `POWER SHORT / Blanco` tampoco se tocó — su único archivo en el shooting resultó ser del mismo patrón sospechoso (nombre corto, tamaño chico) que el de BUTTON; a diferencia de BUTTON, esta sí parecía una foto genuina de KINARA al verificarla visualmente, pero se optó por no arriesgar y dejar la foto vieja intacta.

## Criterios de aceptación

- [x] 128 combinaciones de (producto, color) con fotos nuevas del shooting, 685 fotos en total, subidas y reemplazando la(s) foto(s) vieja(s).
- [x] Ninguna foto de otra marca/producto ajeno quedó publicada (verificado visualmente antes de subir).
- [x] El orden de las fotos por color queda numerado 0..N-1 de forma consistente con el nombre de archivo original.
- [x] Los colores sin fotos nuevas en el shooting no se tocaron (mantienen su foto anterior).
- [x] Verificado con una muestra de productos (AURA TOP, DUO CROSS FLARE) que las URLs son públicas y las imágenes se ven correctas.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — se mantiene el patrón de "un color puede tener varias fotos, `position=0` es la principal" (tarea 019); se recorre la restricción de no asignar una foto sin verificarla 1:1 (tarea 009) — en este caso, se verificó visualmente cada patrón de archivo sospechoso antes de subir, no solo se confió en el nombre del archivo.
- Regresiones encontradas y corregidas en el camino: contaminación de fotos de referencia de otra marca mezcladas en carpetas del shooting (ver arriba) — se excluyeron antes de la subida masiva, salvo el caso de BUTTON/Negro donde el error ya se había cometido en una prueba puntual previa (foto vieja perdida, sin poder recuperarse).
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (operación de datos puntual, no un estándar de código nuevo).

## Pruebas manuales

- Verificado en Supabase que las 685 filas nuevas de `product_images` tienen `position` secuencial correcto y `color_name` esperado, y que los colores no tocados conservan su foto anterior.
- Verificado que las URLs públicas de una muestra de fotos cargan correctamente (HTTP 200, `content-type` correcto) y se ven como fotos reales y coherentes con el producto/color.
- Sin errores durante la subida (128/128 grupos OK).

## Notas de progreso

- 2026-09-09: Implementado en la misma sesión. Antes de subir nada se consultó al usuario (vía preguntas puntuales) sobre: reemplazar vs. sumar fotos viejas, qué hacer con 2 colores nuevos sin variante (AURA TOP Rojo/Verde, ONE MOTION JUMPSUIT Negro), 2 carpetas sin producto correspondiente (Barbi Legins, Felty Pants), 5 fotos sin nombre útil (confirmadas como Negro), y 154 fotos sin producto/color identificable (Accesorios/Extras) — todas resueltas antes de tocar la base de datos. Durante una prueba con un solo grupo se descubrió el problema de fotos de referencia de otra marca mezcladas sin subcarpeta separada; se corrigió el criterio de selección de archivos y se re-verificó todo antes de la subida masiva final, salvo la pérdida ya consumada de la foto vieja de BUTTON/Negro (documentada arriba).
