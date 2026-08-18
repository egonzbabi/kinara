import PDFDocument from "pdfkit";
import type { InventoryRow } from "./admin-catalog.server";
import { SIZE_ORDER, groupByProduct, type ProductGroup } from "./admin-inventory-groups";
import { fetchImage } from "./fetch-image.server";
import { formatPrice } from "./formatPrice";

// pdfkit solo soporta jpeg/png de forma nativa (a diferencia de exceljs, que también
// acepta gif) — si la foto es de otro formato, se omite igual que en el Excel.
const SUPPORTED_IMAGE_TYPES: Record<string, "jpeg" | "png"> = {
  "image/jpeg": "jpeg",
  "image/jpg": "jpeg",
  "image/png": "png",
};

const PAGE_WIDTH = 792; // carta horizontal (11in x 8.5in, en puntos)
const PAGE_HEIGHT = 612;
const MARGIN = 28;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const CONTENT_BOTTOM = PAGE_HEIGHT - MARGIN;

const COLOR_ESPRESSO = "#2b2118";
const COLOR_MUTED = "#6f6457";
const COLOR_CLAY = "#c2603d";
const COLOR_LINE = "#d9d9d9";
const COLOR_CLAY_BG = "#f5e2da";
const COLOR_SAGE_BG = "#e7ebe1";

const PHOTO_SIZE = 46;
const STATS_WIDTH = 264; // 3 cajas (Stock/Precio/Valor) a la derecha del encabezado
const COLOR_COL_WIDTH = 240;
const SIZE_COL_WIDTH = (CONTENT_WIDTH - COLOR_COL_WIDTH) / SIZE_ORDER.length;
const BLOCK_PADDING = 6;
const BLOCK_GAP = 10;

const NAME_AREA_WIDTH = CONTENT_WIDTH - PHOTO_SIZE - 12 - STATS_WIDTH - 12;

type Metrics = { fontSize: number; rowHeight: number; tableHeaderHeight: number; headerHeight: number };

/** Alto de fila/encabezado en función del font elegido — así un font más grande no
 * queda apretado dentro de su celda (la foto del producto pone un piso mínimo). */
function metricsFor(fontSize: number): Metrics {
  return {
    fontSize,
    rowHeight: fontSize + 10,
    tableHeaderHeight: fontSize + 8,
    headerHeight: Math.max(PHOTO_SIZE, fontSize * 2 + 16) + BLOCK_PADDING * 2,
  };
}

/** El font más grande (de una lista de candidatos) que deja todos los nombres de
 * producto y de color dentro de sus columnas, sin desbordar la hoja. */
function pickMetrics(doc: PDFKit.PDFDocument, groups: ProductGroup[]): Metrics {
  const candidates = [13, 12, 11, 10, 9, 8, 7, 6];
  for (const size of candidates) {
    doc.font("Helvetica-Bold").fontSize(size + 1);
    const namesFit = groups.every((g) => doc.widthOfString(g.productName) <= NAME_AREA_WIDTH);
    doc.font("Helvetica").fontSize(size);
    const colorsFit = groups.every((g) =>
      g.colors.every((c) => doc.widthOfString(c.colorName) <= COLOR_COL_WIDTH - 12),
    );
    if (namesFit && colorsFit) return metricsFor(size);
  }
  return metricsFor(candidates[candidates.length - 1]);
}

function blockHeight(group: ProductGroup, m: Metrics): number {
  return m.headerHeight + m.tableHeaderHeight + group.colors.length * m.rowHeight + BLOCK_PADDING * 2;
}

function drawPageHeader(doc: PDFKit.PDFDocument, emittedAt: string, big: boolean) {
  doc.font("Helvetica-Bold").fontSize(big ? 16 : 10).fillColor(COLOR_ESPRESSO);
  doc.text("Inventario KINARA", MARGIN, MARGIN, { lineBreak: false });
  doc.font("Helvetica-Oblique").fontSize(big ? 9 : 7).fillColor(COLOR_MUTED);
  doc.text(`Fecha de emisión: ${emittedAt}`, MARGIN, MARGIN + (big ? 20 : 13), { lineBreak: false });
  doc.y = MARGIN + (big ? 38 : 26);
}

function statCell(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  fontSize: number,
) {
  doc.font("Helvetica").fontSize(Math.max(fontSize - 2, 6)).fillColor(COLOR_MUTED);
  doc.text(label, x, y, { width, align: "right" });
  doc.font("Helvetica-Bold").fontSize(fontSize + 1).fillColor(COLOR_ESPRESSO);
  doc.text(value, x, y + 10, { width, align: "right" });
}

