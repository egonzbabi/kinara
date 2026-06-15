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

/** Named raw photo ids (Unsplash), grouped by intended use. */
export const PHOTO = {
  heroPrimary: "photo-1517836357463-d25dfeac3438",
  heroSecondary: "photo-1552674605-db6ffd4facb5",

  categoryMujer: "photo-1535556116002-6281ff3e9f36",
  categoryHombre: "photo-1538805060514-97d9cc17730c",
  categoryAccesorios: "photo-1556817411-31ae72fa3ea0",

  editorial: "photo-1549576490-b0b4831ef60a",
  lookbookA: "photo-1483721310020-03333e577078",
  lookbookB: "photo-1518611012118-696072aa579a",
  lookbookC: "photo-1532009324734-20a7a5813719",
  lookbookD: "photo-1571945153237-4929e783af4a",

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
