export type Category = "mujer" | "hombre" | "accesorios";

export type ColorOption = {
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  kind: string;
  price: number;
  compareAt?: number;
  colors: ColorOption[];
  sizes: string[];
  gallery: string[];
  /** Foto principal por color (nombre de color -> URL), cuando existe. Ver tasks/009-fotos-por-color.md. */
  colorImages?: Record<string, string>;
  /** Todas las fotos por color, en orden (la primera es la principal, igual que colorImages). Ver tasks/019-fotos-multiples-color.md. */
  colorGallery?: Record<string, string[]>;
  /** SKU por combinación color+talla ("Negro|M" -> "JV014-NEGRO-M"), cuando existe. Ver tasks/040-sku-detalle-producto.md. */
  skuByVariant?: Record<string, string>;
  /** Stock por combinación color+talla ("Negro|M" -> 3). `product.sizes` solo
   * dice qué tallas tienen stock en ALGÚN color — esto es lo único que dice
   * si una combinación específica sí se puede vender. */
  stockByVariant: Record<string, number>;
  badge?: "Nuevo" | "Best-seller" | "Oferta" | "Edición" | "Últimas unidades";
  isNew?: boolean;
  isBestseller?: boolean;
  isOnSale?: boolean;
  /** Muestra la leyenda "· Tallas reducidas" junto a "Talla" en el detalle. Default true (ver tasks/058). */
  showReducedSizesNotice?: boolean;
  description: string;
  materials: string;
};

/**
 * El catálogo real vive en Supabase (ver app/lib/catalog.ts), no aquí.
 * Este archivo solo define los tipos compartidos por los componentes.
 */

export const CATEGORY_LABELS: Record<Category, string> = {
  mujer: "Mujer",
  hombre: "Hombre",
  accesorios: "Accesorios",
};
