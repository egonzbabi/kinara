import { supabaseAdmin } from "./supabase.server";
import { slugify, generateShortId, baseSkuFrom } from "./slug";
import { VALID_BADGES } from "./catalog-constants";

const BUCKET = "product-images";

export type SizeStock = { size: "S" | "M" | "L" | "XL"; stock: number; modelo: string | null };

export type AdminColorInput = {
  name: string;
  hex: string | null;
  sizes: SizeStock[];
  /** Todas las fotos de este color, en orden — la primera es la principal. */
  imageUrls: string[];
};

export type AdminProductInput = {
  name: string;
  slug: string;
  category: "mujer" | "hombre" | "accesorios";
  kind: string;
  price: number;
  compareAt: number | null;
  description: string | null;
  materials: string | null;
  badge: string | null;
  isNew: boolean;
  isBestseller: boolean;
  isOnSale: boolean;
  /** Muestra la leyenda "· Tallas reducidas" junto a "Talla" en el detalle público. Default true. */
  showReducedSizesNotice: boolean;
  colors: AdminColorInput[];
  gallery: string[];
};

export type AdminProductListItem = {
  id: string;
  slug: string;
  name: string;
  category: "mujer" | "hombre" | "accesorios";
  price: number | null;
  isDraft: boolean;
  totalStock: number;
  colors: { name: string; hex: string | null }[];
  thumbnailUrl: string;
  /** SKU original (base, sin -COLOR-TALLA) — vacío si ninguna variante tiene modelo cargado. */
  baseSku: string;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: "mujer" | "hombre" | "accesorios";
  kind: string;
  price: number | null;
  is_draft: boolean;
  compare_at: number | null;
  description: string | null;
  materials: string | null;
  badge: string | null;
  is_new: boolean;
  is_bestseller: boolean;
  is_on_sale: boolean;
  show_reduced_sizes_notice: boolean;
  product_variants: {
    color_name: string;
    color_hex: string | null;
    size: "S" | "M" | "L" | "XL";
    stock: number;
    modelo: string | null;
  }[];
  product_images: { url: string; position: number; color_name: string | null }[];
};

const SELECT =
  "*, product_variants(color_name, color_hex, size, stock, modelo), product_images(url, position, color_name)";

function pickThumbnail(row: ProductRow): string {
  const generic = row.product_images
    .filter((img) => img.color_name === null)
    .sort((a, b) => a.position - b.position)[0];
  if (generic) return generic.url;
  const perColor = row.product_images.find((img) => img.color_name !== null);
  if (perColor) return perColor.url;
  return "/productos/placeholder.png";
}

export async function listAdminProducts(): Promise<AdminProductListItem[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(SELECT)
    .order("created_at");
  if (error) throw new Error(`No se pudo cargar el catálogo: ${error.message}`);

  return (data as ProductRow[]).map((row) => {
    const colorMap = new Map<string, string | null>();
    let totalStock = 0;
    for (const v of row.product_variants) {
      if (!colorMap.has(v.color_name)) colorMap.set(v.color_name, v.color_hex);
      totalStock += v.stock;
    }
    const withSku = row.product_variants.find((v) => v.modelo);
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: row.category,
      price: row.price,
      isDraft: row.is_draft,
      totalStock,
      colors: Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex })),
      thumbnailUrl: pickThumbnail(row),
      baseSku: withSku?.modelo ? baseSkuFrom(withSku.modelo) : "",
    };
  });
}

export type InventoryRow = {
  productId: string;
  productName: string;
  /** Slug (URL) del producto — a veces conserva el nombre anterior si el producto se renombró. */
  productSlug: string;
  category: "mujer" | "hombre" | "accesorios";
  kind: string;
  isDraft: boolean;
  colorName: string;
  size: "S" | "M" | "L" | "XL";
  sku: string | null;
  stock: number;
  price: number | null;
  compareAt: number | null;
  photoUrl: string;
};

