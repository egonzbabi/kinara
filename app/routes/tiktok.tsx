import { Link } from "react-router";
import type { Route } from "./+types/tiktok";
import { LinkButton } from "~/components/Button";
import { getAllProducts } from "~/lib/catalog";
import { formatPrice } from "~/lib/formatPrice";
import { productImage, productSrcSet } from "~/lib/productImage";
import { seoMeta } from "~/lib/seo";
import { useScrollReveal } from "~/hooks/useScrollReveal";
import {
  TIKTOK_AUTO_LIMIT,
  TIKTOK_FEATURED_SLUGS,
  withTiktokUtm,
} from "~/lib/tiktok-links";

// Página para el tráfico de redes (enlace en la bio): no tiene sentido que
// Google la indexe aparte — sería contenido repetido de la tienda — así que va
// con noindex y fuera del sitemap.
export function meta(_: Route.MetaArgs) {
  return seoMeta({
    title: "Comunidad Kinara · KINARA",
    description:
      "Las prendas de nuestros videos, con enlace directo a la compra. Ropa deportiva para mujeres reales.",
    path: "/tiktok",
    noindex: true,
  });
}

export async function loader() {
  const all = await getAllProducts();
  const clothing = all.filter((p) => p.category !== "accesorios" && p.sizes.length > 0);

  let featured = TIKTOK_FEATURED_SLUGS.map((slug) => all.find((p) => p.slug === slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );
  if (featured.length === 0) {
    // Primero los más vendidos y luego los más nuevos (el catálogo viene del más
    // viejo al más nuevo, por eso se invierte), sin repetir.
    const bestsellers = clothing.filter((p) => p.isBestseller);
    const newest = [...clothing].reverse().filter((p) => p.isNew);
    featured = [...bestsellers, ...newest]
      .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
      .slice(0, TIKTOK_AUTO_LIMIT);
  }

  return {
    products: featured.map((p) => ({
      slug: p.slug,
      name: p.name,
      price: p.price,
      compareAt: p.compareAt ?? null,
      image: p.gallery[0],
    })),
  };
}

const SIZES = "(min-width: 768px) 30vw, 46vw";

export default function Tiktok({ loaderData }: Route.ComponentProps) {
  useScrollReveal();
  const { products } = loaderData;

  return (
    <div className="pad py-[clamp(32px,5vw,64px)]">
      <div className="reveal mx-auto max-w-[44ch] text-center">
        <span className="label">Kinara Fit</span>
        <h1 className="mt-3 font-display text-[clamp(34px,6vw,60px)] leading-none">
          Comunidad Kinara
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Más que ropa deportiva: una comunidad de mujeres que se mueven y se sienten fuertes.
        </p>
        <div className="mt-7 flex flex-col gap-3">
          <LinkButton to={withTiktokUtm("/tienda")} variant="clay" full>
            Ver toda la colección
          </LinkButton>
          <LinkButton to={withTiktokUtm("/#bienvenida")} variant="outline" full>
            Quiero mi 10 % de bienvenida
          </LinkButton>
        </div>
      </div>

      {products.length > 0 && (
        <section className="mt-14">
          <h2 className="reveal mb-6 text-center font-display text-[clamp(24px,3.4vw,36px)] leading-none">
            Las prendas de nuestros videos
          </h2>
          <ul className="mx-auto grid max-w-[920px] grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3">
            {products.map((p) => (
              <li key={p.slug}>
                <Link
                  to={withTiktokUtm(`/producto/${p.slug}`)}
                  className="group block"
                  aria-label={`${p.name}, ${formatPrice(p.price)}. Ver y comprar`}
                >
                  <div className="aspect-[4/5] overflow-hidden rounded-xl bg-bone">
                    <img
                      src={productImage(p.image, { width: 400, height: 500 })}
                      srcSet={productSrcSet(p.image, [400, 800], { heightRatio: 1.25 })}
                      sizes={SIZES}
                      alt={p.name}
                      width={400}
                      height={500}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="pt-3 text-center">
                    <h3 className="truncate font-medium leading-tight">{p.name}</h3>
                    <p className="mt-1 text-sm">
                      <span className="font-medium">{formatPrice(p.price)}</span>
                      {p.compareAt && (
                        <span className="ml-1.5 text-muted line-through">
                          {formatPrice(p.compareAt)}
                        </span>
                      )}
                    </p>
                    <span className="mt-2 inline-block text-[13px] font-semibold text-clay-deep underline-offset-4 group-hover:underline">
                      Comprar →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
