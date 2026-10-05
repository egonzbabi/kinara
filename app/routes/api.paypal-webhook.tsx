import type { Route } from "./+types/api.paypal-webhook";
import { verifyPaypalWebhookSignature } from "~/lib/paypal.server";
import { ensureOrderFromPaypalCapture, cancelOrderAndRestoreStock } from "~/lib/orders.server";

interface PaypalWebhookEvent {
  event_type: string;
  resource: {
    id?: string;
    custom_id?: string;
    links?: { rel: string; href: string }[];
  };
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const rawBody = await request.text();
  const verified = await verifyPaypalWebhookSignature(
    {
      authAlgo: request.headers.get("paypal-auth-algo"),
      certUrl: request.headers.get("paypal-cert-url"),
      transmissionId: request.headers.get("paypal-transmission-id"),
      transmissionSig: request.headers.get("paypal-transmission-sig"),
      transmissionTime: request.headers.get("paypal-transmission-time"),
    },
    rawBody,
  );
  if (!verified) {
    console.error("[paypal-webhook] firma inválida o no se pudo verificar");
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as PaypalWebhookEvent;

  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const captureId = event.resource.id;
    const pendingCheckoutId = event.resource.custom_id;
    if (!captureId || !pendingCheckoutId) {
      return Response.json({ received: true });
    }
    const result = await ensureOrderFromPaypalCapture({ captureId, pendingCheckoutId });
    if (!result) {
      // Igual que con Stripe: un 500 aquí hace que PayPal reintente el evento
      // en vez de perder el pedido por una falla transitoria de BD.
      console.error(`[paypal-webhook] no se pudo crear la orden para la captura ${captureId}, pidiendo reintento`);
      return Response.json({ error: "Order creation failed, retry" }, { status: 500 });
    }
    return Response.json({ received: true, orderId: result.orderId });
  }

  if (event.event_type === "PAYMENT.CAPTURE.REFUNDED") {
    // El recurso de este evento es el Reembolso, no la Captura original — su
    // id viene en el link "up" (".../payments/captures/{capture_id}"), no
    // como un campo plano.
    const upLink = event.resource.links?.find((l) => l.rel === "up")?.href;
    const captureId = upLink?.split("/").filter(Boolean).pop();
    if (!captureId) {
      return Response.json({ received: true });
    }
    try {
      const result = await cancelOrderAndRestoreStock({ paypalOrderId: captureId });
      return Response.json({ received: true, cancelled: result !== null });
    } catch (err) {
      console.error(`[paypal-webhook] fallo manejando el reembolso de ${captureId}:`, err);
      return Response.json({ error: "Refund handling failed, retry" }, { status: 500 });
    }
  }

  return Response.json({ received: true });
}
