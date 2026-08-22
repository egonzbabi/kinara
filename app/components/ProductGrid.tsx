import type { Product } from "~/data/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  priorityCount = 0,
  activeFamily,
  forceBadge,
}: {
  products: Product[];
  priorityCount?: number;
  /** Familia de color actualmente filtrada en /tienda (si es exactamente
   * una, ver ~/lib/colorFamilies) — hace que cada tarjeta muestre, cuando
   * exista, la foto del color de esa familia que tiene el producto en vez de
   * la genérica (ver ProductCard). */
  activeFamily?: string;
  /** Fuerza la misma etiqueta en todas las tarjetas de esta grilla, sin
   * importar la bandera propia de cada producto (ver ProductCard). */
  forceBadge?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard
          key={p.id}
          product={p}
          priority={i < priorityCount}
          activeFamily={activeFamily}
          forceBadge={forceBadge}
        />
      ))}
    </div>
  );
}
