import { supabaseAdmin } from "./supabase.server";

export type MovementType = "entrada" | "salida";

export type InventoryMovementInput = {
  productId: string;
  colorName: string;
  size: "S" | "M" | "L" | "XL";
  type: MovementType;
  quantity: number;
  concept: string;
  /** YYYY-MM-DD, la fecha que digita quien registra el movimiento. */
  movementDate: string;
  adminId: string | null;
  adminName: string;
};

export type InventoryMovement = {
  id: string;
  productId: string;
  productName: string;
  colorName: string;
  size: "S" | "M" | "L" | "XL";
  type: MovementType;
  quantity: number;
  concept: string;
  /** Fecha digitada por el admin (el día al que corresponde el movimiento). */
  movementDate: string;
  resultingStock: number;
  adminName: string;
  /** Fecha/hora real en que quedó registrado (reloj del servidor, no editable). */
  createdAt: string;
};

export async function listInventoryMovements(): Promise<InventoryMovement[]> {
  const { data, error } = await supabaseAdmin
    .from("inventory_movements")
    .select("*, products(name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudo cargar el historial de movimientos: ${error.message}`);

  return (data as unknown as Array<{
    id: string;
    product_id: string;
    color_name: string;
    size: "S" | "M" | "L" | "XL";
    type: MovementType;
    quantity: number;
    concept: string;
    movement_date: string;
    resulting_stock: number;
    admin_name: string;
    created_at: string;
    products: { name: string } | null;
  }>).map((row) => ({
    id: row.id,
    productId: row.product_id,
    productName: row.products?.name ?? "(producto eliminado)",
    colorName: row.color_name,
    size: row.size,
    type: row.type,
    quantity: row.quantity,
    concept: row.concept,
    movementDate: row.movement_date,
    resultingStock: row.resulting_stock,
    adminName: row.admin_name,
    createdAt: row.created_at,
  }));
}

/** Ajusta el stock de la variante y registra el movimiento en una sola transacción
 * (RPC `register_inventory_movement`, mismo patrón atómico que el checkout). Devuelve
 * el stock resultante para mostrarlo de inmediato en la confirmación. */
export async function createInventoryMovement(input: InventoryMovementInput): Promise<number> {
  const { data, error } = await supabaseAdmin
    .rpc("register_inventory_movement", {
      p_product_id: input.productId,
      p_color_name: input.colorName,
      p_size: input.size,
      p_type: input.type,
      p_quantity: input.quantity,
      p_concept: input.concept,
      p_movement_date: input.movementDate,
      p_admin_id: input.adminId,
      p_admin_name: input.adminName,
    })
    .single();
  if (error) throw new Error(error.message);
  return (data as { resulting_stock: number }).resulting_stock;
}
