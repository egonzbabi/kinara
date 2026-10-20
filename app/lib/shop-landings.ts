import type { Product } from "~/data/products";
import { SIZE_ORDER } from "~/lib/catalog-constants";
import { formatPrice } from "~/lib/formatPrice";

/**
 * Páginas propias por tipo de prenda (tarea 136, SEO). Cada una es una página
 * indexable con su propio título, H1, texto y canonical — a diferencia de las
 * vistas filtradas de /tienda (`?tipo=`, `?cat=`), que son la misma página
 * reordenada y por eso apuntan a /tienda.
 *
 * Los textos solo resumen lo que ya dicen las descripciones de los productos
 * (nada de características inventadas). Si un tipo no tiene ningún producto,
 * la página da 404 y no entra al sitemap — ver `landingProducts`.
 */
export type ShopLanding = {
  slug: string;
  /** Etiqueta corta para enlaces entre páginas. */
  navLabel: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  match: (p: Product) => boolean;
};

const isClothing = (p: Product) => p.category !== "accesorios";

export const SHOP_LANDINGS: ShopLanding[] = [
  {
    slug: "conjuntos-deportivos",
    navLabel: "Conjuntos",
    title: "Conjuntos deportivos para mujer · KINARA",
    h1: "Conjuntos deportivos para mujer",
    description:
      "Conjuntos deportivos de legging y top, top y short o pantalón acampanado. Tela elástica y suave, en varios colores. Envíos a todo México.",
    intro:
      "Conjuntos deportivos de legging y top, de top y short, o con pantalón acampanado. Tejidos elásticos y suaves que se ajustan al cuerpo, con opciones bicolor, sin costuras, de malla y de estampado camuflaje. Ideales para yoga, pilates, entrenar o uso diario.",
    match: (p) => isClothing(p) && p.kind === "Set",
  },
  {
    slug: "tops-deportivos",
    navLabel: "Tops",
    title: "Tops deportivos para mujer · KINARA",
    h1: "Tops deportivos para mujer",
    description:
      "Tops deportivos, bras, crop tops y playeras de tela suave y transpirable. Algunos con almohadillas removibles. Envíos a todo México.",
    intro:
      "Tops deportivos, bras, crop tops, playeras y tops de tirantes en tela suave y transpirable, algunos con almohadillas removibles. Para yoga, pilates, entrenar o uso casual.",
    match: (p) => isClothing(p) && p.kind === "Top",
  },
  {
    slug: "leggings-deportivos",
    navLabel: "Leggings",
    title: "Leggings deportivos para mujer · KINARA",
    h1: "Leggings deportivos para mujer",
    description:
      "Leggings deportivos ultra ligeros, de tiro alto, acampanados o afelpados para clima frío. Tela elástica que moldea la figura. Envíos a todo México.",
    intro:
      "Leggings deportivos ultra ligeros, de tiro alto, acampanados (flare), con control de abdomen o afelpados para clima frío. Tela elástica que moldea la figura, para yoga, entrenar o uso diario.",
    match: (p) => isClothing(p) && /leggin/i.test(p.name),
  },
  {
    slug: "chamarras-y-sudaderas-deportivas",
    navLabel: "Chamarras y sudaderas",
    title: "Chamarras y sudaderas deportivas para mujer · KINARA",
    h1: "Chamarras y sudaderas deportivas para mujer",
    description:
      "Chamarras, chaquetas y sudaderas deportivas con capucha, hoodies oversize o crop y chamarra estilo anorak. Envíos a todo México.",
    intro:
      "Chamarras, chaquetas y sudaderas deportivas: con capucha y cierre completo, hoodies oversize o crop, y chamarra estilo anorak cortavientos. Para entrenar, actividades al aire libre o uso diario.",
    match: (p) => isClothing(p) && p.kind === "Chaqueta",
  },
  {
    slug: "enterizos-deportivos",
    navLabel: "Enterizos",
    title: "Enterizos deportivos para mujer · KINARA",
    h1: "Enterizos deportivos para mujer",
    description:
      "Enterizos deportivos cortos y largos, con espalda abierta, cuello camisero o tela ultra suave. Envíos a todo México.",
    intro:
      "Enterizos deportivos cortos y largos, con espalda abierta, cuello camisero o tela ultra suave. Para entrenar, hacer yoga o usar todos los días.",
    match: (p) => isClothing(p) && p.kind === "Enterizo",
  },
  {
    slug: "pants-deportivos",
    navLabel: "Pants",
    title: "Pants deportivos para mujer · KINARA",
    h1: "Pants deportivos para mujer",
    description:
      "Pants deportivos de corte ancho, relajado o acampanado, con cintura elástica y tela suave. Envíos a todo México.",
    intro:
      "Pants deportivos de corte ancho, relajado o acampanado (flare), con cintura elástica y tela suave. Para entrenar, descansar o uso casual.",
    match: (p) => isClothing(p) && /pants/i.test(p.name),
  },
];

