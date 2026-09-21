import { useState } from "react";
import { cn } from "~/lib/cn";
import { productImage, productSrcSet } from "~/lib/productImage";

export const MAIN_WIDTHS = [500, 800, 1100];
// La miniatura ahora vive siempre al lado de la foto principal (columna de
// ~64px + gap), incluso en mobile — ya no ocupa el 100vw completo como
// cuando las miniaturas quedaban abajo. `calc()` resta esa columna + el
// padding lateral de `.pad` (~20px de cada lado en mobile).
export const MAIN_SIZES = "(min-width: 768px) 55vw, calc(100vw - 116px)";

export type GalleryItem = { src: string; color?: string };

export function ProductGallery({
  items,
  active: activeProp,
  onSelect,
  alt,
  mainSrcOverride,
}: {
  items: GalleryItem[];
  /** Índice activo controlado por el padre (ej. sincronizado con el color seleccionado). */
  active?: number;
  onSelect?: (index: number) => void;
  alt: string;
  /** Reemplaza la foto principal mostrada (ej. al elegir una foto del carrusel de un color con varias fotos), sin afectar qué miniatura de color está activa. */
  mainSrcOverride?: string;
}) {
  const [activeState, setActiveState] = useState(0);
  const active = activeProp ?? activeState;
  const current = mainSrcOverride ?? items[active]?.src ?? items[0]?.src;

  const handleSelect = (i: number) => {
    setActiveState(i);
    onSelect?.(i);
  };

  return (
    // Miniaturas siempre a la izquierda (antes quedaban abajo de la foto en
    // mobile — `flex-col-reverse` + `md:flex-row` — y solo pasaban a la
    // izquierda desde `md`; a pedido del usuario ahora es igual en todos los
    // anchos). La columna de miniaturas va `absolute` (no como hermano flex
    // normal): en un flex row sin alto explícito, el alto del contenedor sale
    // del hijo MÁS ALTO de los dos — con muchas fotos, la columna de
    // miniaturas terminaba siendo ese hijo más alto, así que en vez de
    // scrollear dentro de la altura de la foto principal, crecía sin límite Y
    // ESTIRABA también la foto principal a esa misma altura (dejando un
    // espacio en blanco enorme debajo de ella). Al sacarla del flujo normal
    // con `absolute`, el alto del contenedor lo decide solo la foto principal
    // (el único hijo que ya queda en flujo normal), y la columna de
    // miniaturas (`inset-y-0`) se ajusta a esa altura ya fija y scrollea
    // dentro de ella si hace falta.
    <div className="relative">
      {items.length > 1 && (
        <div className="absolute inset-y-0 left-0 flex w-16 flex-col gap-2 overflow-y-auto md:w-20">
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

      {/* Main — el margen izquierdo (ancho de la columna de miniaturas + el
          gap que antes daba `gap-3`) le hace lugar a la columna `absolute`. */}
      <div
        className={cn(
          "overflow-hidden rounded-2xl bg-bone",
          items.length > 1 && "ml-[76px] md:ml-[92px]",
        )}
      >
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
