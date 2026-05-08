export function Hero() {
  return (
    <header className="relative flex min-h-[calc(100vh-98px)] flex-col justify-end overflow-hidden px-[clamp(16px,3vw,40px)] pt-[clamp(28px,4vw,64px)]">
      <div className="hero-rays" aria-hidden />
      <div className="hero-sun" aria-hidden />

      <div className="absolute left-[clamp(16px,3vw,40px)] right-[clamp(16px,3vw,40px)] top-[clamp(28px,4vw,64px)] flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-[.2em] opacity-70">
            SS26 — 04 / 12
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[.2em] opacity-70">
            © KINARA ATELIER
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[11px] uppercase tracking-[.2em] opacity-70">
            N° 04 · SOLAR PERFORMANCE
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-[11px] uppercase tracking-[.2em] opacity-70">
            PORTO ↔ MADRID
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[.2em] opacity-70">
            08.MAY.2026
          </span>
        </div>
      </div>

      <h1 className="wordmark text-ink" aria-label="KINARA">
        <span>K</span>
        <span>I</span>
        <span>N</span>
        <span>A</span>
        <span>R</span>
        <span>A</span>
      </h1>

      <div className="relative z-[2] mt-[clamp(20px,4vw,40px)] grid grid-cols-[1.4fr_1fr] items-end gap-8 border-t border-line py-[clamp(20px,3vw,40px)] pt-[clamp(20px,3vw,32px)] max-[980px]:grid-cols-1">
        <p className="max-w-[14ch] text-[clamp(28px,5vw,64px)] font-light leading-[1] tracking-[-0.02em]">
          <em className="font-black not-italic">Brilla</em> con{" "}
          <span className="text-solar">fuerza.</span>
          <br />
          Ropa técnica que persigue al sol.
        </p>
        <div className="flex flex-wrap items-center justify-end gap-3 max-[980px]:justify-start">
          <div className="flex gap-1.5" aria-hidden>
            <span className="rounded-full border border-line px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[.16em]">
              14 piezas
            </span>
            <span className="rounded-full border border-line px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[.16em]">
              Edición limitada
            </span>
          </div>
          <a
            href="#shop"
            className="btn btn-solar group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-solar bg-solar px-5 py-3.5 font-mono text-[12px] uppercase tracking-[.18em] text-ink transition-shadow duration-200 ease-[var(--ease-solar)] hover:shadow-[0_6px_24px_rgb(0_0_0_/_0.12)]"
          >
            Ver el drop
            <span className="inline-block transition-transform duration-200 ease-[var(--ease-solar)] group-hover:translate-x-1">
              →
            </span>
          </a>
          <a
            href="#lookbook"
            className="btn btn-ghost group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-ink bg-transparent px-5 py-3.5 font-mono text-[12px] uppercase tracking-[.18em] text-ink transition-shadow duration-200 ease-[var(--ease-solar)] hover:shadow-[0_6px_24px_rgb(0_0_0_/_0.12)]"
          >
            Lookbook
            <span className="inline-block transition-transform duration-200 ease-[var(--ease-solar)] group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
