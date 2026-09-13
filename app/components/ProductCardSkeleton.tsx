/**
 * Placeholder de una `ProductCard` mientras el catálogo todavía viaja del
 * servidor (loader diferido de la home, tarea 105) — mismas proporciones
 * (imagen `aspect-[4/5]`, título + precio debajo) para que no haya salto de
 * layout cuando la tarjeta real la reemplaza. Nunca pantalla en blanco
 * mientras carga (regla de `CLAUDE.md`).
 */
export function ProductCardSkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="aspect-[4/5] rounded-xl bg-bone" />
      <div className="flex items-start justify-between gap-3 pt-3">
        <div className="min-w-0 flex-1">
          <div className="h-4 w-3/4 rounded bg-bone" />
          <div className="mt-2 h-3 w-1/2 rounded bg-bone" />
        </div>
        <div className="h-4 w-12 shrink-0 rounded bg-bone" />
      </div>
    </div>
  );
}

/** Grilla de skeletons — mismas clases de grid que `ProductGrid`. */
export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Riel de skeletons — mismas clases de ancho por tarjeta que `BestsellerRail`. */
export function ProductRailSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden px-[clamp(20px,5vw,80px)] pb-2">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="w-[68vw] shrink-0 sm:w-[42vw] md:w-[30vw] lg:w-[23vw]"
        >
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}
