import { useState, type FormEvent } from "react";

const COLS = [
  {
    title: "Tienda",
    items: ["Mujer", "Hombre", "Calzado", "Accesorios", "Drops anteriores"],
  },
  {
    title: "Servicio",
    items: ["Envíos", "Devoluciones", "Tallas", "Cuidado", "Contacto"],
  },
  {
    title: "Mundo Kinara",
    items: [
      "Sobre nosotras",
      "Atelier Porto",
      "Sostenibilidad",
      "Instagram",
      "TikTok",
    ],
  },
];

export function SiteFooter() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail("");
  };

  return (
    <footer className="foot pad bg-bone py-[clamp(48px,5vw,80px)]">
      <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr] gap-8 border-b border-line pb-10 max-[980px]:grid-cols-1">
        <div>
          <h4 className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[.2em] opacity-70">
            Newsletter solar
          </h4>
          <p className="max-w-[38ch] text-[14px] opacity-80">
            Avisos de drop, una pieza por mes. Sin promociones, sin ruido.
          </p>
          <form
            onSubmit={onSubmit}
            className="news mt-3.5 flex max-w-[360px] overflow-hidden rounded-full border border-ink"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@brilla.com"
              className="flex-1 bg-transparent px-4 py-3 font-mono text-[12px] tracking-[.06em] outline-none"
            />
            <button
              type="submit"
              className="bg-ink px-[18px] font-mono text-[11px] uppercase tracking-[.2em] text-bone transition-colors hover:bg-solar hover:text-ink"
            >
              {submitted ? "✓ Apuntad@" : "Apuntarme"}
            </button>
          </form>
        </div>
        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[.2em] opacity-70">
              {col.title}
            </h4>
            <ul className="flex list-none flex-col gap-1.5">
              {col.items.map((it) => (
                <li key={it}>
                  <a
                    href="#"
                    className="text-[14px] transition-colors hover:text-solar"
                  >
                    {it}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex items-end justify-between gap-6 pt-8">
        <div className="text-[clamp(72px,14vw,220px)] font-black leading-[0.85] tracking-[-0.04em]">
          KINARA
        </div>
        <div className="text-right font-mono text-[11px] uppercase tracking-[.18em] opacity-65">
          © KINARA 2026 · BRILLA CON FUERZA
          <br />
          Made in Porto · Designed for the sun
        </div>
      </div>
    </footer>
  );
}
