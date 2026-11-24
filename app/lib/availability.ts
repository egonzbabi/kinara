import type { Product } from "~/data/products";

// Disponibilidad por color (tarea 153). El stock real vive por combinación
// color+talla en `product.stockByVariant` ("Negro|M" -> 3).

/** Un color está agotado cuando ninguna de sus tallas tiene stock. */
export function isColorSoldOut(product: Pick<Product, "stockByVariant">, colorName: string): boolean {
  const prefix = `${colorName}|`;
  for (const [key, stock] of Object.entries(product.stockByVariant)) {
    if (key.startsWith(prefix) && stock > 0) return false;
  }
  return true;
}

/** El producto está agotado cuando todos sus colores lo están. */
export function isProductSoldOut(product: Pick<Product, "stockByVariant" | "colors">): boolean {
  if (product.colors.length === 0) return false;
  return product.colors.every((c) => isColorSoldOut(product, c.name));
}
