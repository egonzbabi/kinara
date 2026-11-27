// Tarjeta descargable del QR de una promotora (tarea 156): marca KINARA y el
// texto "Descuento exclusivo para las clientas de <nombre>" arriba del QR, para
// que quien lo reciba por WhatsApp sepa de qué tienda es. Se arma en el
// navegador (canvas) con las mismas fuentes y colores del sitio; no hay
// servidor ni librerías extra de imágenes.

const W = 1080;
const PAD = 90;
const ESPRESSO = "#2b2118";
const BONE = "#f4f0e8";
const CLAY = "#9e4e32";
const MUTED = "#6d6356";
const DISPLAY = '"Fraunces Variable", Georgia, serif';
const SANS = '"Hanken Grotesk Variable", system-ui, sans-serif';

export interface PromoterCardInput {
  /** Texto que se muestra como nombre (ej. "Dra. Connie Gutiérrez"). */
  name: string;
  percent: number;
  code: string;
  /** SVG del QR tal como lo genera el servidor. */
  qrSvg: string;
}

/** Parte un texto en líneas que no pasen de `maxWidth` con la fuente ya puesta en `ctx`. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Texto centrado con espacio extra entre letras (el wordmark KINARA). */
function spaced(ctx: CanvasRenderingContext2D, text: string, y: number, tracking: number) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1);
  let x = (W - total) / 2;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = "left";
  chars.forEach((c, i) => {
    ctx.fillText(c, x, y);
    x += widths[i] + tracking;
  });
  ctx.textAlign = prevAlign;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function loadSvg(svg: string, size: number): Promise<HTMLImageElement> {
  const sized = svg.replace(/<svg\b/, `<svg width="${size}" height="${size}"`);
  const url = URL.createObjectURL(new Blob([sized], { type: "image/svg+xml" }));
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo dibujar el QR."));
    };
    img.src = url;
  });
}

