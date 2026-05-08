import { useEffect, useRef, useState } from "react";
import { useHasHover } from "~/hooks/useHasHover";

export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const hasHover = useHasHover();
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !hasHover) return;
    const cursor = cursorRef.current;
    if (!cursor) return;

    document.body.classList.add("no-cursor");

    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;

    let lastDarkTarget: Element | null = null;
    const setDark = (dark: boolean) => {
      document.body.classList.toggle("cursor-on-dark", dark);
    };

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      cursor.style.opacity = "1";

      const target = e.target as Element | null;
      if (target && target !== lastDarkTarget) {
        lastDarkTarget = target;
        const onDark =
          !!target.closest('[data-cursor="dark"]') ||
          document.body.classList.contains("theme-dark");
        setDark(onDark);
      }
    };
    const onLeave = () => {
      cursor.style.opacity = "0";
      setDark(false);
    };
    const tick = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const productEls = document.querySelectorAll<HTMLElement>("[data-product]");
    const onEnter = () => cursor.classList.add("is-on-product");
    const onProdLeave = () => cursor.classList.remove("is-on-product");
    productEls.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onProdLeave);
    });

    // expose toggle so TweaksPanel can flip cursor on/off
    (window as unknown as { __setCursor?: (on: boolean) => void }).__setCursor = (on) => {
      if (!on) {
        cursor.style.display = "none";
        document.body.classList.remove("no-cursor");
      } else {
        cursor.style.display = "";
        document.body.classList.add("no-cursor");
      }
    };

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      productEls.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onProdLeave);
      });
      document.body.classList.remove("no-cursor");
      document.body.classList.remove("cursor-on-dark");
      delete (window as unknown as { __setCursor?: (on: boolean) => void }).__setCursor;
    };
  }, [mounted, hasHover]);

  if (!mounted || !hasHover) return null;
  return <div ref={cursorRef} className="cursor" />;
}
