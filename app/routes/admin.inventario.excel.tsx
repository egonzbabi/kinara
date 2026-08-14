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
  const filename = `inventario-kinara-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
