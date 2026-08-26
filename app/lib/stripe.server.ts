import "dotenv/config";
import Stripe from "stripe";
import { DISCOUNT_PERCENT } from "./discount-constants";

let cached: Stripe | null = null;

/**
 * Construcción perezosa: si se creara el cliente a nivel de módulo, la falta de
 * STRIPE_SECRET_KEY rompería la carga de cualquier ruta que lo importe (el SDK
 * lanza al construirse con una llave vacía), no solo la llamada que lo usa. Al
 * pedirlo dentro de cada action/loader, el error queda dentro de su try/catch.
 */
export function getStripe(): Stripe {
  if (!cached) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("Falta STRIPE_SECRET_KEY en las variables de entorno (.env).");
    }
    cached = new Stripe(secretKey, { typescript: true });
  }
  return cached;
}

const WELCOME_COUPON_ID = "bienvenida10";

/**
 * Un solo Coupon de Stripe, reutilizado en todos los pedidos que aplican el
 * descuento de bienvenida (10% en la primera compra) — toda la elegibilidad
 * (correo, primera compra, mínimo de $799) ya se validó antes de llegar aquí
 * (ver `discount-signups.server.ts`); este Coupon solo aplica el porcentaje.
 * Se crea perezosamente la primera vez que se necesita, no en un script aparte.
 */
export async function getOrCreateWelcomeCoupon(): Promise<string> {
  const stripe = getStripe();
  try {
    await stripe.coupons.retrieve(WELCOME_COUPON_ID);
    return WELCOME_COUPON_ID;
  } catch {
    await stripe.coupons.create({
      id: WELCOME_COUPON_ID,
      percent_off: DISCOUNT_PERCENT,
      duration: "once",
      name: "Bienvenida 10%",
    });
    return WELCOME_COUPON_ID;
  }
}
