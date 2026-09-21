import { Link } from "react-router";
import type { Route } from "./+types/_index";
import { Hero, HERO_VIDEO_POSTER } from "~/components/Hero";
import { TrustStrip } from "~/components/TrustStrip";
import { CategoryTiles } from "~/components/CategoryTiles";
import { ProductGrid } from "~/components/ProductGrid";
import { EditorialSplit } from "~/components/EditorialSplit";
import { WelcomeDiscountBanner } from "~/components/WelcomeDiscountBanner";
import { BestsellerRail } from "~/components/BestsellerRail";
import { ComingSoonRail } from "~/components/ComingSoonRail";
import { getAllProducts } from "~/lib/catalog";
import { useScrollReveal } from "~/hooks/useScrollReveal";
import { seoMeta, SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "~/lib/seo";

// Precarga el poster del video del hero (tarea 104/115): con el video ahora
// full-bleed (única capa visual del hero, tarea 115) es el candidato a LCP
// del home. Sin esto el navegador lo descubre recién al parsear el body,
// perdiendo tiempo.
export const links: Route.LinksFunction = () => [
  { rel: "preload", as: "image", href: HERO_VIDEO_POSTER, fetchPriority: "high" },
];

export function meta(_: Route.MetaArgs) {
  return [
    ...seoMeta({
      title: "KINARA · Ropa deportiva con alma",
      description:
        "Athleisure técnico en tonos cálidos. Leggings, tops, sudaderas y capas hechas para moverse y para vivir. Nueva colección SS26.",
      path: "/",
    }),
    // Organization (tarea 003, SEO técnico) — se pone solo aquí, no en
    // root.tsx: cada ruta reemplaza por completo el `meta()` de sus
    // ancestros en React Router 7 (no se concatenan), así que ponerlo en
    // root.tsx nunca llegaría a renderizarse en ninguna ruta que defina su
    // propio meta() — y todas las rutas públicas de este sitio lo hacen.
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        image: DEFAULT_OG_IMAGE,
        description:
          "Athleisure técnico mexicano en tonos cálidos, hecho para moverse y para vivir.",
      },
    },
  ];
}

export async function loader() {
  const products = await getAllProducts();
  return { products };
}

export default function Index({ loaderData }: Route.ComponentProps) {
  useScrollReveal();
  const { products } = loaderData;

  const novedades = products.filter((p) => p.isNew).slice(0, 4);
  // Sin límite: a diferencia de "Lo nuevo" (una vitrina acotada), esta sección
  // debe mostrar todos los productos en oferta, no solo los primeros 4.
  const ofertas = products.filter((p) => p.isOnSale);

  return (
    <>
      <Hero />
      <WelcomeDiscountBanner />
      <TrustStrip />
      <CategoryTiles />

      {/* Ofertas */}
      {ofertas.length > 0 && (
        <section className="pad py-[clamp(48px,7vw,96px)]">
          <div className="reveal mb-8 flex items-end justify-between gap-6">
            <div>
              <span className="label">Por tiempo limitado</span>
              <h2 className="mt-2 font-display text-[clamp(28px,4vw,48px)] leading-none">
                Ofertas
              </h2>
            </div>
            <Link
              to="/tienda"
              className="text-sm font-medium underline-offset-4 hover:text-clay hover:underline"
            >
              Ver todo →
            </Link>
          </div>
          <ProductGrid products={ofertas} priorityCount={2} forceBadge="Oferta" />
        </section>
      )}

      <ComingSoonRail />

      {/* Lo nuevo */}
      <section className="pad py-[clamp(48px,7vw,96px)]">
        <div className="reveal mb-8 flex items-end justify-between gap-6">
          <div>
            <span className="label">Recién llegado</span>
            <h2 className="mt-2 font-display text-[clamp(28px,4vw,48px)] leading-none">
              Lo nuevo
            </h2>
          </div>
          <Link
            to="/tienda"
            className="text-sm font-medium underline-offset-4 hover:text-clay hover:underline"
          >
            Ver todo →
          </Link>
        </div>
        <ProductGrid products={novedades} priorityCount={2} />
      </section>

      <EditorialSplit />
      <BestsellerRail products={products} />

      {/* Lookbook desactivado a pedido del usuario (tarea 101): solo tiene 6
          fotos y 4 ya estaban rotas (apuntaban a archivos renombrados en la
          tarea 098). Se reactivará cuando haya más fotos para la sección —
          el componente (`LookbookBand`) y los datos (`app/data/looks.ts`,
          ya corregidos) se dejan intactos para ese momento. */}
    </>
  );
}
