import { LinkButton } from "./Button";
import { img, PHOTO } from "~/data/images";

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
            Diseñamos cada pieza con tejidos reciclados y un patronaje que
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
            src={img(PHOTO.editorial, { w: 1100, h: 1200, q: 82 })}
            alt="Detalle de tejido y movimiento en ropa KINARA"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
