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
import type { ProductSize } from "~/lib/catalog-constants";
import { cn } from "~/lib/cn";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Movimientos de inventario · Admin · KINARA" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const [rows, movements] = await Promise.all([listInventory(), listInventoryMovements()]);
  return { rows, movements };
}

type ActionData = { error: string } | { success: true; resultingStock: number };

export async function action({ request }: Route.ActionArgs) {
  const { adminId, adminName } = await requireAdmin(request);
  const form = await request.formData();

  const productId = String(form.get("productId") || "");
  const colorName = String(form.get("colorName") || "");
  const size = String(form.get("size") || "");
  const type = String(form.get("type") || "");
  const quantity = Number(form.get("quantity") || 0);
  const concept = String(form.get("concept") || "").trim();
  const movementDate = String(form.get("movementDate") || "");

  if (!productId || !colorName || !size) {
    return { error: "Selecciona un SKU válido." } satisfies ActionData;
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
    // adminId/adminName vienen de la sesión verificada en el servidor (requireAdmin),
    // no del formulario — así no se puede falsear quién hizo el movimiento.
    const resultingStock = await createInventoryMovement({
      productId,
      colorName,
      size: size as ProductSize,
      type,
      quantity,
      concept,
      movementDate,
      adminId,
      adminName,
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

/** Fecha/hora real de registro (created_at, un instante real con zona horaria) —
 * a diferencia de movement_date, aquí sí corresponde convertir a hora de México. */
function formatRegisteredAt(isoString: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  }).format(new Date(isoString));
}

const labelClass = "text-sm font-medium text-espresso";
const inputClass =
  "w-full rounded-lg border border-line bg-bone px-4 py-2.5 text-sm text-espresso placeholder:text-muted focus:border-clay focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export default function AdminInventarioMovimientos({ loaderData }: Route.ComponentProps) {
  const { rows, movements } = loaderData;
  const fetcher = useFetcher<ActionData>();
  const isSubmitting = fetcher.state === "submitting";

  const [type, setType] = useState<MovementType>("entrada");
  const [skuInput, setSkuInput] = useState("");
  const [quantity, setQuantity] = useState("");
  const [concept, setConcept] = useState("");
  const [movementDate, setMovementDate] = useState(todayLocal());
  const [showSuccess, setShowSuccess] = useState(false);

  // Cada fila de listInventory() ya es una variante única (producto+color+talla)
  // con su SKU — es el catálogo completo para el buscador y para resolver el SKU
  // elegido de vuelta a producto/color/talla.
  const skuRows = useMemo(() => rows.filter((r) => r.sku), [rows]);
  const bySku = useMemo(() => {
    const map = new Map<string, (typeof skuRows)[number]>();
    for (const r of skuRows) if (r.sku) map.set(r.sku, r);
    return map;
  }, [skuRows]);

  const selected = bySku.get(skuInput.trim());
  const skuTyped = skuInput.trim().length > 0;
  const skuNotFound = skuTyped && !selected;

  // Al llegar una respuesta exitosa: limpia cantidad/concepto para el siguiente
  // registro (se deja SKU/tipo/fecha, lo normal es seguir cargando movimientos
  // del mismo pedido o del mismo día).
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
          Registra entradas y salidas de stock por SKU — cada movimiento ajusta el inventario y
          queda en el historial de abajo, con fecha, usuario y hora de registro.
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

          <div>
            <label className={labelClass} htmlFor="mov-sku">
              SKU
            </label>
            <input
              id="mov-sku"
              type="text"
              list="sku-options"
              value={skuInput}
              onChange={(e) => setSkuInput(e.target.value)}
              placeholder="Escribe o elige un SKU…"
              className={cn(inputClass, "mt-1.5 font-mono")}
              autoComplete="off"
              required
            />
            <datalist id="sku-options">
              {skuRows.map((r) => (
                <option key={r.sku} value={r.sku!}>
                  {r.productName} · {r.colorName} · {r.size}
                </option>
              ))}
            </datalist>
            <input type="hidden" name="productId" value={selected?.productId ?? ""} />
            <input type="hidden" name="colorName" value={selected?.colorName ?? ""} />
            <input type="hidden" name="size" value={selected?.size ?? ""} />

            {skuNotFound && (
              <p className="mt-1.5 text-sm text-clay">No se encontró ningún SKU con ese valor.</p>
            )}
            {selected && (
              <div className="mt-2.5 rounded-lg bg-sand p-3 text-sm">
                <p className="text-espresso">
                  <span className="font-semibold">{selected.productName}</span>
                  {selected.productName !== selected.productSlug && (
                    <span className="text-muted"> (nombre original: {selected.productSlug})</span>
                  )}
                </p>
                <p className="mt-0.5 text-muted">
                  {selected.colorName} · {selected.size} — Stock actual:{" "}
                  <span className="font-semibold text-espresso">{selected.stock}</span> unidades
                </p>
              </div>
            )}
          </div>

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
              Fecha del movimiento
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
            <p className="mt-1.5 text-xs text-muted">
              El día al que corresponde el movimiento — la fecha y hora reales de registro se
              guardan aparte, junto con tu usuario.
            </p>
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
              disabled={isSubmitting || !selected}
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
                    Fecha del movimiento
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
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Registrado
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
                    <td className="whitespace-nowrap px-5 py-3 text-[13px] text-muted">
                      {formatRegisteredAt(m.createdAt)}
                      <br />
                      <span className="text-espresso">{m.adminName}</span>
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
