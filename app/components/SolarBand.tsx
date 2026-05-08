import { Ticker } from "./Ticker";

const STAR = <span className="text-ink">★</span>;

const ITEMS = [
  "CORRER · SUDAR · BRILLAR",
  STAR,
  "SOLAR PERFORMANCE",
  STAR,
  "SS26 KINARA",
  STAR,
  "BRILLA CON FUERZA",
  STAR,
];

export function SolarBand() {
  return <Ticker items={ITEMS} variant="solar" size="lg" durationSec={22} />;
}
