import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/admin.inventario";
import { requireAdmin } from "~/lib/session.server";
import { listInventory } from "~/lib/admin-catalog.server";
import { SIZE_ORDER, groupByProduct } from "~/lib/admin-inventory-groups";
import { baseSkuFrom } from "~/lib/slug";
import { formatPrice } from "~/lib/formatPrice";
import { productImage } from "~/lib/productImage";
import { cn } from "~/lib/cn";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Inventario · Admin · KINARA" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const rows = await listInventory();
  return { rows };
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-bone p-4">
      <p className="label text-[11px] text-muted">{label}</p>
      <p
        className={cn(
          "mt-1 truncate font-display text-[clamp(18px,3.2vw,26px)] leading-tight",
          accent ? "text-clay" : "text-espresso",
        )}
        title={String(value)}
      >
        {value}
      </p>
    </div>
  );
}

export default function AdminInventario({ loaderData }: Route.ComponentProps) {
  const { rows } = loaderData;
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("Todos");
  const [stockFilter, setStockFilter] = useState<"todos" | "con-stock" | "sin-stock">("todos");

  const kinds = ["Todos", ...new Set(rows.map((r) => r.kind))];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => {
      const matchSearch =
        r.productName.toLowerCase().includes(q) ||
        (r.sku ?? "").toLowerCase().includes(q) ||
        (r.sku ? baseSkuFrom(r.sku).toLowerCase().includes(q) : false) ||
        r.colorName.toLowerCase().includes(q);
      const matchKind = kind === "Todos" || r.kind === kind;
      const matchStock =
        stockFilter === "todos" ||
        (stockFilter === "con-stock" && r.stock > 0) ||
        (stockFilter === "sin-stock" && r.stock === 0);
      return matchSearch && matchKind && matchStock;
    });
  }, [rows, search, kind, stockFilter]);

  const groups = useMemo(() => groupByProduct(filtered), [filtered]);

  const totalStock = filtered.reduce((n, r) => n + r.stock, 0);
  const totalValue = filtered.reduce((n, r) => n + (r.price ?? 0) * r.stock, 0);

  const inputClass =
    "rounded-lg border border-line bg-bone px-4 py-2.5 text-sm text-espresso placeholder:text-muted focus:border-clay focus:outline-none";

  return (
    <div className="flex flex-col gap-6">
      {/* Solo visible al imprimir — el topbar (con el título) se oculta */}
      <div className="hidden print:block">
        <h1 className="font-display text-xl text-espresso">Inventario · KINARA</h1>
        <p className="text-sm text-muted">
          {new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(new Date())}
        </p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3 print:hidden sm:grid-cols-4">
        <StatCard label="Productos" value={groups.length} />
        <StatCard label="SKUs (color+talla)" value={filtered.length} />
        <StatCard label="Unidades en stock" value={totalStock} />
        <StatCard label="Valor de inventario" value={formatPrice(Math.round(totalValue))} />
      </div>

      <div className="flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Buscar producto, color o SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(inputClass, "sm:max-w-xs")}
          />
          <select value={kind} onChange={(e) => setKind(e.target.value)} className={inputClass}>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {k === "Todos" ? "Todos los tipos" : k}
              </option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
            className={inputClass}
          >
            <option value="todos">Cualquier stock</option>
            <option value="con-stock">Con stock</option>
            <option value="sin-stock">Sin stock</option>
          </select>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/inventario/movimientos"
            className="btn btn-outline whitespace-nowrap px-5 py-2.5 text-[13px]"
          >
            Movimientos
          </Link>
          <Link
            to="/admin/inventario/conteo"
            className="btn btn-outline whitespace-nowrap px-5 py-2.5 text-[13px]"
          >
            Conteo físico
          </Link>
          <a
            href={`/admin/inventario/excel?search=${encodeURIComponent(search)}&kind=${encodeURIComponent(kind)}`}
            className="btn btn-outline whitespace-nowrap px-5 py-2.5 text-[13px]"
          >
            Descargar Excel
          </a>
          <a
            href={`/admin/inventario/pdf?search=${encodeURIComponent(search)}&kind=${encodeURIComponent(kind)}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-clay whitespace-nowrap px-5 py-2.5 text-[13px]"
          >
            Imprimir
          </a>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-xl bg-bone p-8 text-center text-sm text-muted">
          No hay artículos que coincidan con los filtros.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((g) => (
            <article
              key={g.productId}
              className="overflow-hidden rounded-xl bg-bone print:break-inside-avoid print:rounded-none print:border print:border-line"
            >
              {/* Encabezado del producto */}
              <div className="flex flex-wrap items-center gap-4 border-b border-line p-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                  <img
                    src={productImage(g.photoUrl, { width: 128, height: 128 })}
                    alt={g.productName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-[10rem] flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-espresso">
                    {g.productName}
                    {g.isDraft && (
                      <span className="rounded-full bg-clay/10 px-2 py-0.5 text-[11px] font-semibold text-clay print:hidden">
                        Borrador
                      </span>
                    )}
                  </p>
                  <p className="font-mono text-[12px] text-muted">{g.productSlug}</p>
                  <p className="text-[12px] text-muted">
                    {g.kind}
                    {g.baseSku && (
                      <>
                        {" "}
                        · SKU <span className="font-mono">{g.baseSku}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="label text-[11px] text-muted">Stock total</p>
                  <p
                    className={cn(
                      "font-display text-xl",
                      g.totalStock === 0 ? "text-clay" : "text-espresso",
                    )}
                  >
                    {g.totalStock}
                  </p>
                </div>
                <div className="text-right">
                  <p className="label text-[11px] text-muted">Precio</p>
                  <p className="font-display text-xl text-espresso">
                    {g.price === null ? <span className="text-muted">—</span> : formatPrice(g.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="label text-[11px] text-muted">Valor</p>
                  <p className="font-display text-xl text-espresso">{formatPrice(g.value)}</p>
                </div>
              </div>

              {/* Matriz color × talla */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-muted">
                        Color
                      </th>
                      {SIZE_ORDER.map((s) => (
                        <th
                          key={s}
                          className="px-3 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-muted"
                        >
                          {s}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {g.colors.map((c) => (
                      <tr
                        key={c.colorName}
                        className="border-b border-line last:border-0 hover:bg-sand/60"
                      >
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 shrink-0 overflow-hidden rounded-md bg-sand">
                              <img
                                src={productImage(c.photoUrl, { width: 56, height: 56 })}
                                alt={c.colorName}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <span className="text-sm text-espresso">{c.colorName}</span>
                          </div>
                        </td>
                        {SIZE_ORDER.map((s) => {
                          const cell = c.sizes[s];
                          return (
                            <td key={s} className="px-3 py-2 text-center">
                              <span
                                title={cell?.sku ?? "Talla no disponible en este color"}
                                className={cn(
                                  "inline-flex min-w-8 justify-center rounded-md px-2 py-1 text-[13px] font-medium tabular-nums",
                                  !cell || cell.stock === 0
                                    ? "bg-clay/10 text-clay"
                                    : "bg-sage/10 text-espresso",
                                )}
                              >
                                {cell ? cell.stock : "—"}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
