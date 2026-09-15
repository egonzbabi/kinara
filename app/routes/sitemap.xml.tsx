import type { Route } from "./+types/sitemap.xml";
import { getAllProducts } from "~/lib/catalog";
import { SITE_URL } from "~/lib/seo";

// Páginas estáticas de contenido real (no /checkout*, /admin*, /api* — esas
// ya están en robots.txt como Disallow, y /tienda con query params de
// filtro no se lista aparte: son la misma página que la base, ver el
// comentario de canonical en tienda.tsx).
const STATIC_PATHS = [
  "/",
  "/tienda",
  "/contacto",
  "/aviso-de-privacidad",
  "/politica-de-cambios-y-devoluciones",
  "/politica-de-envios",
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * `sitemap.xml` generado dinámicamente desde el catálogo real de Supabase
 * (tarea 003, SEO técnico) — nunca desde `app/data/products.ts` (ese
 * archivo solo define tipos, ver tarea 006/REQUISITOS.md). Se registra como
 * ruta normal (`route("sitemap.xml", ...)` en app/routes.ts) que no
 * exporta componente, solo `loader` — una "resource route" que devuelve XML
 * crudo en vez de HTML, mismo patrón que admin.inventario.pdf.tsx.
 */
export async function loader(_: Route.LoaderArgs) {
  const products = await getAllProducts();

  const urls = [
    ...STATIC_PATHS.map((path) => ({ loc: `${SITE_URL}${path}`, priority: path === "/" ? "1.0" : "0.7" })),
    ...products.map((p) => ({ loc: `${SITE_URL}/producto/${p.slug}`, priority: "0.8" })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <priority>${u.priority}</priority>\n  </url>`).join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Un día de caché — el catálogo no cambia tan seguido como para
      // regenerar esto en cada request de un crawler.
      "Cache-Control": "public, max-age=86400",
    },
  });
}
