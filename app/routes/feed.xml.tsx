import type { Route } from "./+types/feed.xml";
import { getAllProducts } from "~/lib/catalog";
import { SITE_URL, SITE_NAME } from "~/lib/seo";
import type { Product } from "~/data/products";

// Google Merchant Center (tarea 132) lee este feed una vez al día para
// mostrar los productos gratis en Google. Solo ropa (mujer y hombre) —
// los accesorios se dejan fuera a pedido del usuario.
const FEED_CATEGORIES = new Set<Product["category"]>(["mujer", "hombre"]);

const GENDER: Record<string, string> = { mujer: "female", hombre: "male" };

// Categoría de Google (ruta de texto, la acepta en vez del ID numérico).
const GOOGLE_CATEGORY = "Apparel & Accessories > Clothing > Activewear";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function tag(name: string, value: string | undefined): string {
  return value ? `      <g:${name}>${escapeXml(value)}</g:${name}>\n` : "";
}

function mxn(amount: number): string {
  return `${amount.toFixed(2)} MXN`;
}

// Merchant Center solo acepta imágenes con URL absoluta (no el placeholder
// local `/productos/placeholder.png`). Se usa la URL original de Storage, no
// la de transformación, para no gastar la cuota de Image Transformations.
function isAbsoluteImage(url: string | undefined): url is string {
  return Boolean(url && /^https?:\/\//.test(url));
}

// El campo "materiales" del catálogo a veces trae la composición real ("82.5%
// Poliéster / 17.5% Elastano") y a veces frases de características ("Tela
// suave. Corte relajado…"). Google espera solo la composición, así que solo se
// manda cuando hay porcentajes.
function materialFor(materials: string): string | undefined {
  const text = materials.trim();
  if (!/\d\s*%/.test(text)) return undefined;
  // Los conjuntos traen una composición por prenda ("Top:" / porcentajes /
  // "Pantalón:" / porcentajes) — cada encabezado abre un grupo nuevo.
  let out = "";
  for (const line of text.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean)) {
    if (line.endsWith(":")) out += `${out ? "; " : ""}${line} `;
    else out += `${out && !out.endsWith(" ") ? ", " : ""}${line}`;
  }
  return out;
}

function variantId(product: Product, color: string, size: string): string {
  const sku = product.skuByVariant?.[`${color}|${size}`];
  if (sku) return sku;
  return `${product.slug}-${color}-${size}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function buildItems(product: Product): string[] {
  if (!FEED_CATEGORIES.has(product.category)) return [];
  if (!(product.price > 0)) return [];

  const link = `${SITE_URL}/producto/${product.slug}`;
  const onSale = product.compareAt !== undefined && product.compareAt > product.price;
  const description = product.description.trim() || product.name;
  const items: string[] = [];

  for (const [key, stock] of Object.entries(product.stockByVariant)) {
    const [color, size] = key.split("|");
    if (!color || !size) continue;

    const gallery = product.colorGallery?.[color] ?? [];
    const mainImage = [gallery[0], product.colorImages?.[color], product.gallery[0]].find(
      isAbsoluteImage,
    );
    if (!mainImage) continue;
    const extraImages = [...gallery.slice(1), ...product.gallery]
      .filter(isAbsoluteImage)
      .filter((url) => url !== mainImage)
      // Solo 1 foto extra (2 en total por variante): con hasta 10, Google pedía
      // ~1,000 imágenes de golpe y Supabase respondía 429, que Merchant Center
      // reporta como "Tipo de imagen no admitido".
      .slice(0, 1);

    items.push(
      [
        "    <item>\n",
        tag("id", variantId(product, color, size)),
        tag("item_group_id", product.id),
        tag("title", `${product.name} - ${color} - ${size}`),
        tag("description", description),
        tag("link", link),
        tag("image_link", mainImage),
        ...extraImages.map((url) => tag("additional_image_link", url)),
        tag("availability", stock > 0 ? "in_stock" : "out_of_stock"),
        tag("price", mxn(onSale ? product.compareAt! : product.price)),
        onSale ? tag("sale_price", mxn(product.price)) : "",
        tag("brand", SITE_NAME),
        tag("condition", "new"),
        tag("identifier_exists", "no"),
        tag("google_product_category", GOOGLE_CATEGORY),
        tag("product_type", product.kind),
        tag("gender", GENDER[product.category]),
        tag("age_group", "adult"),
        tag("color", color),
        tag("size", size),
        tag("material", materialFor(product.materials)),
        "    </item>\n",
      ].join(""),
    );
  }

  return items;
}

/**
 * `feed.xml` para Google Merchant Center (tarea 132). Resource route (sin
 * componente), mismo patrón que `sitemap.xml.tsx`: un `<item>` por variante
 * (color + talla) generado en vivo desde el catálogo real de Supabase, así
 * stock y precios siempre coinciden con el sitio.
 */
export async function loader(_: Route.LoaderArgs) {
  const products = await getAllProducts();
  const items = products.flatMap(buildItems);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>Catálogo de productos de ${escapeXml(SITE_NAME)}</description>
${items.join("")}  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Una hora de caché: el stock sí cambia con las ventas y Google lee
      // el feed pocas veces al día.
      "Cache-Control": "public, max-age=3600",
    },
  });
}