function drawGroup(doc: PDFKit.PDFDocument, group: ProductGroup, photo: { buffer: Buffer } | null, m: Metrics) {
  const { fontSize } = m;
  const startY = doc.y;
  const left = MARGIN;

  doc.rect(left, startY, CONTENT_WIDTH, blockHeight(group, m)).stroke(COLOR_LINE);

  const innerY = startY + BLOCK_PADDING;
  if (photo) {
    try {
      doc.image(photo.buffer, left + BLOCK_PADDING, innerY, {
        fit: [PHOTO_SIZE, PHOTO_SIZE],
        align: "center",
        valign: "center",
      });
    } catch {
      // Foto corrupta o formato no soportado en runtime — se omite sin romper el PDF.
    }
  }

  const nameX = left + BLOCK_PADDING + PHOTO_SIZE + 12;
  doc.font("Helvetica-Bold").fontSize(fontSize + 1).fillColor(COLOR_ESPRESSO);
  doc.text(group.productName, nameX, innerY, { width: NAME_AREA_WIDTH, lineBreak: false });
  doc.font("Helvetica").fontSize(Math.max(fontSize - 1, 6)).fillColor(COLOR_MUTED);
  const metaParts = [group.kind, group.baseSku ? `SKU ${group.baseSku}` : null].filter(Boolean);
  doc.text(metaParts.join(" · "), nameX, innerY + fontSize + 4, { width: NAME_AREA_WIDTH, lineBreak: false });

  const statsX = left + CONTENT_WIDTH - BLOCK_PADDING - STATS_WIDTH;
  const statWidth = STATS_WIDTH / 3;
  statCell(doc, statsX, innerY, statWidth - 6, "Stock total", String(group.totalStock), fontSize);
  statCell(
    doc,
    statsX + statWidth,
    innerY,
    statWidth - 6,
    "Precio",
    group.price === null ? "—" : formatPrice(group.price),
    fontSize,
  );
  statCell(doc, statsX + statWidth * 2, innerY, statWidth - 6, "Valor", formatPrice(group.value), fontSize);

  const tableY = startY + m.headerHeight;
  const tableBottom = tableY + m.tableHeaderHeight + group.colors.length * m.rowHeight;
  const headerTextY = tableY + (m.tableHeaderHeight - fontSize) / 2;
  doc.rect(left, tableY, CONTENT_WIDTH, m.tableHeaderHeight).fillAndStroke("#f4f0e8", COLOR_LINE);
  doc.font("Helvetica-Bold").fontSize(Math.max(fontSize - 1, 6)).fillColor(COLOR_MUTED);
  doc.text("COLOR", left + 6, headerTextY, { width: COLOR_COL_WIDTH - 12, lineBreak: false });
  SIZE_ORDER.forEach((s, i) => {
    const x = left + COLOR_COL_WIDTH + SIZE_COL_WIDTH * i;
    doc.text(s, x, headerTextY, { width: SIZE_COL_WIDTH, align: "center", lineBreak: false });
  });
  doc.moveTo(left + COLOR_COL_WIDTH, tableY).lineTo(left + COLOR_COL_WIDTH, tableBottom).strokeColor(COLOR_LINE).stroke();
  for (let i = 1; i < SIZE_ORDER.length; i++) {
    const x = left + COLOR_COL_WIDTH + SIZE_COL_WIDTH * i;
    doc.moveTo(x, tableY).lineTo(x, tableBottom).strokeColor(COLOR_LINE).stroke();
  }

  group.colors.forEach((color, rowIndex) => {
    const rowY = tableY + m.tableHeaderHeight + rowIndex * m.rowHeight;
    const cellTextY = rowY + (m.rowHeight - fontSize) / 2;
    doc.rect(left, rowY, CONTENT_WIDTH, m.rowHeight).strokeColor(COLOR_LINE).stroke();
    doc.font("Helvetica").fontSize(fontSize).fillColor(COLOR_ESPRESSO);
    doc.text(color.colorName, left + 6, cellTextY, { width: COLOR_COL_WIDTH - 12, lineBreak: false });

    SIZE_ORDER.forEach((s, i) => {
      const cell = color.sizes[s];
      const x = left + COLOR_COL_WIDTH + SIZE_COL_WIDTH * i;
      const hasStock = Boolean(cell && cell.stock > 0);
      doc
        .rect(x + 3, rowY + 2, SIZE_COL_WIDTH - 6, m.rowHeight - 4)
        .fill(hasStock ? COLOR_SAGE_BG : COLOR_CLAY_BG);
      doc.font("Helvetica-Bold").fontSize(fontSize).fillColor(hasStock ? COLOR_ESPRESSO : COLOR_CLAY);
      doc.text(cell ? String(cell.stock) : "—", x, cellTextY, { width: SIZE_COL_WIDTH, align: "center", lineBreak: false });
    });
  });

  doc.y = startY + blockHeight(group, m) + BLOCK_GAP;
}

export async function buildInventoryPdf(rows: InventoryRow[]): Promise<Buffer> {
  const groups = groupByProduct(rows);
  const photos = await Promise.all(
    groups.map((g) => fetchImage(g.photoUrl, SUPPORTED_IMAGE_TYPES)),
  );

  const emittedAt = new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  }).format(new Date());

  const doc = new PDFDocument({
    size: "letter",
    layout: "landscape",
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    autoFirstPage: true,
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  drawPageHeader(doc, emittedAt, true);
  doc.on("pageAdded", () => drawPageHeader(doc, emittedAt, false));

  const metrics = pickMetrics(doc, groups);

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const needed = blockHeight(group, metrics);
    // Nunca se corta un producto (ni su foto) entre dos páginas: si no cabe
    // completo en lo que queda de la página actual, se pasa de página antes
    // de empezar a dibujarlo, no a la mitad.
    if (doc.y + needed > CONTENT_BOTTOM) {
      doc.addPage();
    }
    drawGroup(doc, group, photos[i], metrics);
  }

  doc.end();
  return done;
}
