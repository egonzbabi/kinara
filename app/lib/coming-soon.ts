import { supabase } from "./supabase";
import { productImage } from "./productImage";

// "Próximamente" del home (tareas 122 y 152): prendas nuevas todavía sin dar de
// alta como producto (sin precio, color ni stock). Viven en `coming_soon_items`,
// aparte del catálogo, y se administran desde /admin/proximamente.

/** Anchos de la tarjeta del carrusel y de la vista ampliada. */
const CARD_WIDTHS = [480, 800];
const FULL_WIDTH = 1400;

export type ComingSoonItem = {
  id: string;
  name: string;
  /** Foto de la tarjeta (4:5) y su `srcSet`. */
  src: string;
  srcSet: string;
  /** Foto para la vista ampliada: la más grande disponible, sin recortar. */
  fullSrc: string;
};

type Row = {
  id: string;
  name: string;
  image_url: string | null;
  image_base: string | null;
};

/** Arma las URLs de una fila: foto subida al Storage, o la estática anterior. */
export function mapComingSoonRow(row: Row): ComingSoonItem {
  if (row.image_url) {
    return {
      id: row.id,
      name: row.name,
      src: productImage(row.image_url, { width: 800, height: 1000 }),
      srcSet: CARD_WIDTHS.map(
        (w) => `${productImage(row.image_url!, { width: w, height: Math.round(w * 1.25) })} ${w}w`,
      ).join(", "),
      fullSrc: productImage(row.image_url, { width: FULL_WIDTH }),
    };
  }
  const base = row.image_base ?? "";
  // Las fotos estáticas solo existen en 480 y 800 px.
  return {
    id: row.id,
    name: row.name,
    src: `/proximamente/${base}-800.webp`,
    srcSet: CARD_WIDTHS.map((w) => `/proximamente/${base}-${w}.webp ${w}w`).join(", "),
    fullSrc: `/proximamente/${base}-800.webp`,
  };
}

/**
 * Prendas visibles en el home, en su orden. Si la tabla no existe o la consulta
 * falla devuelve una lista vacía (y la sección se oculta): el home nunca se
 * rompe por esto.
 */
export async function getComingSoonItems(): Promise<ComingSoonItem[]> {
  const { data, error } = await supabase
    .from("coming_soon_items")
    .select("id, name, image_url, image_base")
    .eq("active", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[coming-soon] no se pudo cargar:", error.message);
    return [];
  }
  return (data ?? []).map(mapComingSoonRow);
}
