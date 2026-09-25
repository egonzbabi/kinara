import { useEffect, useState } from "react";
import { LinkButton } from "./Button";
import { productImage, productSrcSet } from "~/lib/productImage";
import { cn } from "~/lib/cn";

// Fotogramas reales del video del hero (mujeres reales, distintos cuerpos y
// edades, distintas formas de moverse) convertidos a fotos fijas — a pedido
// del usuario, en vez de la única foto de shooting que tenía esta sección
// desde la tarea 103. Encajan con el copy de abajo (diversidad, comunidad).
const EDITORIAL_BASE =
  "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/site";
const EDITORIAL_PHOTOS = [
  {
    url: `${EDITORIAL_BASE}/editorial-tenis-1790304354749.jpg`,
    alt: "Mujer de KINARA jugando tenis, en pleno movimiento",
  },
  {
    url: `${EDITORIAL_BASE}/editorial-liga-1790304354749.jpg`,
    alt: "Mujer de KINARA estirando una liga elástica de entrenamiento",
  },
  {
    url: `${EDITORIAL_BASE}/editorial-yoga-1790304354749.jpg`,
    alt: "Mujer de KINARA en una postura de yoga con aro elástico",
  },
  {
    url: `${EDITORIAL_BASE}/editorial-box-1790304354749.jpg`,
    alt: "Mujer de KINARA en guardia de boxeo",
  },
  {
    url: `${EDITORIAL_BASE}/editorial-serena-1790304354749.jpg`,
    alt: "Mujer de KINARA en un momento de calma, ojos cerrados",
  },
  {
    url: `${EDITORIAL_BASE}/editorial-retrato-1790304354749.jpg`,
    alt: "Retrato de una mujer de KINARA sonriendo",
  },
] as const;
const EDITORIAL_WIDTHS = [480, 700, 1100];
const EDITORIAL_INTERVAL_MS = 4500;

function EditorialCarousel() {
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    setAutoplay(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % EDITORIAL_PHOTOS.length);
    }, EDITORIAL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoplay]);

  return (
    <div className="relative aspect-[1100/1200] h-full w-full">
      {EDITORIAL_PHOTOS.map((photo, i) => (
        <img
          key={photo.url}
          src={productImage(photo.url, { width: 1100, height: 1200 })}
          srcSet={productSrcSet(photo.url, EDITORIAL_WIDTHS, { heightRatio: 1200 / 1100 })}
          sizes="(min-width: 768px) 46vw, 92vw"
          alt={photo.alt}
          loading="lazy"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out",
            i === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </div>
  );
}

export function EditorialSplit() {
  return (
    <section className="pad py-[clamp(48px,7vw,96px)]">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
        <div className="reveal order-2 md:order-1">
          <span className="label">Nuestra filosofía</span>
          <blockquote className="mt-4 font-display text-[clamp(26px,3.6vw,44px)] font-medium leading-[1.08]">
            “FUERZA EN MOVIMIENTO”
          </blockquote>
          <p className="mt-5 max-w-[48ch] text-muted">
            Ropa deportiva creada para mujeres reales, con diseños que se
            adaptan a cada etapa, cada cuerpo y cada forma de moverse.
          </p>
          <p className="mt-3 max-w-[48ch] font-display text-xl italic text-espresso sm:text-2xl">
            Hecha para moverte. <span className="text-clay">Creada para brillar.</span>
          </p>
          <div className="mt-7">
            <LinkButton to="/tienda" variant="ink">
              Conoce la colección
            </LinkButton>
          </div>
        </div>

        <div className="reveal order-1 overflow-hidden rounded-2xl md:order-2">
          <EditorialCarousel />
        </div>
      </div>
    </section>
  );
}
