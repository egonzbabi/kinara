import { Link } from "react-router";
import { isPromoActive, isPromoAnnounced, PROMO } from "~/lib/promo";

type Message = { text: string; to?: string };

const WELCOME_MESSAGE: Message = {
  text: "10% de descuento en tu primera compra — regístrate",
  to: "/#bienvenida",
};

// Promoción de temporada (tarea 148). Durante la promo el 10% de bienvenida no
// se acepta, así que su mensaje se oculta para no prometer algo que no aplica.
const PROMO_MESSAGE: Message = {
  text: `${PROMO.name}: ${PROMO.percent}% de descuento en todo del ${PROMO.rangeLong}`,
  to: "/tienda",
};

const OTHER_MESSAGES: Message[] = [
  { text: "Envío calculado al finalizar la compra" },
  { text: "Política de cambios y devoluciones", to: "/politica-de-cambios-y-devoluciones" },
  { text: "Tejidos cómodos · Hecho con cuidado" },
];

export function AnnouncementBar({ now }: { now: number }) {
  const messages = isPromoAnnounced(now)
    ? [PROMO_MESSAGE, ...(isPromoActive(now) ? [] : [WELCOME_MESSAGE]), ...OTHER_MESSAGES]
    : [WELCOME_MESSAGE, ...OTHER_MESSAGES];
  // Duplicated track for a seamless marquee (paused under prefers-reduced-motion).
  const track = [...messages, ...messages, ...messages, ...messages];
  return (
    <div className="bg-espresso text-bone">
      <div className="flex overflow-hidden whitespace-nowrap py-2.5">
        <div className="flex shrink-0 animate-marquee items-center">
          {track.map((m, i) => (
            <span
              key={i}
              className="flex items-center text-[11px] font-medium uppercase tracking-[0.16em]"
            >
              {m.to ? (
                <Link to={m.to} className="hover:text-clay hover:underline">
                  {m.text}
                </Link>
              ) : (
                m.text
              )}
              <span aria-hidden className="px-6 text-clay">
                ✳
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
