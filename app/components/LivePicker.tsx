import { useRef, useState } from "react";
import { useCart } from "~/context/CartContext";
import { isLightSwatch, PICKER_SWATCHES } from "~/data/swatches";
import { PickerGarment } from "./svg/PickerGarment";

const SIZES = ["XS", "S", "M", "L", "XL"] as const;

export function LivePicker() {
  const { bump } = useCart();
  const mediaRef = useRef<HTMLDivElement>(null);
  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState<(typeof SIZES)[number]>("M");

  const swatch = PICKER_SWATCHES[colorIdx];
  const garmentFill = isLightSwatch(swatch.hex) ? "#0A0A0A" : "#F2EFE8";

  const onSwatch = (i: number) => {
    setColorIdx(i);
    mediaRef.current?.animate(
      [{ opacity: 0.55 }, { opacity: 1 }],
      { duration: 380, easing: "cubic-bezier(.16,1,.3,1)" },
    );
  };

  return (
    <div
      id="picker"
      className="picker-frame reveal mt-[clamp(48px,5vw,80px)] grid grid-cols-[1.1fr_0.9fr] items-stretch overflow-hidden rounded-lg border border-line max-[980px]:grid-cols-1"
    >
      <div
        ref={mediaRef}
        className="picker-media relative flex min-h-[480px] items-center justify-center overflow-hidden transition-[background] duration-500 ease-[var(--ease-solar)]"
        style={{ background: swatch.hex }}
      >
        <span className="absolute left-[18px] top-[18px] rounded-full bg-ink px-3 py-2 font-mono text-[11px] uppercase tracking-[.2em] text-bone">
          Probador en vivo
        </span>
        <PickerGarment fill={garmentFill} />
        <div
          className="picker-big pointer-events-none absolute -bottom-10 -right-[30px] text-[clamp(120px,18vw,260px)] font-black leading-[0.8] tracking-[-0.05em]"
          style={{ color: "rgba(0,0,0,0.06)" }}
        >
          SOLAR
        </div>
      </div>
      <div className="picker-panel flex flex-col justify-between gap-6 bg-bone p-[clamp(24px,3vw,40px)]">
        <div>
          <span className="mono tiny">N° 04 — Shell Jacket</span>
          <h3 className="mt-2.5 text-[clamp(28px,3.2vw,44px)] font-black tracking-[-0.02em]">
            Solar Shell — toca un color y míralo arder.
          </h3>
          <p className="mt-4 max-w-[44ch] text-[16px] font-light leading-[1.5] opacity-90">
            Tejido reciclado, costuras termoselladas, tratamiento DWR. Diseñada
            para correr al amanecer y al ocaso, con bolsillo escondido a la
            altura del pulso.
          </p>
        </div>

        <div>
          <span className="mono tiny opacity-70">
            Color · <b>{swatch.name}</b>
          </span>
          <div
            role="radiogroup"
            aria-label="Color"
            className="mt-2.5 flex flex-wrap gap-3.5"
          >
            {PICKER_SWATCHES.map((s, i) => {
              const checked = i === colorIdx;
              return (
                <button
                  key={s.hex}
                  role="radio"
                  aria-checked={checked}
                  aria-label={s.name}
                  onClick={() => onSwatch(i)}
                  className={`relative size-12 rounded-full border border-line transition-transform duration-200 ease-[var(--ease-solar)] hover:scale-105 ${
                    checked ? "outline outline-2 outline-offset-4 outline-ink" : ""
                  }`}
                  style={{ background: s.hex }}
                />
              );
            })}
          </div>
        </div>

        <div>
          <span className="mono tiny opacity-70">Talla</span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {SIZES.map((sz) => {
              const active = sz === size;
              return (
                <button
                  key={sz}
                  onClick={() => setSize(sz)}
                  className={`size-btn min-w-12 rounded-md border border-ink px-3.5 py-2.5 text-center font-mono text-[12px] tracking-[.12em] transition-colors duration-200 ease-[var(--ease-solar)] hover:bg-ink hover:text-bone ${
                    active ? "border-solar bg-solar" : ""
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="mono tiny opacity-70">Total</span>
            <div className="text-[clamp(32px,3vw,48px)] font-black tracking-[-0.02em]">
              €189
            </div>
          </div>
          <button
            onClick={bump}
            className="btn btn-solid group inline-flex items-center gap-2.5 rounded-full border border-ink bg-ink px-5 py-3.5 font-mono text-[12px] uppercase tracking-[.18em] text-bone transition-shadow duration-200 ease-[var(--ease-solar)] hover:shadow-[0_6px_24px_rgb(0_0_0_/_0.12)]"
          >
            Añadir a la bolsa
            <span className="inline-block transition-transform duration-200 ease-[var(--ease-solar)] group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
