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

        {/* El texto se posiciona con `top` en porcentaje (no con flex
            justify-center ni con translate-y) a propósito: en mobile la
            tarjeta de video vive arriba (tarea 092) y centrar el bloque
            completo lo hacía encimarse con ella; con `top` fijamos su
            posición relativa al alto real del hero, dejando aire debajo
            de la tarjeta, y evitamos otro choque con el translate-y de la
            animación de entrada (misma razón que la tarjeta de video). */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <div
            className={cn(
              "pointer-events-auto absolute left-0 right-0 top-[47%] max-w-2xl px-[clamp(24px,5vw,72px)] text-bone md:top-[30%] md:max-w-xl",
              revealBase,
              mounted || reducedMotion ? revealShown : revealHidden,
            )}
          >
            {/* Frase grande: fuente de acento (Syne, tarea 094) — deliberadamente
                distinta a Fraunces para que contraste, moderna y llamativa,
                solo aquí (no reemplaza la tipografía de marca en el resto del
                sitio). El h1 semántico (abajo) es el mensaje de marca de
                siempre, ahora en un tamaño secundario más discreto. */}
            <p className="max-w-[18ch] font-accent text-[clamp(30px,5.2vw,58px)] font-bold leading-[1.02] tracking-[-0.02em]">
              Tu fuerza no tiene edad. Tu mejor versión está por comenzar...
            </p>
            <h1 className="mt-5 font-display text-[clamp(20px,2.4vw,30px)] italic leading-snug tracking-[-0.005em] text-bone/85">
              El mundo de las <span className="text-[#f0c9b5]">mujeres</span>.
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="#e0303d"
                className="ml-1.5 inline-block h-[0.75em] w-[0.75em] align-[-0.05em]"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </h1>
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
