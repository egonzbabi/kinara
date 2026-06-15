import { useRef } from "react";
import { LOOKS } from "~/data/looks";
import { useDragScroll } from "~/hooks/useDragScroll";

export function LookbookBand() {
  const railRef = useRef<HTMLDivElement>(null);
  useDragScroll(railRef);

  return (
    <section className="py-[clamp(48px,7vw,96px)]">
      <div className="pad reveal mb-8 flex items-end justify-between gap-6">
        <div>
          <span className="label">SS26</span>
          <h2 className="mt-2 font-display text-[clamp(28px,4vw,48px)] leading-none">
            Lookbook
          </h2>
        </div>
        <span className="hidden text-[13px] text-muted sm:block">
          ← Arrastra →
        </span>
      </div>

      <div
        ref={railRef}
        className="no-scrollbar flex cursor-grab gap-4 overflow-x-auto px-[clamp(20px,5vw,80px)] pb-2"
      >
        {LOOKS.map((look) => (
          <figure
            key={look.id}
            className="group relative w-[72vw] shrink-0 overflow-hidden rounded-2xl sm:w-[44vw] md:w-[32vw] lg:w-[26vw]"
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={look.image}
                alt={`${look.num} — ${look.name}`}
                loading="lazy"
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-espresso/70 to-transparent p-5 text-bone">
              <span className="font-display text-lg">{look.name}</span>
              <span className="label text-bone/70">{look.num}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
