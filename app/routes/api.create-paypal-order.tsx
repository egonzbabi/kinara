import type { Route } from "./+types/api.create-paypal-order";
import { validateCheckout, type CheckoutRequest } from "~/lib/checkout-validation.server";
import { createPaypalOrder } from "~/lib/paypal.server";
import { createPendingCheckout } from "~/lib/orders.server";
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

  // Mismo criterio que Stripe (ver api.create-checkout-session.tsx): el 10%
  // de bienvenida se descuenta directo en cada línea de producto, el envío
  // siempre va a precio completo.
  const discountFactor = discountApplies ? 1 - DISCOUNT_PERCENT / 100 : 1;
  const paypalItems = trustedItems.map((i) => ({
    name: `${i.productName} · ${i.colorName} · Talla ${i.size}`,
    unitAmountCents: Math.round(i.price * 100 * discountFactor),
    quantity: i.quantity,
  }));
  const itemTotalCents = paypalItems.reduce((n, i) => n + i.unitAmountCents * i.quantity, 0);
  const shippingFeeCents = Math.round(shippingFee * 100);
  const totalCents = itemTotalCents + shippingFeeCents;

  const pendingCheckoutId = await createPendingCheckout({
    items: trustedItems.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      modelo: i.modelo,
      colorName: i.colorName,
      size: i.size,
      quantity: i.quantity,
      price: i.price,
    })),
    address: body.address,
    subtotal,
    shippingFee,
    total: totalCents / 100,
    shippingCarrier,
    shippingDays,
    shippingProviderName,
    shippingServiceCode,
    discountCode,
  });
  if (!pendingCheckoutId) {
    return Response.json({ error: "No se pudo iniciar el pago" }, { status: 500 });
  }

  try {
    const orderId = await createPaypalOrder({
      pendingCheckoutId,
      items: paypalItems,
      shippingFeeCents,
      totalCents,
    });
    return Response.json({ id: orderId });
  } catch (err) {
    console.error("[paypal] error creando la orden:", err);
    const message = err instanceof Error ? err.message : "No se pudo iniciar el pago";
    await sendOwnerAlert({
      subject: `🚨 Checkout (PayPal) falló — no se pudo crear la orden`,
      text: `Un cliente no pudo iniciar el pago con PayPal.\n\nCorreo: ${body.address.email}\nSubtotal: ${formatPrice(subtotal)}\n\nError: ${message}`,
    });
    return Response.json({ error: message }, { status: 500 });
  }
}
