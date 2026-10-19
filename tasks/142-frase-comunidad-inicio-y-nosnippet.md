---
id: 142
title: "Frase de comunidad visible bajo la portada + data-nosnippet en descripciones de prendas"
status: in-progress
---

## Contexto

En Google, el fragmento bajo el resultado de kinarafit.com.mx no usaba nuestra meta description: tomaba un pedazo de la descripción del CROP TOP ("Tu mejor opción para yoga, fitness, correr…"), porque el texto completo de cada prenda está en el HTML del inicio aunque se vea cortado a una línea (`line-clamp-1`). La usuaria quiere que Google muestre que Kinara es más que ropa deportiva: una comunidad.

## Objetivo

1. Texto visible bajo la portada (`<p>`, no encabezado; el h1 sigue siendo el del Hero): "Kinara es más que ropa deportiva: es una comunidad de mujeres que se mueven y se sienten fuertes."
2. `data-nosnippet` en la descripción de cada `ProductCard`, para que Google no la use como fragmento.

## Archivos involucrados

- `app/routes/_index.tsx`
- `app/components/ProductCard.tsx`

## Restricciones específicas de esta tarea

- Cambio visible solo la frase nueva (aprobada por la usuaria, ubicación "debajo de la portada"); `data-nosnippet` es invisible.
- No hay garantía de que Google la tome: decide el fragmento. Solo se maximiza la probabilidad.

## Criterios de aceptación

- [x] La frase está en el HTML del inicio, centrada bajo la portada, con la tipografía de la marca.
- [x] `data-nosnippet` en las 19 tarjetas del inicio.
- [x] Un solo h1 en el inicio; sin overflow horizontal.
- [x] Typecheck sin errores.
- [ ] En unos días/semanas: el fragmento de Google refleja la idea de comunidad (no garantizado).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (diseño aprobado intacto salvo la frase aprobada; un solo h1)
- Regresiones encontradas: ninguna
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno

## Pruebas manuales

- Ver el inicio en local (escritorio y 375 px) y, tras subir, Search Console → Inspeccionar URL → Solicitar indexación.

## Notas de progreso

- 2026-10-19: implementado y verificado en local. Falta subir (aprobación pendiente), solicitar indexación y esperar el re-rastreo.
