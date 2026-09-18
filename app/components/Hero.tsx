import { useEffect, useRef, useState } from "react";
import { LinkButton } from "./Button";
import { HERO_COLLAGE } from "~/data/images";
import { productImage } from "~/lib/productImage";
import { cn } from "~/lib/cn";

// Poster del video (LCP): mismo archivo fuente, pedido a un tamaño/formato
// razonable (WebP, redimensionado) en vez del JPEG crudo de Storage —
// exportado para que _index.tsx lo precargue (`links()`) con la URL exacta
// que este componente realmente pide (tarea 104).
export const HERO_VIDEO_POSTER = productImage(HERO_COLLAGE.main.poster, {
  width: 1600,
  height: 900,
});

export function Hero() {
  // Entrada suave del texto al cargar (no al hacer scroll — el hero ya está a
  // la vista desde el primer momento) y respeto a "menos movimiento": sin
  // esto, el video autoplay ignoraba por completo la preferencia de
  // accesibilidad del sistema (tarea 090).
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // El video fuente es cuadrado; para que "aparezca la foto completa y luego
  // haga zoom" (tarea 117) el estado de reposo es `object-contain` (se ve
  // TODO el cuadro, con franjas del fondo a los lados o arriba/abajo según el
  // ancho del banner) y la animación lo acerca hasta el mismo recorte que
  // `object-cover` habría mostrado siempre. Ese factor de escala depende de
  // la proporción real del contenedor (cambia con el viewport), así que se
  // calcula en vivo en vez de un valor fijo — de lo contrario en algunos
  // anchos se quedaría corto (sigue viéndose franja) o se pasaría (recorta
  // de más) del punto exacto donde `contain` se vuelve `cover`.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const scale = Math.max(width, height) / Math.min(width, height);
      el.style.setProperty("--kb-scale-end", scale.toFixed(3));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const playsVideo = !reducedMotion;
  const revealBase = "transition-all duration-700 ease-out";
  const revealHidden = "opacity-0 translate-y-4";
  const revealShown = "opacity-100 translate-y-0";

  return (
    <section className="pad pt-4">
      {/* Rediseño full-bleed (tarea 115): el video ya no vive en una tarjeta
          flotante a un lado — llena todo el banner, como en las referencias
          premium del sector (Lululemon, Vuori, Gymshark) que el usuario pidió
          revisar. Un solo titular corto abajo-izquierda en vez de los 5
          bloques de texto apilados que había antes (frase grande + "KINARA" +
          tagline + 2 botones). */}
      <div
        ref={containerRef}
        className="relative h-[clamp(440px,68vh,720px)] w-full overflow-hidden rounded-[28px] bg-espresso"
      >
        <video
          src={HERO_COLLAGE.main.url}
          poster={HERO_VIDEO_POSTER}
          autoPlay={playsVideo}
          muted
          loop
          playsInline
          preload="auto"
          aria-label={HERO_COLLAGE.main.alt}
          // `object-contain` (no `cover`): el usuario pidió ver el cuadro
          // completo del video en reposo, no recortado — el zoom (abajo) es
          // el que después lo acerca hasta el recorte equivalente a `cover`.
          // Desactivado si el usuario prefiere menos movimiento (mismo
          // criterio que `autoPlay`, tarea 090); en ese caso queda fijo
          // mostrando el cuadro completo, sin animar.
          className={cn(
            "absolute inset-0 h-full w-full object-contain",
            playsVideo && "animate-kenburns-fill",
          )}
        />

        {/* Tinte cálido de marca sobre el video (mix-blend-overlay deja pasar
            el detalle, no lo tapa) — mismo tratamiento que ya existía, ahora
            sobre el video completo en vez de solo el fondo ambiental. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(120% 100% at 100% 30%, rgba(200,138,98,0.4), transparent 60%), linear-gradient(135deg, rgba(58,38,28,0.5), transparent 55%)",
          }}
        />

        {/* Scrim para legibilidad del texto — más fuerte abajo/izquierda,
            donde vive el texto ahora (patrón Lululemon: degradado de abajo
            hacia arriba, no una franja lateral). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-espresso/85 via-espresso/25 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-espresso/45 via-transparent to-transparent"
        />

        {/* Texto anclado abajo-izquierda (no centrado ni con `top`): con el
            video llenando todo el banner ya no hay una tarjeta que esquivar,
            así que el texto puede vivir siempre en la misma esquina en
            mobile y desktop. */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-end">
          <div
            className={cn(
              "pointer-events-auto max-w-xl px-[clamp(24px,5vw,72px)] pb-[clamp(32px,6vw,64px)] text-bone",
              revealBase,
              mounted || reducedMotion ? revealShown : revealHidden,
            )}
          >
            {/* Titular único (tarea 115): antes eran dos frases separadas
                ("Tu fuerza no tiene edad. Tu mejor versión está por
                comenzar..." + "El mundo de las mujeres.") — a pedido del
                usuario, combinadas en una sola oración corta, como en las
                referencias revisadas (un titular, no varios bloques). */}
            <h1 className="max-w-[18ch] font-accent text-[clamp(28px,4.6vw,56px)] font-bold leading-[1.08] tracking-[-0.01em]">
              El mundo de las mujeres no tiene edad.
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="#e0303d"
                className="ml-2 inline-block h-[0.85em] w-[0.85em] align-[-0.08em]"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </h1>
            <div className="mt-7 flex flex-wrap gap-3">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
