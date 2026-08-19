import { useEffect, useMemo, useState } from "react";
import { Link, useFetcher } from "react-router";
import type { Route } from "./+types/admin.inventario.movimientos";
import { requireAdmin } from "~/lib/session.server";
import { listInventory } from "~/lib/admin-catalog.server";
import {
  createInventoryMovement,
  listInventoryMovements,
  type MovementType,
} from "~/lib/admin-inventory-movements.server";
import { cn } from "~/lib/cn";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Movimientos de inventario · Admin · KINARA" }];
}

const SIZE_ORDER = ["S", "M", "L", "XL"] as const;

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const [rows, movements] = await Promise.all([listInventory(), listInventoryMovements()]);
  return { rows, movements };
}

type ActionData = { error: string } | { success: true; resultingStock: number };

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();

  const productId = String(form.get("productId") || "");
  const colorName = String(form.get("colorName") || "");
  const size = String(form.get("size") || "");
  const type = String(form.get("type") || "");
  const quantity = Number(form.get("quantity") || 0);
  const concept = String(form.get("concept") || "").trim();
  const movementDate = String(form.get("movementDate") || "");

  if (!productId || !colorName || !size) {
    return { error: "Selecciona producto, color y talla." } satisfies ActionData;
  }
  if (type !== "entrada" && type !== "salida") {
    return { error: "Tipo de movimiento inválido." } satisfies ActionData;
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { error: "La cantidad debe ser un número entero mayor a 0." } satisfies ActionData;
  }
  if (!concept) {
    return { error: "Escribe un concepto para el movimiento." } satisfies ActionData;
  }
  if (!movementDate) {
    return { error: "Selecciona una fecha." } satisfies ActionData;
  }

  try {
    const resultingStock = await createInventoryMovement({
      productId,
      colorName,
      size: size as "S" | "M" | "L" | "XL",
      type,
      quantity,
      concept,
      movementDate,
    });
    return { success: true, resultingStock } satisfies ActionData;
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "No se pudo registrar el movimiento.",
    } satisfies ActionData;
  }
}

const CONCEPT_SUGGESTIONS: Record<MovementType, string[]> = {
  entrada: [
    "Compra a proveedor",
    "Devolución de cliente",
    "Ajuste de conteo (sobrante)",
    "Traspaso entre bodegas",
  ],
  salida: [
    "Venta directa (fuera de la tienda)",
    "Merma o daño",
    "Ajuste de conteo (faltante)",
    "Muestra o regalo",
    "Traspaso entre bodegas",
  ],
};

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Formatea una fecha "YYYY-MM-DD" (sin hora) anclada a medianoche local — evita
 * el corrimiento de día que da un round-trip por UTC (ver tarea 057). */
function formatMovementDate(dateStr: string): string {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(
    new Date(`${dateStr}T00:00:00`),
  );
}

