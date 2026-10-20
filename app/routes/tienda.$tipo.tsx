import { Link } from "react-router";
import type { Route } from "./+types/tienda.$tipo";
import { ProductGrid } from "~/components/ProductGrid";
import { getAllProducts } from "~/lib/catalog";
import { useScrollReveal } from "~/hooks/useScrollReveal";
import { productImage } from "~/lib/productImage";
import { seoMeta, absoluteUrl } from "~/lib/seo";
import { activeLandings, getLanding, landingFacts, landingProducts } from "~/lib/shop-landings";

/**
 * Página propia por tipo de prenda (tarea 136, SEO): "Leggings deportivos
 * para mujer", "Conjuntos deportivos…", etc. A diferencia de las vistas
 * filtradas de /tienda (canonical a /tienda), cada una es indexable con su
 * propio título, H1 y canonical. Los textos y el filtro viven en
 * `~/lib/shop-landings`.
 */
export async function loader({ params }: Route.LoaderArgs) {
  const landing = getLanding(params.tipo);
  if (!landing) throw new Response("No encontrado", { status: 404 });

  const all = await getAllProducts();
  const products = landingProducts(landing, all);
  // Sin productos no hay página: 404 (tampoco entra al sitemap).
  if (products.length === 0) throw new Response("No encontrado", { status: 404 });

  return {
    landing: {
      slug: landing.slug,
      title: landing.title,
      h1: landing.h1,
      description: landing.description,
      intro: landing.intro,
    },
    products,
    facts: landingFacts(products),
    others: activeLandings(all)
      .filter((l) => l.slug !== landing.slug)
      .map((l) => ({ slug: l.slug, navLabel: l.navLabel })),
  };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: "Tienda · KINARA" }];
  const { landing, products } = data;
  const path = `/tienda/${landing.slug}`;
  return [
    ...seoMeta({
      title: landing.title,
      description: landing.description,
      path,
      image: productImage(products[0].gallery[0], { width: 1200, height: 630 }),
    }),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Tienda", item: absoluteUrl("/tienda") },
          { "@type": "ListItem", position: 3, name: landing.h1, item: absoluteUrl(path) },
        ],
      },
    },
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: landing.h1,
        description: landing.description,
        url: absoluteUrl(path),
        mainEntity: {
          "@type": "ItemList",
          itemListElement: products.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: absoluteUrl(`/producto/${p.slug}`),
            name: p.name,
          })),
        },
      },
    },
  ];
}

export default function TiendaTipo({ loaderData }: Route.ComponentProps) {
  useScrollReveal();
  const { landing, products, facts, others } = loaderData;

  return (
    <div className="pad py-[clamp(28px,4vw,56px)]">
      <div className="reveal pb-8">
        <nav aria-label="Ruta de navegación" className="mb-4 text-[13px] text-muted">
          <ol className="flex flex-wrap items-center gap-x-2">
            <li>
              <Link to="/" className="hover:text-clay">
                Inicio
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li>
              <Link to="/tienda" className="hover:text-clay">
                Tienda
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li aria-current="page" className="text-espresso">
              {landing.h1}
            </li>
          </ol>
        </nav>
        <h1 className="font-display text-[clamp(34px,5.5vw,68px)] leading-none">{landing.h1}</h1>
        <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed text-muted">{landing.intro}</p>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-6">
        <p className="text-sm text-muted">
          {products.length} {products.length === 1 ? "artículo" : "artículos"}
        </p>
      </div>

      <div className="mt-6">
        <h2 className="sr-only">Productos</h2>
        <ProductGrid products={products} priorityCount={4} />
      </div>

      {/* Datos reales de la colección (tarea 144): contenido propio y distinto en
          cada página, calculado del catálogo. */}
      <section className="mt-14 max-w-[70ch] border-t border-line pt-8">
        <h2 className="label mb-3">Sobre esta colección</h2>
        <p className="text-[15px] leading-relaxed text-muted">{facts}</p>
      </section>

      {others.length > 0 && (
        <nav aria-label="Más tipos de prenda" className="mt-16 border-t border-line pt-8">
          <h2 className="label mb-4">Explora más</h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-2.5">
            {others.map((o) => (
              <li key={o.slug}>
                <Link
                  to={`/tienda/${o.slug}`}
                  className="text-sm text-espresso/80 transition-colors hover:text-clay"
                >
                  {o.navLabel}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/tienda"
                className="text-sm text-espresso/80 transition-colors hover:text-clay"
              >
                Toda la colección
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
