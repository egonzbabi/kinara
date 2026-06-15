import { Link } from "react-router";
import { CATEGORY_TILES } from "~/data/categories";

export function CategoryTiles() {
  return (
    <section className="pad py-[clamp(48px,7vw,96px)]">
      <div className="reveal mb-8 flex items-end justify-between gap-6">
        <div>
          <span className="label">Compra por categoría</span>
          <h2 className="mt-2 font-display text-[clamp(28px,4vw,48px)] leading-none">
            Encuentra lo tuyo
          </h2>
        </div>
        <Link
          to="/tienda"
          className="hidden text-sm font-medium underline-offset-4 hover:text-clay hover:underline sm:block"
        >
          Ver todo →
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {CATEGORY_TILES.map((tile, i) => (
          <Link
            key={tile.slug}
            to={`/tienda?cat=${tile.slug}`}
            className="reveal group relative block overflow-hidden rounded-2xl"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <div className="aspect-[3/4] overflow-hidden md:aspect-[4/5]">
              <img
                src={tile.image}
                alt={`Categoría ${tile.title}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
            </div>
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-espresso/70 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6 text-bone">
              <div>
                <h3 className="font-display text-3xl">{tile.title}</h3>
                <p className="mt-1 max-w-[24ch] text-sm text-bone/80">
                  {tile.copy}
                </p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-bone/15 backdrop-blur transition-colors group-hover:bg-clay">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
