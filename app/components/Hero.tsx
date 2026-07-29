import { LinkButton } from "./Button";
import { HERO_COLLAGE } from "~/data/images";
import { productImage, productSrcSet } from "~/lib/productImage";

export const HERO_WIDTHS = [480, 720, 1080, 1440];

export function Hero() {
  return (
    <section className="pad pt-4">
      <div className="relative grid h-[clamp(520px,82vh,860px)] grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-[28px] sm:grid-rows-3">
        <img
          src={productImage(HERO_COLLAGE.main.url, { width: 1440, height: 1600 })}
          srcSet={productSrcSet(HERO_COLLAGE.main.url, HERO_WIDTHS, { heightRatio: 1600 / 1440 })}
          sizes="(min-width: 640px) 55vw, 50vw"
          alt={HERO_COLLAGE.main.alt}
          className="h-full w-full object-cover object-[center_20%] sm:row-span-3"
          fetchPriority="high"
        />
        {HERO_COLLAGE.support.map((photo) => (
          <img
            key={photo.url}
            src={productImage(photo.url, { width: 720, height: 540 })}
            srcSet={productSrcSet(photo.url, HERO_WIDTHS, { heightRatio: 540 / 720 })}
            sizes="(min-width: 640px) 27vw, 50vw"
            alt={photo.alt}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ))}

        {/* Warm scrim for legibility + brand tone */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/75 via-espresso/20 to-espresso/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-espresso/40 to-transparent"
        />

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-[clamp(24px,5vw,72px)]">
          <div className="pointer-events-auto max-w-2xl text-bone">
            <span className="label text-bone/70">Nueva colección · SS26</span>
            <h1 className="mt-3 font-display text-[clamp(40px,7vw,92px)] font-medium leading-[0.98] tracking-[-0.01em]">
              El universo de la
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
        </div>
      </div>
    </section>
  );
}
