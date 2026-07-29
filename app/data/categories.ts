export type CategoryTile = {
  /** Valor de `kind` en Supabase — arma el link a `/tienda?tipo=`. */
  tipo: string;
  title: string;
  copy: string;
  /** URL real de Supabase Storage (se redimensiona con `productImage` al usarla). */
  image: string;
};

/**
 * Tiles de "Encuentra lo tuyo" en la home — uno por tipo de producto real del
 * catálogo (no por categoría mujer/hombre, ver tarea 022), con una foto real
 * ya subida y verificada de ese tipo.
 */
export const CATEGORY_TILES: CategoryTile[] = [
  {
    tipo: "Top",
    title: "Top",
    copy: "Bases suaves que se llevan solas o en capas.",
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/06hfejx4.png",
  },
  {
    tipo: "Bottom",
    title: "Bottom",
    copy: "Shorts y pantalones que se mueven contigo.",
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/8akg4rmo.png",
  },
  {
    tipo: "Legging",
    title: "Legging",
    copy: "Segunda piel para entrenar o para el día a día.",
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/nih06ld7/generic-1785027562494.jpg",
  },
  {
    tipo: "Chaqueta",
    title: "Chaqueta",
    copy: "Capas técnicas para el after y el afuera.",
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/x17aegeg.png",
  },
  {
    tipo: "Enterizo",
    title: "Enterizo",
    copy: "Una sola pieza, ajuste total.",
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/dfp1c34z/generic-0.jpg",
  },
  {
    tipo: "Set",
    title: "Set",
    copy: "Conjuntos pensados para combinar sin pensar.",
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/wk8gx3lz/generic-0.jpg",
  },
];
