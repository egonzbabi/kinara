import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  /** Stable line key: product + color + size */
  key: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  qty: number;
};

export type AddPayload = Omit<CartItem, "key" | "qty"> & { qty?: number };

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  /** false hasta que se termine de leer localStorage al montar. */
  hydrated: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (payload: AddPayload) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

const lineKey = (p: { productId: string; color: string; size: string }) =>
  `${p.productId}::${p.color}::${p.size}`;

// El carrito sale de la página por completo al ir a la Checkout Session
// hospedada de Stripe (no es un popup/iframe) — sin esto, React se destruye
// y el carrito vuelve vacío al regresar, sea cual sea el resultado del pago.
const CART_STORAGE_KEY = "kinara-cart";

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStoredCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Modo privado, cuota agotada, etc. — el carrito sigue funcionando en memoria.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Se hidrata una sola vez al montar (después del render inicial, para no
  // desajustar el HTML de SSR). Cada mutación de abajo ya escribe a
  // localStorage de forma síncrona, así que esto no compite con, por ejemplo,
  // el clear() de /checkout/success al volver de Stripe.
  // `hydrated` deja saber a componentes hijos (ej. /checkout) que todavía no se
  // debe decidir nada basado en `items` — sus propios efectos de montaje corren
  // antes que este (React ejecuta hijos antes que padres al montar).
  useEffect(() => {
    const stored = readStoredCart();
    if (stored.length > 0) setItems(stored);
    setHydrated(true);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const add = useCallback((payload: AddPayload) => {
    const key = lineKey(payload);
    const qty = payload.qty ?? 1;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      const next = existing
        ? prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i))
        : [...prev, { ...payload, key, qty }];
      writeStoredCart(next);
      return next;
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.key !== key);
      writeStoredCart(next);
      return next;
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) => {
      const next =
        qty <= 0
          ? prev.filter((i) => i.key !== key)
          : prev.map((i) => (i.key === key ? { ...i, qty } : i));
      writeStoredCart(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    writeStoredCart([]);
  }, []);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
    return { items, count, subtotal, hydrated, isOpen, open, close, add, remove, setQty, clear };
  }, [items, hydrated, isOpen, open, close, add, remove, setQty, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const value = useContext(Ctx);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}

/** Free-shipping threshold in EUR. */
export const FREE_SHIPPING_THRESHOLD = 60;
