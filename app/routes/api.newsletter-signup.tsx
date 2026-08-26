import type { Route } from "./+types/api.newsletter-signup";
import { getOrCreateDiscountSignup } from "~/lib/discount-signups.server";
import { sendWelcomeDiscountEmail } from "~/lib/resend.server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Cuerpo de la solicitud inválido" }, { status: 400 });
  }

  const email = String(body.email || "").trim();
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Escribe un correo válido." }, { status: 400 });
  }

  let signup;
  try {
    const result = await getOrCreateDiscountSignup(email);
    signup = result.signup;
  } catch (err) {
    console.error("[newsletter-signup] error creando el código:", err);
    return Response.json({ error: "No se pudo generar tu código, intenta de nuevo." }, { status: 500 });
  }

  // Un correo que ya gastó su código no recibe uno nuevo — el reenvío es solo
  // para quien todavía no lo usa (perdió el correo, quiere reenviarlo, etc.).
  if (signup.usedAt) {
    return Response.json(
      { error: "Ya usaste tu código de bienvenida con este correo." },
      { status: 400 },
    );
  }

  const emailResult = await sendWelcomeDiscountEmail({ email: signup.email, code: signup.code });
  if (!emailResult.sent) {
    console.error(`[newsletter-signup] correo no enviado para ${signup.email}:`, emailResult.error);
  }

  return Response.json({ ok: true, emailSent: emailResult.sent });
}
