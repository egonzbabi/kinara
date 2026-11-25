import { useEffect, useState } from "react";
import { Link } from "react-router";
import { isPromoActive, PROMO } from "~/lib/promo";
import { cn } from "~/lib/cn";

const STARTS_AT = Date.parse(PROMO.startsAt);
const ENDS_AT = Date.parse(PROMO.endsAt);

function remaining(ms: number) {
  const minutes = Math.max(0, Math.floor(ms / 60_000));
  return {
    days: Math.floor(minutes / 1440),
    hours: Math.floor((minutes % 1440) / 60),
    minutes: minutes % 60,
  };
}

// Reloj compartido por la franja y la banda (tareas 148 y 154). `now` viene del
// servidor para que el HTML y la hidratación coincidan; ya montado, el reloj del
// navegador toma el relevo y se actualiza cada 30 s (sin segundos, para no
// distraer).
function usePromoCountdown(now: number) {
  const [current, setCurrent] = useState(now);
  useEffect(() => {
    setCurrent(Date.now());
    const id = setInterval(() => setCurrent(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const active = isPromoActive(current);
  return {
    active,
    // Con la página abierta al terminar la promoción, la franja y la banda se quitan solas.
    ended: current >= ENDS_AT,
    left: remaining((active ? ENDS_AT : STARTS_AT) - current),
  };
}

// Fondo luminoso de los banners de Black Friday / Cyber Monday: degradado de
// crema a champaña con brillos blancos y un haz de luz que cruza cada pocos
// segundos (`prefers-reduced-motion` lo deja quieto). Todo decorativo.
function Glow({ strong = false }: { strong?: boolean }) {
  return (
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute rounded-full bg-white blur-3xl",
          strong
            ? "-right-20 -top-24 h-[420px] w-[420px] opacity-80"
            : "-right-10 -top-20 h-48 w-48 opacity-80",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute rounded-full bg-gold/35 blur-3xl",
          strong ? "-bottom-32 -left-24 h-[320px] w-[320px]" : "-bottom-16 -left-10 h-40 w-40",
        )}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1/5 animate-shine bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      </div>
    </>
  );
}

// Destello de cuatro puntas: adorno decorativo (aria-hidden). Parpadea suave.
function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn("pointer-events-none absolute animate-twinkle fill-gold-ink/60", className)}
    >
      <path d="M12 0c.7 5.6 2.3 9.9 4.3 11.7C18.1 13.7 22.4 11.3 24 12c-5.6.7-9.9 2.3-11.7 4.3C10.3 18.1 12.7 22.4 12 24c-.7-5.6-2.3-9.9-4.3-11.7C5.9 10.3 1.6 12.7 0 12c5.6-.7 9.9-2.3 11.7-4.3C13.7 5.9 11.3 1.6 12 0Z" />
    </svg>
  );
}

// Etiqueta de precio (adorno): va junto al nombre del evento.
function TagIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Botón oscuro sobre fondo claro: lo contrario del botón terracota del Buen Fin.
const DARK_BUTTON =
  "inline-flex items-center justify-center rounded-full bg-espresso font-semibold text-bone shadow-[0_8px_20px_-8px_rgba(43,33,24,0.55)] transition-colors hover:bg-clay focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso";

const SURFACE =
  "relative overflow-hidden bg-gradient-to-br from-champagne-light via-champagne to-[#efca7c] text-espresso ring-1 ring-gold/60";

