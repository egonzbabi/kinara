/**
 * Central image map para fotos de sitio (no de catálogo — esas viven en
 * Supabase, ver `app/lib/catalog.ts`). Antes tenía fotos de stock de Unsplash
 * hotlinkeadas (`img()`/`PHOTO`, tarea 002-ish); se quitaron en la tarea 103
 * al reemplazar la última que se renderizaba (`PHOTO.editorial`, en
 * `EditorialSplit.tsx`) por una foto real del shooting — ya no queda ninguna
 * imagen del sitio dependiendo de un dominio externo.
 */

/**
 * Hero de home: antes era un collage rotativo de fotos propias, ahora es un
 * solo video (tarea 088) — se deja `main` como único campo, subido al mismo
 * lugar de Storage (`product-images/site/`) que las fotos que reemplazó.
 */
const HERO_BASE =
  "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/site";

export const HERO_COLLAGE = {
  main: {
    // Nombre con timestamp (no "hero-video.mp4" a secas): el endpoint de
    // transformación de imágenes de Supabase cachea por URL durante 1 hora
    // sin importar que el archivo cambie — sobrescribir el mismo nombre deja
    // el sitio sirviendo la versión vieja por un rato (mismo problema ya
    // documentado en REQUISITOS.md, tarea 120). Un nombre nuevo lo evita.
    url: `${HERO_BASE}/hero-video-1790300621322.mp4`,
    // Cuadro real del video (no una foto aparte) — se ve de inmediato mientras
    // el video todavía está bajando, en vez de una caja vacía (tarea 088).
    poster: `${HERO_BASE}/hero-poster-1790300621322.jpg`,
    alt: "Video de KINARA: mujer jugando tenis en movimiento",
  },
} as const;
