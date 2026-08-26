import "dotenv/config";
import { Resend } from "resend";
import { formatPrice } from "./formatPrice";
import type { OrderItem } from "./orders.server";
import {
  DISCOUNT_PERCENT,
  DISCOUNT_MIN_SUBTOTAL_MXN,
  DISCOUNT_EXPIRY_DAYS,
} from "./discount-constants";

/**
 * Envío de correo del formulario de contacto vía Resend. A propósito nunca
 * lanza si faltan las variables de entorno (`RESEND_API_KEY`/`CONTACT_EMAIL_TO`
 * — pendientes de que el usuario dé la cuenta real de Resend y el correo del
 * cliente, ver CLAUDE.md) — el mensaje del visitante ya se guardó en
 * `contact_messages` antes de llamar esto, así que un correo no configurado
 * nunca debe verse como un error para quien llena el formulario.
 */
export type SendContactEmailResult = { sent: boolean; error?: string };

export async function sendContactEmail(params: {
  name: string;
  email: string;
  message: string;
}): Promise<SendContactEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO;
  if (!apiKey || !to) {
    return { sent: false, error: "RESEND_API_KEY o CONTACT_EMAIL_TO no configurados" };
  }

  const from = process.env.CONTACT_EMAIL_FROM || "KINARA <onboarding@resend.dev>";

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: params.email,
      subject: `Nuevo mensaje de contacto — ${params.name}`,
      text: `De: ${params.name} <${params.email}>\n\n${params.message}`,
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

/**
 * Correo de confirmación de pedido al cliente. Mismas garantías que
 * sendContactEmail: nunca lanza si falta configuración de Resend — la orden
 * ya se creó y descontó stock antes de llamar esto, así que un correo no
 * enviado nunca debe verse como una compra fallida.
 */
interface OrderShippingAddress {
  name?: string;
  street1: string;
  postalCode: string;
  areaLevel1: string;
  areaLevel2: string;
  areaLevel3?: string;
}

