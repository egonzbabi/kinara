import { useEffect, useState } from "react";
import { LinkButton } from "./Button";
import { HERO_COLLAGE } from "~/data/images";
import { productImage, productSrcSet } from "~/lib/productImage";

export const HERO_WIDTHS = [640, 1000, 1500, 2000];
const SLIDE_MS = 5000;

const SLIDES = [HERO_COLLAGE.main, ...HERO_COLLAGE.support];

// Estado de recorte (clip-path) de cada foto: CLOSED es una línea de 0px en
// el centro (como el lomo de un libro cerrado), OPEN es la foto completa.
// La foto activa anima de CLOSED a OPEN "abriéndose" desde el centro hacia
// los dos lados; la que estaba activa justo antes se queda en OPEN sin
// animar, sirviendo de fondo visible mientras la nueva se revela encima —
// así nunca hay un cuadro vacío entre una foto y otra.
const CLOSED = "inset(0% 50% 0% 50%)";
const OPEN = "inset(0% 0% 0% 0%)";

export function Hero() {
  const [active, setActive] = useState(0);
  const [prevActive, setPrevActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = (next: number) => {
    if (next === active) return;
    setPrevActive(active);
    setActive(next);
    setPaused(true);
  };

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setTimeout(() => {
      setPrevActive(active);
      setActive((active + 1) % SLIDES.length);
    }, SLIDE_MS);
    return () => clearTimeout(id);
  }, [active, paused]);

  return (
    <section className="pad pt-4">
      <div
        className="relative h-[clamp(520px,82vh,860px)] w-full cursor-pointer overflow-hidden rounded-[28px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onClick={() => goTo((active + 1) % SLIDES.length)}
      >
        {SLIDES.map((slide, i) => {
          const isActive = i === active;
          const isBase = i === prevActive && i !== active;
          const visible = isActive || isBase;
          return (
            <div
              key={slide.url}
              className="absolute inset-0 overflow-hidden"
              style={{
                clipPath: visible ? OPEN : CLOSED,
                zIndex: isActive ? 2 : isBase ? 1 : 0,
                transition: isActive
                  ? "clip-path 1000ms var(--ease-out-soft)"
                  : "none",
              }}
            >
              <img
                src={productImage(slide.url, { width: 2000, height: 1300 })}
                srcSet={productSrcSet(slide.url, HERO_WIDTHS, { heightRatio: 1300 / 2000 })}
                sizes="100vw"
                alt={slide.alt}
                className={`h-full w-full object-cover object-[center_62%] ${
                  isActive ? "animate-kenburns" : ""
                }`}
                fetchPriority={i === 0 ? "high" : undefined}
              />
            </div>
          );
        })}

        {/* Warm scrim for legibility + brand tone — siempre por encima de
            las fotos (z-10) para que nunca quede tapado el texto. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-espresso/75 via-espresso/20 to-espresso/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-espresso/40 to-transparent"
        />

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end p-[clamp(24px,5vw,72px)]">
          <div
            className="pointer-events-auto max-w-2xl text-bone"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="mt-3 font-display text-[clamp(40px,7vw,92px)] font-medium leading-[0.98] tracking-[-0.01em]">
              El mundo de la
              <br />
              mujer en <span className="italic text-[#f0c9b5]">movimiento</span>.
            </h1>
            <p className="mt-5 max-w-[46ch] text-[clamp(15px,1.6vw,18px)] text-bone/80">
              Tejidos técnicos con tacto de segunda piel. Diseñado en tonos
              cálidos para entrenar, respirar y seguir con tu día.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton to="/tienda" variant="clay" size="lg">
                Comprar la colección
              </LinkButton>
              <LinkButton
                to="/tienda?cat=mujer"
                size="lg"
                className="border border-bone/40 bg-transparent text-bone hover:bg-bone hover:text-espresso"
              >
                Ver Mujer
              </LinkButton>
            </div>
          </div>

          <div
            className="pointer-events-auto mt-8 flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {SLIDES.map((slide, i) => (
              <button
                key={slide.url}
                type="button"
                aria-label={`Ver foto ${i + 1} de ${SLIDES.length}`}
                aria-current={i === active}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-6 bg-bone" : "w-1.5 bg-bone/40 hover:bg-bone/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
