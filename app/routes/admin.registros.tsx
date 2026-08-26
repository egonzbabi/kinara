import type { Route } from "./+types/admin.registros";
import { requireAdmin } from "~/lib/session.server";
import { listDiscountSignups } from "~/lib/discount-signups.server";
import { DISCOUNT_PERCENT } from "~/lib/discount-constants";
import { cn } from "~/lib/cn";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Registros · Admin · KINARA" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const signups = await listDiscountSignups();
  return { signups };
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  }).format(new Date(iso));
}

export default function AdminRegistros({ loaderData }: Route.ComponentProps) {
  const { signups } = loaderData;
  const usedCount = signups.filter((s) => s.usedAt).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl text-espresso">Registros</h2>
        <p className="mt-1 text-sm text-muted">
          Correos que se apuntaron al {DISCOUNT_PERCENT}% de bienvenida — sirve como lista para
          campañas de correo. {signups.length} en total, {usedCount} ya usaron su código.
        </p>
      </div>

      {signups.length === 0 ? (
        <p className="rounded-xl bg-bone p-8 text-center text-sm text-muted">
          Todavía no hay registros.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-bone">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Correo
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Código
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Registrado
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {signups.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-0 hover:bg-sand/60">
                    <td className="px-5 py-3">
                      <a
                        href={`mailto:${s.email}`}
                        className="text-sm text-espresso underline-offset-2 hover:text-clay hover:underline"
                      >
                        {s.email}
                      </a>
                    </td>
                    <td className="px-5 py-3 font-mono text-[13px] text-muted">{s.code}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-muted">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold",
                          s.usedAt ? "bg-sage/10 text-espresso" : "bg-clay/10 text-clay",
                        )}
                        title={s.usedAt ? `Usado el ${formatDate(s.usedAt)}` : undefined}
                      >
                        {s.usedAt ? "Usado" : "Disponible"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
