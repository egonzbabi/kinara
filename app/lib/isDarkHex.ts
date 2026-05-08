/**
 * Quick brightness check — returns true if the hex color is dark enough
 * to need a light-ringed solar cursor.
 * Uses perceptual luminance (Rec. 709 weights).
 */
export function isDarkHex(hex: string): boolean {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  // Rec. 709 luminance, 0–255 scale
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return l < 90;
}
