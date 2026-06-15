import { img, PHOTO } from "./images";

export type Category = "mujer" | "hombre" | "accesorios";

export type ColorOption = {
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  /** Short kind label, e.g. "Legging" */
  kind: string;
  /** Price in EUR */
  price: number;
  /** Optional original price for sale display */
  compareAt?: number;
  colors: ColorOption[];
  sizes: string[];
  gallery: string[];
  /** Small marketing badge */
  badge?: "Nuevo" | "Best-seller" | "Edición" | "Últimas unidades";
  isNew?: boolean;
  isBestseller?: boolean;
  description: string;
  materials: string;
};

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL"];

export const PRODUCTS: Product[] = [
  {
    id: "bruma",
    slug: "legging-bruma",
    name: "Legging Bruma",
    category: "mujer",
    kind: "Legging tiro alto",
    price: 78,
    colors: [
      { name: "Espresso", hex: "#2B2118" },
      { name: "Arcilla", hex: "#C2603D" },
      { name: "Salvia", hex: "#7C8466" },
    ],
    sizes: APPAREL_SIZES,
    gallery: [
      img(PHOTO.pBruma1, { w: 1000, h: 1250 }),
      img(PHOTO.pBruma2, { w: 1000, h: 1250 }),
    ],
    badge: "Best-seller",
    isBestseller: true,
    description:
      "Nuestro legging insignia. Tiro alto que sujeta sin apretar, costura plana y un tejido de compresión suave que se mueve contigo del estudio a la calle. Opaco en cualquier postura.",
    materials: "76% poliamida reciclada · 24% elastano. Tacto segunda piel.",
  },
  {
    id: "calma",
    slug: "top-calma",
    name: "Top Calma",
    category: "mujer",
    kind: "Top de sujeción media",
    price: 52,
    colors: [
      { name: "Arena", hex: "#E9E1D4" },
      { name: "Arcilla", hex: "#C2603D" },
      { name: "Espresso", hex: "#2B2118" },
    ],
    sizes: APPAREL_SIZES,
    gallery: [
      img(PHOTO.pCalma1, { w: 1000, h: 1250 }),
      img(PHOTO.pCalma2, { w: 1000, h: 1250 }),
    ],
    badge: "Nuevo",
    isNew: true,
    description:
      "Sujeción media con un favorecedor escote en U a la espalda. Bandas suaves que no marcan y un soporte fiable para yoga, pilates o entrenos de intensidad baja-media.",
    materials: "82% poliéster reciclado · 18% elastano. Forro transpirable.",
  },
  {
    id: "corteza",
    slug: "sudadera-corteza",
    name: "Sudadera Corteza",
    category: "mujer",
    kind: "Sudadera oversize",
    price: 95,
    compareAt: 120,
    colors: [
      { name: "Arena", hex: "#E9E1D4" },
      { name: "Salvia", hex: "#7C8466" },
    ],
    sizes: APPAREL_SIZES,
    gallery: [
      img(PHOTO.pCorteza1, { w: 1000, h: 1250 }),
      img(PHOTO.pCorteza2, { w: 1000, h: 1250 }),
    ],
    badge: "Edición",
    isBestseller: true,
    description:
      "Felpa de algodón cepillado por dentro, corte oversize y caída perfecta. La capa que te pones para el calentamiento y no te quitas en todo el día.",
    materials: "100% algodón orgánico cepillado, 380 g/m².",
  },
  {
    id: "sendero",
    slug: "chaqueta-sendero",
    name: "Chaqueta Sendero",
    category: "hombre",
    kind: "Cortavientos técnico",
    price: 139,
    colors: [
      { name: "Espresso", hex: "#2B2118" },
      { name: "Salvia", hex: "#7C8466" },
      { name: "Arcilla", hex: "#C2603D" },
    ],
    sizes: APPAREL_SIZES,
    gallery: [
      img(PHOTO.pSendero1, { w: 1000, h: 1250 }),
      img(PHOTO.pSendero2, { w: 1000, h: 1250 }),
    ],
    badge: "Nuevo",
    isNew: true,
    description:
      "Cortavientos ligero con repelencia al agua, capucha ajustable y bolsillos con cremallera. Se pliega en su propio bolsillo para llevarlo a cualquier parte.",
    materials: "100% nylon ripstop reciclado con acabado DWR sin PFC.",
  },
  {
    id: "aurora",
    slug: "sujetador-aurora",
    name: "Sujetador Aurora",
    category: "mujer",
    kind: "Sujetador alto impacto",
    price: 58,
    colors: [
      { name: "Espresso", hex: "#2B2118" },
      { name: "Arcilla", hex: "#C2603D" },
      { name: "Niebla", hex: "#C7C2B8" },
    ],
    sizes: APPAREL_SIZES,
    gallery: [
      img(PHOTO.pAurora1, { w: 1000, h: 1250 }),
      img(PHOTO.pAurora2, { w: 1000, h: 1250 }),
    ],
    isBestseller: true,
    description:
      "Máxima sujeción para correr y entrenos de alta intensidad. Espalda nadadora, copas extraíbles y bandas anchas que reparten la presión.",
    materials: "70% poliamida · 30% elastano. Copas moldeadas extraíbles.",
  },
  {
    id: "duna",
    slug: "camiseta-duna",
    name: "Camiseta Duna",
    category: "hombre",
    kind: "Camiseta técnica",
    price: 42,
    colors: [
      { name: "Arena", hex: "#E9E1D4" },
      { name: "Espresso", hex: "#2B2118" },
      { name: "Salvia", hex: "#7C8466" },
      { name: "Arcilla", hex: "#C2603D" },
    ],
    sizes: APPAREL_SIZES,
    gallery: [
      img(PHOTO.pDuna1, { w: 1000, h: 1250 }),
      img(PHOTO.pDuna2, { w: 1000, h: 1250 }),
    ],
    badge: "Best-seller",
    isBestseller: true,
    description:
      "La técnica que parece de algodón. Tejido transpirable de secado rápido con tacto suave y costuras planas que no rozan en distancias largas.",
    materials: "88% poliéster reciclado · 12% elastano. Control de olor.",
  },
  {
    id: "raiz",
    slug: "joggers-raiz",
    name: "Joggers Raíz",
    category: "hombre",
    kind: "Jogger relajado",
    price: 89,
    colors: [
      { name: "Espresso", hex: "#2B2118" },
      { name: "Arena", hex: "#E9E1D4" },
    ],
    sizes: APPAREL_SIZES,
    gallery: [
      img(PHOTO.pRaiz1, { w: 1000, h: 1250 }),
      img(PHOTO.pRaiz2, { w: 1000, h: 1250 }),
    ],
    isNew: true,
    description:
      "Corte relajado con tobillo elástico, cintura ajustable y bolsillos profundos. Felpa ligera para los días de descanso activo.",
    materials: "60% algodón orgánico · 40% poliéster reciclado.",
  },
  {
    id: "brisa",
    slug: "short-brisa",
    name: "Short Brisa",
    category: "mujer",
    kind: "Short 2 en 1",
    price: 48,
    colors: [
      { name: "Espresso", hex: "#2B2118" },
      { name: "Arcilla", hex: "#C2603D" },
      { name: "Salvia", hex: "#7C8466" },
    ],
    sizes: APPAREL_SIZES,
    gallery: [
      img(PHOTO.pBrisa1, { w: 1000, h: 1250 }),
      img(PHOTO.pBrisa2, { w: 1000, h: 1250 }),
    ],
    badge: "Últimas unidades",
    description:
      "Short con malla interior integrada y bolsillo para el móvil. Libertad total de movimiento sin transparencias, con cintura ancha que no se enrolla.",
    materials: "Exterior 100% poliéster reciclado · malla 85/15.",
  },
  {
    id: "nudo",
    slug: "banda-nudo",
    name: "Pack Bandas Nudo",
    category: "accesorios",
    kind: "Bandas para el pelo",
    price: 18,
    colors: [
      { name: "Surtido cálido", hex: "#C2603D" },
      { name: "Surtido neutro", hex: "#E9E1D4" },
    ],
    sizes: ["Única"],
    gallery: [
      img(PHOTO.categoryAccesorios, { w: 1000, h: 1250 }),
      img(PHOTO.pBruma2, { w: 1000, h: 1250 }),
    ],
    isNew: true,
    description:
      "Pack de tres bandas antideslizantes en tonos cálidos. Interior de silicona que se queda en su sitio, por intenso que sea el entreno.",
    materials: "Algodón reciclado con banda interior de silicona.",
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function relatedProducts(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category,
  )
    .concat(PRODUCTS.filter((p) => p.category !== product.category))
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
    .filter((p) => p.id !== product.id)
    .slice(0, limit);
}

export const CATEGORY_LABELS: Record<Category, string> = {
  mujer: "Mujer",
  hombre: "Hombre",
  accesorios: "Accesorios",
};
