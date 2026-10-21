import type { Route } from "./+types/api.cron.sync-shipments";
import { syncShipmentsForOrders } from "~/lib/admin-orders.server";

/**
 * Proceso automático (tarea 147): lo llama el cron de Vercel. Busca en Skydropx
 * la guía de los pedidos recientes que aún no tienen rastreo y, si hay UNA sola
 * coincidencia estricta, guarda el rastreo y avisa a la clienta por correo.
 *
 * Protegido con `CRON_SECRET`: Vercel lo manda solo como `Authorization: Bearer …`
 * cuando la variable existe. Sin la variable configurada responde 503 y no hace
 * nada. La respuesta solo trae números de pedido y resultados (sin datos
 * personales).
 */
export async function loader({ request }: Route.LoaderArgs) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ ok: false, error: "CRON_SECRET no configurado" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  try {
    const outcomes = await syncShipmentsForOrders();
    const count = (r: string) => outcomes.filter((o) => o.result === r).length;
    return Response.json({
      ok: true,
      checked: outcomes.length,
      sent: count("sent"),
      delivered: count("delivered"),
      noMatch: count("no_match"),
      ambiguous: outcomes.filter((o) => o.result === "ambiguous").map((o) => o.orderId),
      failed: outcomes.filter((o) => o.result === "failed").map((o) => o.orderId),
    });
  } catch (err) {
    console.error("[cron sync-shipments]", err);
    return Response.json({ ok: false, error: "Error al revisar los envíos" }, { status: 500 });
  }
}
