import { useState } from "react";
import { cn } from "~/lib/cn";
import { productImage, productSrcSet } from "~/lib/productImage";

export const MAIN_WIDTHS = [500, 800, 1100];
export const MAIN_SIZES = "(min-width: 768px) 55vw, 100vw";

export type GalleryItem = { src: string; color?: string };

export function ProductGallery({
  items,
  active: activeProp,
  onSelect,
  alt,
}: {
  items: GalleryItem[];
  /** Índice activo controlado por el padre (ej. sincronizado con el color seleccionado). */
  active?: number;
  onSelect?: (index: number) => void;
  alt: string;
}) {
  const [activeState, setActiveState] = useState(0);
  const active = activeProp ?? activeState;
  const current = items[active]?.src ?? items[0]?.src;

  const handleSelect = (i: number) => {
    setActiveState(i);
    onSelect?.(i);
  };

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {/* Thumbnails */}
      {items.length > 1 && (
        <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-visible">
          {items.map((item, i) => (
            <button
              key={item.src}
              onClick={() => handleSelect(i)}
              title={item.color}
              aria-label={item.color ? `Ver color ${item.color}` : `Ver imagen ${i + 1}`}
              className={cn(
                "h-20 w-16 shrink-0 overflow-hidden rounded-lg border transition-colors md:h-24 md:w-20",
                active === i
                  ? "border-espresso"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <img
                src={productImage(item.src, { width: 160, height: 200 })}
                alt=""
                aria-hidden
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main */}
      <div className="flex-1 overflow-hidden rounded-2xl bg-bone">
        <img
          src={productImage(current ?? "", { width: 800, height: 1000 })}
          srcSet={productSrcSet(current ?? "", MAIN_WIDTHS, { heightRatio: 1.25 })}
          sizes={MAIN_SIZES}
          alt={alt}
          className="aspect-[4/5] w-full object-cover"
          fetchPriority="high"
        />
      </div>
    </div>
  );
}
