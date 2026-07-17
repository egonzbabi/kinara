import { useMemo } from "react";
import { useSearchParams } from "react-router";
import type { Route } from "./+types/tienda";
import { ProductGrid } from "~/components/ProductGrid";
import { CATEGORY_LABELS, type Category, type Product } from "~/data/products";
import { getAllProducts } from "~/lib/catalog";
import { useScrollReveal } from "~/hooks/useScrollReveal";
import { cn } from "~/lib/cn";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Tienda · KINARA" },
    {
      name: "description",
      content:
        "Explora toda la colección KINARA: leggings, tops, sudaderas, capas y accesorios técnicos en tonos cálidos.",
    },
  ];
}

type Sort = "destacados" | "precio-asc" | "precio-desc" | "nuevo";

const SORTS: { value: Sort; label: string }[] = [
  { value: "destacados", label: "Destacados" },
  { value: "nuevo", label: "Novedades" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
];

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "Única"];

export async function loader() {
  const products = await getAllProducts();
  return { products };
}

export default function Tienda({ loaderData }: Route.ComponentProps) {
  useScrollReveal();
  const { products } = loaderData;
  const [params, setParams] = useSearchParams();
  const cat = (params.get("cat") as Category | null) ?? "todo";
  const sort = (params.get("sort") as Sort | null) ?? "destacados";
  const sizes = useMemo(
    () => params.get("talla")?.split(",").filter(Boolean) ?? [],
    [params],
  );
  const colors = useMemo(
    () => params.get("color")?.split(",").filter(Boolean) ?? [],
    [params],
  );
  const types = useMemo(
    () => params.get("tipo")?.split(",").filter(Boolean) ?? [],
    [params],
  );

  const allColors = useMemo(
    () => Array.from(new Map(products.flatMap((p) => p.colors).map((c) => [c.name, c])).values()),
    [products],
  );

  const allTypes = useMemo(
    () => Array.from(new Set(products.map((p) => p.kind))).sort(),
    [products],
  );

  const setParam = (key: string, value: string | null) => {
    const p = new URLSearchParams(params);
    if (value === null) p.delete(key);
    else p.set(key, value);
    setParams(p, { preventScrollReset: true });
  };

  const setCat = (next: Category | "todo") =>
    setParam("cat", next === "todo" ? null : next);

  const setSort = (next: Sort) =>
    setParam("sort", next === "destacados" ? null : next);

  const toggle = (key: string, value: string, list: string[]) => {
    const next = list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
    setParam(key, next.length ? next.join(",") : null);
  };

  const filtered = useMemo(() => {
    let list: Product[] = products.slice();
    if (cat !== "todo") list = list.filter((p) => p.category === cat);
    if (sizes.length)
      list = list.filter((p) => p.sizes.some((s) => sizes.includes(s)));
    if (colors.length)
      list = list.filter((p) =>
        p.colors.some((c) => colors.includes(c.name)),
      );
    if (types.length) list = list.filter((p) => types.includes(p.kind));

    switch (sort) {
      case "precio-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "precio-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "nuevo":
        list.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
        break;
      default:
        list.sort(
          (a, b) => Number(!!b.isBestseller) - Number(!!a.isBestseller),
        );
    }
    return list;
  }, [products, cat, sizes, colors, types, sort]);

  const heading =
    cat === "todo" ? "Toda la colección" : CATEGORY_LABELS[cat as Category];

  const clearAll = () => setParams(new URLSearchParams(), { preventScrollReset: true });

  const hasFilters =
    sizes.length > 0 || colors.length > 0 || types.length > 0 || cat !== "todo";

  return (
    <div className="pad py-[clamp(28px,4vw,56px)]">
      {/* Header */}
      <div className="reveal border-b border-line pb-7">
        <span className="label">Tienda · SS26</span>
        <h1 className="mt-2 font-display text-[clamp(34px,5.5vw,68px)] leading-none">
          {heading}
        </h1>
      </div>

      {/* Category chips */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["todo", "mujer", "hombre", "accesorios"] as const).map((c) => (
          <Chip
            key={c}
            active={cat === c}
            onClick={() => setCat(c)}
          >
            {c === "todo" ? "Todo" : CATEGORY_LABELS[c]}
          </Chip>
        ))}
      </div>

      {/* Filter bar */}
      <div className="sticky top-16 z-30 -mx-[clamp(20px,5vw,80px)] mt-6 border-y border-line bg-sand/90 px-[clamp(20px,5vw,80px)] py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {/* Sizes */}
          <div className="flex items-center gap-2">
            <span className="label">Talla</span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggle("talla", s, sizes)}
                  className={cn(
                    "min-w-8 rounded-md border px-2 py-1 text-[12px] font-medium transition-colors",
                    sizes.includes(s)
                      ? "border-espresso bg-espresso text-bone"
                      : "border-line hover:border-espresso",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Types */}
          <div className="flex items-center gap-2">
            <span className="label">Tipo</span>
            <div className="flex flex-wrap gap-1.5">
              {allTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => toggle("tipo", t, types)}
                  className={cn(
                    "rounded-md border px-2 py-1 text-[12px] font-medium transition-colors",
                    types.includes(t)
                      ? "border-espresso bg-espresso text-bone"
                      : "border-line hover:border-espresso",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-2">
            <span className="label">Color</span>
            <div className="flex flex-wrap gap-1.5">
              {allColors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => toggle("color", c.name, colors)}
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={colors.includes(c.name)}
                  className={cn(
                    "h-6 w-6 rounded-full border transition-[box-shadow,transform]",
                    colors.includes(c.name)
                      ? "ring-2 ring-espresso ring-offset-2 ring-offset-sand"
                      : "border-line hover:scale-110",
                  )}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="sort" className="label">
              Ordenar
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-md border border-line bg-bone px-3 py-1.5 text-[13px] font-medium outline-none focus:border-espresso"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Result meta */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted">
          {filtered.length}{" "}
          {filtered.length === 1 ? "artículo" : "artículos"}
        </p>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-[13px] font-medium text-muted underline-offset-4 hover:text-clay hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="mt-6">
        {filtered.length > 0 ? (
          <ProductGrid products={filtered} priorityCount={4} />
        ) : (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="font-display text-2xl">Sin resultados</p>
            <p className="max-w-[32ch] text-muted">
              Prueba a quitar algún filtro para ver más piezas.
            </p>
            <button
              onClick={clearAll}
              className="btn btn-outline mt-2"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-espresso bg-espresso text-bone"
          : "border-line hover:border-espresso",
      )}
    >
      {children}
    </button>
  );
}
