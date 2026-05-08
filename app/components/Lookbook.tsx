import { useRef } from "react";
import { LOOKS } from "~/data/looks";
import { useDragScroll } from "~/hooks/useDragScroll";
import { isDarkHex } from "~/lib/isDarkHex";

export function Lookbook() {
  const railRef = useRef<HTMLDivElement>(null);
  useDragScroll(railRef);

  return (
    <div className="overflow-hidden">
      <div
        ref={railRef}
        className="rail flex cursor-grab gap-[18px] overflow-x-auto py-2 pb-8 [scroll-snap-type:x_mandatory] [scrollbar-width:none] [&.is-grabbing]:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      >
        {LOOKS.map((look) => (
          <a
            key={look.id}
            href={`#${look.id}`}
            data-cursor={isDarkHex(look.bg) ? "dark" : undefined}
            className="look relative aspect-[3/4] flex-[0_0_clamp(280px,26vw,420px)] overflow-hidden rounded-lg bg-paper transition-transform duration-500 ease-[var(--ease-out-solar)] [scroll-snap-align:start]"
          >
            <div
              className="absolute inset-0"
              style={{ background: look.bg }}
            />
            <span
              className="absolute left-[14px] top-[14px] rounded-full bg-white/65 px-2.5 py-1.5 font-mono text-[10px] tracking-[.2em] backdrop-blur"
            >
              {look.num}
            </span>
            <div className="look-cap absolute inset-x-[14px] bottom-[14px] flex items-end justify-between">
              <span className="text-[18px] font-black tracking-[-0.01em]">
                {look.name}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[.18em]">
                Shop →
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
