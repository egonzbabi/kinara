import { useMemo, useState } from "react";
import { Link, useFetcher } from "react-router";
import type { Route } from "./+types/admin.inventario.conteo";
import { requireAdmin } from "~/lib/session.server";
import { listInventory, type InventoryRow } from "~/lib/admin-catalog.server";
import {
  listInventoryCounts,
  saveInventoryCounts,
  clearInventoryCounts,
  type InventoryCountInput,
} from "~/lib/admin-inventory-counts.server";
import { SIZE_ORDER } from "~/lib/admin-inventory-groups";
import { baseSkuFrom } from "~/lib/slug";
import { productImage } from "~/lib/productImage";
import { cn } from "~/lib/cn";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Conteo físico · Inventario · Admin · KINARA" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const [rows, counts] = await Promise.all([listInventory(), listInventoryCounts()]);
  return { rows, counts };
}

type ActionData =
  | { error: string }
  | { success: true; action: "save"; count: number }
  | { success: true; action: "clear" };

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);
  const body = (await request.json()) as
    | { action: "clear" }
    | { action: "save"; counts: InventoryCountInput[] };

  try {
    if (body.action === "clear") {
      await clearInventoryCounts();
      return { success: true, action: "clear" } satisfies ActionData;
    }
    if (body.action === "save") {
      if (!Array.isArray(body.counts) || body.counts.length === 0) {
        return { error: "No hay ningún conteo capturado para guardar." } satisfies ActionData;
      }
      await saveInventoryCounts(body.counts);
      return { success: true, action: "save", count: body.counts.length } satisfies ActionData;
    }
    return { error: "Acción inválida." } satisfies ActionData;
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "No se pudo guardar el conteo.",
    } satisfies ActionData;
  }
}

type CountedGroup = {
  productId: string;
  productName: string;
  productSlug: string;
  kind: string;
  isDraft: boolean;
  photoUrl: string;
  baseSku: string;
  colors: {
    colorName: string;
    photoUrl: string;
    sizes: Partial<
      Record<(typeof SIZE_ORDER)[number], { key: string; sku: string | null; stock: number }>
    >;
  }[];
};

function cellKey(productId: string, colorName: string, size: string) {
  return `${productId}|${colorName}|${size}`;
}

function groupRows(rows: InventoryRow[]): CountedGroup[] {
  const groups = new Map<string, CountedGroup>();
  for (const r of rows) {
    let group = groups.get(r.productId);
    if (!group) {
      group = {
        productId: r.productId,
        productName: r.productName,
        productSlug: r.productSlug,
        kind: r.kind,
        isDraft: r.isDraft,
        photoUrl: r.photoUrl,
        baseSku: r.sku ? baseSkuFrom(r.sku) : "",
        colors: [],
      };
      groups.set(r.productId, group);
    }
    let color = group.colors.find((c) => c.colorName === r.colorName);
    if (!color) {
      color = { colorName: r.colorName, photoUrl: r.photoUrl, sizes: {} };
      group.colors.push(color);
    }
    color.sizes[r.size] = { key: cellKey(r.productId, r.colorName, r.size), sku: r.sku, stock: r.stock };
  }
  return Array.from(groups.values());
}

const inputClass =
  "rounded-lg border border-line bg-bone px-4 py-2.5 text-sm text-espresso placeholder:text-muted focus:border-clay focus:outline-none";

