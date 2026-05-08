export type Silhouette =
  | "shellJacket"
  | "legging"
  | "cropTop"
  | "runner"
  | "tee"
  | "shorts";

export type CardVariant = "feature" | "tall" | "standard";

export type DotSwatch = {
  bg: string;
  light?: boolean;
};

export type Product = {
  id: string;
  no: string;
  name: string;
  tag: string;
  tagSolar?: boolean;
  price: string;
  cardSwatch: string;
  silhouette: Silhouette;
  dots: DotSwatch[];
  variant: CardVariant;
  /** Whether the card uses dark text on a light bg or vice versa. */
  inverse?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    id: "solar-shell",
    no: "N° 04 · SOLAR JACKET",
    name: "Solar Shell Jacket",
    tag: "★ Best-seller",
    tagSolar: true,
    price: "€189,00",
    cardSwatch: "#FF5B1F",
    silhouette: "shellJacket",
    dots: [{ bg: "#0A0A0A" }, { bg: "#FF5B1F" }, { bg: "#F2EFE8" }],
    variant: "feature",
  },
  {
    id: "helio-legging",
    no: "N° 07",
    name: "Helio Legging",
    tag: "Nuevo",
    price: "€89",
    cardSwatch: "#0A0A0A",
    silhouette: "legging",
    dots: [
      { bg: "#0A0A0A", light: true },
      { bg: "#888" },
      { bg: "#FF5B1F" },
    ],
    variant: "tall",
    inverse: true,
  },
  {
    id: "brasa-crop",
    no: "N° 02",
    name: "Brasa Crop Top",
    tag: "Edición",
    price: "€55",
    cardSwatch: "#E8E4DA",
    silhouette: "cropTop",
    dots: [{ bg: "#FF5B1F" }, { bg: "#0A0A0A" }],
    variant: "tall",
  },
  {
    id: "aurora-runner",
    no: "N° 11",
    name: "Aurora Runner 01",
    tag: "Drop",
    tagSolar: true,
    price: "€140",
    cardSwatch: "#1a1a1a",
    silhouette: "runner",
    dots: [
      { bg: "#F2EFE8" },
      { bg: "#FF5B1F" },
      { bg: "#0A0A0A", light: true },
    ],
    variant: "standard",
    inverse: true,
  },
  {
    id: "sol-tee",
    no: "N° 01",
    name: "Sol Tee",
    tag: "Esencial",
    price: "€42",
    cardSwatch: "#F2EFE8",
    silhouette: "tee",
    dots: [
      { bg: "#0A0A0A" },
      { bg: "#F2EFE8" },
      { bg: "#FF5B1F" },
      { bg: "#888" },
    ],
    variant: "standard",
  },
  {
    id: "llama-shorts",
    no: "N° 09",
    name: "Llama Run Short",
    tag: "Run",
    price: "€65",
    cardSwatch: "#E8E4DA",
    silhouette: "shorts",
    dots: [{ bg: "#0A0A0A" }, { bg: "#FF5B1F" }],
    variant: "standard",
  },
];

export const FEATURED_PRODUCT_ID = "solar-shell";
