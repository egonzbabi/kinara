import { useState, type FormEvent } from "react";
import { Button } from "./Button";

export function Newsletter() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="pad py-[clamp(56px,8vw,120px)]">
      <div className="reveal mx-auto flex max-w-3xl flex-col items-center rounded-3xl bg-espresso px-6 py-[clamp(40px,6vw,72px)] text-center text-bone">
        <span className="label text-bone/60">Comunidad KINARA</span>
        <h2 className="mt-3 font-display text-[clamp(28px,4.5vw,46px)] leading-[1.05]">
          Movimiento, calma y novedades.
        </h2>
        <p className="mt-3 max-w-[44ch] text-bone/70">
          Suscríbete y recibe un 10 % en tu primer pedido, además de acceso
          anticipado a cada colección.
        </p>
        {submitted ? (
          <p className="mt-7 font-medium text-sage">
            ¡Gracias! Revisa tu correo para confirmar. 🌿
          </p>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-7 flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              aria-label="Tu correo electrónico"
              className="flex-1 rounded-full bg-bone/10 px-5 py-3.5 text-bone placeholder:text-bone/40 outline-none ring-1 ring-inset ring-bone/20 focus:ring-clay"
            />
            <Button type="submit" variant="clay">
              Suscribirme
            </Button>
          </form>
        )}
        <p className="mt-4 text-[12px] text-bone/40">
          Sin spam. Cancela cuando quieras.
        </p>
      </div>
    </section>
  );
}
