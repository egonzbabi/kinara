---
id: 012
title: "Ajustar color_hex del swatch para que coincida con el color real de la foto"
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

Los círculos de color en el selector de swatch usan `product_variants.color_hex`, que hasta ahora era un hex genérico aproximado asignado al nombrar el color (ej. "Marino" → `#000080` estándar), no el color real de la prenda fotografiada. Con las tareas 009-011 ya subiendo fotos reales por color para la mayoría del catálogo, el círculo a veces no coincidía con el tono real que se ve en la foto (ej. un "Marino" que en la foto real se ve casi negro bajo la iluminación del estudio).

## Objetivo

Para todo color con foto real verificada (`product_images.color_name` no nulo), recalcular `color_hex` muestreando el color real de la prenda en esa foto, para que el círculo del swatch sea fiel a lo que el usuario verá al seleccionarlo.

## Archivos involucrados

- `scripts/update-color-hex.ts` (nuevo)
- `package.json` (nuevo script `update:color-hex`)

## Restricciones específicas de esta tarea

- Alcance: todos los productos con al menos una foto por color ya subida (tareas 009, 010, 011) — 63 combinaciones producto/color en total.
- El muestreo debe tomarse de una región de la imagen que sea 100% tela (nunca fondo de estudio, piel, sombra fuerte o accesorios) — se verificó visualmente cada recorte antes de calcular el color.
- No modificar qué colores se muestran (eso lo sigue controlando `product_images.color_name` sin cambios) — esta tarea solo toca el hex del círculo.

## Pasos sugeridos

1. Listar todas las combinaciones producto/color con foto real.
2. Descargar cada foto y definir una región de recorte limpia (solo tela) por imagen.
3. Calcular el color representativo (mediana RGB dentro del recorte).
4. Actualizar `product_variants.color_hex`.
5. Verificar en el navegador varios productos representativos.

## Criterios de aceptación

- [x] 62/63 colores actualizados con el hex muestreado de su foto real.
- [x] `npm run typecheck` pasa sin errores.
- [x] Verificado visualmente en el navegador que los círculos ahora reflejan tonos realistas (BICROSSFLARE, CONJUNTO NUBE, TECNO PREMIUM, LULU TOP x2).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí. No se toca qué colores se muestran (requisito de tarea 009), solo el hex del círculo. No se sube ninguna foto nueva ni se cambia ninguna asignación color→foto (eso sigue intacto).
- Regresiones encontradas: ninguna introducida por esta tarea.
- **Hallazgo fuera de alcance, no corregido aquí**: al muestrear CONJUNTO NUBE (2510), la foto asignada a "Botanica Verde" resultó ser un azul marino oscuro (no verde) — visualmente casi idéntica a la foto de "Marino" del mismo producto. Esto sugiere una foto mal asignada en la tarea 009 (un color de este producto probablemente comparte foto por error con Marino), no un problema de hex. Se excluyó "Botanica Verde" de esta actualización (mantiene su hex verde anterior, `#5F8575`) para no maquillar el problema real con un hex azul bajo una etiqueta "verde". **Requiere una tarea de seguimiento** para investigar y corregir la foto de ese color específico.
- Requisitos nuevos agregados a `REQUISITOS.md`: sí, ver arriba (categoría Datos/Supabase).

## Pruebas manuales

- [x] `/producto/bicrossflare`: círculos ahora muestran tonos reales (Marino como azul marino real, Negro como negro suave de estudio, etc.).
- [x] `/producto/conjunto-nube`: confirmado que "Botanica Verde" sigue mostrando su hex verde original (sin tocar, como se documentó arriba) mientras el resto de colores del producto sí se actualizaron.
- [x] `/producto/tecno-premium`, `/producto/lulu-top`, `/producto/lulu-top-2315`: círculos verificados visualmente contra sus fotos.

## Notas de progreso

- 2026-07-14: Usuario pidió ajustar los círculos de color para que coincidan con las fotos reales. Se acordó con el usuario que el alcance es TODOS los productos con foto real (no solo LULU TOP).
- 2026-07-14: Primeros intentos de automatizar el muestreo con una región central genérica y detección de fondo/piel por umbral fijo fallaron para muchas fotos (framing muy variable: unas son crops de torso ajustados, otras cuerpo completo con mucho fondo blanco alrededor) — el fondo o la piel contaminaban la muestra en ~20 de 63 casos.
- 2026-07-14: Se cambió de enfoque: se generaron hojas de contacto (contact sheets) de las 63 fotos para revisar visualmente y definir manualmente una región de recorte (solo tela) por imagen, luego calcular la mediana RGB dentro de ese recorte — mucho más confiable que cualquier heurística genérica.
- 2026-07-14: Se detectaron y corrigieron 5 recortes que aún fallaban tras la primera pasada manual (mediana bimodal fondo/prenda dando un resultado ni fondo ni prenda) ajustando la región a una zona de tela más homogénea: AIRLIFT SHORT Negro, LULU TOP Negro (080924), TECNO PREMIUM Blanco, PASTEL FALDA Blanco, y el caso especial de CONJUNTO NUBE Botanica Verde (ver hallazgo arriba).
- 2026-07-14: 62/63 colores actualizados vía `scripts/update-color-hex.ts` (`npm run update:color-hex`). Verificado en navegador y `npm run typecheck` sin errores.
- 2026-07-14: Usuario reportó dos círculos mal ajustados tras la primera pasada: TECNO PREMIUM/Blanco se veía gris (no blanco) y BICROSSFLARE/Gris se veía casi blanco (no gris). Causa: el recorte automático había muestreado una zona de tela en sombra para el blanco (subestimando su brillo) y una zona con brillo/highlight para el gris (sobrestimando su claridad) — la iluminación direccional del estudio crea un degradado fuerte luz-sombra en la tela que un solo punto de muestreo puede capturar mal en cualquiera de los dos extremos.
- 2026-07-14: Corregido con muestreo dirigido: para "Blanco" se buscó programáticamente el parche de tela más brillante (evitando fondo y piel) — TECNO PREMIUM/Blanco → `#EEEEEB`. Para "Gris" se buscó un parche de tela plano en la zona media (ni sombra profunda ni brillo) — BICROSSFLARE/Gris → `#676965`. Ambos verificados visualmente contra la foto y en el navegador.
- 2026-07-14: Usuario reportó que PASTEL FALDA/Blanco también se veía beige, no blanco. Esta foto tiene un tinte cálido general en toda la escena (fondo y prendas), así que cualquier punto "promedio" de la tela salía beige/crema. Se buscó programáticamente el punto más brillante no-piel/no-fondo de la imagen (mismo método usado para TECNO PREMIUM) y se muestreó un parche pequeño y limpio alrededor de ese punto → `#E8E5E0`. Verificado visualmente y en el navegador.
- **TAREA COMPLETADA** (con una excepción documentada que requiere seguimiento aparte).
