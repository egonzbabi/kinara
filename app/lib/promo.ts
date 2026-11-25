// Promoción de temporada (tareas 148 y 154): 30% en todo el catálogo excepto
// los productos que ya tienen precio tachado (`compare_at`). Hoy describe
// Black Friday + Cyber Monday 2026 (antes: Buen Fin, del 10 al 17 de nov).
//
// Sin dependencias de servidor: lo usan el catálogo (lo que se muestra), el
// checkout (lo que se cobra), el feed de Merchant y la barra de anuncios.
// Nada de esto se guarda en la base: el precio real de `products.price` no
// cambia nunca, la promo solo se calcula mientras la ventana está activa.

export const PROMO = {
  // Nombre corto: etiquetas de tarjetas, precios y mensajes en línea.
  name: "Black Friday",
  // Nombre completo del evento: franja y banda del inicio.
  fullName: "Black Friday y Cyber Monday",
  percent: 30,
  // México central no tiene horario de verano (UTC-6 todo el año). La promo va
  // del viernes 27 de nov 00:00 al lunes 30 de nov 23:59:59; `endsAt` es
  // exclusivo.
  startsAt: "2026-11-27T00:00:00-06:00",
  endsAt: "2026-12-01T00:00:00-06:00",
  // La barra de anuncios avisa unos días antes de que empiece.
  announceFrom: "2026-11-25T00:00:00-06:00",
  // Textos de las fechas que se muestran en el sitio (un solo lugar: si cambian
  // las fechas de arriba, cambian aquí también).
  rangeShort: "27 al 30 de nov",
  rangeShortCompact: "27–30 nov",
  rangeLong: "27 al 30 de noviembre",
  startLabel: "27 de noviembre",
  endLabel: "30 de noviembre",
  // Los dos días fuertes del evento (banda del inicio).
  days: [
    { weekday: "Vie", day: "27", name: "Black Friday" },
    { weekday: "Lun", day: "30", name: "Cyber Monday" },
  ],
  // Mismos instantes en el formato que pide Merchant Center (ISO 8601 con
  // zona, el fin es el último minuto de la promo).
  feedWindow: "2026-11-27T00:00-0600/2026-11-30T23:59-0600",
} as const;

// El catálogo se guarda en memoria hasta 30 s (tarea 137): una clienta que vio el
// precio con promo justo antes del cierre sigue pudiendo pagarlo un momento.
export const PROMO_CHECKOUT_GRACE_MS = 2 * 60 * 1000;

const STARTS_AT = Date.parse(PROMO.startsAt);
const ENDS_AT = Date.parse(PROMO.endsAt);
const ANNOUNCE_FROM = Date.parse(PROMO.announceFrom);

export function isPromoActive(now: number = Date.now(), graceMs = 0): boolean {
  return now >= STARTS_AT && now < ENDS_AT + graceMs;
}

// Verdadero desde que se anuncia hasta que termina (solo para la barra).
export function isPromoAnnounced(now: number = Date.now()): boolean {
  return now >= ANNOUNCE_FROM && now < ENDS_AT;
}

// Precio que tendrá en la promoción, para mostrarlo antes de que empiece (solo
// durante el periodo de aviso y si el producto es elegible).
export function promoPreviewPrice(
  price: number,
  compareAt: number | null | undefined,
  now: number = Date.now(),
): number | undefined {
  return isPromoAnnounced(now) && !isPromoActive(now) && isPromoEligible(compareAt)
    ? promoPrice(price)
    : undefined;
}

// Los productos que ya tienen precio tachado se quedan como están.
export function isPromoEligible(compareAt: number | null | undefined): boolean {
  return compareAt == null;
}

export function promoPrice(price: number): number {
  return Math.round((price * (100 - PROMO.percent)) / 100);
}

// Precio y precio tachado que se muestran/cobran en este momento.
export function applyPromo(
  price: number,
  compareAt: number | null | undefined,
  now: number = Date.now(),
  graceMs = 0,
): { price: number; compareAt: number | undefined; promoted: boolean } {
  if (isPromoActive(now, graceMs) && isPromoEligible(compareAt)) {
    return { price: promoPrice(price), compareAt: price, promoted: true };
  }
  return { price, compareAt: compareAt ?? undefined, promoted: false };
}
