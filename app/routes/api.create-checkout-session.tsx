import type { Route } from "./+types/api.create-checkout-session";
import { getStripe } from "~/lib/stripe.server";
import { chunkMetadata } from "~/lib/orders.server";
import { validateCheckout, type CheckoutRequest } from "~/lib/checkout-validation.server";
import { formatPrice } from "~/lib/formatPrice";
import { sendOwnerAlert } from "~/lib/resend.server";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: CheckoutRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Cuerpo de la solicitud inválido" }, { status: 400 });
  }

  const result = await validateCheckout(body);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }
  const {
    trustedItems,
    subtotal,
    shippingFee,
    shippingCarrier,
    shippingDays,
    shippingProviderName,
    shippingServiceCode,
    discountCode,
    unitAmountCents,
  } = result.data;

  const itemsJson = JSON.stringify(trustedItems);
  const addressJson = JSON.stringify(body.address);
  const metadata: Record<string, string> = {
    ...chunkMetadata("items_json", itemsJson),
    ...chunkMetadata("shipping_address_json", addressJson),
    subtotal: String(subtotal),
    shipping_fee: String(shippingFee),
    shipping_days: shippingDays == null ? "" : String(shippingDays),
    shipping_carrier: shippingCarrier,
    shipping_provider_name: shippingProviderName ?? "",
    shipping_service_code: shippingServiceCode ?? "",
    discount_code: discountCode ?? "",
  };

  // El descuento del código (bienvenida o promotora) aplica solo a los
  // productos, nunca al envío. `validateCheckout` ya calculó cuánto le toca a
  // cada línea (`unitAmountCents`, con el precio ya rebajado). Para que Stripe
  // lo muestre desglosado ("Descuento (CÓDIGO) −$X") se manda así: cada
  // producto a su precio completo, un cupón de monto fijo por el total
  // descontado, y el envío como `shipping_options` — Stripe no aplica los
  // cupones a los envíos, así que no se rebajan. El total cobrado es el mismo.
  const fullUnitCents = trustedItems.map((i) => Math.round(i.price * 100));
  const discountCents = trustedItems.reduce(
    (n, i, idx) => n + i.quantity * (fullUnitCents[idx] - unitAmountCents[idx]),
    0,
  );

  const line_items: Array<{
    price_data: {
      currency: string;
      product_data: { name: string };
      unit_amount: number;
    };
    quantity: number;
  }> = trustedItems.map((i, idx) => ({
    price_data: {
      currency: "mxn",
      product_data: { name: `${i.productName} · ${i.colorName} · Talla ${i.size}` },
      unit_amount: fullUnitCents[idx],
    },
    quantity: i.quantity,
  }));

  const origin = new URL(request.url).origin;

  try {
    const stripe = getStripe();
    let discounts: Array<{ coupon: string }> | undefined;
    if (discountCents > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: discountCents,
        currency: "mxn",
        duration: "once",
        // Es la etiqueta que ve la clienta en la pantalla de Stripe (máx. 40).
        name: (discountCode ?? "Descuento").slice(0, 40),
      });
      discounts = [{ coupon: coupon.id }];
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      ...(discounts ? { discounts } : {}),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: Math.round(shippingFee * 100), currency: "mxn" },
            display_name: `Envío · ${shippingCarrier}`,
          },
        },
      ],
      payment_method_types: ["card", "oxxo"],
      // Meses sin intereses (tarea 155): Stripe muestra los planes solo si la
      // tarjeta es de crédito emitida en México y el total pasa el mínimo del
      // plan. Los plazos disponibles y sus mínimos se controlan en el Dashboard
      // de Stripe (Configuración → Métodos de pago → Meses sin intereses).
      payment_method_options: { card: { installments: { enabled: true } } },
      customer_email: body.address.email,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancelado`,
      metadata,
      payment_intent_data: { metadata },
    });
    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] error creando la Checkout Session:", err);
    const message = err instanceof Error ? err.message : "No se pudo iniciar el pago";
    // Este catch es justo el que dispara cuando algo real está roto (clave de
    // Stripe inválida, API caída, etc.) — no los 400 de arriba (carrito vacío,
    // sin stock, código de descuento inválido), que son parte normal del uso
    // del sitio y no ameritan avisar cada vez.
    await sendOwnerAlert({
      subject: `🚨 Checkout falló — no se pudo crear la sesión de pago`,
      text: `Un cliente no pudo iniciar el pago.\n\nCorreo: ${body.address.email}\nSubtotal: ${formatPrice(subtotal)}\n\nError: ${message}`,
    });
    return Response.json({ error: message }, { status: 500 });
  }
}
