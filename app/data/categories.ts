import { img, PHOTO } from "./images";
import type { Category } from "./products";

export type CategoryTile = {
  slug: Category;
  title: string;
  copy: string;
  image: string;
};

export const CATEGORY_TILES: CategoryTile[] = [
  {
    slug: "mujer",
    title: "Mujer",
    copy: "Leggings, tops y capas que se mueven contigo.",
    image: img(PHOTO.categoryMujer, { w: 900, h: 1200 }),
  },
  {
    slug: "hombre",
    title: "Hombre",
    copy: "Tejidos técnicos con caída de calle.",
    image: img(PHOTO.categoryHombre, { w: 900, h: 1200 }),
  },
  {
    slug: "accesorios",
    title: "Accesorios",
    copy: "Los detalles que rematan el entreno.",
    image: img(PHOTO.categoryAccesorios, { w: 900, h: 1200 }),
  },
];
