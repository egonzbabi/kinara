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
  /** Foto real por color (nombre de color -> URL), cuando existe. Ver tasks/009-fotos-por-color.md. */
  colorImages?: Record<string, string>;
  badge?: "Nuevo" | "Best-seller" | "Edición" | "Últimas unidades";
  isNew?: boolean;
  isBestseller?: boolean;
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
