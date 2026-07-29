import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/admin.pedidos";
import { requireAdmin } from "~/lib/session.server";
import {
  listAdminOrders,
  updateOrderStatus,
  type AdminOrderListItem,
  type OrderStatus,
} from "~/lib/admin-orders.server";
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
  const [expanded, setExpanded] = useState<string | null>(null);

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
                  <th className="w-8 px-5 py-3" />
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
                  <OrderRow
                    key={o.id}
                    order={o}
                    isExpanded={expanded === o.id}
                    onToggle={() => setExpanded(expanded === o.id ? null : o.id)}
                  />
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
  isExpanded,
  onToggle,
}: {
  order: AdminOrderListItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const fetcher = useFetcher();
  const status = (fetcher.formData?.get("status") as OrderStatus | null) ?? order.status;

  return (
    <>
      <tr
        className={cn(
          "cursor-pointer border-b border-line last:border-0 hover:bg-sand/60",
          isExpanded && "bg-sand/60",
        )}
        onClick={onToggle}
      >
        <td className="px-5 py-3 text-muted">
          <span
            aria-hidden
            className={cn("inline-block transition-transform", isExpanded && "rotate-90")}
          >
            ›
          </span>
        </td>
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
        <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
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
      {isExpanded && (
        <tr className="border-b border-line bg-sand/30 last:border-0">
          <td colSpan={6} className="px-5 py-5">
            <OrderDetail order={order} />
          </td>
        </tr>
      )}
    </>
  );
}

function OrderDetail({ order }: { order: AdminOrderListItem }) {
  const addr = order.shippingAddress;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <section>
        <h3 className="label mb-2 text-muted">Contacto</h3>
        <dl className="space-y-1 text-sm">
          <Row label="Nombre" value={order.customerName} />
          <Row label="Email" value={order.customerEmail} />
          <Row label="Teléfono" value={order.customerPhone || "—"} />
        </dl>
      </section>

      <section>
        <h3 className="label mb-2 text-muted">Envío</h3>
        <dl className="space-y-1 text-sm">
          <Row
            label="Dirección"
            value={
              addr
                ? `${addr.street1}, ${addr.areaLevel3}, ${addr.areaLevel2}, ${addr.areaLevel1}, CP ${addr.postalCode}`
                : "—"
            }
          />
          <Row label="Paquetería / servicio" value={order.shippingCarrier || "—"} />
          <Row
            label="Entrega estimada"
            value={
              order.shippingDays != null
                ? `${order.shippingDays} ${order.shippingDays === 1 ? "día" : "días"}`
                : "—"
            }
          />
          <Row label="Costo de envío" value={formatPrice(order.shippingFee)} />
        </dl>
      </section>

      <section>
        <h3 className="label mb-2 text-muted">Totales</h3>
        <dl className="space-y-1 text-sm">
          <Row label="Subtotal" value={formatPrice(order.subtotal)} />
          <Row label="Envío" value={formatPrice(order.shippingFee)} />
          <Row label="Total" value={formatPrice(order.total)} />
          <Row label="Moneda" value={order.currency.toUpperCase()} />
          <Row label="ID sesión Stripe" value={order.stripeSessionId} mono />
        </dl>
      </section>

      <section className="md:col-span-3">
        <h3 className="label mb-2 text-muted">Productos</h3>
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-bone">
                <th className="px-3 py-2 text-left font-medium text-muted">Producto</th>
                <th className="px-3 py-2 text-left font-medium text-muted">Color</th>
                <th className="px-3 py-2 text-left font-medium text-muted">Talla</th>
                <th className="px-3 py-2 text-right font-medium text-muted">Cant.</th>
                <th className="px-3 py-2 text-right font-medium text-muted">Precio</th>
                <th className="px-3 py-2 text-right font-medium text-muted">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 text-espresso">{item.productName}</td>
                  <td className="px-3 py-2 text-muted">{item.colorName ?? "—"}</td>
                  <td className="px-3 py-2 text-muted">{item.size}</td>
                  <td className="px-3 py-2 text-right text-muted">{item.quantity}</td>
                  <td className="px-3 py-2 text-right text-muted">{formatPrice(item.price)}</td>
                  <td className="px-3 py-2 text-right text-espresso">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className={cn("text-right text-espresso", mono && "font-mono text-[12px]")}>{value}</dd>
    </div>
  );
}
