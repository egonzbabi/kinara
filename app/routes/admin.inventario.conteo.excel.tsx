import type { Route } from "./+types/admin.inventario.conteo.excel";
import { requireAdmin } from "~/lib/session.server";
import { getInventoryCountDiffs, buildInventoryCountDiffExcel } from "~/lib/admin-inventory-counts.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);

  const diffs = await getInventoryCountDiffs();
  const buffer = await buildInventoryCountDiffExcel(diffs);

  // Fecha en hora de México, no UTC (el servidor corre en UTC en Vercel) — si
  // no, el nombre del archivo puede mostrar el día siguiente (ver tarea 057).
  const todayMx = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const filename = `diferencias-conteo-fisico-${todayMx}.xlsx`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