/**
 * Una fila por combinación producto+color+talla (nivel SKU) — es la unidad
 * real de inventario físico, a diferencia de `listAdminProducts` que agrupa
 * todo por producto para la tabla de /admin/productos.
 */
export async function listInventory(): Promise<InventoryRow[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(SELECT)
    .order("created_at");
  if (error) throw new Error(`No se pudo cargar el inventario: ${error.message}`);

  const rows: InventoryRow[] = [];
  for (const row of data as ProductRow[]) {
    const photoByColor = new Map<string, string>();
    for (const img of row.product_images) {
      if (img.color_name && !photoByColor.has(img.color_name)) {
        photoByColor.set(img.color_name, img.url);
      }
    }
    const generic = pickThumbnail(row);

    for (const v of row.product_variants) {
      rows.push({
        productId: row.id,
        productName: row.name,
        productSlug: row.slug,
        category: row.category,
        kind: row.kind,
        isDraft: row.is_draft,
        colorName: v.color_name,
        size: v.size,
        sku: v.modelo,
        stock: v.stock,
        price: row.price,
        compareAt: row.compare_at,
        photoUrl: photoByColor.get(v.color_name) ?? generic,
      });
    }
  }
  return rows;
}

export async function getAdminProductById(id: string): Promise<AdminProductInput | null> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`No se pudo cargar el producto: ${error.message}`);
  if (!data) return null;
  const row = data as ProductRow;

  const colorOrder: string[] = [];
  const colorsByName = new Map<string, AdminColorInput>();
  for (const v of row.product_variants) {
    if (!colorsByName.has(v.color_name)) {
      colorOrder.push(v.color_name);
      colorsByName.set(v.color_name, {
        name: v.color_name,
        hex: v.color_hex,
        sizes: [],
        imageUrls: [],
      });
    }
    colorsByName.get(v.color_name)!.sizes.push({ size: v.size, stock: v.stock, modelo: v.modelo });
  }
  const colorImageRows = row.product_images
    .filter((img) => img.color_name)
    .sort((a, b) => a.position - b.position);
  for (const img of colorImageRows) {
    if (img.color_name && colorsByName.has(img.color_name)) {
      colorsByName.get(img.color_name)!.imageUrls.push(img.url);
    }
  }

  const gallery = row.product_images
    .filter((img) => img.color_name === null)
    .sort((a, b) => a.position - b.position)
    .map((img) => img.url);

  return {
    name: row.name,
    slug: row.slug,
    category: row.category,
    kind: row.kind,
    price: row.price ?? 0,
    compareAt: row.compare_at,
    description: row.description,
    materials: row.materials,
    badge: row.badge,
    isNew: row.is_new,
    isBestseller: row.is_bestseller,
    isOnSale: row.is_on_sale,
    showReducedSizesNotice: row.show_reduced_sizes_notice,
    colors: colorOrder.map((name) => colorsByName.get(name)!),
    gallery,
  };
}

function validateInput(input: AdminProductInput) {
  if (input.badge && !(VALID_BADGES as readonly string[]).includes(input.badge)) {
    throw new Error(`Badge inválido: ${input.badge}`);
  }
}

/**
 * `preserveStock`: cuando se pasa (solo al editar un producto ya existente,
 * ver `updateProduct`), el stock que llega del formulario se IGNORA por
 * completo para cualquier talla que ya existiera — se usa el stock real que
 * ya tenía en la base en su lugar. Así el número de existencias solo puede
 * cambiar por `/admin/inventario/movimientos` (tarea 078), nunca por accidente
 * al editar nombre/precio/fotos/etc. de un producto. Una talla nueva (que no
 * existía antes) siempre arranca en 0, sin importar qué número traiga el
 * formulario — se le sube el stock real después, también por Movimientos.
 */
