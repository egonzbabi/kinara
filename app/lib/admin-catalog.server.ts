import { supabaseAdmin } from "./supabase.server";
import { slugify, generateShortId } from "./slug";
import { VALID_BADGES } from "./catalog-constants";

const BUCKET = "product-images";

export type SizeStock = { size: "S" | "M" | "L" | "XL"; stock: number; modelo: string | null };

export type AdminColorInput = {
  name: string;
  hex: string | null;
  sizes: SizeStock[];
  imageUrl: string | null;
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
    };
  });
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
        imageUrl: null,
      });
    }
    colorsByName.get(v.color_name)!.sizes.push({ size: v.size, stock: v.stock, modelo: v.modelo });
  }
  for (const img of row.product_images) {
    if (img.color_name && img.position === 0 && colorsByName.has(img.color_name)) {
      colorsByName.get(img.color_name)!.imageUrl = img.url;
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
    colors: colorOrder.map((name) => colorsByName.get(name)!),
    gallery,
  };
}

function validateInput(input: AdminProductInput) {
  if (input.badge && !(VALID_BADGES as readonly string[]).includes(input.badge)) {
    throw new Error(`Badge inválido: ${input.badge}`);
  }
}

async function insertVariantsAndImages(productId: string, input: AdminProductInput) {
  const variantRows = input.colors.flatMap((color) =>
    color.sizes
      .filter((s) => s.stock > 0)
      .map((s) => ({
        product_id: productId,
        color_name: color.name,
        color_hex: color.hex,
        size: s.size,
        stock: s.stock,
        modelo: s.modelo,
      })),
  );
  if (variantRows.length > 0) {
    const { error } = await supabaseAdmin.from("product_variants").insert(variantRows);
    if (error) throw new Error(`No se pudieron guardar las variantes: ${error.message}`);
  }

  const imageRows = [
    ...input.colors
      .filter((c) => c.imageUrl)
      .map((c) => ({
        product_id: productId,
        color_name: c.name,
        url: c.imageUrl!,
        position: 0,
      })),
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
}

export async function createProduct(input: AdminProductInput): Promise<string> {
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
    is_draft: false,
  });
  if (insertError) throw new Error(`No se pudo crear el producto: ${insertError.message}`);

  try {
    await insertVariantsAndImages(id, input);
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
      is_draft: false,
    })
    .eq("id", id);
  if (updateError) throw new Error(`No se pudo actualizar el producto: ${updateError.message}`);

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

  await insertVariantsAndImages(id, input);

  // Limpiar en Storage las imágenes que ya no están en el set nuevo (si no, quedan huérfanas).
  const newUrls = new Set([
    ...input.colors.filter((c) => c.imageUrl).map((c) => c.imageUrl!),
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
