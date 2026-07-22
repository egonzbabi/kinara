import type Stripe from "stripe";
import { supabaseAdmin } from "./supabase.server";

export interface OrderItem {
  productId: string;
  productName: string;
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

async function decrementStockForItems(items: OrderItem[]) {
  for (const item of items) {
    const { data: variant, error } = await supabaseAdmin
      .from("product_variants")
      .select("id")
      .eq("product_id", item.productId)
      .eq("color_name", item.colorName ?? "")
      .eq("size", item.size as "S" | "M" | "L" | "XL")
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
    stripe_session_id: session.id,
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

  return { orderId, created: true };
}
