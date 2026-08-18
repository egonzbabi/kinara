import type { Route } from "./+types/admin.inventario.pdf";
import { requireAdmin } from "~/lib/session.server";
import { listInventory } from "~/lib/admin-catalog.server";
import { buildInventoryPdf } from "~/lib/admin-inventory-pdf.server";

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

  const buffer = await buildInventoryPdf(rows);
  // Fecha en hora de México, no UTC (el servidor corre en UTC en Vercel).
  const todayMx = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const filename = `inventario-kinara-${todayMx}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      // "inline" (no "attachment"): abre directo en el visor de PDF del navegador,
      // listo para mandar a imprimir con Ctrl+P sobre un archivo ya fijo.
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
