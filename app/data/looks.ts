export type Look = {
  id: string;
  num: string;
  name: string;
  /** Slug del producto real que se ve en la foto — el tile linkea a su página. */
  slug: string;
  /** URL real de Supabase Storage (se redimensiona con `productImage` al usarla). */
  image: string;
};

/**
 * Lookbook de la home — fotos reales de estudio ya subidas y verificadas
 * (no stock genérico), una por producto/color, elegidas por variedad visual.
 * Ver tarea 022.
 */
export const LOOKS: Look[] = [
  {
    id: "l1",
    num: "Look 01",
    name: "Conjunto Rib · Rosa",
    slug: "conjunto-rib",
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/wk8gx3lz/rosa.jpg",
  },
  {
    id: "l2",
    num: "Look 02",
    name: "Bottee Set · Verde Fresco",
    slug: "bottee-set",
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/b6qq5u7o/verde-fresco.jpg",
  },
  {
    id: "l3",
    num: "Look 03",
    name: "Leggin Flare · Vino",
    slug: "leggin-flare",
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/b0qfoka7/vino.jpg",
  },
  {
    id: "l4",
    num: "Look 04",
    name: "Conjunto Camuflaje · Rosa",
    slug: "conjunto-camuflaje",
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/rva62zma/rosa.jpg",
  },
  {
    id: "l5",
    num: "Look 05",
    name: "Enterizo Largo · Rey",
    slug: "enterizo-largo",
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/dfp1c34z/rey.jpg",
  },
  {
    id: "l6",
    num: "Look 06",
    name: "Wrinkle Short · Lila",
    slug: "wrinkle-short",
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/z2gep2ik/lila.jpg",
  },
];
