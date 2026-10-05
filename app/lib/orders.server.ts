import type Stripe from "stripe";
import { supabaseAdmin } from "./supabase.server";
import { sendOrderConfirmationEmail, sendOwnerAlert } from "./resend.server";
import { markDiscountCodeUsed } from "./discount-signups.server";
import type { ProductSize } from "./catalog-constants";
import { formatPrice } from "./formatPrice";

export interface OrderItem {
  productId: string;
  productName: string;
  modelo: string | null;
  colorName: string | null;
  size: string;
  quantity: number;
  price: number;
}

// Stripe limita cada valor de metadata a 500 caracteres. El JSON de items puede
// superarlo con carritos grandes, así que se parte en `items_json_0`, `items_json_1`, ...
const METADATA_CHUNK_SIZE = 450;

export function chunkMetadata(prefix: string, value: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (value.length <= METADATA_CHUNK_SIZE) {
    out[`${prefix}_0`] = value;
    return out;
  }
  for (let i = 0, idx = 0; i < value.length; i += METADATA_CHUNK_SIZE, idx++) {
    out[`${prefix}_${idx}`] = value.slice(i, i + METADATA_CHUNK_SIZE);
  }
  return out;
}

function joinChunkedMetadata(
  metadata: Record<string, string> | null | undefined,
  prefix: string,
): string {
  if (!metadata) return "[]";
  const chunks: string[] = [];
  for (let i = 0; ; i++) {
    const chunk = metadata[`${prefix}_${i}`];
    if (chunk === undefined) break;
    chunks.push(chunk);
  }
  return chunks.length > 0 ? chunks.join("") : "[]";
}

