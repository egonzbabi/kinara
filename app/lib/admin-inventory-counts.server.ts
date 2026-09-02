import ExcelJS from "exceljs";
import { supabaseAdmin } from "./supabase.server";
import type { ProductSize } from "./catalog-constants";

export type InventoryCount = {
  productId: string;
  colorName: string;
  size: ProductSize;
  systemStock: number;
  countedStock: number;
  countedAt: string;
  updatedAt: string;
};

export type InventoryCountInput = {
  productId: string;
  colorName: string;
  size: ProductSize;
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

export type InventoryCountDiff = {
  productName: string;
  productSlug: string;
  colorName: string;
  size: ProductSize;
  sku: string;
  systemStock: number;
  countedStock: number;
  difference: number;
};

/** Solo las casillas del conteo guardado cuyo número contado NO coincide con
 * el stock ACTUAL del sistema (no con la foto que se guardó al momento de
 * contar — el stock pudo moverse desde entonces por ventas/movimientos, así
 * que se compara siempre contra lo más reciente). Usado tanto por la pantalla
 * como por el Excel descargable (tarea 080). */
export async function getInventoryCountDiffs(): Promise<InventoryCountDiff[]> {
  const { data: counts, error: countsError } = await supabaseAdmin.from("inventory_counts").select("*");
  if (countsError) throw new Error(`No se pudo cargar el conteo físico: ${countsError.message}`);

  const { data: products, error: productsError } = await supabaseAdmin
    .from("products")
    .select("id, name, slug");
  if (productsError) throw new Error(`No se pudieron cargar los productos: ${productsError.message}`);
  const productById = new Map((products ?? []).map((p) => [p.id, p]));

  const { data: variants, error: variantsError } = await supabaseAdmin
    .from("product_variants")
    .select("product_id, color_name, size, stock, modelo");
  if (variantsError) throw new Error(`No se pudieron cargar las variantes: ${variantsError.message}`);
  const variantByKey = new Map(
    (variants ?? []).map((v) => [`${v.product_id}|${v.color_name}|${v.size}`, v]),
  );

  const diffs: InventoryCountDiff[] = [];
  for (const c of counts ?? []) {
    const variant = variantByKey.get(`${c.product_id}|${c.color_name}|${c.size}`);
    const systemStock = variant?.stock ?? 0;
    if (systemStock === c.counted_stock) continue;
    const product = productById.get(c.product_id);
    diffs.push({
      productName: product?.name ?? "(producto eliminado)",
      productSlug: product?.slug ?? "",
      colorName: c.color_name,
      size: c.size,
      sku: variant?.modelo ?? "(sin SKU)",
      systemStock,
      countedStock: c.counted_stock,
      difference: c.counted_stock - systemStock,
    });
  }
  diffs.sort(
    (a, b) => a.productName.localeCompare(b.productName) || a.colorName.localeCompare(b.colorName),
  );
  return diffs;
}

/** Excel descargable con las diferencias del conteo físico — mismo dato que
 * muestra la pantalla, para poder revisarlo fuera del navegador o mandarlo. */
export async function buildInventoryCountDiffExcel(diffs: InventoryCountDiff[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet("Diferencias");
  sheet.columns = [
    { header: "Producto", key: "producto", width: 24 },
    { header: "Nombre original", key: "nombreOriginal", width: 24 },
    { header: "Color", key: "color", width: 16 },
    { header: "Talla", key: "talla", width: 8 },
    { header: "SKU", key: "sku", width: 24 },
    { header: "Sistema", key: "sistema", width: 10 },
    { header: "Contado", key: "contado", width: 10 },
    { header: "Diferencia", key: "diferencia", width: 12 },
  ];
  sheet.getRow(1).font = { bold: true };
  for (const d of diffs) {
    const row = sheet.addRow({
      producto: d.productName,
      nombreOriginal: d.productSlug,
      color: d.colorName,
      talla: d.size,
      sku: d.sku,
      sistema: d.systemStock,
      contado: d.countedStock,
      diferencia: d.difference,
    });
    row.getCell("diferencia").font = {
      bold: true,
      color: { argb: d.difference > 0 ? "FF2E7D32" : "FFC62828" },
    };
  }
  sheet.autoFilter = { from: "A1", to: "H1" };
  return Buffer.from(await wb.xlsx.writeBuffer());
}
