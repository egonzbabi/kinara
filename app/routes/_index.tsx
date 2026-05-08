import type { Route } from "./+types/_index";
import { CartProvider } from "~/context/CartContext";
import { CustomCursor } from "~/components/CustomCursor";
import { Hero } from "~/components/Hero";
import { LivePicker } from "~/components/LivePicker";
import { Lookbook } from "~/components/Lookbook";
import { Manifesto } from "~/components/Manifesto";
import { ProductGrid } from "~/components/ProductGrid";
import { SiteFooter } from "~/components/SiteFooter";
import { SiteNav } from "~/components/SiteNav";
import { SolarBand } from "~/components/SolarBand";
import { Splits } from "~/components/Splits";
import { Ticker } from "~/components/Ticker";
import { TweaksPanel } from "~/components/TweaksPanel";
import { useScrollReveal } from "~/hooks/useScrollReveal";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "KINARA · Brilla con fuerza" },
    {
      name: "description",
      content:
        "Drop 04 · Solar Performance · SS26. Ropa técnica que persigue al sol.",
    },
  ];
}

const STAR = <i className="not-italic text-solar">★</i>;

const TICKER_ITEMS = [
  <>BRILLA {STAR} CON FUERZA</>,
  "ENVÍO GRATIS DESDE 60€",
  "DROP 04 · SOLAR PERFORMANCE",
  "DEVOLUCIONES 30 DÍAS",
  "SS26 · MADE IN PORTUGAL",
];

export default function Index() {
  useScrollReveal();

  return (
    <CartProvider>
      <Ticker items={TICKER_ITEMS} />
      <SiteNav />
      <Hero />
      <SolarBand />

      <section className="pad relative z-[2] py-[clamp(48px,7vw,96px)]" id="shop">
        <div className="reveal flex items-end justify-between gap-6 border-b border-line pb-6">
          <h2 className="text-[clamp(32px,4.4vw,56px)] font-black leading-none tracking-[-0.02em]">
            Drop 04 · Lo nuevo
          </h2>
          <div className="flex items-center gap-3.5">
            <span className="mono tiny">14 piezas</span>
            <a className="mono tiny" href="#all">
              Ver todo →
            </a>
          </div>
        </div>

        <ProductGrid />

        <LivePicker />
      </section>

      <Splits />

      <section className="pad relative z-[2] py-[clamp(48px,7vw,96px)]" id="lookbook">
        <div className="reveal flex items-end justify-between gap-6 border-b border-line pb-6">
          <h2 className="text-[clamp(32px,4.4vw,56px)] font-black leading-none tracking-[-0.02em]">
            Lookbook · 04
          </h2>
          <div className="flex items-center gap-3.5">
            <span className="mono tiny">↔ Arrastra</span>
            <a className="mono tiny" href="#full">
              Ver completo →
            </a>
          </div>
        </div>
        <div className="mt-8">
          <Lookbook />
        </div>
      </section>

      <Manifesto />
      <SiteFooter />

      <CustomCursor />
      <TweaksPanel />
    </CartProvider>
  );
}
