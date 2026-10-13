---
id: 137
title: "Estabilizar la velocidad del inicio (HTML en caché de borde + caché del catálogo)"
status: in-progress
---

## Contexto

Lighthouse (celular) del inicio daba 62–91 y LCP de 3.2 a 8.6 s con mucha variación (meta < 2.5 s). Diagnóstico (tarea 135 y siguiente): el LCP es el `<video poster>` del hero; el HTML tardaba ~0.8 s en el primer byte en CADA visita (`x-vercel-cache: MISS` siempre, `cache-control: public, max-age=0, must-revalidate`), y en una corrida mala el documento tardó 2.5 s — todo lo demás (portada, scripts, fotos) espera a ese HTML. Además cada visita ejecutaba `getAllProducts()` dos veces (loader de root + loader de la ruta), y el inicio precargaba con `fetchpriority=high` 4 fotos de producto que están bajo el fold, compitiendo con la portada del hero.

## Objetivo

Que el HTML del inicio salga mayormente del borde de Vercel y que el servidor no repita la consulta pesada del catálogo, sin tocar el checkout ni nada visual.

## Archivos involucrados

- `app/routes/_index.tsx` (`headers` con `s-maxage`; `priorityCount` fuera de las grillas bajo el fold)
- `app/lib/catalog.ts` (caché en memoria de `getAllProducts`, TTL 30 s)

## Restricciones específicas de esta tarea

- Stock/precio en pantalla pueden atrasarse unos minutos; el checkout valida stock y precios directo en la base con `supabaseAdmin` (`checkout-validation.server.ts`), y el admin usa `admin-catalog.server.ts`: ninguno usa la caché.
- Solo el inicio lleva caché de borde por ahora; tienda/producto/landings se evalúan después con los resultados.
- Sin cambios visuales.

## Criterios de aceptación

- [x] El inicio responde `cache-control: public, max-age=0, s-maxage=60, stale-while-revalidate=300`.
- [x] Solo la portada del hero se precarga con prioridad alta en el inicio (antes + 4 fotos de producto).
- [x] Con la caché del catálogo, visitas seguidas ya no repiten la consulta (local: 16–90 ms).
- [x] Typecheck sin errores; `/tienda` conserva su comportamiento.
- [ ] En producción: `x-vercel-cache: HIT` en el inicio y mejora medible en Lighthouse (4+ corridas).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (nada visual; checkout y admin no dependen de la caché)
- Regresiones encontradas: ninguna en local
- Requisitos nuevos agregados a `REQUISITOS.md`: ver abajo

## Pruebas manuales

- Cabeceras del inicio en producción; Lighthouse del inicio; cambiar un precio en el admin y confirmar que aparece en ≤ 6 min.

## Notas de progreso

- 2026-10-13: implementado en local y verificado (cabecera, precargas, tiempos). Falta: subir (pendiente de aprobación) y medir en producción.
