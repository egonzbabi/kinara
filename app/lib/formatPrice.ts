const EUR = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Format a EUR amount the Spanish way, e.g. 78 -> "78 €". */
export function formatPrice(amount: number): string {
  return EUR.format(amount);
}
