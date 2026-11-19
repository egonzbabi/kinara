import { useEffect } from "react";
import { useLocation } from "react-router";
import { saveCodeFromSearch } from "~/lib/promo-code-storage";

/** No pinta nada: guarda el `?codigo=` del enlace/QR de una promotora (tarea
 * 150) para que /checkout lo traiga ya escrito. */
export function PromoCodeCapture() {
  const { search } = useLocation();
  useEffect(() => {
    saveCodeFromSearch(search);
  }, [search]);
  return null;
}
