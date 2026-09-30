import "dotenv/config";
import Stripe from "stripe";

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
