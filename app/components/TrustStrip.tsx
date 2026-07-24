import type { ReactNode } from "react";

const ITEMS: { icon: ReactNode; title: string; copy: string }[] = [
  {
    icon: <TruckIcon />,
    title: "Envío calculado",
    copy: "Al finalizar la compra",
  },
  {
    icon: <ReturnIcon />,
    title: "Sin devoluciones",
    copy: "No aceptamos devoluciones",
  },
  {
    icon: <LeafIcon />,
    title: "Tejidos cómodos",
    copy: "Hecho con cuidado",
  },
  {
    icon: <LockIcon />,
    title: "Pago seguro",
    copy: "Cifrado en cada compra",
  },
];

export function TrustStrip() {
  return (
    <section className="pad border-y border-line">
      <ul className="grid grid-cols-2 gap-x-6 gap-y-7 py-7 md:grid-cols-4">
        {ITEMS.map((it) => (
          <li key={it.title} className="flex items-center gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-bone text-clay">
              {it.icon}
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">{it.title}</p>
              <p className="text-[13px] text-muted">{it.copy}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TruckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 7h11v8H3zM14 10h4l3 3v2h-7zM7.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ReturnIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 9a8 8 0 0113.6-3.6L20 8M20 4v4h-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 15a8 8 0 01-13.6 3.6L4 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function LeafIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 19c0-8 6-13 14-13 0 8-5 14-13 14a6 6 0 01-1-1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 15c2-3 5-5 8-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 10V8a4 4 0 018 0v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
