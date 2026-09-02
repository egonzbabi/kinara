import type { InventoryRow } from "./admin-catalog.server";
import { baseSkuFrom } from "./slug";
import { SIZE_ORDER as APPAREL_SIZE_ORDER, ACCESSORY_SIZE } from "./catalog-constants";

// La "Única" de accesorios se agrega como una columna más al final (tarea
// 081) — para no rediseñar la matriz por producto según si tiene tallas o no.
export const SIZE_ORDER = [...APPAREL_SIZE_ORDER, ACCESSORY_SIZE] as const;

export type ProductGroup = {
  productId: string;
  productName: string;
  productSlug: string;
  kind: string;
  isDraft: boolean;
  price: number | null;
  photoUrl: string;
  totalStock: number;
  baseSku: string;
  value: number;
  colors: {
    colorName: string;
    photoUrl: string;
    sizes: Partial<Record<(typeof SIZE_ORDER)[number], { stock: number; sku: string | null }>>;
  }[];
};

/** Agrupa filas de inventario (una por SKU) en un producto con su matriz color × talla. */
export function groupByProduct(rows: InventoryRow[]): ProductGroup[] {
  const groups = new Map<string, ProductGroup>();
  for (const r of rows) {
    let group = groups.get(r.productId);
    if (!group) {
      group = {
        productId: r.productId,
        productName: r.productName,
        productSlug: r.productSlug,
        kind: r.kind,
        isDraft: r.isDraft,
        price: r.price,
        photoUrl: r.photoUrl,
        totalStock: 0,
        baseSku: r.sku ? baseSkuFrom(r.sku) : "",
        value: 0,
        colors: [],
      };
      groups.set(r.productId, group);
    }
    group.totalStock += r.stock;
    group.value += (r.price ?? 0) * r.stock;
    let color = group.colors.find((c) => c.colorName === r.colorName);
    if (!color) {
      color = { colorName: r.colorName, photoUrl: r.photoUrl, sizes: {} };
      group.colors.push(color);
    }
    color.sizes[r.size] = { stock: r.stock, sku: r.sku };
  }
  return Array.from(groups.values());
}
