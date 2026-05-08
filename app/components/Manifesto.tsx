export function Manifesto() {
  return (
    <section
      data-cursor="dark"
      className="relative overflow-hidden bg-ink py-[clamp(72px,10vw,160px)] text-bone"
    >
      <div className="manifesto-sun" aria-hidden />
      <div className="pad relative z-[2] grid grid-cols-2 items-center gap-12 max-[980px]:grid-cols-1">
        <div className="reveal">
          <span className="mono tiny opacity-70">Manifiesto · KINARA SS26</span>
          <h2 className="mt-3.5 text-[clamp(40px,6vw,96px)] font-black leading-[0.95] tracking-[-0.03em]">
            El cuerpo es <span className="text-solar">brasa.</span>
            <br />
            El sudor, combustible.
          </h2>
        </div>
        <div className="reveal">
          <p className="max-w-[50ch] text-[clamp(15px,1.2vw,18px)] font-light leading-[1.55] opacity-90">
            KINARA hace ropa para gente que se mueve. Tejidos reciclados,
            fábricas a 1.500 km, sin colecciones de relleno. Cuatro drops al año,
            catorce piezas por drop, cero rebajas. Si una prenda no rinde, no
            entra.
          </p>
          <div className="mt-7 grid max-w-[480px] grid-cols-3 gap-3">
            {[
              { label: "Tejido", value: "78% rec." },
              { label: "Origen", value: "Porto, PT" },
              { label: "Drops/año", value: "04" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-md border border-bone/20 p-3"
              >
                <b className="block font-mono text-[11px] font-medium uppercase tracking-[.2em] opacity-65">
                  {s.label}
                </b>
                <span className="mt-1.5 block text-[22px] font-black tracking-[-0.01em]">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
