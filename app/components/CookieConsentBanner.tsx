import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "./Button";
import { getStoredConsent, setStoredConsent } from "~/lib/analytics";

/**
 * Banner de cookies (tarea 004, GA4) — se muestra solo cuando el visitante
 * todavía no eligió (no hay nada en `localStorage`). Aceptar/rechazar
 * actualiza el Consent Mode de GA4 en el momento (`gtag('consent','update')`,
 * ver app/lib/analytics.ts) y persiste la elección para no volver a
 * preguntar. Sin elección — antes de que se muestre o mientras está
 * visible sin responder — no se manda ningún hit con datos reales
 * (`analytics_storage` arranca "denied" por el script inline en root.tsx).
 */
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getStoredConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const respond = (value: "granted" | "denied") => {
    setStoredConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[200] pad pb-[max(16px,env(safe-area-inset-bottom))] pt-4"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl bg-espresso px-6 py-5 text-bone shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-bone/80">
          Usamos cookies para entender cómo se usa el sitio y mejorar tu experiencia. Puedes
          leer más en nuestro{" "}
          <Link to="/aviso-de-privacidad" className="underline hover:text-clay">
            Aviso de Privacidad
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2.5">
          <button
            type="button"
            onClick={() => respond("denied")}
            className="rounded-full border border-bone/30 px-5 py-2.5 text-sm font-medium text-bone transition-colors hover:bg-bone/10"
          >
            Rechazar
          </button>
          <Button variant="clay" size="sm" onClick={() => respond("granted")}>
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
}
