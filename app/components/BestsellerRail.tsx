import { useRef } from "react";
import { Link } from "react-router";
import type { Product } from "~/data/products";
import { ProductCard } from "./ProductCard";
import { useDragScroll } from "~/hooks/useDragScroll";

export function BestsellerRail({ products }: { products: Product[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  useDragScroll(railRef);

  const items = products.filter((p) => p.isBestseller);

  return (
    <section className="py-[clamp(48px,7vw,96px)]">
      <div className="pad reveal mb-8 flex items-end justify-between gap-6">
        <div>
          <span className="label">Lo más querido</span>
          <h2 className="mt-2 font-display text-[clamp(28px,4vw,48px)] leading-none">
            Best-sellers
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-[13px] text-muted sm:block">
            ← Arrastra →
          </span>
          <Link
            to="/tienda"
            className="text-sm font-medium underline-offset-4 hover:text-clay hover:underline"
          >
            Ver todo →
          </Link>
        </div>
      </div>

      <div
        ref={railRef}
        className="no-scrollbar flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(20px,5vw,80px)] pb-2"
      >
        {items.map((p) => (
          <div
            key={p.id}
            className="w-[68vw] shrink-0 snap-start sm:w-[42vw] md:w-[30vw] lg:w-[23vw]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
