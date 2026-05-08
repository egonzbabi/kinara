type SplitItem = {
  href: string;
  num: string;
  title: string;
  desc: string;
  cta: string;
};

const ITEMS: SplitItem[] = [
  {
    href: "#run",
    num: "01 / 03",
    title: "RUN",
    desc: "Ligero, transpirable, hecho para perseguir el sol y volver con la cara cubierta de sal.",
    cta: "Comprar Run",
  },
  {
    href: "#train",
    num: "02 / 03",
    title: "TRAIN",
    desc: "Sujeción donde la necesitas. Estructura que se mueve contigo. Sin distracciones.",
    cta: "Comprar Train",
  },
  {
    href: "#recover",
    num: "03 / 03",
    title: "REPOSO",
    desc: "Algodón orgánico, cortes sueltos, sensación de ducha caliente después de los kilómetros.",
    cta: "Comprar Reposo",
  },
];

export function Splits() {
  return (
    <section
      id="colecciones"
      className="splits-grid grid grid-cols-3 border-y border-line max-[980px]:grid-cols-1"
    >
      {ITEMS.map((it, idx) => (
        <a
          key={it.href}
          href={it.href}
          className={`split group relative cursor-pointer overflow-hidden border-line px-[clamp(24px,3vw,40px)] py-[clamp(48px,6vw,96px)] transition-colors duration-300 ease-[var(--ease-solar)] hover:bg-ink hover:text-bone ${
            idx < ITEMS.length - 1 ? "border-r" : ""
          } max-[980px]:border-r-0 max-[980px]:border-b max-[980px]:last:border-b-0`}
        >
          <div className="font-mono text-[11px] uppercase tracking-[.2em] opacity-70">
            {it.num}
          </div>
          <div className="mt-4 text-[clamp(56px,9vw,144px)] font-black leading-[0.85] tracking-[-0.04em]">
            {it.title}
          </div>
          <p className="mt-4 max-w-[30ch] text-[14px] font-light leading-[1.5] opacity-80">
            {it.desc}
          </p>
          <span className="mt-[clamp(24px,3vw,40px)] inline-flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[.18em]">
            {it.cta}
            <span className="inline-block transition-transform duration-300 ease-[var(--ease-solar)] group-hover:translate-x-1.5">
              →
            </span>
          </span>
          <span
            aria-hidden
            className="absolute -bottom-7 -right-5 size-40 scale-[0.6] rounded-full bg-solar opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-solar)] group-hover:scale-100 group-hover:opacity-100"
          />
        </a>
      ))}
    </section>
  );
}
