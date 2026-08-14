import ExcelJS from "exceljs";
import type { InventoryRow } from "./admin-catalog.server";

/**
 * Deriva el "SKU original" (código base, antes de -COLOR-TALLA) a partir del
 * primer SKU disponible del producto — misma regla ya usada en
 * ProductForm.tsx (`guessModeloBase`), nunca se guardó por separado.
 */
function baseSku(rows: InventoryRow[]): string {
  const withSku = rows.find((r) => r.sku);
  if (!withSku?.sku) return "";
  return withSku.sku.split("-").slice(0, -2).join("-");
}

type ImageExtension = ExcelJS.Image["extension"];

const SUPPORTED_IMAGE_TYPES: Record<string, ImageExtension> = {
  "image/jpeg": "jpeg",
  "image/jpg": "jpeg",
  "image/png": "png",
  "image/gif": "gif",
};

async function fetchImage(url: string): Promise<{ buffer: Buffer; extension: ImageExtension } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ?? "";
    const extension = SUPPORTED_IMAGE_TYPES[contentType];
    // Excel (vía exceljs) solo soporta jpeg/png/gif — si la foto es webp u otro
    // formato, se omite la imagen para ese producto en vez de romper todo el archivo.
    if (!extension) return null;
    const buffer = Buffer.from(await res.arrayBuffer()) as Buffer;
    return { buffer, extension };
  } catch {
    return null;
  }
}

function groupByProduct(rows: InventoryRow[]): InventoryRow[][] {
  const groups: InventoryRow[][] = [];
  let current: InventoryRow[] = [];
  for (const row of rows) {
    if (current.length > 0 && current[0].productId !== row.productId) {
      groups.push(current);
      current = [];
    }
    current.push(row);
  }
  if (current.length > 0) groups.push(current);
  return groups;
}

export async function buildInventoryExcel(rows: InventoryRow[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "KINARA Admin";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Inventario", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Foto", key: "foto", width: 14 },
    { header: "SKU original", key: "skuOriginal", width: 16 },
    { header: "Producto", key: "producto", width: 28 },
    { header: "Tipo", key: "tipo", width: 14 },
    { header: "Color", key: "color", width: 14 },
    { header: "Talla", key: "talla", width: 8 },
    { header: "SKU", key: "sku", width: 20 },
    { header: "Stock", key: "stock", width: 10 },
    { header: "Precio", key: "precio", width: 12 },
    { header: "Estado", key: "estado", width: 12 },
  ];
  sheet.getRow(1).font = { bold: true };

  const groups = groupByProduct(rows);

  // Se busca la foto de cada producto en paralelo antes de armar las filas
  // (una sola por producto, no una por SKU — así el fetch no crece con el
  // número de colores/tallas).
  const photos = await Promise.all(groups.map((group) => fetchImage(group[0].photoUrl)));

  let currentRow = 2;
  groups.forEach((group, i) => {
    const startRow = currentRow;
    for (const r of group) {
      sheet.addRow({
        skuOriginal: "",
        producto: r.productName,
        tipo: r.kind,
        color: r.colorName,
        talla: r.size,
        sku: r.sku ?? "",
        stock: r.stock,
        precio: r.price ?? "",
        estado: r.isDraft ? "Borrador" : "Publicado",
      });
      sheet.getRow(currentRow).height = 60;
      currentRow++;
    }
    const endRow = currentRow - 1;

    if (endRow > startRow) {
      sheet.mergeCells(`A${startRow}:A${endRow}`);
      sheet.mergeCells(`B${startRow}:B${endRow}`);
    }
    const skuCell = sheet.getCell(`B${startRow}`);
    skuCell.value = baseSku(group);
    skuCell.alignment = { vertical: "middle", horizontal: "center" };

    const photo = photos[i];
    if (photo) {
      // Los tipos de exceljs y el `Buffer` genérico de @types/node más reciente
      // no coinciden estructuralmente (friccion conocida entre versiones) —
      // el buffer es válido en runtime, solo se relaja el tipo aquí.
      const imageId = workbook.addImage({
        buffer: photo.buffer,
        extension: photo.extension,
      } as unknown as ExcelJS.Image);
      sheet.addImage(imageId, `A${startRow}:A${endRow}`);
    }
  });

  return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
}
