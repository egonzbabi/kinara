import { useState } from "react";
import { preload } from "react-dom";
import { Link } from "react-router";
import type { Route } from "./+types/producto.$slug";
import { CATEGORY_LABELS } from "~/data/products";
import { getProductBySlug, getAllProducts, relatedProducts } from "~/lib/catalog";
import {
  ProductGallery,
  MAIN_WIDTHS,
  MAIN_SIZES,
  type GalleryItem,
} from "~/components/ProductGallery";
import { Accordion } from "~/components/Accordion";
import { ProductCard } from "~/components/ProductCard";
import { Button } from "~/components/Button";
import { useCart } from "~/context/CartContext";
import { formatPrice } from "~/lib/formatPrice";
import { productImage, productSrcSet } from "~/lib/productImage";
import { useScrollReveal } from "~/hooks/useScrollReveal";
import { cn } from "~/lib/cn";

export async function loader({ params }: Route.LoaderArgs) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    throw new Response("No encontrado", { status: 404 });
  }
  const all = await getAllProducts();
  return { product, related: relatedProducts(product, all) };
}


export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: "Producto · KINARA" }];
  return [
    { title: `${data.product.name} · KINARA` },
    { name: "description", content: data.product.description },
  ];
}

export default function ProductDetail({ loaderData }: Route.ComponentProps) {
  const { product, related } = loaderData;
  const { add } = useCart();
  useScrollReveal();

  const [color, setColor] = useState<string | null>(
    product.colors.length <= 1 ? (product.colors[0]?.name ?? "Único") : null,
  );
  const [size, setSize] = useState<string | null>(
    product.sizes.length === 1 ? product.sizes[0] : null,
  );
  const missingSelection = !color || !size;
  const [attempted, setAttempted] = useState(false);

  const colorImage = color ? product.colorImages?.[color] : undefined;

  // Si el producto tiene foto real por color, la galería muestra una miniatura por
  // cada color disponible (en vez de solo la del color seleccionado + fotos genéricas),
  // y seleccionar una miniatura cambia también el color activo.
  const galleryItems: GalleryItem[] = product.colorImages
    ? product.colors.map((c) => ({ src: product.colorImages![c.name]!, color: c.name }))
    : product.gallery.map((src) => ({ src }));

  // Precarga la imagen inicial de la galería (LCP de esta ruta) — sin esto el
  // navegador la descubre recién al parsear el <img> en el body.
  if (galleryItems[0]) {
    preload(productImage(galleryItems[0].src, { width: 800, height: 1000 }), {
      as: "image",
      imageSrcSet: productSrcSet(galleryItems[0].src, MAIN_WIDTHS, { heightRatio: 1.25 }),
      imageSizes: MAIN_SIZES,
      fetchPriority: "high",
    });
  }

  const activeGalleryIndex = product.colorImages
    ? Math.max(
        0,
        galleryItems.findIndex((item) => item.color === color),
      )
    : 0;

  const onAdd = () => {
    if (!color || !size) {
      setAttempted(true);
      return;
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: colorImage ?? product.gallery[0],
      color,
      size,
    });
  };

  return (
    <div className="pad py-[clamp(20px,3vw,40px)]">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-[13px] text-muted">
        <Link to="/" className="hover:text-clay">
          Inicio
        </Link>
        <span aria-hidden>/</span>
        <Link
          to={`/tienda?cat=${product.category}`}
          className="hover:text-clay"
        >
          {CATEGORY_LABELS[product.category]}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-espresso">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        {/* Gallery */}
        <ProductGallery
          items={galleryItems}
          active={activeGalleryIndex}
          onSelect={(i) => {
            const item = galleryItems[i];
            if (item.color) setColor(item.color);
          }}
          alt={product.name}
        />

        {/* Info */}
        <div className="lg:py-4">
          {product.badge && (
            <span className="label text-clay">{product.badge}</span>
          )}
          <h1 className="mt-2 font-display text-[clamp(30px,4.5vw,52px)] leading-[1.02]">
            {product.name}
          </h1>
          <p className="mt-1 text-muted">{product.kind}</p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-2xl">
              {formatPrice(product.price)}
            </span>
            {product.compareAt && (
              <span className="text-muted line-through">
                {formatPrice(product.compareAt)}
              </span>
            )}
          </div>

          <p className="mt-5 max-w-[52ch] leading-relaxed text-espresso/90">
            {product.description}
          </p>

          {/* Color */}
          <div className="mt-7">
            <p className="text-sm font-medium">
              Color:{" "}
              <span className="text-muted">
                {color ?? "Selecciona un color"}
              </span>
            </p>
            <div
              className={cn(
                "mt-2.5 flex flex-wrap gap-2.5 rounded-lg",
                attempted && !color && "outline outline-2 outline-offset-4 outline-clay",
              )}
            >
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={color === c.name}
                  className={cn(
                    "h-8 w-8 rounded-full border transition-transform",
                    color === c.name
                      ? "ring-2 ring-espresso ring-offset-2 ring-offset-sand"
                      : "border-line hover:scale-110",
                  )}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Talla</p>
              <span className="text-[13px] font-bold text-clay">
                · Tallas reducidas
              </span>
            </div>
            <div
              className={cn(
                "mt-2.5 flex flex-wrap gap-2 rounded-lg",
                attempted && !size && "outline outline-2 outline-offset-4 outline-clay",
              )}
            >
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  className={cn(
                    "min-w-12 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                    size === s
                      ? "border-espresso bg-espresso text-bone"
                      : "border-line hover:border-espresso",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Add to cart */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="clay"
              size="lg"
              full
              onClick={onAdd}
              aria-disabled={missingSelection}
              className={cn(missingSelection && "is-inactive")}
            >
              {missingSelection
                ? "Selecciona color y talla"
                : `Añadir al carrito de compras · ${formatPrice(product.price)}`}
            </Button>
          </div>
          {attempted && missingSelection && (
            <p className="mt-2 text-[13px] font-medium text-clay">
              Selecciona color y talla para continuar.
            </p>
          )}

          <ul className="mt-5 flex flex-col gap-1.5 text-[13px] text-muted">
            <li>· Envío calculado al finalizar la compra</li>
            <li>· NO HAY DEVOLUCIONES</li>
          </ul>

          {/* Details */}
          <div className="mt-8">
            <Accordion
              items={[
                {
                  title: "Descripción",
                  content: <p>{product.description}</p>,
                },
                {
                  title: "Especificaciones",
                  content: (
                    <div>
                      <p>{product.materials}</p>
                      <p className="mt-2">
                        Lavar a máquina en frío con colores similares. No usar
                        secadora ni suavizante.
                      </p>
                    </div>
                  ),
                },
                {
                  title: "Envíos y devoluciones",
                  content: (
                    <p>
                      Entrega en 24-48 h en península. Envío calculado al
                      finalizar la compra. NO HAY DEVOLUCIONES.
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-[clamp(56px,8vw,112px)]">
          <h2 className="reveal mb-8 font-display text-[clamp(26px,3.5vw,42px)] leading-none">
            Completa el look
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