export async function buildPromoterCard(input: PromoterCardInput): Promise<Blob> {
  // Las fuentes del sitio se cargan por CSS; hay que asegurarse de que ya estén
  // listas antes de dibujar, o el canvas usaría la fuente de respaldo.
  await Promise.all([
    document.fonts.load(`500 80px ${DISPLAY}`),
    document.fonts.load(`600 38px ${SANS}`),
    document.fonts.load(`400 28px ${SANS}`),
    document.fonts.load(`700 28px ${SANS}`),
  ]);

  const QR_BOX = 640;
  const QR_SIZE = 560;
  const name = input.name.trim() || "nuestra promotora";

  // Primero se mide todo para saber qué tan alta queda la tarjeta (el nombre
  // puede ocupar 1, 2 o 3 renglones).
  const probe = document.createElement("canvas").getContext("2d");
  if (!probe) throw new Error("Tu navegador no puede crear la imagen.");
  probe.font = `500 78px ${DISPLAY}`;
  const nameLines = wrap(probe, name, W - PAD * 2).slice(0, 3);
  const NAME_LH = 92;

  const yBrand = 170;
  const yTagline = 224;
  const yRule = 268;
  const yIntro = 352;
  const yName = yIntro + 92;
  const yPill = yName + (nameLines.length - 1) * NAME_LH + 70;
  const PILL_H = 76;
  const yQr = yPill + PILL_H + 56;
  const yScan = yQr + QR_BOX + 78;
  const yScan2 = yScan + 42;
  const yAlt = yScan2 + 92;
  const yUrl = yAlt + 62;
  const yCode = yUrl + 56;
  const yFine = yCode + 64;
  const H = yFine + 84;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no puede crear la imagen.");
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "center";

  // Fondo y marco fino.
  ctx.fillStyle = BONE;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(43,33,24,0.16)";
  ctx.lineWidth = 2;
  roundRect(ctx, 30, 30, W - 60, H - 60, 28);
  ctx.stroke();

  // Marca.
  ctx.fillStyle = ESPRESSO;
  ctx.font = `500 98px ${DISPLAY}`;
  spaced(ctx, "KINARA", yBrand, 18);
  ctx.fillStyle = CLAY;
  ctx.font = `600 24px ${SANS}`;
  spaced(ctx, "ROPA DEPORTIVA CON ALMA", yTagline, 6);
  ctx.fillStyle = "rgba(43,33,24,0.22)";
  ctx.fillRect(W / 2 - 40, yRule, 80, 3);

  // Texto sobre el QR.
  ctx.fillStyle = ESPRESSO;
  ctx.font = `600 40px ${SANS}`;
  ctx.fillText("Descuento exclusivo para las clientas de", W / 2, yIntro);
  ctx.fillStyle = CLAY;
  ctx.font = `500 78px ${DISPLAY}`;
  nameLines.forEach((line, i) => ctx.fillText(line, W / 2, yName + i * NAME_LH));

  // Etiqueta con el porcentaje.
  const pillText = `${input.percent}% de descuento`;
  ctx.font = `700 36px ${SANS}`;
  const pillW = ctx.measureText(pillText).width + 90;
  ctx.fillStyle = ESPRESSO;
  roundRect(ctx, (W - pillW) / 2, yPill, pillW, PILL_H, PILL_H / 2);
  ctx.fill();
  ctx.fillStyle = BONE;
  ctx.fillText(pillText, W / 2, yPill + 50);

  // QR sobre una tarjeta blanca (fondo claro para que lo lea cualquier cámara).
  ctx.save();
  ctx.shadowColor = "rgba(43,33,24,0.14)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, (W - QR_BOX) / 2, yQr, QR_BOX, QR_BOX, 36);
  ctx.fill();
  ctx.restore();
  const qr = await loadSvg(input.qrSvg, QR_SIZE);
  ctx.drawImage(qr, (W - QR_SIZE) / 2, yQr + (QR_BOX - QR_SIZE) / 2, QR_SIZE, QR_SIZE);

  // Pie: primero lo fácil (escanear), después la alternativa (entrar y usar el código).
  ctx.fillStyle = ESPRESSO;
  ctx.font = `600 32px ${SANS}`;
  ctx.fillText("Escanea el código con la cámara de tu celular", W / 2, yScan);
  ctx.fillText("y tu descuento se aplica automáticamente al pagar", W / 2, yScan2);
  ctx.fillStyle = MUTED;
  ctx.font = `400 27px ${SANS}`;
  ctx.fillText("¿No puedes escanearlo? Compra en", W / 2, yAlt);
  ctx.fillStyle = ESPRESSO;
  ctx.font = `500 48px ${DISPLAY}`;
  ctx.fillText("kinarafit.com.mx", W / 2, yUrl);
  // "y usa el código" en gris y el código en negrita, centrados como una sola línea.
  const lead = "e ingresa el código ";
  const tail = " al pagar";
  ctx.font = `400 27px ${SANS}`;
  const wLead = ctx.measureText(lead).width;
  const wTail = ctx.measureText(tail).width;
  ctx.font = `700 27px ${SANS}`;
  const wCode = ctx.measureText(input.code).width;
  let x = (W - (wLead + wCode + wTail)) / 2;
  ctx.textAlign = "left";
  ctx.fillStyle = MUTED;
  ctx.font = `400 27px ${SANS}`;
  ctx.fillText(lead, x, yCode);
  x += wLead;
  ctx.fillStyle = ESPRESSO;
  ctx.font = `700 27px ${SANS}`;
  ctx.fillText(input.code, x, yCode);
  x += wCode;
  ctx.fillStyle = MUTED;
  ctx.font = `400 27px ${SANS}`;
  ctx.fillText(tail, x, yCode);
  ctx.textAlign = "center";

  // Letra chica: las condiciones reales del código de promotora.
  ctx.fillStyle = MUTED;
  ctx.font = `400 22px ${SANS}`;
  ctx.fillText("Válido en productos sin precio rebajado · Un uso por correo", W / 2, yFine);

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("No se pudo crear la imagen."))),
      "image/png",
    ),
  );
}
