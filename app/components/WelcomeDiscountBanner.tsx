import { useEffect, useState } from "react";
import { useFetcher, useLocation } from "react-router";
import { Button } from "./Button";
import { formatPrice } from "~/lib/formatPrice";
import { DISCOUNT_PERCENT, DISCOUNT_MIN_SUBTOTAL_MXN } from "~/lib/discount-constants";
import { cn } from "~/lib/cn";

type ActionData = { ok: true; emailSent: boolean } | { error: string };

export function WelcomeDiscountBanner() {
  const fetcher = useFetcher<ActionData>();
  const isSubmitting = fetcher.state === "submitting";
  const [email, setEmail] = useState("");
  const location = useLocation();

  const data = fetcher.data;
  const success = data && "ok" in data;
  const errorMessage = data && "error" in data ? data.error : null;

  useEffect(() => {
    if (success) setEmail("");
  }, [success]);

  // La barra de anuncios (todo el sitio) enlaza aquí con /#bienvenida — el
  // #hash solo no alcanza (ScrollRestoration de React Router no lo mira en
  // una carga fresca, ver tarea 068), así que el scroll se hace a mano. El
  // efecto depende de location.hash (no solo se ejecuta al montar) para que
  // también funcione si ya se está en el home y se hace clic en el mensaje.
  useEffect(() => {
    if (location.hash !== "#bienvenida") return;
    document.getElementById("bienvenida")?.scrollIntoView({ block: "center" });
  }, [location.hash]);

  return (
    <section id="bienvenida" className="pad py-[clamp(40px,6vw,72px)]">
      <div className="reveal rounded-2xl bg-espresso px-6 py-10 text-center text-bone sm:px-12 sm:py-14">
        <span className="label text-clay">Bienvenida</span>
        <h2 className="mt-3 font-display text-[clamp(24px,3.4vw,38px)] leading-tight">
          Llévate {DISCOUNT_PERCENT}% en tu primera compra
        </h2>
        <p className="mx-auto mt-3 max-w-[46ch] text-sm text-bone/70">
          Regístrate con tu correo y te mandamos tu código — válido desde{" "}
          {formatPrice(DISCOUNT_MIN_SUBTOTAL_MXN)} en productos, sin contar el envío.
        </p>

        {success ? (
          <p className="mx-auto mt-7 max-w-[40ch] text-sm font-medium text-bone">
            {data && "emailSent" in data && data.emailSent
              ? "Listo — revisa tu correo, ahí te mandamos tu código. Cuando pagues, ingrésalo en el checkout para aplicar tu descuento."
              : "Listo — ya quedó tu código registrado. Úsalo en el checkout al momento de pagar para aplicar tu descuento."}
          </p>
        ) : (
          <fetcher.Form
            method="post"
            action="/api/newsletter-signup"
            className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              // fetcher.Form manda application/x-www-form-urlencoded; la acción
              // espera JSON — se intercepta y se manda el JSON a mano.
              e.preventDefault();
              fetcher.submit(
                { email },
                { method: "post", action: "/api/newsletter-signup", encType: "application/json" },
              );
            }}
          >
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className={cn(
                "w-full rounded-lg border border-bone/25 bg-bone/10 px-4 py-2.5 text-sm text-bone",
                "placeholder:text-bone/50 focus:border-clay focus:outline-none",
              )}
            />
            <Button type="submit" variant="clay" disabled={isSubmitting} className="whitespace-nowrap">
              {isSubmitting ? "Enviando…" : "Quiero mi código"}
            </Button>
          </fetcher.Form>
        )}

        {errorMessage && (
          <p className="mx-auto mt-3 max-w-[40ch] text-sm font-medium text-clay">{errorMessage}</p>
        )}
      </div>
    </section>
  );
}
