/**
 * Central image map. Every product/editorial photo is referenced from here so a
 * real photo shoot can replace these by editing a single file.
 *
 * Sources are curated Unsplash athletic/athleisure photos (verified live).
 * `img()` builds an optimized delivery URL with crop + format params.
 */

const BASE = "https://images.unsplash.com/";

type ImgOpts = {
  w?: number;
  h?: number;
  q?: number;
};

export function img(id: string, { w = 1200, h, q = 80 }: ImgOpts = {}): string {
  const params = new URLSearchParams({
    auto: "format",
    fit: "crop",
    crop: "entropy",
    w: String(w),
    q: String(q),
  });
  if (h) params.set("h", String(h));
  return `${BASE}${id}?${params.toString()}`;
}

/**
 * `srcSet` para una serie de anchos, manteniendo el aspect ratio de `w`/`h`
 * pasados — evita que un móvil descargue la misma imagen de escritorio.
 */
export function imgSrcSet(id: string, widths: number[], { h: baseH, w: baseW, q = 80 }: ImgOpts = {}): string {
  const ratio = baseH && baseW ? baseH / baseW : undefined;
  return widths
    .map((w) => `${img(id, { w, h: ratio ? Math.round(w * ratio) : undefined, q })} ${w}w`)
    .join(", ");
}

/** Named raw photo ids (Unsplash), grouped by intended use. */
export const PHOTO = {
  heroPrimary: "photo-1517836357463-d25dfeac3438",

  editorial: "photo-1549576490-b0b4831ef60a",

  // Product galleries
  pBruma1: "photo-1556817411-31ae72fa3ea0",
  pBruma2: "photo-1518310383802-640c2de311b2",
  pCalma1: "photo-1535556116002-6281ff3e9f36",
  pCalma2: "photo-1552674605-db6ffd4facb5",
  pCorteza1: "photo-1594381898411-846e7d193883",
  pCorteza2: "photo-1434596922112-19c563067271",
  pSendero1: "photo-1538805060514-97d9cc17730c",
  pSendero2: "photo-1540206395-68808572332f",
  pAurora1: "photo-1506629082955-511b1aa562c8",
  pAurora2: "photo-1517836357463-d25dfeac3438",
  pDuna1: "photo-1571019613454-1cb2f99b2d8b",
  pDuna2: "photo-1581009146145-b5ef050c2e1e",
  pRaiz1: "photo-1549576490-b0b4831ef60a",
  pRaiz2: "photo-1532009324734-20a7a5813719",
  pBrisa1: "photo-1571945153237-4929e783af4a",
  pBrisa2: "photo-1483721310020-03333e577078",
} as const;

/**
 * Collage del hero de home: fotos propias (no Unsplash) subidas a Supabase
 * Storage (`product-images/site/`), servidas vía `productImage()`/`productSrcSet()`
 * (`app/lib/productImage.ts`) para WebP + resize automático. `main` es la foto
 * grande (LCP); `support` son las 3 de apoyo, en orden de arriba hacia abajo.
 */
const HERO_BASE =
  "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/site";

export const HERO_COLLAGE = {
  main: {
    url: `${HERO_BASE}/hero-4.jpg`,
    alt: "Mujer sonriente estirando los brazos hacia arriba con top deportivo blanco y leggings KINARA",
  },
  support: [
    {
      url: `${HERO_BASE}/hero-2.jpg`,
      alt: "Mujer sonriente con tapete de yoga bajo el brazo, vistiendo leggings KINARA en un parque",
    },
    {
      url: `${HERO_BASE}/hero-1.jpg`,
      alt: "Mujer estirando los brazos hacia arriba en una vereda arbolada",
    },
    {
      url: `${HERO_BASE}/hero-3.jpg`,
      alt: "Mujer sonriente sentada en el pasto estirando después de entrenar",
    },
  ],
} as const;
