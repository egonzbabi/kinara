import { useEffect, useRef } from "react";
import type { ComingSoonItem } from "~/lib/coming-soon";
import { useFocusTrap } from "~/hooks/useFocusTrap";
import { cn } from "~/lib/cn";

type Props = {
  items: ComingSoonItem[];
  /** Posición de la prenda abierta, o `null` si está cerrada. */
  index: number | null;
  onIndexChange: (index: number) => void;
  /** Debe ser estable (useCallback): el focus trap se reinicia si cambia. */
  onClose: () => void;
};

const SWIPE_MIN_PX = 50;

// Vista ampliada de una prenda de "Próximamente" (tarea 152): foto grande sin
// recortar, nombre y etiqueta. Cierra con Esc, con la X o tocando el fondo;
// flechas del teclado, botones o deslizar el dedo pasan a la anterior/siguiente.
export function ComingSoonViewer({ items, index, onIndexChange, onClose }: Props) {
  const open = index !== null;
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const count = items.length;

  useFocusTrap(open, panelRef, onClose);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (index === null || count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + count) % count);
      if (e.key === "ArrowRight") onIndexChange((index + 1) % count);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, count, onIndexChange]);

  if (index === null) return null;
  const item = items[index];
  if (!item) return null;

  const go = (delta: number) => onIndexChange((index + delta + count) % count);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-espresso/80 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${item.name}, próximamente`}
        className="relative flex max-h-full w-full max-w-[560px] flex-col items-center"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current;
          touchStartX.current = null;
          const end = e.changedTouches[0]?.clientX;
          if (start == null || end == null || count < 2) return;
          if (end - start > SWIPE_MIN_PX) go(-1);
          else if (start - end > SWIPE_MIN_PX) go(1);
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute -top-1 right-0 z-10 grid h-10 w-10 -translate-y-full place-items-center rounded-full bg-bone text-espresso transition-colors hover:bg-white sm:-right-12 sm:top-0 sm:translate-y-0"
        >
          <CloseIcon />
        </button>

        <img
          key={item.id}
          src={item.fullSrc}
          alt={item.name}
          className="max-h-[calc(100dvh-9rem)] w-auto max-w-full rounded-xl bg-bone object-contain"
        />

        <div className="mt-4 flex flex-col items-center gap-1.5 text-center text-bone">
          <span className="inline-block rounded-full bg-bone px-2.5 py-1 text-[11px] font-semibold tracking-wide text-espresso">
            Próximamente
          </span>
          <h3 className="font-display text-2xl leading-tight">{item.name}</h3>
        </div>

        {count > 1 && (
          <>
            <ArrowButton
              label="Anterior"
              onClick={() => go(-1)}
              className="left-0 sm:-left-14"
            >
              <path d="M15 5l-7 7 7 7" />
            </ArrowButton>
            <ArrowButton
              label="Siguiente"
              onClick={() => go(1)}
              className="right-0 sm:-right-14"
            >
              <path d="M9 5l7 7-7 7" />
            </ArrowButton>
          </>
        )}
      </div>
    </div>
  );
}

function ArrowButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-[40%] grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-bone/90 text-espresso transition-colors hover:bg-white",
        className,
      )}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {children}
        </g>
      </svg>
    </button>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