const ESPRESSO = "#2b2118";
const SAND = "#e9e1d4";
const BONE = "#f4f0e8";
const CLAY = "#c2603d";
const MUTED = "#6f6457";
const LINE = "#e2d9c9";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildOrderConfirmationHtml(params: {
  orderId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: OrderShippingAddress | null;
  shippingCarrier: string | null;
  shippingDays: number | null;
}): string {
  const { orderId, customerName, items, subtotal, shippingFee, total, shippingAddress, shippingCarrier, shippingDays } =
    params;
  const firstName = customerName.split(" ")[0] || customerName;
  const date = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(),
  );

  const itemsRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid ${LINE};">
          <p style="margin:0;font-size:15px;color:${ESPRESSO};font-weight:600;">${escapeHtml(item.productName)}</p>
          <p style="margin:4px 0 0;font-size:13px;color:${MUTED};">
            ${[item.colorName, `Talla ${item.size}`, `x${item.quantity}`]
              .filter((v): v is string => Boolean(v))
              .map(escapeHtml)
              .join(" · ")}
          </p>
        </td>
        <td style="padding:14px 0;border-bottom:1px solid ${LINE};text-align:right;white-space:nowrap;vertical-align:top;">
          <span style="font-size:15px;color:${ESPRESSO};">${formatPrice(item.price * item.quantity)}</span>
        </td>
      </tr>`,
    )
    .join("");

  const addressBlock = shippingAddress
    ? `
      <p style="margin:0;font-size:14px;line-height:1.6;color:${ESPRESSO};">
        ${escapeHtml(shippingAddress.street1)}<br />
        ${escapeHtml(shippingAddress.areaLevel3 || "")}${shippingAddress.areaLevel3 ? ", " : ""}${escapeHtml(shippingAddress.areaLevel2)}<br />
        ${escapeHtml(shippingAddress.areaLevel1)}, C.P. ${escapeHtml(shippingAddress.postalCode)}
      </p>`
    : "";

  const shippingNote =
    shippingCarrier && shippingDays
      ? `Se enviará por <strong>${escapeHtml(shippingCarrier)}</strong>, con entrega estimada en ${shippingDays} día${shippingDays === 1 ? "" : "s"} hábil${shippingDays === 1 ? "" : "es"}.`
      : "Te avisaremos por correo en cuanto tu pedido salga, con su número de rastreo.";

  return `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pedido confirmado · KINARA</title>
  </head>
  <body style="margin:0;padding:0;background:${SAND};font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SAND};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${BONE};border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:40px 40px 24px;text-align:center;">
                <span style="font-size:22px;letter-spacing:6px;color:${ESPRESSO};font-weight:600;">KINARA</span>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px;">
                <hr style="border:none;border-top:1px solid ${LINE};margin:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 0;font-family:Georgia,'Times New Roman',serif;">
                <h1 style="margin:0 0 8px;font-size:26px;color:${ESPRESSO};font-weight:500;">
                  Gracias por tu compra, ${escapeHtml(firstName)}.
                </h1>
                <p style="margin:0;font-size:15px;line-height:1.6;color:${MUTED};font-family:Helvetica,Arial,sans-serif;">
                  Ya recibimos tu pedido y lo estamos preparando con cuidado. En cuanto salga
                  de nuestras manos, te avisamos.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 0;font-family:Helvetica,Arial,sans-serif;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SAND};border-radius:12px;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="margin:0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};">
                        Número de pedido
                      </p>
                      <p style="margin:2px 0 0;font-size:16px;color:${ESPRESSO};font-weight:600;">${escapeHtml(orderId)}</p>
                    </td>
                    <td style="padding:16px 20px;text-align:right;">
                      <p style="margin:0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};">
                        Fecha
                      </p>
                      <p style="margin:2px 0 0;font-size:16px;color:${ESPRESSO};">${date}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 0;font-family:Helvetica,Arial,sans-serif;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${itemsRows}
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:${MUTED};">Subtotal</td>
                    <td style="padding:6px 0;text-align:right;font-size:14px;color:${ESPRESSO};">${formatPrice(subtotal)}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:${MUTED};">Envío</td>
                    <td style="padding:6px 0;text-align:right;font-size:14px;color:${ESPRESSO};">${formatPrice(shippingFee)}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 0 0;border-top:1px solid ${LINE};font-size:16px;color:${ESPRESSO};font-weight:700;">Total</td>
                    <td style="padding:14px 0 0;border-top:1px solid ${LINE};text-align:right;font-size:18px;color:${CLAY};font-weight:700;">${formatPrice(total)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            ${
              addressBlock
                ? `<tr>
              <td style="padding:28px 40px 0;font-family:Helvetica,Arial,sans-serif;">
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};">
                  Se envía a
                </p>
                ${addressBlock}
              </td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding:24px 40px 0;font-family:Helvetica,Arial,sans-serif;">
                <p style="margin:0;font-size:14px;line-height:1.6;color:${MUTED};">${shippingNote}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 40px;text-align:center;font-family:Helvetica,Arial,sans-serif;">
                <a href="https://kinara-ecommerce.vercel.app/tienda" style="display:inline-block;background:${CLAY};color:${BONE};text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:999px;">
                  Seguir explorando
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 32px;text-align:center;font-family:Helvetica,Arial,sans-serif;">
                <p style="margin:0;font-size:12px;color:${MUTED};">
                  ¿Dudas sobre tu pedido? Responde a este correo y con gusto te ayudamos.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendOrderConfirmationEmail(params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: OrderShippingAddress | null;
  shippingCarrier: string | null;
  shippingDays: number | null;
}): Promise<SendContactEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, error: "RESEND_API_KEY no configurado" };
  }
  if (!params.customerEmail) {
    return { sent: false, error: "El pedido no tiene correo de cliente" };
  }

  const from = process.env.CONTACT_EMAIL_FROM || "KINARA <onboarding@resend.dev>";

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: params.customerEmail,
      subject: `Pedido confirmado · ${params.orderId}`,
      html: buildOrderConfirmationHtml(params),
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

/**
 * Correo con el código de descuento de bienvenida (10% en la primera compra).
 * Mismas garantías que los demás correos de este archivo: nunca lanza si falta
 * configuración de Resend — el código ya se guardó antes de llamar esto, así
 * que un correo no enviado nunca debe verse como que el registro falló.
 */
export async function sendWelcomeDiscountEmail(params: {
  email: string;
  code: string;
}): Promise<SendContactEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, error: "RESEND_API_KEY no configurado" };
  }

  const from = process.env.CONTACT_EMAIL_FROM || "KINARA <onboarding@resend.dev>";

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: params.email,
      subject: `Tu código de ${DISCOUNT_PERCENT}% de descuento · KINARA`,
      html: buildWelcomeDiscountHtml(params),
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

function buildWelcomeDiscountHtml(params: { code: string }): string {
  const { code } = params;
  return `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tu código de descuento · KINARA</title>
  </head>
  <body style="margin:0;padding:0;background:${SAND};font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SAND};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${BONE};border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:40px 40px 24px;text-align:center;">
                <span style="font-size:22px;letter-spacing:6px;color:${ESPRESSO};font-weight:600;">KINARA</span>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px;">
                <hr style="border:none;border-top:1px solid ${LINE};margin:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 0;font-family:Georgia,'Times New Roman',serif;text-align:center;">
                <h1 style="margin:0 0 8px;font-size:26px;color:${ESPRESSO};font-weight:500;">
                  Bienvenida a KINARA.
                </h1>
                <p style="margin:0;font-size:15px;line-height:1.6;color:${MUTED};font-family:Helvetica,Arial,sans-serif;">
                  Aquí está tu código para tu primera compra.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 0;text-align:center;">
                <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="background:${SAND};border-radius:12px;">
                  <tr>
                    <td style="padding:20px 32px;text-align:center;">
                      <p style="margin:0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};font-family:Helvetica,Arial,sans-serif;">
                        ${DISCOUNT_PERCENT}% de descuento
                      </p>
                      <p style="margin:6px 0 0;font-size:24px;letter-spacing:0.08em;color:${CLAY};font-weight:700;font-family:Helvetica,Arial,sans-serif;">
                        ${escapeHtml(code)}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 0;font-family:Helvetica,Arial,sans-serif;text-align:center;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:${MUTED};">
                  Válido en compras desde ${formatPrice(DISCOUNT_MIN_SUBTOTAL_MXN)}, solo en tu primera
                  compra, con este correo. Vence en ${DISCOUNT_EXPIRY_DAYS} días.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 40px;text-align:center;font-family:Helvetica,Arial,sans-serif;">
                <a href="https://kinara-ecommerce.vercel.app/tienda" style="display:inline-block;background:${CLAY};color:${BONE};text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:999px;">
                  Ir a la tienda
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 32px;text-align:center;font-family:Helvetica,Arial,sans-serif;">
                <p style="margin:0;font-size:12px;color:${MUTED};">
                  Ingresa el código en el checkout, en el paso de pago.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
