import { useEffect, useState } from "react";
import { LinkButton } from "./Button";
import { HERO_COLLAGE } from "~/data/images";
import { cn } from "~/lib/cn";

// Ya no se usa para el hero (era el ancho de srcSet de las fotos del
// carrusel, tarea 087/088) — se deja exportado porque _index.tsx todavía lo
// usa para el preload de una foto distinta (PHOTO.heroPrimary).
export const HERO_WIDTHS = [640, 1000, 1500, 2000];

export function Hero() {
  // Entrada suave del texto/tarjeta al cargar (no al hacer scroll — el hero ya
  // está a la vista desde el primer momento) y respeto a "menos movimiento":
  // sin esto, el video autoplay ignoraba por completo la preferencia de
  // accesibilidad del sistema (tarea 090).
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const playsVideo = !reducedMotion;
  const revealBase = "transition-all duration-700 ease-out";
  const revealHidden = "opacity-0 translate-y-4";
  const revealShown = "opacity-100 translate-y-0";

  return (
    <section className="pad pt-4">
      <div className="relative h-[clamp(560px,90vh,960px)] w-full overflow-hidden rounded-[28px] bg-espresso">
        {/* Fondo ambiental: el mismo video, agrandado y desenfocado, para llenar
            la franja horizontal con color y movimiento reales en vez de una
            barra sólida — el video es cuadrado (1080×1080, tarea 092) y no
            llena por sí solo un hero horizontal ancho, así que el hueco se
            resuelve con el propio video, no con relleno plano (tarea 089,
            mismo recurso que usan apps como Spotify/Apple). */}
        <video
          src={HERO_COLLAGE.main.url}
          poster={HERO_COLLAGE.main.poster}
          autoPlay={playsVideo}
          muted
          loop
          playsInline
          aria-hidden
          tabIndex={-1}
          className="absolute inset-0 h-full w-full scale-125 object-cover object-[center_30%] opacity-70 blur-2xl saturate-125"
        />
        {/* Sombreado + tinte cálido de marca sobre el fondo (mix-blend-overlay
            deja pasar el detalle del video, no lo tapa) — sin esto el fondo
            toma el gris del estudio de foto, no el tono cálido de la marca. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-espresso/35" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(120% 100% at 100% 50%, rgba(200,138,98,0.55), transparent 60%), linear-gradient(135deg, rgba(58,38,28,0.6), transparent 55%)",
          }}
        />

        {/* Resplandor cálido detrás de la tarjeta — solo desde `md` (donde la
            tarjeta existe como objeto flotante); le da profundidad e insinúa
            que ahí "vive" la luz de la composición, en vez de un video
            flotando sin razón. */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-[clamp(4px,3.5vw,40px)] top-1/2 z-0 hidden aspect-square h-[96%] -translate-y-1/2 rounded-full bg-clay/40 blur-[90px] md:block",
            revealBase,
            "duration-1000",
            mounted || reducedMotion ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Video nítido: ahora que el archivo mismo es cuadrado (recortado a
            propósito arriba/abajo para quitar el exceso de fondo blanco del
            estudio, sin perder cabeza ni pies — tarea 092), la tarjeta ya no
            necesita `object-contain` ni una proporción artificial: es un
            cuadrado real, centrado en mobile y anclado a la derecha desde
            `md`, y el video la llena exacto. */}
        <video
          src={HERO_COLLAGE.main.url}
          poster={HERO_COLLAGE.main.poster}
          autoPlay={playsVideo}
          muted
          loop
          playsInline
          preload="auto"
          aria-label={HERO_COLLAGE.main.alt}
          className={cn(
            // En mobile se ancla cerca del borde superior (no centrada) para
            // no encimarse con el texto, que siempre vive abajo (tarea 092) —
            // el centrado es solo horizontal (translate-x), a propósito: si
            // también centráramos verticalmente con translate-y chocaría con
            // el translate-y de la animación de entrada de más abajo (misma
            // propiedad CSS, no se pueden combinar dos clases de Tailwind que
            // la usen sin prefijo de breakpoint).
            "absolute left-1/2 top-[5%] z-[1] aspect-square h-[36%] -translate-x-1/2 rounded-2xl object-cover",
            "shadow-[0_30px_70px_-20px_rgba(0,0,0,0.6)] ring-1 ring-bone/10",
            "md:left-auto md:right-[clamp(16px,4vw,56px)] md:top-1/2 md:h-[92%] md:-translate-y-1/2 md:translate-x-0",
            "md:transition-transform md:duration-500 md:ease-out md:hover:scale-[1.015]",
            revealBase,
            "duration-[900ms]",
            mounted || reducedMotion
              ? "opacity-100 translate-y-0 md:scale-100"
              : "opacity-0 translate-y-6 md:scale-[0.97]",
          )}
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
          <div
            className={cn(
              "pointer-events-auto max-w-2xl text-bone md:max-w-lg",
              revealBase,
              mounted || reducedMotion ? revealShown : revealHidden,
            )}
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
              <LinkButton to="/tienda" variant="clay" size="lg" className="group">
                Comprar la colección
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  fill="none"
                  className="ml-2 inline-block h-4 w-4 -translate-y-px transition-transform duration-200 ease-out group-hover:translate-x-1"
                >
                  <path
                    d="M4 10h12m0 0-5-5m5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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
