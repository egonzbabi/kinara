import "dotenv/config";
import { Resend } from "resend";

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
