import { LinkButton } from "./Button";
import { HERO_COLLAGE } from "~/data/images";

// Ya no se usa para el hero (era el ancho de srcSet de las fotos del
// carrusel, tarea 087/088) — se deja exportado porque _index.tsx todavía lo
// usa para el preload de una foto distinta (PHOTO.heroPrimary).
export const HERO_WIDTHS = [640, 1000, 1500, 2000];

export function Hero() {
  return (
    <section className="pad pt-4">
      <div className="relative h-[clamp(520px,82vh,860px)] w-full overflow-hidden rounded-[28px] bg-espresso">
        {/* Fondo ambiental: el mismo video, agrandado y desenfocado, para llenar
            la franja horizontal con color y movimiento reales en vez de una
            barra sólida — el video es vertical (1080×1920, formato celular) y
            nunca va a llenar un hero horizontal sin recortarse o dejar huecos,
            así que el hueco se resuelve con el propio video, no con relleno
            plano (tarea 089, mismo recurso que usan apps como Spotify/Apple
            para video vertical dentro de un marco horizontal). */}
        <video
          src={HERO_COLLAGE.main.url}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
          tabIndex={-1}
          className="absolute inset-0 h-full w-full scale-125 object-cover object-[center_30%] opacity-70 blur-2xl saturate-125"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-espresso/35" />

        {/* Video nítido: en mobile llena el marco (como antes); desde `md` se
            ancla como una tarjeta a la derecha (alto, con su propia sombra),
            dejando el texto respirar a la izquierda sobre el fondo desenfocado. */}
        <video
          src={HERO_COLLAGE.main.url}
          poster={HERO_COLLAGE.main.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label={HERO_COLLAGE.main.alt}
          className="absolute inset-0 z-[1] h-full w-full object-contain
            md:inset-auto md:right-[clamp(20px,5vw,64px)] md:top-1/2 md:h-[86%] md:w-auto
            md:-translate-y-1/2 md:rounded-2xl md:object-cover md:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.55)]"
        />

        {/* Warm scrim for legibility + brand tone — siempre por encima del
            video (z-10) para que nunca quede tapado el texto. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-espresso/75 via-espresso/20 to-espresso/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-espresso/50 via-espresso/10 to-transparent md:from-espresso/60 md:via-espresso/25"
        />

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end p-[clamp(24px,5vw,72px)]">
          <div className="pointer-events-auto max-w-2xl text-bone md:max-w-lg">
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
        </div>
      </div>
    </section>
  );
}