const labelClass = "text-sm font-medium text-espresso";
const inputClass =
  "w-full rounded-lg border border-line bg-bone px-4 py-2.5 text-sm text-espresso placeholder:text-muted focus:border-clay focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export default function AdminInventarioMovimientos({ loaderData }: Route.ComponentProps) {
  const { rows, movements } = loaderData;
  const fetcher = useFetcher<ActionData>();
  const isSubmitting = fetcher.state === "submitting";

  const [type, setType] = useState<MovementType>("entrada");
  const [productId, setProductId] = useState("");
  const [colorName, setColorName] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState("");
  const [concept, setConcept] = useState("");
  const [movementDate, setMovementDate] = useState(todayLocal());
  const [showSuccess, setShowSuccess] = useState(false);

  const products = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of rows) if (!seen.has(r.productId)) seen.set(r.productId, r.productName);
    return Array.from(seen, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [rows]);

  const colorsForProduct = useMemo(() => {
    if (!productId) return [];
    const seen: string[] = [];
    for (const r of rows) {
      if (r.productId === productId && !seen.includes(r.colorName)) seen.push(r.colorName);
    }
    return seen;
  }, [rows, productId]);

  const sizesForColor = useMemo(() => {
    if (!productId || !colorName) return [];
    return rows
      .filter((r) => r.productId === productId && r.colorName === colorName)
      .map((r) => ({ size: r.size, stock: r.stock }))
      .sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size));
  }, [rows, productId, colorName]);

  const currentStock = sizesForColor.find((s) => s.size === size)?.stock;

  // Al llegar una respuesta exitosa: limpia cantidad/concepto para el siguiente
  // registro (se deja producto/color/talla/tipo/fecha, lo normal es seguir
  // cargando movimientos del mismo pedido o del mismo día).
  useEffect(() => {
    if (fetcher.data && "success" in fetcher.data) {
      setQuantity("");
      setConcept("");
      setShowSuccess(true);
      const t = setTimeout(() => setShowSuccess(false), 4000);
      return () => clearTimeout(t);
    }
  }, [fetcher.data]);

  const errorMessage = fetcher.data && "error" in fetcher.data ? fetcher.data.error : null;
  const resultingStock =
    fetcher.data && "success" in fetcher.data ? fetcher.data.resultingStock : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Registra entradas y salidas de stock con fecha y concepto — cada movimiento ajusta el
          inventario y queda en el historial de abajo.
        </p>
        <Link
          to="/admin/inventario"
          className="btn btn-outline whitespace-nowrap px-5 py-2.5 text-[13px]"
        >
          ← Inventario
        </Link>
      </div>

      <div className="rounded-xl bg-bone p-5 sm:p-6">
        <fetcher.Form method="post" className="flex flex-col gap-5">
          <div>
            <p className={labelClass}>Tipo de movimiento</p>
            <div className="mt-2 inline-flex rounded-lg border border-line p-1">
              <button
                type="button"
                onClick={() => setType("entrada")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  type === "entrada" ? "bg-clay text-bone" : "text-espresso hover:bg-sand",
                )}
              >
                <span aria-hidden>+</span> Entrada
              </button>
              <button
                type="button"
                onClick={() => setType("salida")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  type === "salida" ? "bg-clay text-bone" : "text-espresso hover:bg-sand",
                )}
              >
                <span aria-hidden>−</span> Salida
              </button>
            </div>
            <input type="hidden" name="type" value={type} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass} htmlFor="mov-producto">
                Producto
              </label>
              <select
                id="mov-producto"
                name="productId"
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  setColorName("");
                  setSize("");
                }}
                className={cn(inputClass, "mt-1.5")}
                required
              >
                <option value="">Selecciona…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="mov-color">
                Color
              </label>
              <select
                id="mov-color"
                name="colorName"
                value={colorName}
                onChange={(e) => {
                  setColorName(e.target.value);
                  setSize("");
                }}
                className={cn(inputClass, "mt-1.5")}
                disabled={!productId}
                required
              >
                <option value="">Selecciona…</option>
                {colorsForProduct.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="mov-talla">
                Talla
              </label>
              <select
                id="mov-talla"
                name="size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className={cn(inputClass, "mt-1.5")}
                disabled={!colorName}
                required
              >
                <option value="">Selecciona…</option>
                {sizesForColor.map((s) => (
                  <option key={s.size} value={s.size}>
                    {s.size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {currentStock !== undefined && (
            <p className="text-sm text-muted">
              Stock actual: <span className="font-semibold text-espresso">{currentStock}</span>{" "}
              unidades
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass} htmlFor="mov-cantidad">
                Cantidad
              </label>
              <input
                id="mov-cantidad"
                type="number"
                name="quantity"
                min={1}
                step={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={cn(inputClass, "mt-1.5")}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="mov-concepto">
                Concepto
              </label>
              <input
                id="mov-concepto"
                type="text"
                name="concept"
                list="concept-suggestions"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="ej. Compra a proveedor"
                className={cn(inputClass, "mt-1.5")}
                required
              />
              <datalist id="concept-suggestions">
                {CONCEPT_SUGGESTIONS[type].map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="sm:w-56">
            <label className={labelClass} htmlFor="mov-fecha">
              Fecha
            </label>
            <input
              id="mov-fecha"
              type="date"
              name="movementDate"
              value={movementDate}
              onChange={(e) => setMovementDate(e.target.value)}
              max={todayLocal()}
              className={cn(inputClass, "mt-1.5")}
              required
            />
          </div>

          {errorMessage && <p className="text-sm font-medium text-clay">{errorMessage}</p>}
          {showSuccess && resultingStock !== null && (
            <p className="text-sm font-medium text-espresso">
              Movimiento registrado — nuevo stock: {resultingStock} unidades.
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-clay px-6 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Registrando…" : "Registrar movimiento"}
            </button>
          </div>
        </fetcher.Form>
      </div>

      {movements.length === 0 ? (
        <p className="rounded-xl bg-bone p-8 text-center text-sm text-muted">
          Todavía no hay movimientos registrados.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-bone">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Fecha
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Tipo
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Producto
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Color / Talla
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted">
                    Cantidad
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Concepto
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted">
                    Stock resultante
                  </th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-b border-line last:border-0 hover:bg-sand/60">
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-muted">
                      {formatMovementDate(m.movementDate)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold",
                          m.type === "entrada"
                            ? "bg-sage/10 text-espresso"
                            : "bg-clay/10 text-clay",
                        )}
                      >
                        {m.type === "entrada" ? "+ Entrada" : "− Salida"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-espresso">{m.productName}</td>
                    <td className="px-5 py-3 text-sm text-muted">
                      {m.colorName} · {m.size}
                    </td>
                    <td
                      className={cn(
                        "px-5 py-3 text-right text-sm font-semibold tabular-nums",
                        m.type === "entrada" ? "text-espresso" : "text-clay",
                      )}
                    >
                      {m.type === "entrada" ? "+" : "−"}
                      {m.quantity}
                    </td>
                    <td className="px-5 py-3 text-sm text-espresso">{m.concept}</td>
                    <td className="px-5 py-3 text-right text-sm tabular-nums text-muted">
                      {m.resultingStock}
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
