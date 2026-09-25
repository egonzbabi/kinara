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
    // NOVA TOP, color Negro — foto real del shooting profesional (tarea 098),
    // reemplaza la foto genérica de proveedor que se rompió (404) cuando esa
    // foto vieja se sustituyó en la 098 (tarea 101).
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/06hfejx4/negro-1788997383660-0.jpg",
  },
  {
    tipo: "Bottom",
    title: "Bottom",
    copy: "Shorts y pantalones que se mueven contigo.",
    // MOVE SHORT, color Cocoa — foto real del shooting (tarea 101), recorte
    // cerrado solo en el short (no de cuerpo completo) para diferenciarse
    // visualmente del tile de Top, que usa la misma pose de cuerpo completo.
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/z2gep2ik/cocoa-1788997348894-2.jpg",
  },
  {
    tipo: "Chaqueta",
    title: "Chaqueta",
    copy: "Capas técnicas para el after y el afuera.",
    // JACKET FIT, color Negro — la URL anterior (x17aegeg.png) ya no
    // corresponde a ningún archivo real en Storage (quedó de cuando se
    // reemplazaron las fotos de este producto, tarea 120) y devolvía 400.
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/x17aegeg/negro-1790009099878.jpg",
  },
  {
    tipo: "Enterizo",
    title: "Enterizo",
    copy: "Una sola pieza, ajuste total.",
    // ONE MOTION JUMPSUIT, color Oxford — foto real del shooting (tarea 101);
    // la foto genérica anterior ya estaba rota (404, borrada en la 098).
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/dfp1c34z/oxford-1788997401028-0.jpg",
  },
  {
    tipo: "Set",
    title: "Set",
    copy: "Conjuntos pensados para combinar sin pensar.",
    // SCULPT SET, color Rosa — foto real del shooting (tarea 101).
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/b6qq5u7o/rosa-1788997459885-0.jpg",
  },
  {
    tipo: "Vestido",
    title: "Vestido",
    copy: "Un solo movimiento, todo el efecto.",
    // ZIPPER SKIRT, color Negro — foto real del shooting. Tile nuevo: "Vestido"
    // reemplaza a "Legging" (quitado, ver arriba) ahora que el menú es
    // dinámico según el catálogo real (tarea 127) — Legging no tiene ningún
    // producto hoy y Vestido sí.
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/cvun2ie8/negro-1788997619602-0.jpg",
  },
];
