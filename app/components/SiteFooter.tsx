import { Link } from "react-router";

const COLS = [
  {
    title: "Tienda",
    links: [
      { label: "Mujer", to: "/tienda?cat=mujer" },
      { label: "Hombre", to: "/tienda?cat=hombre" },
      { label: "Accesorios", to: "/tienda?cat=accesorios" },
      { label: "Novedades", to: "/tienda" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Envíos y entregas", to: "/tienda" },
      { label: "Devoluciones", to: "/tienda" },
      { label: "Guía de tallas", to: "/tienda" },
      { label: "Contacto", to: "/tienda" },
    ],
  },
  {
    title: "Marca",
    links: [
      { label: "Nuestra historia", to: "/tienda" },
      { label: "Sostenibilidad", to: "/tienda" },
      { label: "Instagram", to: "/tienda" },
      { label: "TikTok", to: "/tienda" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-bone">
      <div className="pad py-[clamp(48px,6vw,88px)]">
        <div className="grid gap-10 border-b border-line pb-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
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
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="label mb-4">{col.title}</h4>
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
          <p className="text-[13px] text-muted">
            © {2026} KINARA · Hecho con cuidado en España
          </p>
          <div className="flex items-center gap-5 text-[13px] text-muted">
            <a href="#" className="hover:text-clay">
              Privacidad
            </a>
            <a href="#" className="hover:text-clay">
              Términos
            </a>
            <a href="#" className="hover:text-clay">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