// Franja compacta arriba de la portada (tareas 148 y 154): es lo primero que se
// ve al entrar al inicio, sin tener que bajar. Sin encabezado: el h1 de la
// página es el de la portada.
export function PromoStrip({ now }: { now: number }) {
  const { active, left, ended } = usePromoCountdown(now);
  if (ended) return null;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section aria-label={`Promoción ${PROMO.fullName}`} className="pad pt-4">
      <div className={cn(SURFACE, "rounded-2xl")}>
        <Glow />
        <Sparkle className="right-[18%] top-2 h-3.5 w-3.5" />
        <Sparkle className="left-[44%] bottom-2 h-2.5 w-2.5 [animation-delay:1.1s]" />
        <Sparkle className="right-4 bottom-3 h-4 w-4 [animation-delay:2s]" />
        <div className="relative flex flex-col items-center gap-3 px-5 py-4 sm:flex-row sm:justify-between sm:gap-6 sm:px-8">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <span className="font-display text-[clamp(40px,6vw,56px)] leading-none tracking-[-0.02em]">
              {PROMO.percent}
              <span className="align-top text-[0.5em]">%</span>
            </span>
            <span>
              <span className="block text-[11px] font-bold uppercase tracking-[0.24em] text-gold-ink">
                <TagIcon className="mr-1.5 inline-block h-3.5 w-3.5 align-[-2px]" />
                {PROMO.fullName}
              </span>
              <span className="mt-0.5 block font-display text-[clamp(18px,2.2vw,24px)] leading-tight">
                de descuento en todo
                <span className="block sm:inline">
                  <span aria-hidden className="hidden sm:inline">
                    {" · "}
                  </span>
                  del {PROMO.rangeShort}
                </span>
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
            <p className="whitespace-nowrap text-sm text-espresso/85">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-ink">
                {active ? "Termina en" : "Empieza en"}
              </span>{" "}
              <span aria-hidden className="font-display text-lg tabular-nums">
                {pad(left.days)}d · {pad(left.hours)}h · {pad(left.minutes)}m
              </span>
              <span className="sr-only">
                {active
                  ? `La promoción termina el ${PROMO.endLabel} a las 11:59 de la noche.`
                  : `La promoción empieza el ${PROMO.startLabel} a las 12 de la noche.`}
              </span>
            </p>
            <Link to="/tienda" className={cn(DARK_BUTTON, "shrink-0 px-5 py-3 text-[13px]")}>
              {active ? "Comprar ahora" : "Ver colección"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Banda grande de la promoción en el inicio, bajo la portada: aparece desde el
// aviso hasta que termina.
export function PromoBand({ now }: { now: number }) {
  const { active, left, ended } = usePromoCountdown(now);
  if (ended) return null;
  const units = [
    { value: left.days, label: "Días" },
    { value: left.hours, label: "Horas" },
    { value: left.minutes, label: "Min" },
  ];

  return (
    <section aria-labelledby="promo-titulo" className="pad py-[clamp(32px,5vw,64px)]">
      <div className={cn(SURFACE, "reveal rounded-3xl")}>
        <Glow strong />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-3 rounded-[20px] border border-gold/45"
        />
        <Sparkle className="left-[7%] top-[14%] h-5 w-5" />
        <Sparkle className="left-[46%] top-[9%] h-3 w-3 [animation-delay:0.8s]" />
        <Sparkle className="right-[8%] top-[18%] h-6 w-6 [animation-delay:1.6s]" />
        <Sparkle className="bottom-[12%] left-[40%] h-4 w-4 [animation-delay:1.6s]" />
        <Sparkle className="bottom-[10%] right-[6%] h-3.5 w-3.5 [animation-delay:0.4s]" />

        <div className="relative grid items-center gap-10 px-8 py-12 sm:px-14 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div className="text-center lg:text-left">
            <span className="block text-[12px] font-bold uppercase tracking-[0.28em] text-gold-ink">
              <TagIcon className="mr-2 inline-block h-4 w-4 align-[-3px]" />
              {PROMO.fullName}
            </span>
            <h2 id="promo-titulo" className="mt-3">
              <span className="block font-display text-[clamp(104px,18vw,220px)] leading-[0.82] tracking-[-0.02em]">
                {PROMO.percent}
                <span className="align-top text-[0.5em] leading-none text-clay">%</span>
              </span>
              <span className="mt-3 block font-display text-[clamp(24px,3.2vw,40px)] leading-tight">
                de descuento en todo
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-[40ch] text-[15px] text-espresso/85 lg:mx-0">
              Del {PROMO.rangeLong}, con envíos a todo México. Sin código: el descuento se
              aplica solo.
            </p>
            <p className="mx-auto mt-3 max-w-[48ch] text-[12px] leading-relaxed text-espresso/75 lg:mx-0">
              Descuento en productos, sin incluir el costo de envío. No se suma con otras
              promociones ni con el código de bienvenida. No aplica en productos en oferta.
            </p>
          </div>

          <div className="flex flex-col items-center gap-7 lg:items-stretch">
            {/* Los dos días fuertes del evento. */}
            <ul className="grid grid-cols-2 gap-3">
              {PROMO.days.map((d) => (
                <li
                  key={d.name}
                  className="rounded-2xl border border-gold/50 bg-white/60 px-3 py-3 text-center shadow-sm backdrop-blur-sm"
                >
                  <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gold-ink">
                    {d.weekday} {d.day}
                  </span>
                  <span className="mt-1 block font-display text-[clamp(17px,2vw,22px)] leading-tight">
                    {d.name}
                  </span>
                </li>
              ))}
            </ul>

            <div>
              <p className="text-center text-[12px] font-bold uppercase tracking-[0.24em] text-gold-ink">
                {active ? "Termina en" : "Empieza en"}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3" aria-hidden>
                {units.map((u) => (
                  <div
                    key={u.label}
                    className="rounded-2xl border border-gold/50 bg-white/60 py-4 text-center shadow-sm backdrop-blur-sm"
                  >
                    <span className="block font-display text-[clamp(34px,4.6vw,52px)] leading-none tabular-nums">
                      {String(u.value).padStart(2, "0")}
                    </span>
                    <span className="mt-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-gold-ink">
                      {u.label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="sr-only">
                {active
                  ? `La promoción termina el ${PROMO.endLabel} a las 11:59 de la noche.`
                  : `La promoción empieza el ${PROMO.startLabel} a las 12 de la noche.`}
              </p>
            </div>

            <Link to="/tienda" className={cn(DARK_BUTTON, "px-7 py-4 text-[15px] lg:w-full")}>
              {active ? "Comprar ahora" : "Ver la colección"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
