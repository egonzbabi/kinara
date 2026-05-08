import { useRef } from "react";
import { useCardTilt } from "~/hooks/useCardTilt";
import { useCart } from "~/context/CartContext";
import type { Product } from "~/data/products";
import { SilhouetteFor } from "./svg/Silhouettes";

const VARIANT_CLASSES = {
  feature: "col-span-12 md:col-span-6 aspect-[6/5] max-[980px]:aspect-[4/5] max-[980px]:col-span-6",
  tall: "col-span-12 md:col-span-4 aspect-[3/5] max-[980px]:aspect-[4/5] max-[980px]:col-span-6",
  standard: "col-span-12 md:col-span-4 aspect-[4/5] max-[980px]:col-span-6",
} as const;

export function ProductCard({ product }: { product: Product }) {
  const { bump } = useCart();
  const cardRef = useRef<HTMLElement>(null);
  const quickRef = useRef<HTMLButtonElement>(null);

  useCardTilt(cardRef);

  const onQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    bump();
    quickRef.current?.animate(
      [
        { transform: "translate(-50%, 0)" },
        { transform: "translate(-50%, -8px) scale(1.04)" },
        { transform: "translate(-50%, 0)" },
      ],
      { duration: 480, easing: "cubic-bezier(.16,1,.3,1)" },
    );
  };

  const inverse = product.inverse;
  const textColor = inverse ? { color: "#F2EFE8" } : undefined;

  return (
    <article
      ref={cardRef}
      data-product=""
      data-cursor={product.inverse ? "dark" : undefined}
      className={`card group relative overflow-hidden rounded-md bg-paper transition-transform duration-500 ease-[var(--ease-out-solar)] [will-change:transform] hover:-translate-y-1 cursor-pointer ${VARIANT_CLASSES[product.variant]}`}
      style={{ ["--swatch" as string]: product.cardSwatch }}
    >
      <div
        className="card-bg absolute inset-0 transition-[background] duration-500 ease-[var(--ease-solar)]"
        style={{
          background: `linear-gradient(160deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0.06) 100%), ${product.cardSwatch}`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-[var(--ease-out-solar)] group-hover:scale-[1.04]">
        <SilhouetteFor id={product.silhouette} />
      </div>

      <div className="absolute inset-0 z-[2] flex flex-col justify-between p-[18px]">
        <div className="flex items-start justify-between">
          <span
            className={`rounded-full px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[.18em] ${
              product.tagSolar
                ? "bg-solar text-ink"
                : "bg-ink text-bone"
            }`}
          >
            {product.tag}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[.18em] opacity-70" style={textColor}>
            {product.no}
          </span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div
              className="text-[clamp(18px,1.6vw,24px)] font-black leading-[1.05] tracking-[-0.01em]"
              style={textColor}
            >
              {product.name}
            </div>
            <div className="mt-1.5 flex gap-1.5" aria-hidden>
              {product.dots.map((d, i) => (
                <i
                  key={i}
                  className="inline-block size-2.5 rounded-full border border-black/20"
                  style={{
                    background: d.bg,
                    borderColor: d.light ? "rgba(255,255,255,.4)" : undefined,
                  }}
                />
              ))}
            </div>
          </div>
          <div
            className="font-mono text-[13px] tracking-[.04em]"
            style={textColor}
          >
            {product.price}
          </div>
        </div>
      </div>

      <button
        ref={quickRef}
        onClick={onQuickAdd}
        className="quickadd absolute bottom-[18px] left-1/2 z-[3] flex translate-x-[-50%] translate-y-[130%] items-center gap-2.5 whitespace-nowrap rounded-full bg-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[.2em] text-bone transition-transform duration-500 ease-[var(--ease-out-solar)] group-hover:translate-y-0"
      >
        <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-solar text-[14px] font-black leading-none text-ink">
          +
        </span>
        {product.variant === "feature" ? "Añadir a la bolsa" : "Añadir"}
      </button>
    </article>
  );
}
