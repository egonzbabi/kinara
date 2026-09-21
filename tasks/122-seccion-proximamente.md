---
id: 122
title: "Nueva sección 'Próximamente' en el home con 10 prendas nuevas"
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

El usuario mandó 10 fotos de prendas nuevas que todavía no están cargadas como productos reales en el catálogo (sin precio, colores ni stock definidos aún) y pidió una sección "Próximamente" para mostrarlas como adelanto en el sitio.

Las fotos son del proveedor (formato "ficha técnica": foto + nombre de la prenda como texto impreso abajo, ej. "FLEXI LISTÓN T-SHIRT"). Se recibieron pegadas en el chat; los archivos reales se ubicaron en `~/Downloads` como las 10 imágenes de WhatsApp más recientes (confirmado por el usuario).

## Objetivo

Una sección nueva en el home, con el mismo lenguaje visual del resto del sitio (tipografía, colores, tarjetas), mostrando las 10 prendas como vista previa — sin precio, sin colores/tallas, sin "Añadir al carrito" (no son productos reales todavía) y sin link a una página de detalle (no existe esa página para estos ítems).

## Archivos involucrados

- `public/proximamente/*.webp` (imágenes optimizadas, nuevas)
- `app/data/comingSoon.ts` (nuevo — lista de los 10 ítems)
- `app/components/ComingSoonRail.tsx` (nuevo componente)
- `app/routes/_index.tsx` (agregar la sección)

## Restricciones específicas de esta tarea

- Estas 10 prendas NO se dan de alta como productos reales en Supabase (no tienen precio/color/talla/stock definidos) — es solo contenido de marketing en el home, no un cambio al catálogo.
- Las fotos del proveedor traen el nombre impreso en la propia imagen (texto genérico, tipografía ajena a la marca) — se recorta ese pie de foto y el nombre se vuelve a mostrar con la tipografía del sitio, para que se vea consistente con el resto del diseño (regla de "resultado profesional" de `CLAUDE.md`).
- No se toca ningún componente/página existente más allá de insertar la nueva sección en el home.

## Pasos sugeridos

1. Recortar el pie de foto de las 10 imágenes (detección automática de la banda de texto) y optimizar a WebP en dos anchos (480/800) para `srcset`.
2. Crear `app/data/comingSoon.ts` con `{ slug, name, image480, image800 }` por prenda.
3. Crear `ComingSoonRail.tsx`: carrusel horizontal con scroll por arrastre (mismo patrón que `BestsellerRail`), tarjeta simple (foto 4:5 + nombre + badge "Próximamente"), sin link ni precio.
4. Insertar la sección en `_index.tsx` (después de "Lo nuevo").
5. Verificar `npm run typecheck` + prueba visual en mobile y desktop.

## Criterios de aceptación

- [x] La sección aparece en el home con las 10 prendas, cada una con su nombre visible en la tipografía del sitio (no el texto impreso de la foto original).
- [x] Ninguna tarjeta tiene precio, colores, talla ni botón de compra — solo foto + nombre + badge "Próximamente".
- [x] Se ve bien en mobile (~375px, carrusel horizontal con scroll) y desktop.
- [x] Imágenes en WebP con `srcset`/`sizes` y `loading="lazy"` (no es LCP del home, el hero lo sigue siendo).
- [x] `npm run typecheck` sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno (no cambia ningún estándar, solo agrega contenido nuevo siguiendo los ya existentes).

## Pruebas manuales

- Verificado en `http://localhost:5173` en desktop y mobile (~375px): la sección "Próximamente" aparece después de "Lo nuevo", con las 10 tarjetas (foto + badge + nombre), scroll horizontal por arrastre funcionando, y estilo visualmente consistente con "Ofertas"/"Lo nuevo"/"Best-sellers".
- Confirmado por red que las imágenes cargan como `.webp` bajo `/proximamente/` con `loading="lazy"`.

## Notas de progreso

- 2026-09-21: Reemplazada también la foto de "Move Enterizo" (misma dinámica: foto nueva del usuario, recorte del pie de foto, WebP 480/800w).
- 2026-09-21: Reemplazada la foto de "Flexi Listón T-Shirt" por una nueva que mandó el usuario (mismo tratamiento: recorte del pie de foto del proveedor, optimizada a WebP 480/800w) — la anterior queda descartada.
- 2026-09-20: Tarea completa en una sola sesión. Fotos ubicadas en `~/Downloads` (confirmadas por el usuario como las 10 más nuevas descargadas de WhatsApp), recortado automático del pie de foto del proveedor (detección de la banda de texto en la franja inferior, con margen de seguridad para restos de antialiasing), optimizadas a WebP 480/800w en `public/proximamente/`. Creado `app/data/comingSoon.ts`, `app/components/ComingSoonRail.tsx` (mismo patrón que `BestsellerRail`) e insertado en `_index.tsx` después de "Lo nuevo". Verificado visualmente en el navegador, typecheck limpio. Subido a `main` (commit `cb3a4b4`) y verificado en producción.
- 2026-09-20 (fix post-deploy): el usuario reportó que en "Aura Skirt Set" el badge "Próximamente" (superpuesto en la esquina superior izquierda de la foto) tapaba la cara de la modelo — esa foto tiene dos modelos lado a lado (frente/espalda), y la de la izquierda queda con la cabeza justo donde caía el badge. Corregido de raíz para las 10 fotos (no solo esa una): el badge ya no se superpone a la imagen, ahora va debajo, junto al nombre — así se evita el riesgo en cualquier composición de foto de proveedor, no solo en la que se reportó. Verificado con getBoundingClientRect que el badge ya no se solapa con la foto. Pendiente de aprobación para subir este fix.
