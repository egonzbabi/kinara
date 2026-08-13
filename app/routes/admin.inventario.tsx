import { useMemo, useState } from "react";
import type { Route } from "./+types/admin.inventario";
import { requireAdmin } from "~/lib/session.server";
import { listInventory, type InventoryRow } from "~/lib/admin-catalog.server";
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

function csvEscape(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadInventoryCsv(rows: InventoryRow[]) {
  const headers = [
    "Producto",
    "Categoría",
    "Tipo",
    "Color",
    "Talla",
    "SKU",
    "Stock",
    "Precio",
    "Precio anterior",
    "Estado",
    "Foto",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        csvEscape(r.productName),
        csvEscape(r.category),
        csvEscape(r.kind),
        csvEscape(r.colorName),
        csvEscape(r.size),
        csvEscape(r.sku ?? ""),
        csvEscape(r.stock),
        csvEscape(r.price ?? ""),
        csvEscape(r.compareAt ?? ""),
        csvEscape(r.isDraft ? "Borrador" : "Publicado"),
        csvEscape(r.photoUrl),
      ].join(","),
    ),
  ];
  // BOM UTF-8: sin esto, Excel abre acentos/ñ como caracteres corruptos.
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inventario-kinara-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminInventario({ loaderData }: Route.ComponentProps) {
  const { rows } = loaderData;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");

  const categories = ["Todas", ...new Set(rows.map((r) => r.category))];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => {
      const matchSearch =
        r.productName.toLowerCase().includes(q) ||
        (r.sku ?? "").toLowerCase().includes(q) ||
        r.colorName.toLowerCase().includes(q);
      const matchCat = category === "Todas" || r.category === category;
      return matchSearch && matchCat;
    });
  }, [rows, search, category]);

  const totalStock = filtered.reduce((n, r) => n + r.stock, 0);

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

      <div className="flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Buscar producto, color o SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(inputClass, "sm:max-w-xs")}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "Todas" ? "Todas las categorías" : c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => downloadInventoryCsv(filtered)}
            className="btn btn-outline whitespace-nowrap px-5 py-2.5 text-[13px]"
          >
            Descargar CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-clay whitespace-nowrap px-5 py-2.5 text-[13px]"
          >
            Imprimir
          </button>
        </div>
      </div>

      <p className="text-sm text-muted print:hidden">
        {filtered.length} {filtered.length === 1 ? "artículo" : "artículos"} · {totalStock} unidades en stock
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-xl bg-bone p-8 text-center text-sm text-muted">
          No hay artículos que coincidan con los filtros.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-bone print:rounded-none print:bg-transparent">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Foto
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Producto
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Color
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Talla
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    SKU
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted">
                    Stock
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted">
                    Precio
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={`${r.productId}-${r.colorName}-${r.size}`}
                    className="border-b border-line last:border-0 hover:bg-sand/60 print:break-inside-avoid"
                  >
                    <td className="px-5 py-2.5">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-sand">
                        <img
                          src={productImage(r.photoUrl, { width: 96, height: 96 })}
                          alt={`${r.productName} · ${r.colorName}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-2.5">
                      <p className="flex items-center gap-2 text-sm font-medium text-espresso">
                        {r.productName}
                        {r.isDraft && (
                          <span className="rounded-full bg-clay/10 px-2 py-0.5 text-[11px] font-semibold text-clay print:hidden">
                            Borrador
                          </span>
                        )}
                      </p>
                      <p className="text-[12px] capitalize text-muted">
                        {r.category} · {r.kind}
                      </p>
                    </td>
                    <td className="px-5 py-2.5 text-sm text-espresso">{r.colorName}</td>
                    <td className="px-5 py-2.5 text-sm text-espresso">{r.size}</td>
                    <td className="px-5 py-2.5 font-mono text-[12px] text-muted">{r.sku ?? "—"}</td>
                    <td className="px-5 py-2.5 text-right text-sm">
                      <span className={r.stock === 0 ? "text-clay" : "text-espresso"}>{r.stock}</span>
                    </td>
                    <td className="px-5 py-2.5 text-right text-sm text-espresso">
                      {r.price === null ? <span className="text-muted">—</span> : formatPrice(r.price)}
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
