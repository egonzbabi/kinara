import { Link } from "react-router";
import type { NavLinkItem } from "~/lib/nav-links";

const HELP_LINKS: NavLinkItem[] = [
  { label: "Envíos y entregas", to: "/politica-de-envios" },
  { label: "Cambios y devoluciones", to: "/politica-de-cambios-y-devoluciones" },
  { label: "Contacto", to: "/contacto" },
];

export function SiteFooter({ links }: { links: NavLinkItem[] }) {
  // "Tienda" empieza con las mismas opciones que el menú principal (mismo
  // `links`, calculado desde el catálogo real — tarea 127) y agrega dos
  // enlaces propios del footer a secciones del home (no son categorías de
  // /tienda, así que no tiene sentido meterlos en el menú principal).
  const cols = [
    {
      title: "Tienda",
      links: [
        ...links,
        { label: "Lo nuevo", to: "/#lo-nuevo" },
        { label: "Próximamente", to: "/#proximamente" },
      ],
    },
    { title: "Ayuda", links: HELP_LINKS },
  ];

  return (
    <footer className="bg-bone">
      <div className="pad py-[clamp(48px,6vw,88px)]">
        <div className="grid gap-10 border-b border-line pb-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link
              to="/"
              className="font-display text-2xl tracking-[0.18em]"
            >
              KINARA
            </Link>
            <p className="mt-4 max-w-[34ch] text-sm text-muted">
              Athleisure técnico hecho para moverse y para vivir. Tejidos
              suaves, color cálido, siluetas que acompañan.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              {/* h3, no h4: no hay ningún h3 antes en la página (las
                  secciones usan h2) — un h4 directo saltaba un nivel del
                  esquema de encabezados (tarea 102). El estilo viene 100% de
                  `.label`, así que el cambio de etiqueta no cambia nada
                  visualmente. */}
              <h3 className="label mb-4">{col.title}</h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-espresso/80 transition-colors hover:text-clay"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-4 pt-7 sm:flex-row sm:items-center">
          <p className="text-[13px] text-muted">© {2026} KINARA</p>
          <div className="flex items-center gap-5 text-[13px] text-muted">
            <Link to="/aviso-de-privacidad" className="hover:text-clay">
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