export default function AdminInventarioConteo({ loaderData }: Route.ComponentProps) {
  const { rows, counts } = loaderData;
  const fetcher = useFetcher<ActionData>();
  const isSaving = fetcher.state === "submitting";

  const groups = useMemo(() => groupRows(rows), [rows]);
  const savedByKey = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of counts) map.set(cellKey(c.productId, c.colorName, c.size), c.countedStock);
    return map;
  }, [counts]);

  // Estado local: lo que se ve escrito en cada casilla ahora mismo, ya sea que
  // venga de un conteo guardado antes (se precarga) o que se esté escribiendo
  // en este momento. Vacío = todavía no se contó esa combinación.
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const [key, value] of savedByKey) initial[key] = String(value);
    return initial;
  });

  const [search, setSearch] = useState("");
  const [view, setView] = useState<"todos" | "diferencia" | "sin-contar">("todos");

  const setCell = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Métricas + filtro de vista se calculan sobre TODAS las celdas reales del
  // catálogo (no solo lo visible tras el buscador), para que "Capturados" y
  // "Con diferencia" siempre reflejen el conteo completo.
  const allCells = useMemo(
    () =>
      groups.flatMap((g) =>
        g.colors.flatMap((c) =>
          SIZE_ORDER.flatMap((s) => {
            const cell = c.sizes[s];
            return cell ? [cell] : [];
          }),
        ),
      ),
    [groups],
  );
  const totalCells = allCells.length;
  const capturedCells = allCells.filter((c) => (inputs[c.key] ?? "").trim() !== "");
  const withDifference = capturedCells.filter((c) => Number(inputs[c.key]) !== c.stock);

  const filteredGroups = useMemo(() => {
    const q = search.toLowerCase();
    return groups
      .filter(
        (g) =>
          !q ||
          g.productName.toLowerCase().includes(q) ||
          g.baseSku.toLowerCase().includes(q) ||
          g.colors.some((c) => c.colorName.toLowerCase().includes(q)),
      )
      .map((g) => {
        if (view === "todos") return g;
        return {
          ...g,
          colors: g.colors
            .map((c) => ({
              ...c,
              sizes: Object.fromEntries(
                Object.entries(c.sizes).filter(([, cell]) => {
                  if (!cell) return false;
                  const raw = inputs[cell.key] ?? "";
                  const captured = raw.trim() !== "";
                  if (view === "sin-contar") return !captured;
                  return captured && Number(raw) !== cell.stock;
                }),
              ) as CountedGroup["colors"][number]["sizes"],
            }))
            .filter((c) => Object.keys(c.sizes).length > 0),
        };
      })
      .filter((g) => g.colors.length > 0);
  }, [groups, search, view, inputs]);

  const handleSave = () => {
    const payload: InventoryCountInput[] = [];
    for (const cell of allCells) {
      const raw = (inputs[cell.key] ?? "").trim();
      if (raw === "") continue;
      const countedStock = Number(raw);
      if (!Number.isInteger(countedStock) || countedStock < 0) continue;
      const [productId, colorName, size] = cell.key.split("|");
      payload.push({
        productId,
        colorName,
        size: size as InventoryCountInput["size"],
        systemStock: cell.stock,
        countedStock,
      });
    }
    fetcher.submit(
      { action: "save", counts: payload },
      { method: "post", encType: "application/json" },
    );
  };

  const handleClear = () => {
    if (!confirm("¿Borrar todo el conteo guardado y empezar de nuevo? Esto no se puede deshacer.")) {
      return;
    }
    setInputs({});
    fetcher.submit({ action: "clear" }, { method: "post", encType: "application/json" });
  };

  const errorMessage = fetcher.data && "error" in fetcher.data ? fetcher.data.error : null;
  const successMessage =
    fetcher.data && "success" in fetcher.data
      ? fetcher.data.action === "save"
        ? `Guardado — ${fetcher.data.count} casillas capturadas.`
        : "Conteo borrado. Puedes empezar de nuevo."
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm text-muted">
          Escribe en cada casilla lo que contaste en papel para ese color y talla. La diferencia
          contra el sistema se calcula al momento — nada se ajusta en el inventario real hasta que
          tú decidas corregirlo (por ejemplo desde{" "}
          <Link to="/admin/inventario/movimientos" className="underline hover:text-clay">
            Movimientos
          </Link>
          ).
        </p>
        <Link
          to="/admin/inventario"
          className="btn btn-outline whitespace-nowrap px-5 py-2.5 text-[13px]"
        >
          ← Inventario
        </Link>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="overflow-hidden rounded-xl bg-bone p-4">
          <p className="label text-[11px] text-muted">Capturados</p>
          <p className="mt-1 font-display text-[clamp(18px,3.2vw,26px)] leading-tight text-espresso">
            {capturedCells.length} / {totalCells}
          </p>
        </div>
        <div className="overflow-hidden rounded-xl bg-bone p-4">
          <p className="label text-[11px] text-muted">Con diferencia</p>
          <p
            className={cn(
              "mt-1 font-display text-[clamp(18px,3.2vw,26px)] leading-tight",
              withDifference.length > 0 ? "text-clay" : "text-espresso",
            )}
          >
            {withDifference.length}
          </p>
        </div>
        <div className="overflow-hidden rounded-xl bg-bone p-4">
          <p className="label text-[11px] text-muted">Sin contar</p>
          <p className="mt-1 font-display text-[clamp(18px,3.2vw,26px)] leading-tight text-espresso">
            {totalCells - capturedCells.length}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Buscar producto, color o SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(inputClass, "sm:max-w-xs")}
          />
          <select
            value={view}
            onChange={(e) => setView(e.target.value as typeof view)}
            className={inputClass}
          >
            <option value="todos">Mostrar todo</option>
            <option value="diferencia">Solo con diferencia</option>
            <option value="sin-contar">Solo sin contar</option>
          </select>
        </div>
        <div className="flex gap-3">
          <a
            href="/admin/inventario/conteo/excel"
            className="btn btn-outline whitespace-nowrap px-5 py-2.5 text-[13px]"
          >
            Descargar diferencias (Excel)
          </a>
          <button
            type="button"
            onClick={handleClear}
            disabled={isSaving}
            className="btn btn-outline whitespace-nowrap px-5 py-2.5 text-[13px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Empezar de nuevo
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || capturedCells.length === 0}
            className="btn btn-clay whitespace-nowrap px-5 py-2.5 text-[13px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Guardando…" : "Guardar conteo"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <p className="rounded-lg bg-clay/10 px-4 py-3 text-sm font-medium text-clay">
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p className="rounded-lg bg-sage/10 px-4 py-3 text-sm font-medium text-espresso">
          {successMessage}
        </p>
      )}

      {filteredGroups.length === 0 ? (
        <p className="rounded-xl bg-bone p-8 text-center text-sm text-muted">
          No hay artículos que coincidan con los filtros.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredGroups.map((g) => (
            <article key={g.productId} className="overflow-hidden rounded-xl bg-bone">
              <div className="flex flex-wrap items-center gap-4 border-b border-line p-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-sand">
                  <img
                    src={productImage(g.photoUrl, { width: 112, height: 112 })}
                    alt={g.productName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-[10rem] flex-1">
                  <p className="text-sm font-medium text-espresso">{g.productName}</p>
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
              </div>

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
                          if (!cell) {
                            return (
                              <td key={s} className="px-3 py-2 text-center text-sm text-muted">
                                —
                              </td>
                            );
                          }
                          const raw = inputs[cell.key] ?? "";
                          const captured = raw.trim() !== "";
                          const counted = captured ? Number(raw) : null;
                          const diff = counted !== null ? counted - cell.stock : null;
                          return (
                            <td key={s} className="px-3 py-2">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[11px] text-muted" title="Stock en el sistema">
                                  Sistema: {cell.stock}
                                </span>
                                <input
                                  type="number"
                                  min={0}
                                  step={1}
                                  inputMode="numeric"
                                  value={raw}
                                  onChange={(e) => setCell(cell.key, e.target.value)}
                                  placeholder="—"
                                  title={cell.sku ?? undefined}
                                  className="w-16 rounded-md border border-line bg-white px-2 py-1 text-center text-[13px] text-espresso focus:border-clay focus:outline-none"
                                />
                                {diff !== null && (
                                  <span
                                    className={cn(
                                      "inline-flex min-w-8 justify-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                                      diff === 0
                                        ? "bg-sage/10 text-espresso"
                                        : "bg-clay/10 text-clay",
                                    )}
                                  >
                                    {diff === 0 ? "✓" : diff > 0 ? `+${diff}` : diff}
                                  </span>
                                )}
                              </div>
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
