/**
 * Convierte una URL pública de Supabase Storage en una URL de su endpoint de
 * transformación de imágenes (`/render/image/public/...`), que redimensiona y
 * sirve WebP automáticamente según el `Accept` header del navegador — sin esto,
 * el detalle de producto servía PNGs sin comprimir de ~350KB+ (ver tarea 002).
 *
 * Si la URL no es de Supabase Storage (ej. `/productos/placeholder.png` local),
 * se devuelve tal cual.
 */
const OBJECT_MARKER = "/storage/v1/object/public/";
const RENDER_MARKER = "/storage/v1/render/image/public/";

type ProductImageOpts = {
  width: number;
  height?: number;
  quality?: number;
};

export function productImage(
  url: string,
  { width, height, quality = 75 }: ProductImageOpts,
): string {
  if (!url.includes(OBJECT_MARKER)) return url;

  const params = new URLSearchParams({
    width: String(width),
    quality: String(quality),
  });
  if (height) {
    params.set("height", String(height));
    params.set("resize", "cover");
  }

  return `${url.replace(OBJECT_MARKER, RENDER_MARKER)}?${params.toString()}`;
}

/**
 * `srcSet` para una serie de anchos, manteniendo un aspect ratio fijo
 * (`heightRatio` = alto/ancho, ej. 1.25 para 4:5). Se usa junto al atributo
 * `sizes` en el `<img>` para que el navegador pida solo el ancho que necesita.
 */
export function productSrcSet(
  url: string,
  widths: number[],
  { heightRatio, quality = 75 }: { heightRatio?: number; quality?: number } = {},
): string | undefined {
  if (!url.includes(OBJECT_MARKER)) return undefined;
  return widths
    .map((w) => {
      const height = heightRatio ? Math.round(w * heightRatio) : undefined;
      return `${productImage(url, { width: w, height, quality })} ${w}w`;
    })
    .join(", ");
}
