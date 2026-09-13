import { LinkButton } from "./Button";
import { productImage, productSrcSet } from "~/lib/productImage";

// Foto real del shooting (NEWYORK SET, Ivory/Cocoa) — reemplaza la foto de
// stock de Unsplash que tenía esta sección (tarea 103, auditoría de
// performance: "reemplazar fotos hotlinked por fotos reales del shooting").
// Pose de movimiento genuina, en la paleta cálida de la marca — encaja con
// la frase "el cuerpo que se mueve y la mente que necesita calma".
const EDITORIAL_PHOTO =
  "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/t5a8m19y/ivorycocoa-1788997367076-1.jpg";
const EDITORIAL_WIDTHS = [480, 700, 1100];

export function EditorialSplit() {
  return (
    <section className="pad py-[clamp(48px,7vw,96px)]">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
        <div className="reveal order-2 md:order-1">
          <span className="label">Nuestra filosofía</span>
          <blockquote className="mt-4 font-display text-[clamp(26px,3.6vw,44px)] font-medium leading-[1.08]">
            “Hecho para el cuerpo que se mueve y la mente que necesita
            calma.”
          </blockquote>
          <p className="mt-5 max-w-[48ch] text-muted">
            Diseñamos cada pieza con tejidos cómodos y un patronaje que
            favorece a cuerpos reales. Menos colecciones, más duraderas. Color
            cálido que combina con todo lo que ya tienes.
          </p>
          <div className="mt-7">
            <LinkButton to="/tienda" variant="ink">
              Conoce la colección
            </LinkButton>
          </div>
        </div>

        <div className="reveal order-1 overflow-hidden rounded-2xl md:order-2">
          <img
            src={productImage(EDITORIAL_PHOTO, { width: 1100, height: 1200 })}
            srcSet={productSrcSet(EDITORIAL_PHOTO, EDITORIAL_WIDTHS, { heightRatio: 1200 / 1100 })}
            sizes="(min-width: 768px) 46vw, 92vw"
            alt="Modelo de KINARA en movimiento, brazo en alto"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
