import { useEffect, useState } from "react";
import { LinkButton } from "./Button";
import { productImage, productSrcSet } from "~/lib/productImage";
import { cn } from "~/lib/cn";

// Fotos reales del shooting de grupo (mismas usadas para armar el video
// anterior del hero, tarea 118) — a pedido del usuario, en vez de la única
// foto de shooting que tenía esta sección desde la tarea 103, o de
// fotogramas sacados del video (peor calidad que las fotos originales).
// Encajan con el copy de abajo (diversidad, comunidad). Orden deliberadamente
// mezclado, no cronológico ni por tamaño de grupo.
const EDITORIAL_BASE =
  "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/site";
const EDITORIAL_PHOTOS = [
  {
    url: `${EDITORIAL_BASE}/editorial-grupo6-1790306360869.jpg`,
    alt: "Seis mujeres de KINARA de distintas edades posando juntas",
  },
  {
    url: `${EDITORIAL_BASE}/editorial-grupo9c-1790307386277.jpg`,
    alt: "Las mujeres de KINARA juntas, la comunidad completa",
    // Única foto horizontal (viene del video, no del shooting vertical) — no
    // cabe completa en el recuadro retrato sin cortar a alguien de los lados.
    // "contain" (no "cover") la muestra entera; el fondo blanco del propio
    // estudio en la foto se funde con el fondo blanco del contenedor, así
    // que no se nota como una franja de color distinto (a pedido del usuario).
    fit: "contain",
  },
  {
    url: `${EDITORIAL_BASE}/editorial-grupo3-1790306360869.jpg`,
    alt: "Cuatro mujeres de KINARA posando en tonos crema y morado",
  },
  {
    url: `${EDITORIAL_BASE}/editorial-grupo8-1790306360869.jpg`,
    alt: "Mujeres de KINARA celebrando con los brazos en alto",
  },
  {
    url: `${EDITORIAL_BASE}/editorial-grupo1-1790306360869.jpg`,
    alt: "Cuatro mujeres de KINARA posando juntas, distintos estilos",
  },
  {
    url: `${EDITORIAL_BASE}/editorial-grupo5-1790306360869.jpg`,
    alt: "Cinco mujeres de KINARA en azul, negro y blanco",
  },
  {
    url: `${EDITORIAL_BASE}/editorial-grupo2-1790306360869.jpg`,
    alt: "Cuatro mujeres de KINARA posando, elegantes",
  },
  {
    url: `${EDITORIAL_BASE}/editorial-grupo7-1790306360869.jpg`,
    alt: "Cinco mujeres de KINARA en tonos rosas y pasteles",
  },
  {
    url: `${EDITORIAL_BASE}/editorial-grupo4-1790306360869.jpg`,
    alt: "Cinco mujeres de KINARA de distintas edades posando juntas",
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
    <div className="relative aspect-[1100/1200] h-full w-full bg-white">
      {EDITORIAL_PHOTOS.map((photo, i) => {
        // La foto "contain" es horizontal (viene del video) — pedirla con
        // height+resize=cover la recortaría en el servidor antes de que
        // object-contain pueda hacer nada; se pide a su proporción natural.
        const isContain = "fit" in photo && photo.fit === "contain";
        return (
          <img
            key={photo.url}
            src={
              isContain
                ? productImage(photo.url, { width: 1100 })
                : productImage(photo.url, { width: 1100, height: 1200 })
            }
            srcSet={
              isContain
                ? productSrcSet(photo.url, EDITORIAL_WIDTHS)
                : productSrcSet(photo.url, EDITORIAL_WIDTHS, { heightRatio: 1200 / 1100 })
            }
            sizes="(min-width: 768px) 46vw, 92vw"
            alt={photo.alt}
            loading="lazy"
            className={cn(
              "absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out",
              isContain ? "object-contain" : "object-cover",
              i === index ? "opacity-100" : "opacity-0",
            )}
          />
        );
      })}
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