async function insertVariantsAndImages(
  productId: string,
  input: AdminProductInput,
  preserveStock?: Map<string, number>,
) {
  const variantRows = input.colors.flatMap((color) =>
    color.sizes
      // El formulario manda las 4 tallas de cada color siempre (aunque el admin
      // no las haya tocado, ver `sizesFor` en ProductForm), así que una talla en
      // 0 sin SKU es "no aplica" y se descarta. Pero una talla con SKU cargado sí
      // se guarda aunque esté en 0 — es como el admin da de alta un color/talla
      // real que existe físicamente pero todavía no tiene existencias (ver tarea
      // 076: antes se perdía en silencio, sin poder registrarla para compararla
      // después en el conteo físico de inventario).
      .filter((s) => s.stock > 0 || Boolean(s.modelo?.trim()))
      .map((s) => {
        const key = `${color.name}|${s.size}`;
        const stock = preserveStock ? (preserveStock.get(key) ?? 0) : s.stock;
        return {
          product_id: productId,
          color_name: color.name,
          color_hex: color.hex,
          size: s.size,
          stock,
          modelo: s.modelo,
        };
      }),
  );
  if (variantRows.length > 0) {
    const { error } = await supabaseAdmin.from("product_variants").insert(variantRows);
    if (error) throw new Error(`No se pudieron guardar las variantes: ${error.message}`);
  }

  const imageRows = [
    ...input.colors.flatMap((c) =>
      c.imageUrls.map((url, i) => ({
        product_id: productId,
        color_name: c.name,
        url,
        position: i,
      })),
    ),
    ...input.gallery.map((url, i) => ({
      product_id: productId,
      color_name: null,
      url,
      position: i,
    })),
  ];
  if (imageRows.length > 0) {
    const { error } = await supabaseAdmin.from("product_images").insert(imageRows);
    if (error) throw new Error(`No se pudieron guardar las imágenes: ${error.message}`);
  }

  return variantRows;
}

export async function createProduct(
  input: AdminProductInput,
  admin: { adminId: string | null; adminName: string },
): Promise<string> {
  validateInput(input);

  const safeSlug = slugify(input.slug);
  const { data: existingSlug } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("slug", safeSlug)
    .maybeSingle();
  if (existingSlug) {
    throw new Error(`Ya existe un producto con el slug "${safeSlug}".`);
  }
  input = { ...input, slug: safeSlug };

  // El id es un código interno generado por el programa, sin significado de negocio
  // (el código de negocio/logística vive en product_variants.modelo, ver tarea 016).
  let id = generateShortId();
  for (let attempts = 0; attempts < 5; attempts++) {
    const { data: existingId } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (!existingId) break;
    id = generateShortId();
  }

  const { error: insertError } = await supabaseAdmin.from("products").insert({
    id,
    slug: input.slug,
    name: input.name,
    category: input.category,
    kind: input.kind,
    price: input.price,
    compare_at: input.compareAt,
    description: input.description,
    materials: input.materials,
    badge: input.badge,
    is_new: input.isNew,
    is_bestseller: input.isBestseller,
    is_on_sale: input.isOnSale,
    show_reduced_sizes_notice: input.showReducedSizesNotice,
    is_draft: false,
  });
  if (insertError) throw new Error(`No se pudo crear el producto: ${insertError.message}`);

  try {
    const variantRows = await insertVariantsAndImages(id, input);
    // Tarea 079: el stock inicial también queda registrado en Movimientos (tipo
    // "entrada", concepto "Carga inicial de producto") — así ningún número de
    // existencias existe sin un origen auditable, ni siquiera el primero. Se
    // inserta directo (no vía register_inventory_movement) porque esa función
    // espera una variante YA existente para bloquearla/ajustarla; aquí la
    // variante se acaba de crear con el stock ya puesto, no hay nada que ajustar.
    const today = new Date().toISOString().slice(0, 10);
    const movementRows = variantRows
      .filter((v) => v.stock > 0)
      .map((v) => ({
        product_id: id,
        color_name: v.color_name,
        size: v.size,
        type: "entrada" as const,
        quantity: v.stock,
        concept: "Carga inicial de producto",
        movement_date: today,
        resulting_stock: v.stock,
        admin_id: admin.adminId,
        admin_name: admin.adminName,
      }));
    if (movementRows.length > 0) {
      const { error: movementError } = await supabaseAdmin
        .from("inventory_movements")
        .insert(movementRows);
      if (movementError) {
        throw new Error(`No se pudo registrar la carga inicial en Movimientos: ${movementError.message}`);
      }
    }
  } catch (err) {
    // No dejar un producto huérfano visible en la tienda si falló algo después.
    await supabaseAdmin.from("products").delete().eq("id", id);
    throw err;
  }

  return id;
}

