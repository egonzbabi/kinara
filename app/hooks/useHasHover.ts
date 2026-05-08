import { useEffect, useState } from "react";

export function useHasHover(): boolean {
  const [hasHover, setHasHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover)");
    setHasHover(mq.matches);
    const handler = (e: MediaQueryListEvent) => setHasHover(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return hasHover;
}
