import type { MetaDescriptor } from "react-router";

/**
 * SEO técnico (tarea 003). Dominio real del sitio, confirmado con el usuario
 * — el sitio hoy vive en kinara-ecommerce.vercel.app, pero el dominio propio
 * (ya usado para el correo, `contacto@kinarafit.com.mx`) es
 * www.kinarafit.com.mx; se usa ese aquí para no tener que rehacer todo el
 * SEO cuando se conecte el dominio en Vercel.
 */
export const SITE_URL = "https://www.kinarafit.com.mx";
export const SITE_NAME = "KINARA";

// Imagen de respaldo para Open Graph/Twitter cuando la página no tiene una
// foto propia (contacto, políticas, home) — no hay un logo cuadrado
// dedicado todavía, así que se usa el poster del hero (real, ya en Storage,
// el mismo que usa <Hero> como LCP — ver tarea 104).
export const DEFAULT_OG_IMAGE =
  "https://njvfxzmbyckktygeiwhi.supabase.co/storage/v1/object/public/product-images/site/hero-poster.jpg";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

/**
 * Arma el bloque completo de metadatos de una ruta pública: title,
 * description, canonical, Open Graph y Twitter Card. Cada ruta con su
 * propio `meta()` reemplaza por completo el de sus ancestros (no se
 * concatenan — comportamiento real de React Router 7, confirmado leyendo su
 * código fuente), así que cada ruta debe llamar a este helper con sus
 * propios datos en vez de asumir que algo de `root.tsx` se hereda.
 */
export function seoMeta({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "product";
  /** Páginas transitorias/específicas del usuario (checkout) — no deben indexarse. */
  noindex?: boolean;
}): MetaDescriptor[] {
  const url = absoluteUrl(path);
  const meta: MetaDescriptor[] = [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: "es_MX" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
  if (noindex) {
    meta.push({ name: "robots", content: "noindex, follow" });
  }
  return meta;
}
