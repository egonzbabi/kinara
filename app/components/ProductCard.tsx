import { Link } from "react-router";
import { useState } from "react";
import type { Product } from "~/data/products";
import { useCart } from "~/context/CartContext";
import { formatPrice } from "~/lib/formatPrice";
import { cn } from "~/lib/cn";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { add } = useCart();
  const [hover, setHover] = useState(false);

  const hasSecond = product.gallery.length > 1;
  const defaultColor = product.colors[0]?.name ?? "Único";
  const defaultSize =
    product.sizes[Math.floor(product.sizes.length / 2)] ?? product.sizes[0];

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.gallery[0],
      color: defaultColor,
      size: defaultSize,
    });
  };

  return (
    <article className="group">
      <Link
        to={`/producto/${product.slug}`}
        className="block"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-bone">
          <img
            src={product.gallery[0]}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
              hover && hasSecond ? "opacity-0" : "opacity-100",
            )}
          />
          {hasSecond && (
            <img
              src={product.gallery[1]}
              alt=""
              aria-hidden
              loading="lazy"
              className={cn(
                "absolute inset-0 h-full w-full scale-[1.03] object-cover transition-opacity duration-500",
                hover ? "opacity-100" : "opacity-0",
              )}
            />
          )}

          {product.badge && (
            <span
              className={cn(
                "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide",
                product.badge === "Best-seller"
                  ? "bg-espresso text-bone"
                  : product.badge === "Nuevo"
                    ? "bg-sage text-bone"
                    : product.badge === "Edición"
                      ? "bg-clay text-bone"
                      : "bg-bone text-espresso",
              )}
            >
              {product.badge}
            </span>
          )}

          {/* Quick add */}
          <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={quickAdd}
              className="w-full rounded-full bg-sand/95 py-3 text-[13px] font-semibold backdrop-blur transition-colors hover:bg-espresso hover:text-bone"
            >
              Añadir rápido
            </button>
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 pt-3">
          <div className="min-w-0">
            <h3 className="truncate font-medium leading-tight">
              {product.name}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-[13px] text-muted">
              {product.description}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="font-medium">{formatPrice(product.price)}</span>
            {product.compareAt && (
              <span className="ml-1.5 text-[13px] text-muted line-through">
                {formatPrice(product.compareAt)}
              </span>
            )}
          </div>
        </div>

        {/* Color dots */}
        <div className="mt-2 flex items-center gap-1.5">
          {product.colors.map((c) => (
            <span
              key={c.name}
              title={c.name}
              className="h-3.5 w-3.5 rounded-full border border-line"
              style={{ background: c.hex }}
            />
          ))}
        </div>
      </Link>
    </article>
  );
}
