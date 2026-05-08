type Props = { fill: string };

/**
 * Live-tinted Solar Shell silhouette used inside <LivePicker>.
 * Fill is bound to picker state — light vs dark hex.
 */
export function PickerGarment({ fill }: Props) {
  return (
    <svg
      viewBox="0 0 200 240"
      aria-hidden
      className="silhouette relative h-[80%] w-[65%] [filter:drop-shadow(0_30px_30px_rgb(0_0_0_/_0.15))]"
    >
      <path
        fill={fill}
        d="M40 50 L70 30 L100 38 L130 30 L160 50 L170 100 L150 110 L150 210 L50 210 L50 110 L30 100 Z"
        style={{ transition: "fill .35s var(--ease-out-solar)" }}
      />
      <circle cx="100" cy="80" r="2.4" fill="#F2EFE8" />
    </svg>
  );
}
