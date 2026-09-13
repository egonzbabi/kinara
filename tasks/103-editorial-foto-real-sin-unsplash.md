---
id: 103
title: "Home: última foto de stock de Unsplash reemplazada por foto real del shooting (EditorialSplit)"
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

Último hallazgo pendiente de la auditoría de performance (tarea 100): `app/data/images.ts` tenía imágenes de stock de Unsplash hotlinkeadas — un riesgo de confiabilidad (dependen de un dominio externo que Claude no controla) y de marca (fotos genéricas, no del shooting real). De las ~16 fotos de `PHOTO`, solo una (`PHOTO.editorial`) seguía renderizándose en el sitio, en `EditorialSplit.tsx` (sección "Nuestra filosofía" de la home); `PHOTO.heroPrimary` ya había quedado sin uso al quitar el preload muerto (tarea 101) y las ~14 restantes ("product galleries") ya eran código muerto de antes de la migración del catálogo a Supabase (tarea 006).

## Objetivo

Ninguna imagen del sitio depende de Unsplash ni de ningún otro dominio externo; la sección editorial de la home usa una foto real del shooting profesional.

## Archivos involucrados

- `app/components/EditorialSplit.tsx` — foto de la sección, ahora servida vía `productImage()`/`productSrcSet()` (Supabase Storage) en vez de `img()` (Unsplash).
- `app/data/images.ts` — se quita por completo `img()`, `imgSrcSet()`, `PHOTO` y la constante `BASE` de Unsplash (ya sin ningún importador); solo queda `HERO_COLLAGE` (usado por `Hero.tsx`).

## Restricciones específicas de esta tarea

- La foto elegida (NEWYORK SET, color Ivory/Cocoa) ya está en Supabase Storage desde el shooting profesional (tarea 098) — no se subió nada nuevo.
- Se buscó a propósito una foto con pose de movimiento genuina (brazo en alto, sonrisa real) para que encaje con la frase ya existente ("el cuerpo que se mueve y la mente que necesita calma"), en la paleta cálida de marca — no se cambió el copy ni el layout de la sección.

## Criterios de aceptación

- [x] `EditorialSplit.tsx` ya no importa nada de Unsplash; usa `productImage()`/`productSrcSet()` con una URL real de Storage, con `srcSet`/`sizes` (antes no tenía responsive srcset).
- [x] `app/data/images.ts` ya no contiene ninguna referencia a `images.unsplash.com`.
- [x] `npm run typecheck` limpio.
- [x] Verificado que la nueva imagen carga (200, `image/jpeg`) y no quedó ningún error de consola (aparte de un falso positivo de buffer de consola obsoleto en la pestaña vieja del navegador, descartado al abrir una pestaña nueva).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — cumple el requisito de la tarea 002 ("toda imagen nueva de Supabase Storage debe pasar por `productImage()`/`productSrcSet()`"), que antes no aplicaba a esta imagen por no venir de Storage.
- Regresiones encontradas: ninguna — se verificó que `HERO_COLLAGE`/`Hero.tsx` no se tocaron y siguen funcionando; se confirmó (grep) que ningún otro archivo importaba `img`/`imgSrcSet`/`PHOTO` antes de borrarlos.
- Requisitos nuevos agregados a `REQUISITOS.md`: se agrega que ninguna imagen del sitio debe depender de un dominio externo (Unsplash u otro) — todo pasa por Supabase Storage.

## Pruebas manuales

- Verificado por JS en el navegador que el `<img>` de la sección tiene el `src` esperado y que la URL responde 200 `image/jpeg`.
- `npm run typecheck` limpio.
- Sin errores de consola (en una pestaña nueva, para descartar el buffer HMR obsoleto de la pestaña donde se hizo el cambio en caliente).

## Notas de progreso

- 2026-09-13: Completada en la misma sesión que las tareas 100-102. Cierra el hallazgo #4 de la auditoría de performance original. Con esto, los 4 puntos de la auditoría (LCP del hero, accesibilidad, y ahora fotos de Unsplash) quedan resueltos salvo el punto #3 (ahorros menores de imagen/JS no usado), que sigue pendiente si el usuario quiere continuar.
