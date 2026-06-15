import { LinkButton } from "./Button";
import { img, PHOTO } from "~/data/images";

export function Hero() {
  return (
    <section className="pad pt-4">
      <div className="relative overflow-hidden rounded-[28px]">
        <img
          src={img(PHOTO.heroPrimary, { w: 2000, h: 1300, q: 82 })}
          alt="Mujer estirando con ropa deportiva KINARA en un estudio cálido"
          className="h-[clamp(520px,82vh,860px)] w-full object-cover object-[center_30%]"
          fetchPriority="high"
        />
        {/* Warm scrim for legibility + brand tone */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-espresso/75 via-espresso/20 to-espresso/10"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-espresso/40 to-transparent"
        />

        <div className="absolute inset-0 flex flex-col justify-end p-[clamp(24px,5vw,72px)]">
          <div className="max-w-2xl text-bone">
            <span className="label text-bone/70">Nueva colección · SS26</span>
            <h1 className="mt-3 font-display text-[clamp(40px,7vw,92px)] font-medium leading-[0.98] tracking-[-0.01em]">
              Muévete con
              <br />
              <span className="italic text-[#f0c9b5]">calma</span> y fuerza.
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
