import type { MetaDescriptor } from "react-router";
import { HERO_COLLAGE } from "~/data/images";

/**
 * SEO técnico (tarea 003). Dominio real del sitio — conectado en Vercel
 * (2026-09-28); `kinarafit.com.mx` redirige a esta versión con `www`.
 */
export const SITE_URL = "https://www.kinarafit.com.mx";
export const SITE_NAME = "KINARA";

// Imagen de respaldo para Open Graph/Twitter cuando la página no tiene una
// foto propia (contacto, políticas, home) — no hay un logo cuadrado
// dedicado todavía, así que se usa el poster del hero (real, ya en Storage,
// el mismo que usa <Hero> como LCP — ver tarea 104). Se importa desde
// `HERO_COLLAGE` (no una URL fija copiada aquí aparte) porque un nombre fijo
// se quedó apuntando al poster viejo varias rondas seguidas de reemplazo del
// video del hero (tareas 128/130/131) sin que nadie se acordara de
// actualizarlo también aquí — así ya no puede volver a desincronizarse.
export const DEFAULT_OG_IMAGE = HERO_COLLAGE.main.poster;

/**
 * Perfiles oficiales de la marca (tarea 134) — van en `sameAs` del JSON-LD
 * `Organization` para que Google los reconozca como la misma marca. Siempre
 * la dirección limpia del perfil, sin parámetros de seguimiento (`?mdxt=…`).
 * Agregar aquí cualquier red nueva.
 */
export const INSTAGRAM_URL = "https://www.instagram.com/kinarafit/";
export const TIKTOK_URL = "https://www.tiktok.com/@kinarafit3";
export const FACEBOOK_URL = "https://www.facebook.com/people/Kinara-Fit/61592285310073/";
export const SOCIAL_PROFILES = [INSTAGRAM_URL, TIKTOK_URL, FACEBOOK_URL];

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

/**
 * Política de devoluciones para el `Offer` del JSON-LD de producto (tarea
 * 133). Refleja `/politica-de-cambios-y-devoluciones`: no hay devoluciones ni
 * reembolsos, solo cambios por defecto de fábrica o por talla. Google compara
 * esto con lo declarado en Merchant Center, así que si la política cambia hay
 * que actualizar los dos. No se incluye `shippingDetails` a propósito: el costo
 * de envío es variable (cotización de Skydropx) y no se inventa uno fijo.
 */
export const RETURN_POLICY_SCHEMA = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "MX",
  returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
  merchantReturnLink: absoluteUrl("/politica-de-cambios-y-devoluciones"),
} as const;

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
