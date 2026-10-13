---
id: 134
title: "Instagram en los datos estructurados de la marca y en el pie de página"
status: in-progress
---

## Contexto

Para que Google reconozca que las cuentas de redes y la tienda son la misma marca, el bloque `Organization` del home debe listar los perfiles oficiales en `sameAs`. Hoy no los tiene.

## Objetivo

Agregar `sameAs` al JSON-LD `Organization` del home con el Instagram oficial (`https://www.instagram.com/kinarafit/`, dirección limpia, sin el parámetro de seguimiento `?mdxt=`). TikTok y Facebook se agregan cuando el usuario dé sus direcciones.

## Archivos involucrados

- `app/lib/seo.ts` (lista `SOCIAL_PROFILES`)
- `app/routes/_index.tsx`
- `app/components/SiteFooter.tsx` (ícono visible de Instagram, aprobado por el usuario)

## Restricciones específicas de esta tarea

- El único cambio visual es un ícono pequeño de Instagram bajo el texto de la marca en el footer (aprobado explícitamente por el usuario); mismo color y hover que los demás enlaces.
- Solo perfiles que el usuario confirme que existen.

## Criterios de aceptación

- [x] El `Organization` del home incluye `sameAs` con el Instagram.
- [x] Typecheck sin errores.
- [x] El footer muestra un ícono de Instagram (aria-label, área de toque 44px, abre en pestaña nueva) que apunta a `INSTAGRAM_URL`.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (solo agrega un campo al JSON-LD)
- Regresiones encontradas: ninguna
- Requisitos nuevos agregados a `REQUISITOS.md`: la URL de Instagram vive en `INSTAGRAM_URL` (`seo.ts`), usada por el footer y por el JSON-LD

## Pruebas manuales

- Ver el JSON-LD del home en local y en producción.

## Notas de progreso

- 2026-10-12: tarea creada, se empieza a implementar.
- 2026-10-12: `SOCIAL_PROFILES` en `seo.ts` y `sameAs` en el Organization de `_index.tsx`; probado en local. Falta: subir (pendiente de aprobación); agregar TikTok/Facebook si el usuario da las direcciones.
- 2026-10-12 (2): URL corregida a `https://www.instagram.com/kinarafit/` (sin parámetros de seguimiento). Footer: ícono de Instagram bajo el texto de la marca; verificado en local (icono alineado con el texto, 44×44 px, sin overflow horizontal, también en 375px). Falta: subir a producción (pendiente de aprobación).
- 2026-10-12 (3): TikTok agregado a `SOCIAL_PROFILES` (`https://www.tiktok.com/@kinarafit3`, solo en JSON-LD; el footer sigue con solo Instagram hasta que el usuario pida el ícono de TikTok). Facebook: sin dirección todavía.
- 2026-10-12 (4): ícono de TikTok agregado al footer junto al de Instagram (aprobado por el usuario); ambos 44×44 px, alineados con el texto de la marca, sin overflow. Typecheck OK. Falta: subir a producción (pendiente de aprobación); Facebook sin dirección todavía.
- 2026-10-12 (5): íconos del footer reemplazados por los logos oficiales de Instagram y TikTok (trazos de Simple Icons 13.21.0, licencia CC0, relleno `currentColor`, mismo color/hover que los demás enlaces). Verificado en local: 44×44 px, sin overflow, typecheck OK. Falta: subir a producción (pendiente de aprobación).
- 2026-10-12 (6): Facebook agregado: página "Kinara Fit" (id 61592285310073), URL canónica a la que redirige Facebook `https://www.facebook.com/people/Kinara-Fit/61592285310073/` (el enlace que dio el usuario era de un reel, no de la página; se resolvió el id desde el reel). Va en `SOCIAL_PROFILES` (JSON-LD) y con logo oficial en el footer (trazo de Simple Icons) junto a Instagram y TikTok. Verificado en local: 3 íconos 44×44 px, sin overflow, typecheck OK. Falta: subir a producción (pendiente de aprobación).
