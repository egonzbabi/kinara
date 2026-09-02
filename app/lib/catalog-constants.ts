/** Badges válidos para un producto — compartido entre el storefront (catalog.ts) y el admin. */
export const VALID_BADGES = ["Nuevo", "Best-seller", "Oferta", "Edición", "Últimas unidades"] as const;

export const SIZE_ORDER = ["S", "M", "L", "XL"] as const;

/** Talla para productos que no manejan S/M/L/XL (accesorios: bolsas, gorras,
 * cinturones, etc., ver tarea 081) — un solo tamaño por color. */
export const ACCESSORY_SIZE = "Única" as const;

/** Todas las tallas válidas en `product_variants.size` (y en las tablas que la
 * reflejan: inventory_movements, inventory_counts) — S/M/L/XL para ropa,
 * "Única" para accesorios. Usar este tipo en vez de repetir la unión a mano. */
export type ProductSize = (typeof SIZE_ORDER)[number] | typeof ACCESSORY_SIZE;
