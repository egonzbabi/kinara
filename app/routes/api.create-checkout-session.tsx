import type { Route } from "./+types/api.create-checkout-session";
import { getStripe } from "~/lib/stripe.server";
import { chunkMetadata } from "~/lib/orders.server";
import { validateCheckout, type CheckoutRequest } from "~/lib/checkout-validation.server";
import { DISCOUNT_PERCENT } from "~/lib/discount-constants";
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
    discountApplies,
    discountCode,
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

  // El 10% de bienvenida aplica solo al precio de los productos, nunca al
  // envío (el copy del sitio ya dice "en productos, sin contar el envío") —
  // por eso se descuenta directo en cada line_item de producto en vez de usar
  // un coupon de Stripe a nivel de sesión, que descontaría todas las líneas
  // por igual, incluida la de envío que se agrega más abajo.
  const discountFactor = discountApplies ? 1 - DISCOUNT_PERCENT / 100 : 1;

  const line_items: Array<{
    price_data: {
      currency: string;
      product_data: { name: string };
      unit_amount: number;
    };
    quantity: number;
  }> = trustedItems.map((i) => ({
    price_data: {
      currency: "mxn",
      product_data: { name: `${i.productName} · ${i.colorName} · Talla ${i.size}` },
      unit_amount: Math.round(i.price * 100 * discountFactor),
    },
    quantity: i.quantity,
  }));
  line_items.push({
    price_data: {
      currency: "mxn",
      product_data: { name: `Envío · ${shippingCarrier}` },
      unit_amount: Math.round(shippingFee * 100),
    },
    quantity: 1,
  });

  const origin = new URL(request.url).origin;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      payment_method_types: ["card", "oxxo"],
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