export function getLanding(slug: string): ShopLanding | undefined {
  return SHOP_LANDINGS.find((l) => l.slug === slug);
}

/** Productos de la página, con los más vendidos primero y luego los nuevos. */
export function landingProducts(landing: ShopLanding, all: Product[]): Product[] {
  return all
    .filter(landing.match)
    .sort(
      (a, b) =>
        Number(!!b.isBestseller) - Number(!!a.isBestseller) ||
        Number(!!b.isNew) - Number(!!a.isNew),
    );
}

/** Páginas que sí tienen productos (las únicas que se enlazan y van al sitemap). */
export function activeLandings(all: Product[]): ShopLanding[] {
  return SHOP_LANDINGS.filter((l) => landingProducts(l, all).length > 0);
}

/**
 * Tarjetas "Encuentra lo tuyo" del inicio (tipo de `kind`) → página propia por
 * tipo (tarea 144). Bottom y Vestido no tienen una sola página (Bottom agrupa
 * leggings, pants, shorts y falda) y siguen apuntando al filtro de /tienda.
 */
export const TILE_LANDING_SLUG: Record<string, string> = {
  Top: "tops-deportivos",
  Chaqueta: "chamarras-y-sudaderas-deportivas",
  Enterizo: "enterizos-deportivos",
  Set: "conjuntos-deportivos",
};

/**
 * Texto con datos reales de la colección (modelos, precios, tallas y colores),
 * calculado del catálogo — sirve de contenido propio y distinto en cada página
 * por tipo (tarea 144), sin inventar nada. Se actualiza solo con el catálogo.
 */
export function landingFacts(products: Product[]): string {
  const n = products.length;
  const prices = products.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const priceText =
    min === max
      ? `con precio de ${formatPrice(min)} MXN`
      : `con precios desde ${formatPrice(min)} hasta ${formatPrice(max)} MXN`;

  const sizes = SIZE_ORDER.filter((s) => products.some((p) => p.sizes.includes(s)));
  const sizeText = sizes.length > 1 ? `${sizes.slice(0, -1).join(", ")} y ${sizes.at(-1)}` : sizes[0];

  // Un color puede estar escrito distinto en cada producto ("Palo De Rosa" /
  // "Palo de Rosa", "Café" / "Cafe"): se agrupa sin mayúsculas ni acentos para
  // no repetirlo, y se muestra con la primera forma que aparece.
  const norm = (c: string) =>
    c
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const counts = new Map<string, { label: string; n: number }>();
  for (const p of products)
    for (const c of p.colors) {
      const entry = counts.get(norm(c.name)) ?? { label: c.name.toLowerCase(), n: 0 };
      entry.n += 1;
      counts.set(norm(c.name), entry);
    }
  const topColors = [...counts.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, 8)
    .map((e) => e.label);
  const colorText =
    topColors.length > 1 ? `${topColors.slice(0, -1).join(", ")} y ${topColors.at(-1)}` : topColors[0];

  return [
    `${n} ${n === 1 ? "modelo" : "modelos"} ${priceText}.`,
    sizeText ? `Tallas disponibles: ${sizeText}.` : null,
    colorText ? `Colores disponibles: ${colorText}, entre otros.` : null,
  ]
    .filter(Boolean)
    .join(" ");
}
