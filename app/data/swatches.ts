export type Swatch = {
  name: string;
  hex: string;
};

export const PICKER_SWATCHES: Swatch[] = [
  { name: "Volcán", hex: "#FF5B1F" },
  { name: "Eclipse", hex: "#0A0A0A" },
  { name: "Hueso", hex: "#F2EFE8" },
  { name: "Salvia", hex: "#3F4A2E" },
  { name: "Niebla", hex: "#C7D7E8" },
];

const LIGHT_HEXES = new Set(["#F2EFE8", "#C7D7E8", "#FFC233"]);

export function isLightSwatch(hex: string): boolean {
  return LIGHT_HEXES.has(hex.toUpperCase());
}
