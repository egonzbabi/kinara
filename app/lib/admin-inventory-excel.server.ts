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

// Ancho de columna Excel ≈ caracteres + relleno, acotado a un mínimo/máximo
// por columna para que ninguna quede ilegible ni desmedida.
const COLUMN_BOUNDS = {
  skuOriginal: [10, 18],
  producto: [12, 30],
  nombreOriginal: [12, 26],
  tipo: [8, 16],
  precio: [8, 12],
  color: [8, 18],
  talla: [7, 8],
  sku: [12, 22],
  stock: [7, 9],
  valor: [10, 24],
  estado: [9, 12],
} as const;

const HEADERS: Record<keyof typeof COLUMN_BOUNDS, string> = {
  skuOriginal: "SKU original",
  producto: "Producto",
  nombreOriginal: "Nombre original",
  tipo: "Tipo",
  precio: "Precio",
  color: "Color",
  talla: "Talla",
  sku: "SKU",
  stock: "Stock",
  valor: "Valor (stock × precio)",
  estado: "Estado",
};

const FOTO_COLUMN_WIDTH = 13; // fija — la foto no tiene texto que medir, se pidió que fuera más chica

export async function buildInventoryExcel(rows: InventoryRow[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "KINARA Admin";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Inventario", {
    views: [{ state: "frozen", ySplit: 3 }],
  });

  const columnKeys = ["foto", ...Object.keys(HEADERS)] as ("foto" | keyof typeof COLUMN_BOUNDS)[];
  sheet.columns = columnKeys.map((key) => ({ key, width: key === "foto" ? FOTO_COLUMN_WIDTH : 10 }));

  // Precio y Valor como moneda con 2 decimales fijos (ej. "$390.00").
  const CURRENCY_FORMAT = '"$"#,##0.00';
  sheet.getColumn("precio").numFmt = CURRENCY_FORMAT;
  sheet.getColumn("valor").numFmt = CURRENCY_FORMAT;

  // Impresión: horizontal, que quepa en el ancho de una página (el alto
  // queda libre — con cientos de filas no cabe todo en una sola hoja de
  // papel, pero nunca se corta una columna a la mitad). Las primeras 3
  // filas (título, fecha de emisión, encabezados) se repiten en cada
  // página impresa.
  sheet.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    printTitlesRow: "1:3",
    margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 },
  };
  // Número de página en el pie de cada hoja impresa (ej. "Página 2 de 5").
  sheet.headerFooter = { oddFooter: "&CPágina &P de &N", evenFooter: "&CPágina &P de &N" };

  // Título + fecha/hora de emisión, combinados sobre todas las columnas.
  const now = new Date();
  const emittedAt = new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(now);
  sheet.mergeCells(1, 1, 1, columnKeys.length);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = "Inventario KINARA";
  titleCell.font = { bold: true, size: 16 };
  sheet.getRow(1).height = 24;

  sheet.mergeCells(2, 1, 2, columnKeys.length);
  const dateCell = sheet.getCell(2, 1);
  dateCell.value = `Fecha de emisión: ${emittedAt}`;
  dateCell.font = { italic: true, color: { argb: "FF6F6457" } };
  sheet.getRow(2).height = 16;

  const headerRow = sheet.addRow(["Foto", ...Object.values(HEADERS)]);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  headerRow.height = 30;

  const groups = groupByProduct(rows);

  // Se busca la foto de cada producto en paralelo antes de armar las filas
  // (una sola por producto, no una por SKU — así el fetch no crece con el
  // número de colores/tallas).
  const photos = await Promise.all(groups.map((group) => fetchImage(group[0].photoUrl)));

  const ROW_HEIGHT = 30; // puntos
  const PHOTO_WIDTH = 80;
  const PHOTO_HEIGHT = 100;
  const PT_PER_PX = 0.75; // 1px = 0.75pt (96dpi)
  const PHOTO_TOP_OFFSET_PX = 12; // margen para que no toque el borde de arriba
  const PHOTO_TOP_OFFSET_FRACTION = (PHOTO_TOP_OFFSET_PX * PT_PER_PX) / ROW_HEIGHT;
  // Columnas que se combinan en un solo cuadro por producto — igual en cada
  // renglón (a diferencia de Color/Talla/SKU/Stock/Valor, que sí cambian).
  const MERGE_COLUMNS = ["A", "B", "C", "D", "E", "F", "L"] as const;
  // Los títulos van alineados arriba (no al centro) para que coincidan con
  // la foto, que también se ancla cerca del borde superior del bloque — en
  // productos con muchos colores/tallas, centrar el texto lo dejaba muy por
  // debajo de la foto.
  const topCenter = { vertical: "top" as const, horizontal: "center" as const };
  const topLeft = { vertical: "top" as const, horizontal: "left" as const };
  const middleCenter = { vertical: "middle" as const, horizontal: "center" as const };

  // Ancho de cada columna según el texto más largo que le tocó mostrar
  // (arranca en el largo del encabezado, que también cuenta).
  const colMaxLen: Record<keyof typeof COLUMN_BOUNDS, number> = Object.fromEntries(
    Object.entries(HEADERS).map(([key, label]) => [key, label.length]),
  ) as Record<keyof typeof COLUMN_BOUNDS, number>;
  const track = (key: keyof typeof COLUMN_BOUNDS, value: unknown) => {
    const len = String(value ?? "").length;
    if (len > colMaxLen[key]) colMaxLen[key] = len;
  };

  let currentRow = 4;
  let totalValue = 0;
  groups.forEach((group, i) => {
    const startRow = currentRow;
    // Dentro de cada producto, las filas de un mismo color (una por talla)
    // también se combinan en un solo cuadro en la columna Color.
    let colorStart = currentRow;
    for (const [idx, r] of group.entries()) {
      const value = (r.price ?? 0) * r.stock;
      totalValue += value;
      const colorCell = idx === 0 || r.colorName !== group[idx - 1].colorName ? r.colorName : "";
      sheet.addRow({
        skuOriginal: "",
        producto: "",
        nombreOriginal: "",
        tipo: "",
        precio: "",
        color: colorCell,
        talla: r.size,
        sku: r.sku ?? "",
        stock: r.stock,
        valor: value,
        estado: "",
      });
      sheet.getRow(currentRow).height = ROW_HEIGHT;
      if (colorCell) track("color", colorCell);
      track("talla", r.size);
      track("sku", r.sku ?? "");
      track("stock", r.stock);
      track("valor", Math.round(value));

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

    const skuOriginalValue = baseSku(group);
    sheet.getCell(`B${startRow}`).value = skuOriginalValue;
    sheet.getCell(`B${startRow}`).alignment = topCenter;
    sheet.getCell(`C${startRow}`).value = first.productName;
    sheet.getCell(`C${startRow}`).alignment = topLeft;
    // "Nombre original" = el slug (campo URL) del producto — a veces conserva
    // el nombre anterior si el producto se renombró (ver tarea 042).
    sheet.getCell(`D${startRow}`).value = first.productSlug;
    sheet.getCell(`D${startRow}`).alignment = topLeft;
    sheet.getCell(`E${startRow}`).value = first.kind;
    sheet.getCell(`E${startRow}`).alignment = topCenter;
    sheet.getCell(`F${startRow}`).value = first.price ?? "";
    sheet.getCell(`F${startRow}`).alignment = topCenter;
    // "Publicado" = el producto está visible y a la venta en /tienda;
    // "Borrador" = todavía no (normalmente porque le falta precio).
    const estadoValue = first.isDraft ? "Borrador" : "Publicado";
    sheet.getCell(`L${startRow}`).value = estadoValue;
    sheet.getCell(`L${startRow}`).alignment = topCenter;

    track("skuOriginal", skuOriginalValue);
    track("producto", first.productName);
    track("nombreOriginal", first.productSlug);
    track("tipo", first.kind);
    track("precio", first.price ?? "");
    track("estado", estadoValue);

    const photo = photos[i];
    if (photo) {
      // Los tipos de exceljs y el `Buffer` genérico de @types/node más reciente
      // no coinciden estructuralmente (friccion conocida entre versiones) —
      // el buffer es válido en runtime, solo se relaja el tipo aquí.
      const imageId = workbook.addImage({
        buffer: photo.buffer,
        extension: photo.extension,
      } as unknown as ExcelJS.Image);
      // Tamaño fijo para todas las fotos (no se estira para llenar la celda
      // combinada) — así un producto con muchos colores/tallas no se ve más
      // grande que uno con pocos. `row` acepta un valor fraccionario: la
      // parte entera es la fila donde empieza, la parte decimal es qué tan
      // abajo de esa fila arranca la imagen (como fracción de su alto) — se
      // usa para bajarla un poco y que no quede pegada al borde de arriba,
      // encimada con el producto anterior. Si el bloque es más bajo que la
      // foto, puede asomarse un poco sobre las filas de abajo (comportamiento
      // normal de imágenes flotantes en Excel), pero nunca se deforma.
      sheet.addImage(imageId, {
        tl: { col: 0, row: startRow - 1 + PHOTO_TOP_OFFSET_FRACTION },
        ext: { width: PHOTO_WIDTH, height: PHOTO_HEIGHT },
      });
    }
  });

  const totalRow = sheet.addRow({ producto: "Valor total del inventario", valor: totalValue });
  totalRow.font = { bold: true };
  track("producto", "Valor total del inventario");
  track("valor", Math.round(totalValue));

  // Aplica el ancho calculado por columna (largo del contenido + relleno,
  // acotado por COLUMN_BOUNDS) — la de Foto se deja fija más chica.
  for (const [key, [min, max]] of Object.entries(COLUMN_BOUNDS)) {
    const width = Math.min(max, Math.max(min, colMaxLen[key as keyof typeof COLUMN_BOUNDS] + 2));
    sheet.getColumn(key).width = width;
  }

  // Rayas tenues en todos los renglones (encabezado, datos y total) — en las
  // columnas combinadas por producto (Foto/SKU original/Producto/Nombre
  // original/Tipo/Precio/Estado) esto dibuja el marco de todo el bloque, no
  // líneas internas falsas entre renglones que en realidad son un solo dato.
  const thinLightBorder: ExcelJS.Border = { style: "thin", color: { argb: "FFD9D9D9" } };
  const gridBorder: Partial<ExcelJS.Borders> = {
    top: thinLightBorder,
    left: thinLightBorder,
    bottom: thinLightBorder,
    right: thinLightBorder,
  };
  for (let r = 3; r <= sheet.lastRow!.number; r++) {
    const row = sheet.getRow(r);
    for (let c = 1; c <= columnKeys.length; c++) {
      row.getCell(c).border = gridBorder;
    }
  }

  return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
}
