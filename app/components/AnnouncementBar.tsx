const MESSAGES = [
  "Envío calculado al finalizar la compra",
  "Nueva colección SS26",
  "No aceptamos devoluciones",
  "Tejidos cómodos · Hecho con cuidado",
];

export function AnnouncementBar() {
  // Duplicated track for a seamless marquee (paused under prefers-reduced-motion).
  const track = [...MESSAGES, ...MESSAGES, ...MESSAGES, ...MESSAGES];
  return (
    <div className="bg-espresso text-bone">
      <div className="flex overflow-hidden whitespace-nowrap py-2.5">
        <div className="flex shrink-0 animate-marquee items-center">
          {track.map((m, i) => (
            <span
              key={i}
              className="flex items-center text-[11px] font-medium uppercase tracking-[0.16em]"
            >
              {m}
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
