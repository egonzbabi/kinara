import { Form, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/contacto";
import { supabaseAdmin } from "~/lib/supabase.server";
import { sendContactEmail } from "~/lib/resend.server";
import { cn } from "~/lib/cn";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Contacto · KINARA" },
    {
      name: "description",
      content: "¿Tienes preguntas sobre un pedido, una prenda o un cambio? Escríbenos.",
    },
  ];
}

type ActionData = { ok: true } | { ok: false; error: string };

export async function action({ request }: Route.ActionArgs): Promise<ActionData> {
  const form = await request.formData();
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim();
  const message = String(form.get("message") || "").trim();

  if (!name || !email || !message) {
    return { ok: false, error: "Completa nombre, email y mensaje." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Ingresa un email válido." };
  }

  // El mensaje se guarda primero — nunca se pierde aunque el correo (Resend)
  // no esté configurado todavía o falle al enviarse (ver CLAUDE.md pendientes).
  const { data: saved, error: insertError } = await supabaseAdmin
    .from("contact_messages")
    .insert({ name, email, message })
    .select("id")
    .single();

  if (insertError || !saved) {
    console.error("[contacto] no se pudo guardar el mensaje:", insertError);
    return { ok: false, error: "No se pudo enviar tu mensaje. Intenta de nuevo." };
  }

  const emailResult = await sendContactEmail({ name, email, message });
  if (!emailResult.sent) {
    console.error("[contacto] correo no enviado (mensaje sí guardado):", emailResult.error);
    await supabaseAdmin
      .from("contact_messages")
      .update({ email_sent: false, email_error: emailResult.error ?? null })
      .eq("id", saved.id);
  } else {
    await supabaseAdmin.from("contact_messages").update({ email_sent: true }).eq("id", saved.id);
  }

  return { ok: true };
}

const inputClass =
  "mt-1.5 w-full rounded-lg border border-line bg-bone px-3 py-2.5 text-sm text-espresso focus:border-clay focus:outline-none";
const labelClass = "text-sm font-medium text-espresso";

export default function Contacto() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const success = actionData?.ok === true;

  return (
    <div className="pad flex flex-col gap-8 py-12 sm:py-16">
      <div>
        <h1 className="font-display text-[clamp(30px,4vw,44px)]">Contacto</h1>
        <p className="mt-2 max-w-[52ch] text-muted">
          ¿Tienes preguntas sobre un pedido, una prenda o un cambio? Escríbenos y te
          respondemos lo antes posible.
        </p>
      </div>

      <section className="max-w-xl rounded-xl bg-bone p-5 sm:p-8">
        {success ? (
          <p className="rounded-lg bg-sage/15 px-4 py-4 text-sm text-espresso" role="status">
            Recibimos tu mensaje. Te responderemos pronto a tu correo.
          </p>
        ) : (
          <Form method="post" className="flex flex-col gap-4">
            <div>
              <label htmlFor="name" className={labelClass}>
                Nombre
              </label>
              <input id="name" name="name" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input id="email" name="email" type="email" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="message" className={labelClass}>
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className={cn(inputClass, "resize-none")}
              />
            </div>

            {actionData?.ok === false && (
              <p className="rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay" role="alert">
                {actionData.error}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn btn-clay mt-1 w-full sm:w-auto">
              {submitting ? "Enviando…" : "Enviar mensaje"}
            </button>
          </Form>
        )}
      </section>
    </div>
  );
}
