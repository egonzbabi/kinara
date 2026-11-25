import { useEffect, useState } from "react";
import { Link } from "react-router";
import { isPromoActive, PROMO } from "~/lib/promo";

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

// Reloj compartido por la franja y la banda (tarea 148). `now` viene del
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

// Franja compacta arriba de la portada (tarea 148): es lo primero que se ve al
// entrar al inicio, sin tener que bajar. Sin encabezado: el h1 de la página es
// el de la portada.
export function BuenFinStrip({ now }: { now: number }) {
  const { active, left, ended } = usePromoCountdown(now);
  if (ended) return null;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section aria-label={`Promoción ${PROMO.name}`} className="pad pt-4">
      <div className="relative overflow-hidden rounded-2xl bg-espresso text-bone ring-1 ring-clay/60">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 h-52 w-52 rounded-full bg-clay/40 blur-3xl"
        />
        <div className="relative flex flex-col items-center gap-3 px-5 py-4 sm:flex-row sm:justify-between sm:gap-6 sm:px-8">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <span className="font-display text-[clamp(40px,6vw,56px)] leading-none tracking-[-0.02em]">
              {PROMO.percent}
              <span className="align-top text-[0.5em]">%</span>
            </span>
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.28em] text-sand">
                {PROMO.name} Kinara
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

          <div className="flex items-center gap-4">
            <p className="text-sm text-bone/85">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sand">
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
            <Link to="/tienda" className="btn btn-clay shrink-0 px-5 py-3 text-[13px]">
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
export function BuenFinBand({ now }: { now: number }) {
  const { active, left, ended } = usePromoCountdown(now);
  if (ended) return null;
  const units = [
    { value: left.days, label: "Días" },
    { value: left.hours, label: "Horas" },
    { value: left.minutes, label: "Min" },
  ];

  return (
    <section aria-labelledby="buen-fin-titulo" className="pad py-[clamp(32px,5vw,64px)]">
      <div className="reveal relative overflow-hidden rounded-3xl bg-espresso text-bone ring-1 ring-clay/60">
        {/* Resplandor terracota y filete interior: dan profundidad y aire de
            "tarjeta de regalo" sin salirse de la paleta. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-28 -top-28 h-[440px] w-[440px] rounded-full bg-clay/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-3 rounded-[20px] border border-bone/15"
        />

        <div className="relative grid items-center gap-10 px-8 py-12 sm:px-14 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div className="text-center lg:text-left">
            <span className="text-[12px] font-semibold uppercase tracking-[0.32em] text-sand">
              {PROMO.name} Kinara
            </span>
            <h2 id="buen-fin-titulo" className="mt-3">
              <span className="block font-display text-[clamp(104px,18vw,220px)] leading-[0.82] tracking-[-0.02em]">
                {PROMO.percent}
                <span className="align-top text-[0.5em] leading-none">%</span>
              </span>
              <span className="mt-3 block font-display text-[clamp(24px,3.2vw,40px)] leading-tight">
                de descuento en todo
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-[40ch] text-[15px] text-bone/80 lg:mx-0">
              Del {PROMO.rangeLong}, con envíos a todo México. Sin código: el descuento se
              aplica solo.
            </p>
            <p className="mx-auto mt-3 max-w-[48ch] text-[12px] leading-relaxed text-bone/65 lg:mx-0">
              Descuento en productos, sin incluir el costo de envío. No se suma con otras
              promociones ni con el código de bienvenida. No aplica en productos en oferta.
            </p>
          </div>

          <div className="flex flex-col items-center gap-7 lg:items-stretch">
            <div>
              <p className="text-center text-[12px] font-semibold uppercase tracking-[0.24em] text-sand">
                {active ? "Termina en" : "Empieza en"}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3" aria-hidden>
                {units.map((u) => (
                  <div
                    key={u.label}
                    className="rounded-2xl border border-bone/20 bg-bone/[0.06] py-4 text-center"
                  >
                    <span className="block font-display text-[clamp(34px,4.6vw,52px)] leading-none tabular-nums">
                      {String(u.value).padStart(2, "0")}
                    </span>
                    <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-sand">
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

            <Link to="/tienda" className="btn btn-clay px-7 py-4 text-[15px] lg:w-full">
              {active ? "Comprar ahora" : "Ver la colección"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
