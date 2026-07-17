/** Convierte texto libre a un slug ASCII-safe (para IDs, slugs de producto, y storage keys). */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

/** Normaliza un nombre de color para el código de "modelo": mayúsculas, sin acentos/espacios/puntuación. */
export function modeloColorCode(colorName: string): string {
  return colorName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

const SHORT_ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

/** Código interno corto y aleatorio para product.id (no tiene significado de negocio). */
export function generateShortId(length = 8): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += SHORT_ID_ALPHABET[b % SHORT_ID_ALPHABET.length];
  return out;
}
