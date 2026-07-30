import type { Route } from "./+types/admin.mensajes";
import { requireAdmin } from "~/lib/session.server";
import { listContactMessages } from "~/lib/admin-messages.server";
import { cn } from "~/lib/cn";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Mensajes · Admin · KINARA" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const messages = await listContactMessages();
  return { messages };
}

export default function AdminMensajes({ loaderData }: Route.ComponentProps) {
  const { messages } = loaderData;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-2xl text-espresso">Mensajes</h2>

      {messages.length === 0 ? (
        <p className="rounded-xl bg-bone p-8 text-center text-sm text-muted">
          Todavía no hay mensajes de contacto.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {messages.map((m) => (
            <li key={m.id} className="rounded-xl bg-bone p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-espresso">{m.name}</p>
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent("Re: tu mensaje a KINARA")}`}
                    className="text-[13px] text-muted underline-offset-2 hover:text-clay hover:underline"
                  >
                    {m.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium",
                      m.emailSent ? "bg-sage/15 text-sage" : "bg-clay/10 text-clay",
                    )}
                    title={m.emailError ?? undefined}
                  >
                    {m.emailSent ? "Correo enviado" : "Correo no enviado"}
                  </span>
                  <time className="text-[13px] text-muted" dateTime={m.createdAt}>
                    {new Date(m.createdAt).toLocaleString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-espresso">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
