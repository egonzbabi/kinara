import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import { useCart } from "~/context/CartContext";
import { cn } from "~/lib/cn";

const LINKS = [
  { to: "/tienda", label: "Tienda" },
  { to: "/tienda?cat=mujer", label: "Mujer" },
  { to: "/tienda?cat=hombre", label: "Hombre" },
  { to: "/tienda?cat=accesorios", label: "Accesorios" },
];

export function SiteNav() {
  const { count, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-sand/85 backdrop-blur-md transition-shadow",
        scrolled ? "shadow-[0_1px_0_var(--color-line)]" : "",
      )}
    >
      <nav className="pad flex h-16 items-center justify-between gap-4">
        {/* Left: desktop links / mobile burger */}
        <div className="flex flex-1 items-center gap-7">
          <button
            className="md:hidden"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen(true)}
          >
            <BurgerIcon />
          </button>
          <ul className="hidden items-center gap-7 md:flex">
            {LINKS.map((l) => (
              <li key={l.label}>
                <NavLink
                  to={l.to}
                  end={l.to === "/tienda"}
                  className={({ isActive }) =>
                    cn(
                      "text-sm font-medium text-espresso/80 transition-colors hover:text-clay",
                      isActive && "text-espresso",
                    )
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Center: wordmark */}
        <Link
          to="/"
          aria-label="KINARA · Inicio"
          className="font-display text-[26px] font-semibold leading-none tracking-[0.18em]"
        >
          KINARA
        </Link>

        {/* Right: utilities */}
        <div className="flex flex-1 items-center justify-end gap-5">
          <button
            className="hidden text-sm font-medium text-espresso/80 transition-colors hover:text-clay sm:block"
            aria-label="Buscar"
          >
            Buscar
          </button>
          <button
            onClick={open}
            className="group flex items-center gap-2 text-sm font-medium"
            aria-label={`Abrir bolsa, ${count} artículos`}
          >
            <span className="transition-colors group-hover:text-clay">
              Bolsa
            </span>
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-espresso px-1.5 text-[12px] font-semibold tabular-nums text-bone">
              {count}
            </span>
          </button>
        </div>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-[60] md:hidden",
        !open && "pointer-events-none",
      )}
    >
      <button
        aria-label="Cerrar menú"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-espresso/40 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "absolute left-0 top-0 flex h-full w-[80%] max-w-[320px] flex-col bg-sand p-6 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="font-display text-xl tracking-[0.18em]">KINARA</span>
          <button onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>
        <ul className="flex flex-col gap-1">
          {LINKS.map((l) => (
            <li key={l.label}>
              <Link
                to={l.to}
                onClick={onClose}
                className="block border-b border-line py-4 font-display text-2xl"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <button className="mt-8 text-left text-sm font-medium text-muted">
          Buscar
        </button>
      </div>
    </div>
  );
}

function BurgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 6h18M3 12h18M3 18h18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
