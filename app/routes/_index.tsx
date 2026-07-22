import { Link } from "react-router";
import type { Route } from "./+types/_index";
import { Hero, HERO_WIDTHS } from "~/components/Hero";
import { TrustStrip } from "~/components/TrustStrip";
import { CategoryTiles } from "~/components/CategoryTiles";
import { ProductGrid } from "~/components/ProductGrid";
import { EditorialSplit } from "~/components/EditorialSplit";
import { BestsellerRail } from "~/components/BestsellerRail";
import { LookbookBand } from "~/components/LookbookBand";
import { Newsletter } from "~/components/Newsletter";
import { getAllProducts } from "~/lib/catalog";
import { useScrollReveal } from "~/hooks/useScrollReveal";
import { img, imgSrcSet, PHOTO } from "~/data/images";

// Precarga la imagen LCP de esta ruta — sin esto el navegador la descubre
// recién al parsear el <img> en el body, perdiendo tiempo de LCP.
export const links: Route.LinksFunction = () => [
  {
    rel: "preload",
    as: "image",
    href: img(PHOTO.heroPrimary, { w: 2000, h: 1300, q: 82 }),
    imageSrcSet: imgSrcSet(PHOTO.heroPrimary, HERO_WIDTHS, { w: 2000, h: 1300, q: 82 }),
    imageSizes: "100vw",
  },
];

export function meta(_: Route.MetaArgs) {
  return [
    { title: "KINARA · Ropa deportiva con alma" },
    {
      name: "description",
      content:
        "Athleisure técnico en tonos cálidos. Leggings, tops, sudaderas y capas hechas para moverse y para vivir. Nueva colección SS26.",
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

  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoryTiles />

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
      <LookbookBand />
      <Newsletter />
    </>
  );
}
