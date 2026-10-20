/**
 * Página `/tiktok` (tarea 143): el enlace de la biografía de TikTok (y de
 * Instagram) lleva aquí — una página de "enlace en la bio" con las prendas que
 * salen en los videos, cada una con su botón directo a la compra.
 *
 * Para elegir qué prendas salen, poner aquí los `slug` de producto (el texto
 * después de /producto/ en la URL), en el orden en que se quieren mostrar:
 *
 *   export const TIKTOK_FEATURED_SLUGS = ["swift-leggin", "daily-top"];
 *
 * Si la lista está vacía, la página muestra sola los más vendidos y los más
 * nuevos (ropa con stock, máximo 8).
 */
export const TIKTOK_FEATURED_SLUGS: string[] = [];

/** Máximo de prendas cuando la lista se arma sola. */
export const TIKTOK_AUTO_LIMIT = 8;

/**
 * Etiquetas de seguimiento (UTM): hacen que Google Analytics sepa que la visita
 * vino de TikTok y que se pueda medir cuántas ventas trae.
 */
export const TIKTOK_UTM = "utm_source=tiktok&utm_medium=social&utm_campaign=link_en_bio";

export function withTiktokUtm(path: string): string {
  const [pathname, hash] = path.split("#");
  const sep = pathname.includes("?") ? "&" : "?";
  return `${pathname}${sep}${TIKTOK_UTM}${hash ? `#${hash}` : ""}`;
}
