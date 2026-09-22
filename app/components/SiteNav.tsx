import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { useCart } from "~/context/CartContext";
import { useFocusTrap } from "~/hooks/useFocusTrap";
import { cn } from "~/lib/cn";
import type { NavLinkItem } from "~/lib/nav-links";

export function SiteNav({ links }: { links: NavLinkItem[] }) {
  const { count, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isProductDetail = location.pathname.startsWith("/producto/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 bg-sand/85 backdrop-blur-md transition-shadow",
          scrolled ? "shadow-[0_1px_0_var(--color-line)]" : "",
        )}
      >
        <div className="pad flex items-center justify-between gap-4 py-3">
          {/* Left: back button / mobile burger */}
          <div className="flex flex-1 items-center gap-4">
            {isProductDetail && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Volver"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-espresso/80 transition-colors hover:text-clay"
              >
                <BackIcon />
                <span className="hidden sm:inline">Volver</span>
              </button>
            )}
            <button
              className="md:hidden"
              aria-label="Abrir menú"
              onClick={() => setMenuOpen(true)}
            >
              <BurgerIcon />
            </button>
          </div>

          {/* Center: wordmark + slogan, siempre visibles (header sticky) */}
          <div className="flex flex-col items-center">
            <Link
              to="/"
              aria-label="KINARA · Inicio"
              className="font-display text-[40px] font-semibold leading-none tracking-[0.18em]"
            >
              KINARA
            </Link>
            <p className="mt-2 whitespace-nowrap font-display text-[clamp(12px,2.8vw,15px)] italic leading-none tracking-[0.02em] text-muted">
              Hecha para moverte. <span className="text-clay">Creada para brillar.</span>
            </p>
          </div>

          {/* Right: utilities */}
          <div className="flex flex-1 items-center justify-end gap-5">
            <Link
              to="/contacto"
              className="hidden text-sm font-medium text-espresso/80 transition-colors hover:text-clay sm:block"
            >
              Contacto
            </Link>
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden text-sm font-medium text-espresso/80 transition-colors hover:text-clay sm:block"
            >
              Buscar
            </button>
            <button
              onClick={open}
              className="group flex items-center gap-2 text-sm font-medium"
            >
              <span className="transition-colors group-hover:text-clay">
                Carrito
              </span>
              <span className="grid h-6 min-w-6 place-items-center rounded-full bg-espresso px-1.5 text-[12px] font-semibold tabular-nums text-bone">
                {count}
              </span>
              {/* Sin aria-label: uno que reemplaza todo el nombre accesible
                  ("Abrir carrito de compras...") no contenía el texto visible
                  ("Carrito"), lo que Lighthouse marca como
                  label-content-name-mismatch (WCAG 2.5.3, rompe el control
                  por voz). En vez de eso, se deja que el nombre accesible se
                  arme del contenido visible + este texto oculto que agrega
                  el plural correcto. */}
              <span className="sr-only">
                , {count === 1 ? "1 artículo" : `${count} artículos`}
              </span>
            </button>
          </div>
        </div>

        {/* Second row: main navigation, its own line below the wordmark */}
        <nav
          aria-label="Navegación principal"
          className="hidden border-t border-line/60 md:block"
        >
          <ul className="pad flex h-12 items-center justify-center gap-7">
            {links.map((l) => (
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
        </nav>
      </header>

      {/* Fuera del <header>: si viviera adentro, el backdrop-blur-md del header
          crea un containing block nuevo para descendientes position:fixed (regla
          CSS de backdrop-filter/transform/filter), y el panel quedaba mal
          posicionado/recortado en vez de cubrir el viewport completo. */}
      <MobileMenu
        open={menuOpen}
        links={links}
        onClose={() => setMenuOpen(false)}
        onSearch={() => {
          setMenuOpen(false);
          setSearchOpen(true);
        }}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  useFocusTrap(open, panelRef, onClose);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? "";
    navigate(q ? `/tienda?q=${encodeURIComponent(q)}` : "/tienda");
    onClose();
  };

  return (
    <div
      inert={!open}
      className={cn(
        "fixed inset-0 z-[70]",
        !open && "pointer-events-none",
      )}
    >
      <button
        aria-label="Cerrar búsqueda"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-espresso/40 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Buscar productos"
        className={cn(
          "pad absolute left-0 right-0 top-0 pt-24 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0",
        )}
      >
        <form
          onSubmit={onSubmit}
          className="mx-auto flex w-full max-w-xl items-center gap-3 rounded-2xl bg-sand p-3 shadow-2xl"
        >
          <SearchIcon />
          <input
            ref={inputRef}
            type="search"
            placeholder="Buscar productos…"
            aria-label="Buscar productos"
            className="flex-1 bg-transparent py-1.5 text-base outline-none placeholder:text-muted"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors hover:bg-bone"
          >
            <CloseIcon />
          </button>
        </form>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0 text-muted"
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M21 21l-4.35-4.35"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MobileMenu({
  open,
  links,
  onClose,
  onSearch,
}: {
  open: boolean;
  links: NavLinkItem[];
  onClose: () => void;
  onSearch: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, panelRef, onClose);

  return (
    <div
      // `inert` (no `aria-hidden`) cuando está cerrado: aria-hidden por sí solo
      // dejaba los links/botones de adentro todavía enfocables con Tab —
      // contradicción de accesibilidad (un elemento aria-hidden no puede tener
      // descendientes enfocables). `inert` además los saca del orden de
      // tabulación, que es lo que realmente hacía falta (tarea 102).
      inert={!open}
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
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
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
          {links.map((l) => (
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
        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/contacto"
            onClick={onClose}
            className="text-left text-sm font-medium text-muted"
          >
            Contacto
          </Link>
          <button
            onClick={onSearch}
            className="text-left text-sm font-medium text-muted"
          >
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M19 12H5M5 12l6-6M5 12l6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
