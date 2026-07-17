const MXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Format an MXN amount, e.g. 390 -> "$390.00". */
export function formatPrice(amount: number): string {
  return MXN.format(amount);
}
