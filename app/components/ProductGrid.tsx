import { PRODUCTS } from "~/data/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid() {
  return (
    <div className="mt-8 grid grid-cols-12 gap-[18px] max-[980px]:grid-cols-6">
      {PRODUCTS.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
