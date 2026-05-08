import type { ReactNode } from "react";

type Item = ReactNode;

type Props = {
  items: ReadonlyArray<Item>;
  /** seconds for one full pass (track is duped, so visual loop = full pass) */
  durationSec?: number;
  variant?: "ink" | "solar";
  size?: "sm" | "lg";
};

export function Ticker({
  items,
  durationSec = 28,
  variant = "ink",
  size = "sm",
}: Props) {
  const palette =
    variant === "solar"
      ? "bg-solar text-ink border-y border-ink"
      : "ticker-bar bg-ink text-bone";
  const heightCls = size === "sm" ? "h-[34px]" : "h-auto py-[18px]";
  const trackTextCls =
    size === "sm"
      ? "font-mono text-[11px] uppercase tracking-[.22em]"
      : "font-sans font-black text-[clamp(28px,5vw,64px)] tracking-[-0.02em]";

  // duplicate items inline so the -50% translate loops seamlessly
  const doubled = [...items, ...items];

  return (
    <div
      data-cursor={variant === "ink" ? "dark" : undefined}
      className={`relative z-[5] flex items-center overflow-hidden ${heightCls} ${palette}`}
      aria-hidden
    >
      <div
        className="flex shrink-0 gap-12 whitespace-nowrap pl-12 will-change-transform"
        style={{ animation: `tick ${durationSec}s linear infinite` }}
      >
        {doubled.map((item, i) => (
          <span key={i} className={trackTextCls}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
