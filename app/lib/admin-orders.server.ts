import { supabaseAdmin } from "./supabase.server";
import { purchaseShipment } from "./skydropx.server";
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
  stripeSessionId: string;
  discountCode: string | null;
  createdAt: string;
};

const ORDER_SELECT =
  "id, customer_name, customer_email, customer_phone, items, subtotal, shipping_fee, total, currency, status, shipping_address, shipping_carrier, shipping_days, shipping_provider_name, shipping_service_code, skydropx_shipment_id, tracking_number, tracking_url, label_url, stripe_session_id, discount_code, created_at";

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
export async function buyShippingLabel(orderId: string): Promise<void> {
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
    })
    .eq("id", orderId);
  if (updateError) {
    throw new Error(`La guía se compró pero no se pudo guardar en el pedido: ${updateError.message}`);
  }
}
