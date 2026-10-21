import { supabaseAdmin } from "./supabase.server";
import { purchaseShipment, listRecentShipments } from "./skydropx.server";
import { sendOrderShippedEmail } from "./resend.server";
import { matchShipmentToOrder } from "./shipment-match";
import { estimateParcel } from "./shipping";
import type { OrderItem } from "./orders.server";
import type { Database } from "./supabase.types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

export type AdminOrderShippingAddress = {
  name: string;
  email: string;
  phone: string;
  street1: string;
  postalCode: string;
  areaLevel1: string;
  areaLevel2: string;
  areaLevel3: string;
};

export type AdminOrderListItem = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  status: OrderStatus;
  shippingAddress: AdminOrderShippingAddress | null;
  shippingCarrier: string | null;
  shippingDays: number | null;
  shippingProviderName: string | null;
  shippingServiceCode: string | null;
  skydropxShipmentId: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  labelUrl: string | null;
  stripeSessionId: string | null;
  paymentProvider: "stripe" | "paypal";
  paypalOrderId: string | null;
  discountCode: string | null;
  createdAt: string;
};

const ORDER_SELECT =
  "id, customer_name, customer_email, customer_phone, items, subtotal, shipping_fee, total, currency, status, shipping_address, shipping_carrier, shipping_days, shipping_provider_name, shipping_service_code, skydropx_shipment_id, tracking_number, tracking_url, label_url, stripe_session_id, payment_provider, paypal_order_id, discount_code, created_at";

function mapOrder(o: OrderRow): AdminOrderListItem {
  return {
    id: o.id,
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    customerPhone: o.customer_phone,
    items: (o.items as OrderItem[] | null) ?? [],
    subtotal: o.subtotal,
    shippingFee: o.shipping_fee,
    total: o.total,
    currency: o.currency,
    status: o.status,
    shippingAddress: (o.shipping_address as AdminOrderShippingAddress | null) ?? null,
    shippingCarrier: o.shipping_carrier,
    shippingDays: o.shipping_days,
    shippingProviderName: o.shipping_provider_name,
    shippingServiceCode: o.shipping_service_code,
    skydropxShipmentId: o.skydropx_shipment_id,
    trackingNumber: o.tracking_number,
    trackingUrl: o.tracking_url,
    labelUrl: o.label_url,
    stripeSessionId: o.stripe_session_id,
    paymentProvider: o.payment_provider,
    paypalOrderId: o.paypal_order_id,
    discountCode: o.discount_code,
    createdAt: o.created_at,
  };
}