function extractStoragePath(url: string): string | null {
  const marker = `/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export async function updateProduct(id: string, input: AdminProductInput): Promise<void> {
  validateInput(input);

  const { error: updateError } = await supabaseAdmin
    .from("products")
    .update({
      slug: input.slug,
      name: input.name,
      category: input.category,
      kind: input.kind,
      price: input.price,
      compare_at: input.compareAt,
      description: input.description,
      materials: input.materials,
      badge: input.badge,
      is_new: input.isNew,
      is_bestseller: input.isBestseller,
      is_on_sale: input.isOnSale,
      show_reduced_sizes_notice: input.showReducedSizesNotice,
      is_draft: false,
    })
    .eq("id", id);
  if (updateError) throw new Error(`No se pudo actualizar el producto: ${updateError.message}`);

  // El stock real se lee de aquí ANTES de borrar — nunca del formulario (ver
  // insertVariantsAndImages/tarea 078): editar un producto no debe poder
  // cambiar existencias por accidente, eso solo pasa por Movimientos.
  const { data: existingVariants, error: existingVariantsError } = await supabaseAdmin
    .from("product_variants")
    .select("color_name, size, stock")
    .eq("product_id", id);
  if (existingVariantsError) {
    throw new Error(`No se pudo leer el stock actual: ${existingVariantsError.message}`);
  }
  const preserveStock = new Map<string, number>(
    (existingVariants ?? []).map((v) => [`${v.color_name}|${v.size}`, v.stock]),
  );

  const { error: deleteVariantsError } = await supabaseAdmin
    .from("product_variants")
    .delete()
    .eq("product_id", id);
  if (deleteVariantsError) {
    throw new Error(`No se pudieron limpiar las variantes previas: ${deleteVariantsError.message}`);
  }

  const { data: oldImages, error: oldImagesError } = await supabaseAdmin
    .from("product_images")
    .select("url")
    .eq("product_id", id);
  if (oldImagesError) {
    throw new Error(`No se pudieron leer las imágenes previas: ${oldImagesError.message}`);
  }

  const { error: deleteImagesError } = await supabaseAdmin
    .from("product_images")
    .delete()
    .eq("product_id", id);
  if (deleteImagesError) {
    throw new Error(`No se pudieron limpiar las imágenes previas: ${deleteImagesError.message}`);
  }

  await insertVariantsAndImages(id, input, preserveStock);

  // Limpiar en Storage las imágenes que ya no están en el set nuevo (si no, quedan huérfanas).
  const newUrls = new Set([
    ...input.colors.flatMap((c) => c.imageUrls),
    ...input.gallery,
  ]);
  const orphanPaths = (oldImages ?? [])
    .map((img) => img.url)
    .filter((url) => !newUrls.has(url))
    .map(extractStoragePath)
    .filter((p): p is string => Boolean(p));
  if (orphanPaths.length > 0) {
    await supabaseAdmin.storage.from(BUCKET).remove(orphanPaths);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const { data: files } = await supabaseAdmin.storage.from(BUCKET).list(id);
  if (files && files.length > 0) {
    await supabaseAdmin.storage.from(BUCKET).remove(files.map((f) => `${id}/${f.name}`));
  }

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) throw new Error(`No se pudo eliminar el producto: ${error.message}`);
}
