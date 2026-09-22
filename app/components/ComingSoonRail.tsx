import { useRef } from "react";
import { useDragScroll } from "~/hooks/useDragScroll";
import { COMING_SOON_ITEMS } from "~/data/comingSoon";

const WIDTHS = [480, 800];
const SIZES = "(min-width: 1024px) 23vw, (min-width: 640px) 30vw, 46vw";

export function ComingSoonRail() {
  const railRef = useRef<HTMLDivElement>(null);
  useDragScroll(railRef);

  return (
    <section id="proximamente" className="py-[clamp(48px,7vw,96px)]">
      <div className="pad reveal mb-8 flex items-end justify-between gap-6">
        <div>
          <span className="label">Nueva colección</span>
          <h2 className="mt-2 font-display text-[clamp(28px,4vw,48px)] leading-none">
            Próximamente
          </h2>
        </div>
        <span className="hidden text-[13px] text-muted sm:block">
          ← Arrastra →
        </span>
      </div>

      <div
        ref={railRef}
        className="no-scrollbar flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(20px,5vw,80px)] pb-2"
      >
        {COMING_SOON_ITEMS.map((item) => (
          <article
            key={item.slug}
            className="w-[68vw] shrink-0 snap-start sm:w-[42vw] md:w-[30vw] lg:w-[23vw]"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-bone">
              <img
                src={`/proximamente/${item.imageBase}-800.webp`}
                srcSet={WIDTHS.map((w) => `/proximamente/${item.imageBase}-${w}.webp ${w}w`).join(
                  ", ",
                )}
                sizes={SIZES}
                alt={item.name}
                loading="lazy"
                className="h-full w-full object-cover object-top"
              />
            </div>
            {/* La etiqueta va debajo de la foto, no encima (tarea 122): con
                fotos de proveedor de composición variable, un badge superpuesto
                a veces tapaba la cara de la modelo (ej. Aura Skirt Set, con dos
                modelos lado a lado). */}
            <span className="mt-3 inline-block rounded-full bg-espresso px-2.5 py-1 text-[11px] font-semibold tracking-wide text-bone">
              Próximamente
            </span>
            <h3 className="mt-1.5 font-medium leading-tight">{item.name}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
