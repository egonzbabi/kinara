import { useCallback, useRef, useState } from "react";
import { useDragScroll } from "~/hooks/useDragScroll";
import type { ComingSoonItem } from "~/lib/coming-soon";
import { ComingSoonViewer } from "./ComingSoonViewer";

const SIZES = "(min-width: 1024px) 23vw, (min-width: 640px) 30vw, 46vw";
/** Si el cursor se movió más que esto entre apretar y soltar, fue un arrastre del carrusel, no un clic. */
const DRAG_THRESHOLD_PX = 6;

export function ComingSoonRail({ items }: { items: ComingSoonItem[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const pressX = useRef<number | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  useDragScroll(railRef);
  // Estable: el focus trap de la vista ampliada se reinicia si esta función cambia.
  const closeViewer = useCallback(() => setOpenIndex(null), []);

  // Sin prendas (o sin la tabla) la sección no se muestra.
  if (items.length === 0) return null;

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
        onPointerDown={(e) => {
          pressX.current = e.clientX;
        }}
        className="no-scrollbar flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(20px,5vw,80px)] pb-2"
      >
        {items.map((item, index) => (
          <article
            key={item.id}
            className="w-[68vw] shrink-0 snap-start sm:w-[42vw] md:w-[30vw] lg:w-[23vw]"
          >
            {/* Toda la foto es un botón: clic, Enter o espacio la abren en grande.
                Un arrastre del carrusel no cuenta como clic. */}
            <button
              type="button"
              aria-label={`Ver ${item.name} en grande`}
              onClick={(e) => {
                const moved = Math.abs(e.clientX - (pressX.current ?? e.clientX));
                pressX.current = null;
                // clientX 0 = activado con teclado (Enter/espacio): siempre abre.
                if (e.detail !== 0 && moved > DRAG_THRESHOLD_PX) return;
                setOpenIndex(index);
              }}
              className="block aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-xl bg-bone text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay"
            >
              <img
                src={item.src}
                srcSet={item.srcSet}
                sizes={SIZES}
                alt={item.name}
                loading="lazy"
                draggable={false}
                className="h-full w-full object-cover object-top"
              />
            </button>
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

      <ComingSoonViewer
        items={items}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={closeViewer}
      />
    </section>
  );
}
