import ExcelJS from "exceljs";
import type { InventoryRow } from "./admin-catalog.server";
import { baseSkuFrom } from "./slug";

/** SKU original del grupo — el primer SKU disponible del producto, sin -COLOR-TALLA. */
function baseSku(rows: InventoryRow[]): string {
  const withSku = rows.find((r) => r.sku);
  return withSku?.sku ? baseSkuFrom(withSku.sku) : "";
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
    { header: "Foto", key: "foto", width: 26 },
    { header: "SKU original", key: "skuOriginal", width: 16 },
    { header: "Producto", key: "producto", width: 28 },
    { header: "Nombre original", key: "nombreOriginal", width: 20 },
    { header: "Tipo", key: "tipo", width: 14 },
    { header: "Precio", key: "precio", width: 12 },
    { header: "Color", key: "color", width: 14 },
    { header: "Talla", key: "talla", width: 8 },
    { header: "SKU", key: "sku", width: 20 },
    { header: "Stock", key: "stock", width: 10 },
    { header: "Valor (stock × precio)", key: "valor", width: 18 },
    { header: "Estado", key: "estado", width: 12 },
  ];
  sheet.getRow(1).font = { bold: true };

  const groups = groupByProduct(rows);

  // Se busca la foto de cada producto en paralelo antes de armar las filas
  // (una sola por producto, no una por SKU — así el fetch no crece con el
  // número de colores/tallas).
  const photos = await Promise.all(groups.map((group) => fetchImage(group[0].photoUrl)));

  const ROW_HEIGHT = 30;
  // Columnas que se combinan en un solo cuadro por producto — igual en cada
  // renglón (a diferencia de Color/Talla/SKU/Stock/Valor, que sí cambian).
  const MERGE_COLUMNS = ["A", "B", "C", "D", "E", "F", "L"] as const;
  const middleCenter = { vertical: "middle" as const, horizontal: "center" as const };
  const middleLeft = { vertical: "middle" as const, horizontal: "left" as const };

  let currentRow = 2;
  let totalValue = 0;
  groups.forEach((group, i) => {
    const startRow = currentRow;
    // Dentro de cada producto, las filas de un mismo color (una por talla)
    // también se combinan en un solo cuadro en la columna Color.
    let colorStart = currentRow;
    for (const [idx, r] of group.entries()) {
      const value = (r.price ?? 0) * r.stock;
      totalValue += value;
      sheet.addRow({
        skuOriginal: "",
        producto: "",
        nombreOriginal: "",
        tipo: "",
        precio: "",
        color: idx === 0 || r.colorName !== group[idx - 1].colorName ? r.colorName : "",
        talla: r.size,
        sku: r.sku ?? "",
        stock: r.stock,
        valor: value,
        estado: "",
      });
      sheet.getRow(currentRow).height = ROW_HEIGHT;

      const isLastOfColor = idx === group.length - 1 || group[idx + 1].colorName !== r.colorName;
      if (isLastOfColor) {
        if (currentRow > colorStart) sheet.mergeCells(`G${colorStart}:G${currentRow}`);
        sheet.getCell(`G${colorStart}`).alignment = middleCenter;
        colorStart = currentRow + 1;
      }
      currentRow++;
    }
    const endRow = currentRow - 1;
    const first = group[0];

    if (endRow > startRow) {
      for (const col of MERGE_COLUMNS) sheet.mergeCells(`${col}${startRow}:${col}${endRow}`);
    }

    sheet.getCell(`B${startRow}`).value = baseSku(group);
    sheet.getCell(`B${startRow}`).alignment = middleCenter;
    sheet.getCell(`C${startRow}`).value = first.productName;
    sheet.getCell(`C${startRow}`).alignment = middleLeft;
    // "Nombre original" = el slug (campo URL) del producto — a veces conserva
    // el nombre anterior si el producto se renombró (ver tarea 042).
    sheet.getCell(`D${startRow}`).value = first.productSlug;
    sheet.getCell(`D${startRow}`).alignment = middleLeft;
    sheet.getCell(`E${startRow}`).value = first.kind;
    sheet.getCell(`E${startRow}`).alignment = middleCenter;
    sheet.getCell(`F${startRow}`).value = first.price ?? "";
    sheet.getCell(`F${startRow}`).alignment = middleCenter;
    // "Publicado" = el producto está visible y a la venta en /tienda;
    // "Borrador" = todavía no (normalmente porque le falta precio).
    sheet.getCell(`L${startRow}`).value = first.isDraft ? "Borrador" : "Publicado";
    sheet.getCell(`L${startRow}`).alignment = middleCenter;

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

  const totalRow = sheet.addRow({ producto: "Valor total del inventario", valor: totalValue });
  totalRow.font = { bold: true };

  return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
}
