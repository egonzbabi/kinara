import type { Silhouette } from "~/data/products";

const baseProps = {
  viewBox: "0 0 200 240",
  "aria-hidden": true,
  className:
    "silhouette relative w-[65%] h-[80%] [filter:drop-shadow(0_30px_30px_rgb(0_0_0_/_0.15))]",
} as const;

export function ShellJacketSvg() {
  return (
    <svg {...baseProps}>
      <path
        fill="#0A0A0A"
        d="M40 50 L70 30 L100 38 L130 30 L160 50 L170 100 L150 110 L150 210 L50 210 L50 110 L30 100 Z"
      />
      <path
        fill="#1a1a1a"
        d="M50 110 L50 210 L80 210 L80 130 Z"
        opacity=".5"
      />
      <circle cx="100" cy="80" r="2.4" fill="#F2EFE8" />
    </svg>
  );
}

export function LeggingSvg() {
  return (
    <svg {...baseProps}>
      <path
        fill="#F2EFE8"
        d="M70 30 H130 L138 90 L120 230 L106 230 L100 110 L94 230 L80 230 L62 90 Z"
      />
      <rect x="76" y="50" width="48" height="3" fill="#0A0A0A" opacity=".15" />
    </svg>
  );
}

export function CropTopSvg() {
  return (
    <svg {...baseProps}>
      <path
        fill="#FF5B1F"
        d="M55 60 L75 38 L100 46 L125 38 L145 60 L138 130 L62 130 Z"
      />
      <path fill="#0A0A0A" opacity=".15" d="M62 122 L138 122 L138 130 L62 130 Z" />
      <circle cx="100" cy="68" r="2.4" fill="#F2EFE8" />
    </svg>
  );
}

export function RunnerSvg() {
  return (
    <svg {...baseProps}>
      <path
        fill="#F2EFE8"
        d="M30 150 Q50 110 100 110 Q150 110 175 140 Q190 160 175 180 L40 180 Q24 168 30 150 Z"
      />
      <path
        fill="#FF5B1F"
        d="M100 110 Q150 110 175 140 L160 145 Q140 122 100 122 Z"
      />
      <path fill="#0A0A0A" opacity=".4" d="M40 180 L175 180 L175 190 L40 190 Z" />
    </svg>
  );
}

export function TeeSvg() {
  return (
    <svg {...baseProps}>
      <path
        fill="#0A0A0A"
        d="M50 60 L78 38 L100 46 L122 38 L150 60 L142 90 L122 84 L122 200 L78 200 L78 84 L58 90 Z"
      />
      <text
        x="100"
        y="140"
        textAnchor="middle"
        fill="#FF5B1F"
        fontFamily="Helvetica"
        fontWeight="900"
        fontSize="22"
        letterSpacing="2"
      >
        KIN
      </text>
    </svg>
  );
}

export function ShortsSvg() {
  return (
    <svg {...baseProps}>
      <path
        fill="#0A0A0A"
        d="M62 60 H138 L142 130 L122 200 L106 200 L100 130 L94 200 L78 200 L58 130 Z"
      />
      <path fill="#FF5B1F" d="M62 60 H138 L138 70 L62 70 Z" />
    </svg>
  );
}

const MAP: Record<Silhouette, () => React.ReactElement> = {
  shellJacket: ShellJacketSvg,
  legging: LeggingSvg,
  cropTop: CropTopSvg,
  runner: RunnerSvg,
  tee: TeeSvg,
  shorts: ShortsSvg,
};

export function SilhouetteFor({ id }: { id: Silhouette }) {
  const C = MAP[id];
  return <C />;
}
