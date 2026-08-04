/**
 * Agrupa los ~36 nombres de color específicos del catálogo en familias
 * visuales (Blanco, Negro, Gris, Café, Rojo, Vino, Rosa, Morado, Azul,
 * Turquesa, Verde) para el filtro de /tienda — antes mostraba un swatch por
 * cada nombre exacto (ej. "Palo De Rosa", "Fresa", "Melon" y "Rosa" como 4
 * puntos casi idénticos por separado), una lista larga y redundante.
 *
 * El criterio de agrupación es visual (hue/saturación/luminosidad del hex
 * real de cada color, ver tasks/034-familias-de-color.md), no solo el
 * nombre — por eso "Verde Claro" (un beige/caqui pálido en la foto real) cae
 * en la familia Café y no Verde, y "Militar"/"Olivo" caen en Verde aunque no
 * lo digan literalmente. En saturaciones bajas el hue calculado del hex no
 * siempre coincide con cómo se ve la prenda real en foto (pasó con "Lila",
 * que por hex daba tono rosa pero en la foto real es claramente morado) — al
 * reasignar una familia, confirmar contra la foto del producto, no solo el hex.
 */
export const COLOR_FAMILY: Record<string, string> = {
  Agua: "Blanco",
  "Agua Blue": "Azul",
  "Azul Gris": "Azul",
  "Azul-Turquesa": "Azul",
  Blanco: "Blanco",
  "Botanica Verde": "Turquesa",
  Botella: "Turquesa",
  Café: "Café",
  Camel: "Café",
  Cocoa: "Café",
  Fresa: "Rosa",
  Gris: "Gris",
  Hueso: "Blanco",
  Ivory: "Blanco",
  Lila: "Morado",
  "Lila Griseado": "Gris",
  Magenta: "Vino",
  Marino: "Azul",
  Melon: "Rosa",
  Menta: "Turquesa",
  Militar: "Verde",
  Morado: "Morado",
  Mulberry: "Vino",
  Negro: "Negro",
  Olivo: "Verde",
  Oxford: "Gris",
  "Palo De Rosa": "Rosa",
  Rey: "Azul",
  Rojo: "Rojo",
  Rosa: "Rosa",
  Turquesa: "Turquesa",
  Verde: "Verde",
  "Verde Claro": "Café",
  "Verde Fresco": "Turquesa",
  Vino: "Vino",
  Violet: "Morado",
};

/** Hex representativo de cada familia para el swatch del filtro — elegido
 * por legibilidad visual, no necesariamente el hex del color que comparte
 * nombre con la familia (ej. "Morado" real es un tono apagado, se usa el
 * hex de "Violet" que se distingue mejor como punto de color). */
export const FAMILY_SWATCH: Record<string, string> = {
  Blanco: "#F0F0F0",
  Negro: "#131312",
  Gris: "#cdc3d0",
  Café: "#8b644b",
  Rojo: "#e60e2e",
  Vino: "#863d49",
  Rosa: "#dda0aa",
  Morado: "#a25fd9",
  Azul: "#3476da",
  Turquesa: "#0194d6",
  Verde: "#4C7A5E",
};

/** Orden fijo del filtro: de neutrales a saturados, como suele verse en retail. */
export const FAMILY_ORDER = [
  "Blanco",
  "Negro",
  "Gris",
  "Café",
  "Rojo",
  "Vino",
  "Rosa",
  "Morado",
  "Azul",
  "Turquesa",
  "Verde",
];

/** Un color nuevo que se dé de alta sin actualizar `COLOR_FAMILY` cae en su
 * propia familia (mismo nombre) en vez de romper el filtro o desaparecer. */
export function getColorFamily(colorName: string): string {
  return COLOR_FAMILY[colorName] ?? colorName;
}
