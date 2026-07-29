import { supabaseAdmin } from "./supabase.server";
import type { OrderItem } from "./orders.server";

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
  stripeSessionId: string;
  createdAt: string;
};

export async function listAdminOrders(): Promise<AdminOrderListItem[]> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id, customer_name, customer_email, customer_phone, items, subtotal, shipping_fee, total, currency, status, shipping_address, shipping_carrier, shipping_days, stripe_session_id, created_at",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar los pedidos: ${error.message}`);

  return (data ?? []).map((o) => ({
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
    stripeSessionId: o.stripe_session_id,
    createdAt: o.created_at,
  }));
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { error } = await supabaseAdmin.from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(`No se pudo actualizar el estado del pedido: ${error.message}`);
}
