import { supabaseAdmin } from "./supabase.server";
import type { OrderItem } from "./orders.server";

export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

export type AdminOrderListItem = {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
};

export async function listAdminOrders(): Promise<AdminOrderListItem[]> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, customer_name, customer_email, items, total, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar los pedidos: ${error.message}`);

  return (data ?? []).map((o) => ({
    id: o.id,
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    items: (o.items as OrderItem[] | null) ?? [],
    total: o.total,
    status: o.status,
    createdAt: o.created_at,
  }));
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { error } = await supabaseAdmin.from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(`No se pudo actualizar el estado del pedido: ${error.message}`);
}
