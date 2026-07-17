import { useMemo, useState } from "react";
import { Link, useFetcher } from "react-router";
import type { Route } from "./+types/admin.productos";
import { requireAdmin } from "~/lib/session.server";
import { listAdminProducts } from "~/lib/admin-catalog.server";
import { formatPrice } from "~/lib/formatPrice";
import { cn } from "~/lib/cn";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Productos · Admin · KINARA" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const products = await listAdminProducts();
  return { products };
}

export default function AdminProductos({ loaderData }: Route.ComponentProps) {
  const { products } = loaderData;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteFetcher = useFetcher();

  const categories = ["Todas", ...new Set(products.map((p) => p.category))];

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "Todas" || p.category === category;
      return matchSearch && matchCat;
    });
  }, [products, search, category]);

  const inputClass =
    "rounded-lg border border-line bg-bone px-4 py-2.5 text-sm text-espresso placeholder:text-muted focus:border-clay focus:outline-none";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Buscar producto…"
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
        <Link to="nuevo" className="btn btn-clay whitespace-nowrap px-5 py-2.5 text-[13px]">
          + Nuevo producto
        </Link>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl bg-bone p-8 text-center text-sm text-muted">
          No hay productos que coincidan con los filtros.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-bone">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Producto
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Precio
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Categoría
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Stock
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0 hover:bg-sand/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-sand">
                          <img src={p.thumbnailUrl} alt={p.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-espresso">{p.name}</p>
                          {p.colors.length > 0 && (
                            <div className="mt-1 flex gap-1">
                              {p.colors.slice(0, 5).map((c) => (
                                <span
                                  key={c.name}
                                  title={c.name}
                                  className="h-2.5 w-2.5 rounded-full border border-line"
                                  style={{ background: c.hex ?? "#CCCCCC" }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-espresso">{formatPrice(p.price)}</td>
                    <td className="px-5 py-3 text-sm capitalize text-muted">{p.category}</td>
                    <td className="px-5 py-3 text-sm">
                      <span className={p.totalStock === 0 ? "text-clay" : "text-espresso"}>
                        {p.totalStock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link to={p.id} className="text-sm text-espresso hover:text-clay">
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteId(p.id)}
                          className="text-sm text-muted hover:text-clay"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-espresso/50" onClick={() => setDeleteId(null)} />
          <div className="relative w-full max-w-sm rounded-xl bg-bone p-6">
            <h3 className="font-display text-lg text-espresso">Eliminar producto</h3>
            <p className="mt-2 text-sm text-muted">
              Esta acción no se puede deshacer. Se eliminarán sus variantes y fotos.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="btn btn-outline flex-1 px-4 py-2.5 text-sm"
              >
                Cancelar
              </button>
              <deleteFetcher.Form
                method="post"
                action={`${deleteId}/eliminar`}
                className="flex-1"
                onSubmit={() => setDeleteId(null)}
              >
                <button type="submit" className="btn btn-clay w-full px-4 py-2.5 text-sm">
                  Eliminar
                </button>
              </deleteFetcher.Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
