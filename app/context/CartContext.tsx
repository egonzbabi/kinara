import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type CartCtx = {
  count: number;
  bump: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({
  initialCount = 2,
  children,
}: {
  initialCount?: number;
  children: ReactNode;
}) {
  const [count, setCount] = useState(initialCount);
  const bump = useCallback(() => setCount((c) => c + 1), []);
  return <Ctx.Provider value={{ count, bump }}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const value = useContext(Ctx);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
