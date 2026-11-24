import { supabaseAdmin } from "./supabase.server";
import { mapComingSoonRow, type ComingSoonItem } from "./coming-soon";
import { slugify } from "./slug";

// Administración de "Próximamente" (tarea 152): alta, nombre, orden,
// mostrar/ocultar, borrar y paso a producto. Solo se usa desde /admin.

export type AdminComingSoonItem = ComingSoonItem & {
  active: boolean;
  position: number;
  /** URL con la que se precarga la foto al darla de alta como producto. */
  photoForProduct: string;
};

type Result = { ok: true } | { ok: false; error: string };

const COLUMNS = "id, name, image_url, image_base, position, active";

type DbRow = {
  id: string;
  name: string;
  image_url: string | null;
  image_base: string | null;
  position: number;
  active: boolean;
};

function toAdmin(row: DbRow): AdminComingSoonItem {
  return {
    ...mapComingSoonRow(row),
    active: row.active,
    position: row.position,
    // La foto estática se guarda tal cual (ruta de /public); la de Storage, su URL.
    photoForProduct: row.image_url ?? `/proximamente/${row.image_base}-800.webp`,
  };
}

export async function listComingSoonForAdmin(): Promise<AdminComingSoonItem[]> {
  const { data, error } = await supabaseAdmin
    .from("coming_soon_items")
    .select(COLUMNS)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(`No se pudo cargar Próximamente: ${error.message}`);
  return (data ?? []).map(toAdmin);
}

export async function getComingSoonForAdmin(id: string): Promise<AdminComingSoonItem | null> {
  const { data, error } = await supabaseAdmin
    .from("coming_soon_items")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return toAdmin(data);
}

export async function createComingSoon(name: string, imageUrl: string): Promise<Result> {
  const cleanName = name.trim().slice(0, 80);
  if (!cleanName) return { ok: false, error: "Escribe el nombre de la prenda." };
  if (!/^https?:\/\//.test(imageUrl)) return { ok: false, error: "Sube la foto de la prenda." };

  // Al final del carrusel.
  const { data: last } = await supabaseAdmin
    .from("coming_soon_items")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await supabaseAdmin.from("coming_soon_items").insert({
    name: cleanName,
    image_url: imageUrl,
    position: (last?.position ?? 0) + 1,
  });
  if (error) return { ok: false, error: `No se pudo guardar: ${error.message}` };
  return { ok: true };
}

export async function updateComingSoon(
  id: string,
  fields: { name?: string; active?: boolean; imageUrl?: string },
): Promise<Result> {
  const update: { name?: string; active?: boolean; image_url?: string; image_base?: null } = {};
  if (fields.name !== undefined) {
    const name = fields.name.trim().slice(0, 80);
    if (!name) return { ok: false, error: "El nombre no puede quedar vacío." };
    update.name = name;
  }
  if (fields.active !== undefined) update.active = fields.active;
  if (fields.imageUrl !== undefined) {
    if (!/^https?:\/\//.test(fields.imageUrl)) return { ok: false, error: "La foto no es válida." };
    update.image_url = fields.imageUrl;
    update.image_base = null;
  }
  const { error } = await supabaseAdmin.from("coming_soon_items").update(update).eq("id", id);
  if (error) return { ok: false, error: `No se pudo guardar: ${error.message}` };
  return { ok: true };
}

/** Sube o baja una prenda un lugar: intercambia su posición con la vecina. */
export async function moveComingSoon(id: string, direction: "up" | "down"): Promise<Result> {
  const { data, error } = await supabaseAdmin
    .from("coming_soon_items")
    .select("id, position, created_at")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error || !data) return { ok: false, error: "No se pudo reordenar." };

  const index = data.findIndex((r) => r.id === id);
  const neighbor = data[direction === "up" ? index - 1 : index + 1];
  if (index === -1 || !neighbor) return { ok: true }; // ya está en la orilla

  // Se renumeran todas (1..n) con las dos intercambiadas: así no quedan
  // posiciones repetidas aunque dos prendas hubieran empatado.
  const ids = data.map((r) => r.id);
  [ids[index], ids[ids.indexOf(neighbor.id)]] = [neighbor.id, id];
  for (let i = 0; i < ids.length; i++) {
    const { error: upErr } = await supabaseAdmin
      .from("coming_soon_items")
      .update({ position: i + 1 })
      .eq("id", ids[i]);
    if (upErr) return { ok: false, error: `No se pudo reordenar: ${upErr.message}` };
  }
  return { ok: true };
}

export async function deleteComingSoon(id: string): Promise<Result> {
  const { error } = await supabaseAdmin.from("coming_soon_items").delete().eq("id", id);
  if (error) return { ok: false, error: `No se pudo borrar: ${error.message}` };
  return { ok: true };
}

/**
 * Quita una prenda de Próximamente después de darla de alta como producto, pero
 * SOLO si el producto realmente quedó en el catálogo: existe, está publicado y
 * tiene al menos una variante (color+talla). Si algo no cuadra no borra nada y
 * la prenda se queda en Próximamente.
 */
export async function removeAfterProductCreated(
  comingSoonId: string,
  productId: string,
): Promise<Result> {
  const { data: product, error } = await supabaseAdmin
    .from("products")
    .select("id, is_draft")
    .eq("id", productId)
    .maybeSingle();
  if (error || !product || product.is_draft) {
    return { ok: false, error: "El producto no aparece publicado en el catálogo." };
  }
  const { count, error: variantsError } = await supabaseAdmin
    .from("product_variants")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  if (variantsError || !count) {
    return { ok: false, error: "El producto no tiene colores/tallas guardados." };
  }
  return deleteComingSoon(comingSoonId);
}

/** Borrador de producto a partir de una prenda de Próximamente (nombre, slug y foto). */
export function productDraftFromComingSoon(item: AdminComingSoonItem) {
  return { name: item.name, slug: slugify(item.name), photo: item.photoForProduct };
}
