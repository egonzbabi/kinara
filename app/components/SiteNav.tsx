import { useEffect, useRef } from "react";
import { useCart } from "~/context/CartContext";

const NAV_ITEMS_LEFT = [
  { label: "Mujer", href: "#mujer" },
  { label: "Hombre", href: "#hombre" },
  { label: "Colecciones", href: "#colecciones" },
  { label: "Lookbook", href: "#lookbook" },
];

const NAV_ITEMS_RIGHT = [
  { label: "Buscar", href: "#search" },
  { label: "Cuenta", href: "#account" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="relative inline-block py-1.5 transition-opacity duration-200 ease-[var(--ease-solar)] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-solar after:transition-transform after:duration-300 after:ease-[var(--ease-solar)] after:content-[''] hover:after:scale-x-100"
    >
      {label}
    </a>
  );
}

export function SiteNav() {
  const { count } = useCart();
  const countRef = useRef<HTMLElement>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const el = countRef.current;
    if (!el) return;
    el.animate(
      [
        { transform: "scale(1)", color: "var(--color-ink)" },
        { transform: "scale(1.5)", color: "#FF5B1F" },
        { transform: "scale(1)", color: "var(--color-ink)" },
      ],
      { duration: 600, easing: "cubic-bezier(.16,1,.3,1)" },
    );
  }, [count]);

  return (
    <nav className="nav sticky top-0 z-40 border-b border-line bg-bone/85 backdrop-blur-[14px] backdrop-saturate-[1.2]">
      <div className="nav-inner grid h-16 grid-cols-[1fr_auto_1fr] items-center px-[clamp(16px,3vw,40px)] max-[980px]:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-[22px] font-mono text-[12px] uppercase tracking-[.18em] max-[980px]:hidden">
          {NAV_ITEMS_LEFT.map((it) => (
            <NavLink key={it.href} {...it} />
          ))}
        </div>
        <a
          href="#"
          aria-label="Kinara"
          className="logo px-3 py-1.5 text-[22px] font-black leading-none tracking-[.32em] text-ink"
        >
          KINARA
        </a>
        <div className="flex items-center justify-end gap-[22px] font-mono text-[12px] uppercase tracking-[.18em]">
          {NAV_ITEMS_RIGHT.map((it) => (
            <NavLink key={it.href} {...it} />
          ))}
          <a
            href="#cart"
            className="cart-pill inline-flex items-center gap-2 rounded-full border border-ink px-3 py-2 font-mono text-[11px] uppercase tracking-[.18em] transition-colors duration-200 ease-[var(--ease-solar)] hover:bg-ink hover:text-bone"
          >
            <span
              className="block size-1.5 rounded-full bg-solar"
              style={{ boxShadow: "0 0 0 4px rgb(255 91 31 / 0.18)" }}
              aria-hidden
            />
            Bolsa · <b ref={countRef} className="inline-block">{count}</b>
          </a>
        </div>
      </div>
    </nav>
  );
}
