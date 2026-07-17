import { useFetcher } from "react-router";
import type { Route } from "./+types/admin.pedidos";
import { requireAdmin } from "~/lib/session.server";
import { listAdminOrders, updateOrderStatus, type OrderStatus } from "~/lib/admin-orders.server";
import { formatPrice } from "~/lib/formatPrice";
import { cn } from "~/lib/cn";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Pedidos · Admin · KINARA" }];
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_CLASSES: Record<OrderStatus, string> = {
  processing: "bg-clay/10 text-clay",
  shipped: "bg-espresso/10 text-espresso",
  delivered: "bg-sage/15 text-sage",
  cancelled: "bg-line text-muted",
};

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const orders = await listAdminOrders();
  return { orders };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const id = String(form.get("id"));
  const status = String(form.get("status")) as OrderStatus;
  await updateOrderStatus(id, status);
  return { ok: true };
}

export default function AdminPedidos({ loaderData }: Route.ComponentProps) {
  const { orders } = loaderData;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-2xl text-espresso">Pedidos</h2>

      {orders.length === 0 ? (
        <p className="rounded-xl bg-bone p-8 text-center text-sm text-muted">
          Todavía no hay pedidos.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-bone">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Folio
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Cliente
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Total
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Fecha
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <OrderRow key={o.id} order={o} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderRow({
  order,
}: {
  order: {
    id: string;
    customerName: string;
    customerEmail: string;
    total: number;
    status: OrderStatus;
    createdAt: string;
  };
}) {
  const fetcher = useFetcher();
  const status = (fetcher.formData?.get("status") as OrderStatus | null) ?? order.status;

  return (
    <tr className="border-b border-line last:border-0 hover:bg-sand/60">
      <td className="px-5 py-3 text-sm font-medium text-espresso">{order.id}</td>
      <td className="px-5 py-3">
        <p className="text-sm text-espresso">{order.customerName}</p>
        <p className="text-[13px] text-muted">{order.customerEmail}</p>
      </td>
      <td className="px-5 py-3 text-sm text-espresso">{formatPrice(order.total)}</td>
      <td className="px-5 py-3 text-sm text-muted">
        {new Date(order.createdAt).toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>
      <td className="px-5 py-3">
        <fetcher.Form method="post">
          <input type="hidden" name="id" value={order.id} />
          <select
            name="status"
            defaultValue={order.status}
            onChange={(e) => fetcher.submit(e.currentTarget.form)}
            className={cn(
              "rounded-full border-0 px-3 py-1 text-[12px] font-medium outline-none",
              STATUS_CLASSES[status],
            )}
          >
            {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </fetcher.Form>
      </td>
    </tr>
  );
}
