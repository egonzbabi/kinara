import { supabaseAdmin } from "./supabase.server";

export type InventoryCount = {
  productId: string;
  colorName: string;
  size: "S" | "M" | "L" | "XL";
  systemStock: number;
  countedStock: number;
  countedAt: string;
  updatedAt: string;
};

export type InventoryCountInput = {
  productId: string;
  colorName: string;
  size: "S" | "M" | "L" | "XL";
  systemStock: number;
  countedStock: number;
};

/** Todos los conteos físicos guardados hasta ahora, uno por combinación
 * producto+color+talla (el conteo más reciente pisa al anterior — no se
 * guarda historial, ver tarea 075). */
export async function listInventoryCounts(): Promise<InventoryCount[]> {
  const { data, error } = await supabaseAdmin.from("inventory_counts").select("*");
  if (error) throw new Error(`No se pudo cargar el conteo físico: ${error.message}`);

  return data.map((row) => ({
    productId: row.product_id,
    colorName: row.color_name,
    size: row.size,
    systemStock: row.system_stock,
    countedStock: row.counted_stock,
    countedAt: row.counted_at,
    updatedAt: row.updated_at,
  }));
}

/** Guarda (crea o pisa) varios conteos de una vez — un upsert por
 * producto+color+talla. `systemStock` se guarda tal cual estaba el stock del
 * sistema al momento de capturar el conteo, para que la diferencia mostrada
 * después siga siendo la correcta aunque el stock del sistema cambie luego
 * (ventas, movimientos) antes de que el admin revise el resultado. */
export async function saveInventoryCounts(inputs: InventoryCountInput[]): Promise<void> {
  if (inputs.length === 0) return;
  const { error } = await supabaseAdmin.from("inventory_counts").upsert(
    inputs.map((i) => ({
      product_id: i.productId,
      color_name: i.colorName,
      size: i.size,
      system_stock: i.systemStock,
      counted_stock: i.countedStock,
      counted_at: new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "product_id,color_name,size" },
  );
  if (error) throw new Error(`No se pudo guardar el conteo: ${error.message}`);
}

/** Borra todos los conteos guardados — para empezar un conteo físico nuevo
 * desde cero (ver botón "Empezar de nuevo" en la pantalla). */
export async function clearInventoryCounts(): Promise<void> {
  const { error } = await supabaseAdmin
    .from("inventory_counts")
    .delete()
    .not("id", "is", null);
  if (error) throw new Error(`No se pudo borrar el conteo: ${error.message}`);
}
