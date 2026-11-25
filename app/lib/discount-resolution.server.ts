import { findPromoterCode, validatePromoterCode } from "~/lib/promoter-codes.server";
import { validateDiscountCode } from "~/lib/discount-signups.server";
import { DISCOUNT_MIN_SUBTOTAL_MXN, DISCOUNT_PERCENT } from "~/lib/discount-constants";
import { formatPrice } from "~/lib/formatPrice";
import { isPromoActive, PROMO, PROMO_CHECKOUT_GRACE_MS } from "~/lib/promo";

export interface DiscountLine {
  /** Precio unitario vigente (ya con la promoción de temporada, si la hay). */
  price: number;
  qty: number;
  /** Si puede llevar el descuento de un código de promotora (sin precio tachado). */
  codeEligible: boolean;
}

export type DiscountResolution =
  | {
      ok: true;
      kind: "welcome" | "promoter";
      percent: number;
      /** Cobro por unidad en centavos, en el mismo orden que `lines`. */
      unitAmountCents: number[];
      /** Cuánto se descuenta en total, en pesos. */
      discountTotal: number;
    }
  | { ok: false; error: string };

const PROMO_ACTIVE_ERROR = `Los códigos de descuento no se suman a la promoción de ${PROMO.fullName}. Quítalo para continuar; te sigue sirviendo después de la promoción.`;
const ALL_ON_SALE_ERROR = "Los productos de tu carrito ya están en oferta y no suman este código.";

/** Aplica `percent` solo a las líneas elegibles. Un solo lugar para el redondeo
 * (centavos por unidad), que usan el cobro y las vistas previas. */
function applyPercent(
  lines: DiscountLine[],
  percent: number,
  isEligible: (l: DiscountLine) => boolean,
): { unitAmountCents: number[]; discountTotal: number } {
  const unitAmountCents = lines.map((l) =>
    isEligible(l) ? Math.round(l.price * 100 * (1 - percent / 100)) : Math.round(l.price * 100),
  );
  const discountCents = lines.reduce(
    (n, l, i) => n + l.qty * (Math.round(l.price * 100) - unitAmountCents[i]),
    0,
  );
  return { unitAmountCents, discountTotal: discountCents / 100 };
}

/**
 * Vista previa del descuento de un código de promotora SIN conocer el correo
 * (para el carrito, donde todavía no se pide). Aplica las mismas reglas que
 * `resolveDiscount`, salvo "una vez por correo", que solo se puede revisar en
 * /checkout y al cobrar. Nunca se usa para cobrar.
 */
export async function previewPromoterDiscount(params: {
  code: string;
  lines: DiscountLine[];
}): Promise<DiscountResolution> {
  const { code, lines } = params;
  if (isPromoActive(Date.now(), PROMO_CHECKOUT_GRACE_MS)) {
    return { ok: false, error: PROMO_ACTIVE_ERROR };
  }
  const promoter = await findPromoterCode(code);
  if (!promoter) return { ok: false, error: "Ese código no existe." };
  const validation = await validatePromoterCode(promoter, null);
  if (!validation.valid) return { ok: false, error: validation.error };
  if (!lines.some((l) => l.codeEligible)) return { ok: false, error: ALL_ON_SALE_ERROR };
  const { unitAmountCents, discountTotal } = applyPercent(lines, promoter.percent, (l) => l.codeEligible);
  return { ok: true, kind: "promoter", percent: promoter.percent, unitAmountCents, discountTotal };
}

/**
 * Decide qué descuento lleva un código de descuento (tarea 150): el de
 * bienvenida (10%, primera compra, tarea 070) o el de promotora (20%). Es la
 * ÚNICA fuente de esta regla: `validateCheckout` la usa al cobrar y
 * `/api/validate-code` la usa para mostrar el descuento en /checkout, así lo
 * que se ve es lo que se cobra. Todo se calcula con los precios del servidor.
 */
export async function resolveDiscount(params: {
  code: string;
  email: string;
  lines: DiscountLine[];
}): Promise<DiscountResolution> {
  const { code, email, lines } = params;
  const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);

  // Los descuentos no se suman (tarea 148): durante la promoción de temporada
  // ningún código se acepta; vuelven a servir al terminar.
  if (isPromoActive(Date.now(), PROMO_CHECKOUT_GRACE_MS)) {
    return { ok: false, error: PROMO_ACTIVE_ERROR };
  }

  const finish = (
    kind: "welcome" | "promoter",
    percent: number,
    isEligible: (l: DiscountLine) => boolean,
  ): DiscountResolution => ({
    ok: true,
    kind,
    percent,
    ...applyPercent(lines, percent, isEligible),
  });

  const promoter = await findPromoterCode(code);
  if (promoter) {
    const validation = await validatePromoterCode(promoter, email);
    if (!validation.valid) return { ok: false, error: validation.error };
    if (!lines.some((l) => l.codeEligible)) return { ok: false, error: ALL_ON_SALE_ERROR };
    // El descuento es solo en productos elegibles, nunca en el envío.
    return finish("promoter", promoter.percent, (l) => l.codeEligible);
  }

  if (subtotal < DISCOUNT_MIN_SUBTOTAL_MXN) {
    return {
      ok: false,
      error: `Ese código requiere una compra mínima de ${formatPrice(DISCOUNT_MIN_SUBTOTAL_MXN)} en productos, sin contar el envío.`,
    };
  }
  const validation = await validateDiscountCode(code, email);
  if (!validation.valid) return { ok: false, error: validation.error };
  return finish("welcome", DISCOUNT_PERCENT, () => true);
}
