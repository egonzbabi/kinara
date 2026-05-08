export function hexToRgbTriplet(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "255, 91, 31";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
