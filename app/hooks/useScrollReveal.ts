import { useEffect } from "react";

export function useScrollReveal(threshold = 0.14) {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [threshold]);
}
