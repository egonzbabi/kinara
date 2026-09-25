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
    // NOVA TOP, color Vino (antes Negro) — a pedido del usuario, tarea 131:
    // los 6 tiles eran todos negro/gris/rosa, se cambian a colores con más
    // variedad usando fotos reales ya existentes del mismo producto.
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/06hfejx4/vino-1788997394372-0.jpg",
  },
  {
    tipo: "Bottom",
    title: "Bottom",
    copy: "Shorts y pantalones que se mueven contigo.",
    // MOVE SHORT, color Agua Blue (antes Cocoa), tarea 131. Foto -2 (no la -0):
    // la -0 es de cuerpo completo y el short casi no se ve (se ve más la
    // playera con la que posó el modelo, que no es del producto); esta es un
    // recorte cerrado en la cadera/short, mismo criterio que ya usaba Cocoa.
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/z2gep2ik/agua-blue-1788997344518-2.jpg",
  },
  {
    tipo: "Chaqueta",
    title: "Chaqueta",
    copy: "Capas técnicas para el after y el afuera.",
    // JACKET FIT, color Marino (antes Negro), tarea 131. El color Lila del
    // mismo producto se descartó: su única foto trae el texto "JACKET FIT"
    // quemado en la imagen (foto de proveedor, no del shooting propio) — no
    // sirve para un tile del sitio.
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/x17aegeg/marino-1790008988188.jpg",
  },
  {
    tipo: "Enterizo",
    title: "Enterizo",
    copy: "Una sola pieza, ajuste total.",
    // ONE MOTION JUMPSUIT, color Rojo (antes Oxford), tarea 131.
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/dfp1c34z/rojo-1788997410150-4.jpg",
  },
  {
    tipo: "Set",
    title: "Set",
    copy: "Conjuntos pensados para combinar sin pensar.",
    // SCULPT SET, color Verde Fresco (antes Rosa), tarea 131.
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/b6qq5u7o/verde-fresco-1788997469897-0.jpg",
  },
  {
    tipo: "Vestido",
    title: "Vestido",
    copy: "Un solo movimiento, todo el efecto.",
    // ZIPPER SKIRT, color Mulberry (antes Negro), tarea 131.
    image:
      "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/cvun2ie8/mulberry-1789778879922.jpg",
  },
];