function safeParseItems(metadata: Record<string, string> | null | undefined): OrderItem[] {
  try {
    const parsed = JSON.parse(joinChunkedMetadata(metadata, "items_json"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface StoredShippingAddress {
  name: string;
  email: string;
  phone: string;
  street1: string;
  postalCode: string;
  areaLevel1: string;
  areaLevel2: string;
  areaLevel3: string;
}

function safeParseShippingAddress(
  metadata: Record<string, string> | null | undefined,
): StoredShippingAddress | null {
  try {
    const parsed = JSON.parse(joinChunkedMetadata(metadata, "shipping_address_json"));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23505";
}

/**
 * Restaura stock vía `register_inventory_movement` (tipo "entrada"), no un
 * incremento directo — así un reembolso también deja rastro en
 * `inventory_movements`, igual que cualquier otro ajuste manual de stock
 * (ver tarea 064/075). Nunca lanza: un reembolso ya es un evento fuera del
 * control del checkout, un fallo aquí solo se registra, no debe tumbar el
 * webhook.
 */
async function restoreStockForItems(items: OrderItem[], concept: string) {
  const today = new Date().toISOString().slice(0, 10);
  for (const item of items) {
    const { error } = await supabaseAdmin.rpc("register_inventory_movement", {
      p_product_id: item.productId,
      p_color_name: item.colorName ?? "",
      p_size: item.size,
      p_type: "entrada",
      p_quantity: item.quantity,
      p_concept: concept,
      p_movement_date: today,
      p_admin_id: null,
      p_admin_name: "Sistema (reembolso Stripe)",
    });
    if (error) {
      console.error(
        `[orders] falló la restauración de stock (${item.productId}/${item.colorName}/${item.size}):`,
        error,
      );
    }
  }
}

/**
 * Cancela el pedido y restaura el stock de sus artículos — llamado desde el
 * webhook de Stripe o de PayPal ante un reembolso total. Idempotente: si el
 * pedido ya estaba cancelado (el webhook puede reintentar/duplicarse), no
 * vuelve a restaurar stock una segunda vez.
 */
export async function cancelOrderAndRestoreStock(
  lookup: { stripeSessionId: string } | { paypalOrderId: string },
): Promise<{ orderId: string; alreadyCancelled: boolean } | null> {
  const column = "stripeSessionId" in lookup ? "stripe_session_id" : "paypal_order_id";
  const value = "stripeSessionId" in lookup ? lookup.stripeSessionId : lookup.paypalOrderId;
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("id, items, status")
    .eq(column, value)
    .maybeSingle();
  // Un error de verdad (DB caída, timeout) debe propagarse para que el
  // webhook responda 500 y Stripe reintente — nunca tratarlo igual que
  // "no existe esa orden" (eso sí es un 200 legítimo, sin reintento).
  if (error) throw error;
  if (!order) return null;
  if (order.status === "cancelled") return { orderId: order.id, alreadyCancelled: true };

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", order.id);
  if (updateError) throw updateError;

  const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : [];
  await restoreStockForItems(items, `Reembolso total del pedido ${order.id}`);

  return { orderId: order.id, alreadyCancelled: false };
}

export interface PendingCheckoutAddress {
  name: string;
  email: string;
  phone: string;
  street1: string;
  postalCode: string;
  areaLevel1: string;
  areaLevel2: string;
  areaLevel3: string;
}

export interface PendingCheckoutPayload {
  items: OrderItem[];
  address: PendingCheckoutAddress;
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingCarrier: string;
  shippingDays: number | null;
  shippingProviderName: string | null;
  shippingServiceCode: string | null;
  discountCode: string | null;
}

/**
 * Guarda el snapshot del carrito ya validado server-side mientras el
 * comprador aprueba el pago en PayPal (ver checkout-validation.server.ts) —
 * equivalente a lo que para Stripe viaja en la metadata de la Checkout
 * Session. Se referencia desde PayPal vía `purchase_units[0].custom_id`.
 */
export async function createPendingCheckout(payload: PendingCheckoutPayload): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("pending_checkouts")
    .insert({ payload })
    .select("id")
    .single();
  if (error || !data) {
    console.error("[orders] no se pudo guardar pending_checkout:", error);
    return null;
  }
  return data.id as string;
}

/**
 * Crea el pedido a partir de una captura de pago de PayPal ya completada
 * (`status: "COMPLETED"`), si todavía no existe. Mismo patrón de
 * deduplicación que `ensureOrderFromCheckoutSession`: índice único en
 * `orders.paypal_order_id` + check-antes-de-insertar + catch de la violación
 * de unicidad — el webhook y la llamada de captura desde el navegador pueden
 * llegar casi al mismo tiempo.
 */
export async function ensureOrderFromPaypalCapture(params: {
  captureId: string;
  pendingCheckoutId: string;
}): Promise<{ orderId: string; created: boolean } | null> {
  const { data: existing } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("paypal_order_id", params.captureId)
    .maybeSingle();
  if (existing) return { orderId: existing.id, created: false };

  const { data: pending, error: pendingError } = await supabaseAdmin
    .from("pending_checkouts")
    .select("payload")
    .eq("id", params.pendingCheckoutId)
    .maybeSingle();
  if (pendingError || !pending) {
    console.error(
      `[orders] no se encontró pending_checkout ${params.pendingCheckoutId} para la captura de PayPal ${params.captureId}:`,
      pendingError,
    );
    return null;
  }

  const payload = pending.payload as PendingCheckoutPayload;
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

  const { error: insertError } = await supabaseAdmin.from("orders").insert({
    id: orderId,
    customer_name: payload.address.name,
    customer_email: payload.address.email,
    customer_phone: payload.address.phone || null,
    items: payload.items,
    subtotal: payload.subtotal,
    shipping_fee: payload.shippingFee,
    total: payload.total,
    currency: "mxn",
    status: "processing",
    shipping_address: payload.address,
    shipping_carrier: payload.shippingCarrier,
    shipping_days: payload.shippingDays,
    shipping_provider_name: payload.shippingProviderName,
    shipping_service_code: payload.shippingServiceCode,
    skydropx_shipment_id: null,
    tracking_number: null,
    tracking_url: null,
    label_url: null,
    stripe_session_id: null,
    payment_provider: "paypal",
    paypal_order_id: params.captureId,
    discount_code: payload.discountCode,
  });

  if (insertError) {
    if (isUniqueViolation(insertError)) {
      const { data: winner } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("paypal_order_id", params.captureId)
        .maybeSingle();
      if (winner) return { orderId: winner.id, created: false };
    }
    console.error("[orders] no se pudo crear la orden (paypal):", insertError);
    return null;
  }

  await decrementStockForItems(payload.items);

  if (payload.discountCode) {
    await markDiscountCodeUsed(payload.discountCode);
  }

  const emailResult = await sendOrderConfirmationEmail({
    orderId,
    customerName: payload.address.name,
    customerEmail: payload.address.email,
    items: payload.items,
    subtotal: payload.subtotal,
    shippingFee: payload.shippingFee,
    total: payload.total,
    discountCode: payload.discountCode,
    shippingAddress: {
      street1: payload.address.street1,
      postalCode: payload.address.postalCode,
      areaLevel1: payload.address.areaLevel1,
      areaLevel2: payload.address.areaLevel2,
      areaLevel3: payload.address.areaLevel3,
    },
    shippingCarrier: payload.shippingCarrier,
    shippingDays: payload.shippingDays,
  });
  if (!emailResult.sent) {
    console.error(`[orders] correo de confirmación no enviado para ${orderId}:`, emailResult.error);
  }

  const itemsSummary = payload.items
    .map((i) => `${i.quantity}x ${i.productName} (${i.colorName}, ${i.size})`)
    .join(", ");
  await sendOwnerAlert({
    subject: `🛍️ Pedido nuevo (PayPal) — ${orderId} — ${formatPrice(payload.total)}`,
    text: `${payload.address.name} (${payload.address.email}) acaba de comprar con PayPal:\n\n${itemsSummary}\n\nSubtotal: ${formatPrice(payload.subtotal)}\nEnvío: ${formatPrice(payload.shippingFee)}\nTotal: ${formatPrice(payload.total)}\n\nPedido: ${orderId}`,
  });

  return { orderId, created: true };
}

async function decrementStockForItems(items: OrderItem[]) {
  for (const item of items) {
    const { data: variant, error } = await supabaseAdmin
      .from("product_variants")
      .select("id")
      .eq("product_id", item.productId)
      .eq("color_name", item.colorName ?? "")
      .eq("size", item.size as ProductSize)
      .maybeSingle();

    if (error || !variant) {
      console.error(
        `[orders] no se encontró la variante para decrementar stock: producto=${item.productId} color=${item.colorName} talla=${item.size}`,
        error,
      );
      continue;
    }

    const { error: rpcError } = await supabaseAdmin.rpc("decrement_variant_stock", {
      p_variant_id: variant.id,
      p_qty: item.quantity,
    });
    if (rpcError) {
      console.error(`[orders] falló el decremento de stock de la variante ${variant.id}:`, rpcError);
    }
  }
}

/**
 * Crea la orden a partir de una Checkout Session pagada, si todavía no existe.
 *
 * El índice único en `orders.stripe_session_id` es el mecanismo atómico que evita
 * duplicados: el webhook y el fallback del loader de `/checkout/success` pueden
 * llamar a esta función casi al mismo tiempo (la carrera se resuelve en el INSERT,
 * no antes) — solo quien gane el insert decrementa stock.
 */
export async function ensureOrderFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<{ orderId: string; created: boolean } | null> {
  if (session.payment_status !== "paid") return null;

  const { data: existing } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();
  if (existing) return { orderId: existing.id, created: false };

  const items = safeParseItems(session.metadata);
  const subtotal = Number(session.metadata?.subtotal ?? 0);
  const shippingFee = Number(session.metadata?.shipping_fee ?? 0);
  const total = (session.amount_total ?? 0) / 100;
  const currency = session.currency ?? "mxn";

  const shippingAddress = safeParseShippingAddress(session.metadata);
  const customerName = shippingAddress?.name ?? session.customer_details?.name ?? "Sin nombre";
  const customerEmail = shippingAddress?.email ?? session.customer_details?.email ?? "";
  const customerPhone = shippingAddress?.phone ?? session.customer_details?.phone ?? null;
  const shippingCarrier = session.metadata?.shipping_carrier || null;
  const shippingDaysRaw = session.metadata?.shipping_days;
  const shippingDays = shippingDaysRaw ? Number(shippingDaysRaw) : null;
  const shippingProviderName = session.metadata?.shipping_provider_name || null;
  const shippingServiceCode = session.metadata?.shipping_service_code || null;
  const discountCode = session.metadata?.discount_code || null;

  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

  const { error: insertError } = await supabaseAdmin.from("orders").insert({
    id: orderId,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    items,
    subtotal,
    shipping_fee: shippingFee,
    total,
    currency,
    status: "processing",
    shipping_address: shippingAddress ?? {},
    shipping_carrier: shippingCarrier,
    shipping_days: shippingDays,
    shipping_provider_name: shippingProviderName,
    shipping_service_code: shippingServiceCode,
    skydropx_shipment_id: null,
    tracking_number: null,
    tracking_url: null,
    label_url: null,
    stripe_session_id: session.id,
    payment_provider: "stripe",
    paypal_order_id: null,
    discount_code: discountCode,
  });

  if (insertError) {
    if (isUniqueViolation(insertError)) {
      const { data: winner } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("stripe_session_id", session.id)
        .maybeSingle();
      if (winner) return { orderId: winner.id, created: false };
    }
    console.error("[orders] no se pudo crear la orden:", insertError);
    return null;
  }

  await decrementStockForItems(items);

  if (discountCode) {
    await markDiscountCodeUsed(discountCode);
  }

  // Nunca bloquea la creación de la orden: si Resend no está configurado o
  // el envío falla, solo se registra — el pedido ya está creado y pagado.
  const emailResult = await sendOrderConfirmationEmail({
    orderId,
    customerName,
    customerEmail,
    items,
    subtotal,
    shippingFee,
    total,
    discountCode,
    shippingAddress: shippingAddress
      ? {
          street1: shippingAddress.street1,
          postalCode: shippingAddress.postalCode,
          areaLevel1: shippingAddress.areaLevel1,
          areaLevel2: shippingAddress.areaLevel2,
          areaLevel3: shippingAddress.areaLevel3,
        }
      : null,
    shippingCarrier,
    shippingDays,
  });
  if (!emailResult.sent) {
    console.error(`[orders] correo de confirmación no enviado para ${orderId}:`, emailResult.error);
  }

  const itemsSummary = items
    .map((i) => `${i.quantity}x ${i.productName} (${i.colorName}, ${i.size})`)
    .join(", ");
  await sendOwnerAlert({
    subject: `🛍️ Pedido nuevo — ${orderId} — ${formatPrice(total)}`,
    text: `${customerName} (${customerEmail}) acaba de comprar:\n\n${itemsSummary}\n\nSubtotal: ${formatPrice(subtotal)}\nEnvío: ${formatPrice(shippingFee)}\nTotal: ${formatPrice(total)}\n\nPedido: ${orderId}`,
  });

  return { orderId, created: true };
}
