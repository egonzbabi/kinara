import type { Route } from "./+types/admin.inventario.excel";
import { requireAdmin } from "~/lib/session.server";
import { listInventory } from "~/lib/admin-catalog.server";
import { buildInventoryExcel } from "~/lib/admin-inventory-excel.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);

  const url = new URL(request.url);
  const search = (url.searchParams.get("search") ?? "").toLowerCase();
  const kind = url.searchParams.get("kind") ?? "Todos";

  const rows = (await listInventory()).filter((r) => {
    const matchSearch =
      !search ||
      r.productName.toLowerCase().includes(search) ||
      (r.sku ?? "").toLowerCase().includes(search) ||
      r.colorName.toLowerCase().includes(search);
    const matchKind = kind === "Todos" || r.kind === kind;
    return matchSearch && matchKind;
  });

  const buffer = await buildInventoryExcel(rows);
  // Fecha en hora de México, no UTC (el servidor corre en UTC en Vercel) —
  // si no, el nombre del archivo puede mostrar el día siguiente.
  const todayMx = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const filename = `inventario-kinara-${todayMx}.xlsx`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
