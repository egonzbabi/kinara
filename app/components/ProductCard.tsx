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
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [color, setColor] = useState<string | null>(
    product.colors.length <= 1 ? (product.colors[0]?.name ?? "Único") : null,
  );
  const [size, setSize] = useState<string | null>(
    product.sizes.length === 1 ? product.sizes[0] : null,
  );
  const [attempted, setAttempted] = useState(false);

  const hasSecond = product.gallery.length > 1;

  const resetQuickAdd = () => {
    setQuickAddOpen(false);
    setAttempted(false);
    setColor(product.colors.length <= 1 ? (product.colors[0]?.name ?? "Único") : null);
    setSize(product.sizes.length === 1 ? product.sizes[0] : null);
  };

  const openQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    setQuickAddOpen(true);
  };

  const confirmQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!color || !size) {
      setAttempted(true);
      return;
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.colorImages?.[color] ?? product.gallery[0],
      color,
      size,
    });
    resetQuickAdd();
  };

  return (
    <article className="group">
      <Link
        to={`/producto/${product.slug}`}
        className="block"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => {
          setHover(false);
          resetQuickAdd();
        }}
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
            {quickAddOpen ? (
              <div className="rounded-xl bg-sand/95 p-3 backdrop-blur">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-muted">
                    {color ?? "Elige color"} · {size ?? "Elige talla"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      resetQuickAdd();
                    }}
                    aria-label="Cerrar"
                    className="text-muted hover:text-espresso"
                  >
                    ✕
                  </button>
                </div>

                {product.colors.length > 1 && (
                  <div
                    className={cn(
                      "mt-2 flex flex-wrap gap-1.5 rounded-full",
                      attempted && !color && "outline outline-2 outline-offset-2 outline-clay",
                    )}
                  >
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={(e) => {
                          e.preventDefault();
                          setColor(c.name);
                        }}
                        title={c.name}
                        aria-label={c.name}
                        aria-pressed={color === c.name}
                        className={cn(
                          "h-6 w-6 rounded-full border transition-transform",
                          color === c.name
                            ? "ring-2 ring-espresso ring-offset-1 ring-offset-sand"
                            : "border-line hover:scale-110",
                        )}
                        style={{ background: c.hex }}
                      />
                    ))}
                  </div>
                )}

                {product.sizes.length > 1 && (
                  <div
                    className={cn(
                      "mt-2 flex flex-wrap gap-1 rounded-lg",
                      attempted && !size && "outline outline-2 outline-offset-2 outline-clay",
                    )}
                  >
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={(e) => {
                          e.preventDefault();
                          setSize(s);
                        }}
                        aria-pressed={size === s}
                        className={cn(
                          "min-w-7 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                          size === s
                            ? "border-espresso bg-espresso text-bone"
                            : "border-line hover:border-espresso",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={confirmQuickAdd}
                  className="mt-2.5 w-full rounded-full bg-espresso py-2 text-[12px] font-semibold text-bone transition-colors hover:bg-clay"
                >
                  Agregar al carrito
                </button>
              </div>
            ) : (
              <button
                onClick={openQuickAdd}
                className="w-full rounded-full bg-sand/95 py-3 text-[13px] font-semibold backdrop-blur transition-colors hover:bg-espresso hover:text-bone"
              >
                Añadir rápido
              </button>
            )}
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
