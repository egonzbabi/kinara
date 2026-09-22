import type { Product } from "~/data/products";

export type NavLinkItem = { to: string; label: string };

/**
 * Orden preferido de los tipos de ropa ya conocidos, tanto para el menú
 * principal como para "Destacados" en /tienda (antes vivía duplicado en
 * SiteNav.tsx y tienda.tsx — un solo lugar, ya no se pueden desincronizar).
 * Un tipo que hoy no tiene ningún producto (ej. "Legging") simplemente no
 * aparece; un tipo nuevo que no está en esta lista (ej. "Vestido") se agrega
 * solo al final, en orden alfabético — ver `buildShopNavLinks` (tarea 127).
 */
export const PREFERRED_KIND_ORDER = [
  "Top",
  "Bottom",
  "Legging",
  "Chaqueta",
  "Enterizo",
  "Set",
];

/**
 * Enlaces de tipo de ropa del menú/footer, calculados desde el catálogo real
 * en vez de una lista fija — así un tipo sin stock desaparece y uno nuevo
 * aparece sin tocar código (tarea 127). "Accesorios" sigue siendo un solo
 * enlace por categoría, no uno por cada `kind` de accesorio (bandas, guantes,
 * bolsas, ...) — eso ya funcionaba así y no es parte de este cambio.
 */
export function buildShopNavLinks(products: Product[]): NavLinkItem[] {
  const presentKinds = new Set(
    products.filter((p) => p.category !== "accesorios").map((p) => p.kind),
  );
  const known = PREFERRED_KIND_ORDER.filter((k) => presentKinds.has(k));
  const extra = [...presentKinds]
    .filter((k) => !PREFERRED_KIND_ORDER.includes(k))
    .sort((a, b) => a.localeCompare(b, "es"));
  const typeLinks: NavLinkItem[] = [...known, ...extra].map((kind) => ({
    to: `/tienda?tipo=${encodeURIComponent(kind)}`,
    label: kind,
  }));

  return [
    { to: "/tienda", label: "Tienda" },
    { to: "/tienda?oferta=1", label: "Ofertas" },
    ...typeLinks,
    { to: "/tienda?cat=accesorios", label: "Accesorios" },
  ];
}