export async function listAdminOrders(): Promise<AdminOrderListItem[]> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar los pedidos: ${error.message}`);

  return (data ?? []).map(mapOrder);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { error } = await supabaseAdmin.from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(`No se pudo actualizar el estado del pedido: ${error.message}`);
}

/**
 * Compra la guía real de Skydropx para un pedido (tiene costo real, descuenta
 * del saldo de la cuenta de Skydropx) — solo se llama a pedido explícito del
 * admin desde `/admin/pedidos`, nunca automáticamente. Requiere que el pedido
 * tenga `shipping_provider_name`/`shipping_service_code` guardados (pedidos de
 * antes de esta función no los tienen y no se pueden comprar así).
 */
export async function buyShippingLabel(orderId: string): Promise<{ emailSent: boolean }> {
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .single();
  if (error || !order) throw new Error(`No se encontró el pedido ${orderId}.`);
  if (order.tracking_number) {
    throw new Error("Este pedido ya tiene una guía comprada — no se puede comprar dos veces.");
  }
  if (!order.shipping_provider_name || !order.shipping_service_code) {
    throw new Error(
      "Este pedido no tiene datos de paquetería guardados (es de antes de esta función) — no se puede comprar la guía automáticamente.",
    );
  }

  const address = order.shipping_address as AdminOrderShippingAddress;
  const items = (order.items as OrderItem[] | null) ?? [];
  const totalQty = items.reduce((n, i) => n + i.quantity, 0);

  const result = await purchaseShipment({
    addressTo: {
      name: address.name,
      phone: address.phone,
      email: address.email,
      street1: address.street1,
      postalCode: address.postalCode,
      areaLevel1: address.areaLevel1,
      areaLevel2: address.areaLevel2,
      areaLevel3: address.areaLevel3,
    },
    parcels: [estimateParcel(totalQty)],
    providerName: order.shipping_provider_name,
    serviceCode: order.shipping_service_code,
  });

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      skydropx_shipment_id: result.shipmentId,
      tracking_number: result.trackingNumber,
      tracking_url: result.trackingUrl,
      label_url: result.labelUrl,
      // Guía comprada = pedido "Enviado" (solo si seguía en Procesando).
      ...(order.status === "processing" ? { status: "shipped" as const } : {}),
    })
    .eq("id", orderId);
  if (updateError) {
    throw new Error(`La guía se compró pero no se pudo guardar en el pedido: ${updateError.message}`);
  }

  // Aviso automático a la clienta (tarea 147). La guía ya está comprada y
  // guardada: si el correo falla NO se revierte nada — el admin puede
  // reenviarlo desde el pedido ("Reenviar aviso por correo").
  const email = await sendShippedEmailForOrder(orderId);
  if (!email.sent) console.error(`[envío] No se pudo avisar al cliente del pedido ${orderId}: ${email.error}`);
  return { emailSent: email.sent };
}

const TRACKING_COLUMNS =
  "id, customer_name, customer_email, customer_phone, shipping_address, shipping_carrier, shipping_days, tracking_number, tracking_url, created_at, status";

type ShippedEmailOrder = Pick<
  OrderRow,
  | "id"
  | "customer_name"
  | "customer_email"
  | "customer_phone"
  | "shipping_address"
  | "shipping_carrier"
  | "shipping_days"
  | "tracking_number"
  | "tracking_url"
  | "created_at"
  | "status"
>;

function sendShippedEmailFor(
  order: ShippedEmailOrder,
  override?: { carrier?: string | null; shippingDays?: number | null },
) {
  const addr = order.shipping_address as AdminOrderShippingAddress | null;
  return sendOrderShippedEmail({
    orderId: order.id,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    carrier: override?.carrier ?? order.shipping_carrier,
    trackingNumber: order.tracking_number ?? "",
    trackingUrl: order.tracking_url,
    shippingDays: override?.shippingDays ?? order.shipping_days,
    shippingAddress: addr
      ? {
          name: addr.name,
          street1: addr.street1,
          postalCode: addr.postalCode,
          areaLevel1: addr.areaLevel1,
          areaLevel2: addr.areaLevel2,
          areaLevel3: addr.areaLevel3,
        }
      : null,
  });
}

/** Envía (o reenvía) el correo "Tu pedido va en camino" de un pedido que ya tiene rastreo. */
export async function sendShippedEmailForOrder(orderId: string) {
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select(TRACKING_COLUMNS)
    .eq("id", orderId)
    .single();
  if (error || !order) return { sent: false, error: `No se encontró el pedido ${orderId}.` };
  if (!order.tracking_number) return { sent: false, error: "El pedido todavía no tiene número de rastreo." };
  if (order.status === "cancelled") return { sent: false, error: "El pedido está cancelado." };
  return sendShippedEmailFor(order as ShippedEmailOrder);
}

/**
 * Guarda un rastreo capturado a mano y avisa a la clienta. Si el correo no sale
 * se revierte, para no dejar un pedido "con rastreo" cuya clienta nunca se enteró.
 */
export async function registerManualTracking(
  orderId: string,
  input: { carrier: string; trackingNumber: string; trackingUrl: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const carrier = input.carrier.trim();
  const trackingNumber = input.trackingNumber.trim();
  const trackingUrl = input.trackingUrl.trim();
  if (!carrier || !trackingNumber) {
    return { ok: false, error: "Escribe la paquetería y el número de rastreo." };
  }
  if (trackingUrl && !/^https?:\/\//i.test(trackingUrl)) {
    return { ok: false, error: "El enlace de rastreo debe empezar con http:// o https://." };
  }
  return claimAndNotify(orderId, {
    tracking_number: trackingNumber,
    tracking_url: trackingUrl || null,
    shipping_carrier: carrier,
  });
}

/**
 * Guarda el rastreo SOLO si el pedido aún no tiene (así dos procesos a la vez
 * no pueden avisar dos veces), manda el correo y, si falla, deja el pedido
 * como estaba para reintentar.
 */
async function claimAndNotify(
  orderId: string,
  fields: {
    tracking_number: string;
    tracking_url: string | null;
    shipping_carrier: string;
    label_url?: string | null;
    skydropx_shipment_id?: string | null;
  },
  shippingDays?: number | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: claimed, error } = await supabaseAdmin
    .from("orders")
    // Rastreo guardado + aviso = el pedido pasa de Procesando a Enviado. Solo se
    // toca un pedido que sigue en Procesando (nunca uno entregado o cancelado).
    .update({ ...fields, status: "shipped" })
    .eq("id", orderId)
    .eq("status", "processing")
    .is("tracking_number", null)
    .select(TRACKING_COLUMNS)
    .maybeSingle();
  if (error) return { ok: false, error: `No se pudo guardar el rastreo: ${error.message}` };
  if (!claimed) {
    return { ok: false, error: "El pedido ya tiene rastreo o ya no está en estado Procesando." };
  }

  const email = await sendShippedEmailFor(claimed as ShippedEmailOrder, { shippingDays });
  if (!email.sent) {
    await supabaseAdmin
      .from("orders")
      .update({
        tracking_number: null,
        tracking_url: null,
        label_url: null,
        skydropx_shipment_id: null,
        status: "processing",
      })
      .eq("id", orderId)
      .eq("tracking_number", fields.tracking_number);
    return {
      ok: false,
      error: `No se pudo enviar el correo a la clienta (${email.error ?? "error desconocido"}); no se guardó el rastreo. Intenta de nuevo.`,
    };
  }
  return { ok: true };
}

export type ShipmentSyncOutcome = {
  orderId: string;
  result: "sent" | "delivered" | "no_match" | "ambiguous" | "failed";
  detail?: string;
};

/**
 * Busca en Skydropx la guía de los pedidos sin rastreo (también las hechas a mano
 * en pro.skydropx.com) y, cuando hay UNA sola coincidencia estricta (ver
 * `shipment-match.ts`), guarda el rastreo y avisa a la clienta. Pasa `orderId`
 * para revisar solo un pedido (botón del admin); sin él revisa los recientes
 * (proceso automático).
 */
/**
 * Candado del proceso AUTOMÁTICO (tarea 147): solo toca pedidos hechos desde esta
 * fecha (inicio del 20-oct-2026, hora de CDMX). Los pedidos anteriores ya se
 * enviaron y entregaron por otro medio — a esas clientas NUNCA debe llegarles un
 * "va en camino". Para uno de esos pedidos solo se envía el aviso si la usuaria
 * lo pide a mano desde el admin (con confirmación).
 */
export const AUTO_SHIPPED_NOTICE_FROM = "2026-10-20T06:00:00.000Z";

export async function syncShipmentsForOrders(orderId?: string): Promise<ShipmentSyncOutcome[]> {
  let query = supabaseAdmin
    .from("orders")
    .select(TRACKING_COLUMNS)
    .is("tracking_number", null)
    .eq("status", "processing");
  if (orderId) {
    query = query.eq("id", orderId);
  } else {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const since = thirtyDaysAgo > AUTO_SHIPPED_NOTICE_FROM ? thirtyDaysAgo : AUTO_SHIPPED_NOTICE_FROM;
    query = query.gte("created_at", since);
  }
  const { data: pending, error } = await query;
  if (error) throw new Error(`No se pudieron cargar los pedidos pendientes: ${error.message}`);

  // Pedidos "Enviado" con guía de Skydropx, para pasarlos a "Entregado" cuando la
  // paquetería lo reporte. Mismo candado de fecha que el aviso.
  const { data: inTransit } = orderId
    ? { data: [] as { id: string; skydropx_shipment_id: string | null }[] }
    : await supabaseAdmin
        .from("orders")
        .select("id, skydropx_shipment_id")
        .eq("status", "shipped")
        .not("skydropx_shipment_id", "is", null)
        .gte("created_at", AUTO_SHIPPED_NOTICE_FROM);

  if ((!pending || pending.length === 0) && (!inTransit || inTransit.length === 0)) return [];

  const { data: assigned } = await supabaseAdmin
    .from("orders")
    .select("skydropx_shipment_id, tracking_number")
    .not("tracking_number", "is", null);
  const used = {
    shipmentIds: new Set((assigned ?? []).map((o) => o.skydropx_shipment_id).filter((v): v is string => !!v)),
    trackingNumbers: new Set((assigned ?? []).map((o) => o.tracking_number).filter((v): v is string => !!v)),
  };

  const shipments = await listRecentShipments();
  const outcomes: ShipmentSyncOutcome[] = [];

  for (const order of inTransit ?? []) {
    const shipment = shipments.find((sh) => sh.id === order.skydropx_shipment_id);
    if (shipment?.trackingStatus && /^delivered$/i.test(shipment.trackingStatus)) {
      const { error: upErr } = await supabaseAdmin
        .from("orders")
        .update({ status: "delivered" })
        .eq("id", order.id)
        .eq("status", "shipped");
      outcomes.push(
        upErr
          ? { orderId: order.id, result: "failed", detail: upErr.message }
          : { orderId: order.id, result: "delivered" },
      );
    }
  }

  for (const order of (pending ?? []) as ShippedEmailOrder[]) {
    const addr = order.shipping_address as AdminOrderShippingAddress | null;
    const match = matchShipmentToOrder(
      {
        customerName: addr?.name || order.customer_name,
        email: addr?.email || order.customer_email,
        phone: addr?.phone || order.customer_phone,
        postalCode: addr?.postalCode ?? null,
        createdAt: order.created_at,
      },
      shipments,
      used,
    );

    if (match.kind === "none") {
      outcomes.push({ orderId: order.id, result: "no_match" });
      continue;
    }
    if (match.kind === "ambiguous") {
      outcomes.push({
        orderId: order.id,
        result: "ambiguous",
        detail: `${match.count} guías podrían ser de este pedido; resuélvelo a mano.`,
      });
      continue;
    }

    const s = match.shipment;
    const carrier = [s.carrierName, s.serviceName].filter(Boolean).join(" ") || order.shipping_carrier || "Paquetería";
    const done = await claimAndNotify(
      order.id,
      {
        tracking_number: s.trackingNumber!,
        tracking_url: s.trackingUrl,
        label_url: s.labelUrl,
        skydropx_shipment_id: s.id,
        shipping_carrier: carrier,
      },
      s.estimatedDays ?? order.shipping_days,
    );
    if (done.ok) {
      used.shipmentIds.add(s.id);
      used.trackingNumbers.add(s.trackingNumber!);
      outcomes.push({ orderId: order.id, result: "sent" });
    } else {
      outcomes.push({ orderId: order.id, result: "failed", detail: done.error });
    }
  }
  return outcomes;
}
