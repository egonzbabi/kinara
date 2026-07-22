import { useEffect } from "react";
import { Link } from "react-router";
import {
  FREE_SHIPPING_THRESHOLD,
  useCart,
  type CartItem,
} from "~/context/CartContext";
import { formatPrice } from "~/lib/formatPrice";
import { productImage } from "~/lib/productImage";
import { Button, LinkButton } from "./Button";
import { cn } from "~/lib/cn";

export function CartDrawer() {
  const { items, subtotal, count, isOpen, close, remove, setQty } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div
      aria-hidden={!isOpen}
      className={cn("fixed inset-0 z-[100]", !isOpen && "pointer-events-none")}
    >
      {/* Backdrop */}
      <button
        aria-label="Cerrar carrito de compras"
        onClick={close}
        className={cn(
          "absolute inset-0 bg-espresso/40 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Tu carrito de compras"
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-sand shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-2xl">
            Tu carrito de compras{" "}
            <span className="text-muted">({count})</span>
          </h2>
          <button
            onClick={close}
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-bone"
          >
            <CloseIcon />
          </button>
        </header>

        {/* Free shipping meter */}
        {items.length > 0 && (
          <div className="border-b border-line px-6 py-4">
            <p className="mb-2 text-[13px] text-muted">
              {remaining > 0 ? (
                <>
                  Te faltan{" "}
                  <span className="font-semibold text-espresso">
                    {formatPrice(remaining)}
                  </span>{" "}
                  para el envío gratis
                </>
              ) : (
                <span className="font-semibold text-sage">
                  ¡Envío gratis conseguido! 🌿
                </span>
              )}
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-bone">
              <div
                className="h-full rounded-full bg-clay transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="font-display text-2xl">Tu carrito de compras está vacío</p>
              <p className="max-w-[24ch] text-sm text-muted">
                Aún no has añadido nada. Descubre la nueva colección.
              </p>
              <Button variant="ink" onClick={close} className="mt-2">
                Seguir comprando
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <CartLine
                  key={item.key}
                  item={item}
                  onRemove={() => remove(item.key)}
                  onDec={() => setQty(item.key, item.qty - 1)}
                  onInc={() => setQty(item.key, item.qty + 1)}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <footer className="border-t border-line px-6 py-5">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="font-display text-2xl">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="mb-4 text-[12px] text-muted">
              Impuestos incluidos. Envío calculado al pagar.
            </p>
            <LinkButton to="/checkout" variant="clay" full size="lg" onClick={close}>
              Finalizar compra
            </LinkButton>
            <button
              onClick={close}
              className="mt-3 w-full text-center text-[13px] text-muted underline-offset-4 hover:underline"
            >
              Seguir comprando
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}

function CartLine({
  item,
  onRemove,
  onDec,
  onInc,
}: {
  item: CartItem;
  onRemove: () => void;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <li className="flex gap-4 py-5">
      <Link
        to={`/producto/${item.slug}`}
        className="h-28 w-22 shrink-0 overflow-hidden rounded-lg bg-bone"
      >
        <img
          src={productImage(item.image, { width: 160, height: 200 })}
          alt={item.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/producto/${item.slug}`}
            className="font-medium leading-tight hover:text-clay"
          >
            {item.name}
          </Link>
          <span className="whitespace-nowrap font-medium">
            {formatPrice(item.price * item.qty)}
          </span>
        </div>
        <p className="mt-1 text-[13px] text-muted">
          {item.color} · Talla {item.size}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center rounded-full border border-line">
            <Stepper label="Quitar uno" onClick={onDec}>
              −
            </Stepper>
            <span className="w-7 text-center text-sm tabular-nums">
              {item.qty}
            </span>
            <Stepper label="Añadir uno" onClick={onInc}>
              +
            </Stepper>
          </div>
          <button
            onClick={onRemove}
            className="text-[13px] text-muted underline-offset-4 hover:text-clay hover:underline"
          >
            Eliminar
          </button>
        </div>
      </div>
    </li>
  );
}

function Stepper({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center text-base leading-none transition-colors hover:text-clay"
    >
      {children}
    </button>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
