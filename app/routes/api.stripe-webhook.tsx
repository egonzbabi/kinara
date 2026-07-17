import type Stripe from "stripe";
import type { Route } from "./+types/api.stripe-webhook";
import { getStripe } from "~/lib/stripe.server";
import { ensureOrderFromCheckoutSession } from "~/lib/orders.server";
import { supabaseAdmin } from "~/lib/supabase.server";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  if (!webhookSecret) {
    console.error("[stripe-webhook] falta STRIPE_WEBHOOK_SECRET en .env");
    return Response.json({ error: "Webhook no configurado" }, { status: 500 });
  }

  // Nunca parsear el body como JSON antes de verificar la firma — Stripe firma
  // el texto crudo del request.
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let stripe: Stripe;
  let event: Stripe.Event;
  try {
    stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] firma inválida o Stripe no configurado:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const result = await ensureOrderFromCheckoutSession(session);
    if (!result && session.payment_status === "paid") {
      // Pago confirmado pero la orden no se pudo crear (falla transitoria de BD):
      // responder 500 para que Stripe reintente el evento — un 200 aquí perdería la orden.
      console.error(`[stripe-webhook] no se pudo crear la orden para la sesión ${session.id}, pidiendo reintento`);
      return Response.json({ error: "Order creation failed, retry" }, { status: 500 });
    }
    return Response.json({ received: true, orderId: result?.orderId ?? null });
  }

  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.warn(`[stripe-webhook] pago asíncrono (OXXO) fallido/expirado para la sesión ${session.id}`);
    return Response.json({ received: true });
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    // Solo un reembolso TOTAL cancela la orden.
    if (!charge.refunded) {
      return Response.json({ received: true, partial: true });
    }
    const paymentIntentId =
      typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
    if (!paymentIntentId) {
      return Response.json({ received: true });
    }
    try {
      const session = await stripe.checkout.sessions.list({ payment_intent: paymentIntentId, limit: 1 });
      const sessionId = session.data[0]?.id;
      if (!sessionId) {
        console.warn(`[stripe-webhook] charge.refunded: no se encontró la sesión para el PI ${paymentIntentId}`);
        return Response.json({ received: true });
      }
      const { data, error } = await supabaseAdmin
        .from("orders")
        .update({ status: "cancelled" })
        .eq("stripe_session_id", sessionId)
        .select("id");
      if (error) throw error;
      return Response.json({ received: true, cancelled: (data?.length ?? 0) > 0 });
    } catch (err) {
      console.error(`[stripe-webhook] fallo manejando el reembolso de ${paymentIntentId}:`, err);
      return Response.json({ error: "Refund handling failed, retry" }, { status: 500 });
    }
  }

  return Response.json({ received: true });
}
