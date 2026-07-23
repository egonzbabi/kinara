import { supabase } from "./supabase";
import type { Product, ColorOption } from "~/data/products";
import { SIZE_ORDER, VALID_BADGES as VALID_BADGES_LIST } from "./catalog-constants";

const VALID_BADGES = new Set<string>(VALID_BADGES_LIST);

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: "mujer" | "hombre" | "accesorios";
  kind: string;
  price: number;
  compare_at: number | null;
  description: string | null;
  materials: string | null;
  badge: string | null;
  is_new: boolean;
  is_bestseller: boolean;
  product_variants: {
    color_name: string;
    color_hex: string | null;
    size: string;
    stock: number;
  }[];
  product_images: { url: string; position: number; color_name: string | null }[];
};

function mapRow(row: ProductRow): Product {
  const colorMap = new Map<string, ColorOption>();
  const stockBySize = new Map<string, number>();

  for (const v of row.product_variants) {
    if (!colorMap.has(v.color_name)) {
      colorMap.set(v.color_name, { name: v.color_name, hex: v.color_hex ?? "#CCCCCC" });
    }
    stockBySize.set(v.size, (stockBySize.get(v.size) ?? 0) + v.stock);
  }

  const sizes = SIZE_ORDER.filter((s) => (stockBySize.get(s) ?? 0) > 0);

  const genericImages = row.product_images
    .filter((img) => img.color_name === null)
    .sort((a, b) => a.position - b.position)
    .map((img) => img.url);

  const colorImages: Record<string, string> = {};
  for (const img of row.product_images) {
    if (img.color_name && img.position === 0) colorImages[img.color_name] = img.url;
  }

  // Si ya hay al menos una foto verificada por color para este producto, el swatch
  // solo muestra los colores con foto real (ver tasks/009-fotos-por-color.md). Si
  // todavía no se ha curado ninguna foto por color, se muestran todos los colores
  // con stock (comportamiento previo, sin cambios).
  const hasColorPhotos = Object.keys(colorImages).length > 0;
  const colors = hasColorPhotos
    ? Array.from(colorMap.values()).filter((c) => colorImages[c.name])
    : Array.from(colorMap.values());

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    kind: row.kind,
    price: row.price,
    compareAt: row.compare_at ?? undefined,
    colors,
    sizes,
    gallery: genericImages.length > 0 ? genericImages : ["/productos/placeholder.png"],
    colorImages: hasColorPhotos ? colorImages : undefined,
    badge: row.badge && VALID_BADGES.has(row.badge) ? (row.badge as Product["badge"]) : undefined,
    isNew: row.is_new,
    isBestseller: row.is_bestseller,
    description: row.description ?? "",
    materials: row.materials ?? "",
  };
}

const SELECT =
  "*, product_variants(color_name, color_hex, size, stock), product_images(url, position, color_name)";

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("is_draft", false)
    .order("created_at");
  if (error) throw new Error(`No se pudo cargar el catálogo: ${error.message}`);
  return (data as ProductRow[]).map(mapRow);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("slug", slug)
    .eq("is_draft", false)
    .maybeSingle();
  if (error) throw new Error(`No se pudo cargar el producto "${slug}": ${error.message}`);
  return data ? mapRow(data as ProductRow) : undefined;
}

export function relatedProducts(product: Product, all: Product[], limit = 4): Product[] {
  return all
    .filter((p) => p.id !== product.id && p.category === product.category)
    .concat(all.filter((p) => p.category !== product.category))
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
    .filter((p) => p.id !== product.id)
    .slice(0, limit);
}
