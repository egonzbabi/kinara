import { Suspense } from "react";
import { Await, Link } from "react-router";
import type { Route } from "./+types/_index";
import { Hero, HERO_BG_IMAGE, HERO_VIDEO_POSTER } from "~/components/Hero";
import { TrustStrip } from "~/components/TrustStrip";
import { CategoryTiles } from "~/components/CategoryTiles";
import { ProductGrid } from "~/components/ProductGrid";
import { ProductGridSkeleton, ProductRailSkeleton } from "~/components/ProductCardSkeleton";
import { EditorialSplit } from "~/components/EditorialSplit";
import { WelcomeDiscountBanner } from "~/components/WelcomeDiscountBanner";
import { BestsellerRail } from "~/components/BestsellerRail";
import { getAllProducts } from "~/lib/catalog";
import { useScrollReveal } from "~/hooks/useScrollReveal";
import type { Product } from "~/data/products";

// Precarga las dos imágenes candidatas a LCP del hero (tarea 104): el fondo
// ambiental (ganaba antes) y el poster del video nítido (ganó después de
// arreglar el fondo — Lighthouse va turnándose el elemento de LCP entre
// ambas capas del hero según cuál sea más lenta en cada momento). Sin esto
// el navegador las descubre recién al parsear el body, perdiendo tiempo.
export const links: Route.LinksFunction = () => [
  { rel: "preload", as: "image", href: HERO_BG_IMAGE, fetchPriority: "high" },
  { rel: "preload", as: "image", href: HERO_VIDEO_POSTER, fetchPriority: "high" },
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

// Sin `await`: el catálogo completo (~50 productos con variantes/fotos) ya
// no bloquea el envío del HTML (tarea 105, auditoría de performance). Antes,
// el servidor no podía mandar ni el <head> (con los preloads del hero de
// arriba) hasta que este fetch terminaba — un Lighthouse real contra
// producción mostró el documento completo tardando 2.36s solo por esto,
// pese a que el hero/header no dependen en nada de `products`. Con el
// loader devolviendo la promesa sin resolver, React Router la transmite en
// streaming: el shell (Hero, header, `<head>`) sale de inmediato y las
// secciones que sí necesitan `products` (Ofertas/Lo nuevo, Bestsellers) se
// completan cuando el fetch responde, mostrando un skeleton mientras tanto
// (nunca una pantalla en blanco — regla de `CLAUDE.md`).
export function loader() {
  return { products: getAllProducts() };
}

export default function Index({ loaderData }: Route.ComponentProps) {
  useScrollReveal();

  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoryTiles />

      <Suspense fallback={<NewInSectionSkeleton />}>
        <Await resolve={loaderData.products}>
          {(products) => <OfertasYNuevoSections products={products} />}
        </Await>
      </Suspense>

      <WelcomeDiscountBanner />

      <EditorialSplit />

      <Suspense fallback={<BestsellersSectionSkeleton />}>
        <Await resolve={loaderData.products}>
          {(products) => <BestsellerRail products={products} />}
        </Await>
      </Suspense>

      {/* Lookbook desactivado a pedido del usuario (tarea 101): solo tiene 6
          fotos y 4 ya estaban rotas (apuntaban a archivos renombrados en la
          tarea 098). Se reactivará cuando haya más fotos para la sección —
          el componente (`LookbookBand`) y los datos (`app/data/looks.ts`,
          ya corregidos) se dejan intactos para ese momento. */}
    </>
  );
}

/** Ofertas (si hay) + Lo nuevo — depende de `products`, ver loader de arriba. */
function OfertasYNuevoSections({ products }: { products: Product[] }) {
  const novedades = products.filter((p) => p.isNew).slice(0, 4);
  // Sin límite: a diferencia de "Lo nuevo" (una vitrina acotada), esta sección
  // debe mostrar todos los productos en oferta, no solo los primeros 4.
  const ofertas = products.filter((p) => p.isOnSale);

  return (
    <>
      {/* Ofertas */}
      {ofertas.length > 0 && (
        <section className="pad py-[clamp(48px,7vw,96px)]">
          <div className="mb-8 flex items-end justify-between gap-6">
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

      {/* Lo nuevo */}
      <section className="pad py-[clamp(48px,7vw,96px)]">
        <div className="mb-8 flex items-end justify-between gap-6">
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
    </>
  );
}

// Ni las secciones reales (OfertasYNuevoSections, BestsellerRail) ni sus
// skeletons usan la clase `reveal` (fade-in por scroll) aquí — `useScrollReveal`
// escanea el DOM una sola vez al montar la ruta, antes de que este contenido
// diferido exista; si llevara `reveal` se quedaría con `opacity-0` para
// siempre (el observer nunca llega a registrarlo). El resto de secciones del
// home (que sí montan de inmediato: Hero, TrustStrip, CategoryTiles,
// EditorialSplit) no se tocaron y conservan su `reveal` normal.

/** Fallback de <Suspense> mientras `products` no ha resuelto — se aproxima a
 * "Lo nuevo" (la sección que siempre se muestra; "Ofertas" es condicional y
 * no se puede saber si aparecerá hasta tener los datos). */
function NewInSectionSkeleton() {
  return (
    <section className="pad py-[clamp(48px,7vw,96px)]">
      <div className="mb-8">
        <span className="label">Recién llegado</span>
        <h2 className="mt-2 font-display text-[clamp(28px,4vw,48px)] leading-none">
          Lo nuevo
        </h2>
      </div>
      <ProductGridSkeleton count={4} />
    </section>
  );
}

function BestsellersSectionSkeleton() {
  return (
    <section className="py-[clamp(48px,7vw,96px)]">
      <div className="pad mb-8">
        <span className="label">Lo más querido</span>
        <h2 className="mt-2 font-display text-[clamp(28px,4vw,48px)] leading-none">
          Best-sellers
        </h2>
      </div>
      <ProductRailSkeleton count={4} />
    </section>
  );
}
