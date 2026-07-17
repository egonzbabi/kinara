/**
 * Migración de una sola vez (tarea 016):
 * 1. Regenera products.id de cada producto existente a un código interno corto
 *    generado por el programa (ya no el código legible del proveedor/Excel).
 * 2. Antes de perder el código original, calcula product_variants.modelo =
 *    "{codigoOriginal}-{COLOR}-{TALLA}" para cada variante.
 * 3. Mueve los archivos de Storage de {idViejo}/... a {idNuevo}/... y actualiza
 *    las URLs guardadas en product_images.
 *
 * Requiere que la migración 20260715000000_modelo_and_id_cascade.sql ya esté
 * aplicada (on update cascade en las FK + columna modelo).
 *
 * Uso: npx tsx scripts/regenerate-product-ids.ts [--dry-run]
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { generateShortId, modeloColorCode } from "../app/lib/slug";
import type { Database } from "../app/lib/supabase.types";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.error("Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.");
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);
const BUCKET = "product-images";
const DRY_RUN = process.argv.includes("--dry-run");

const LOG_PATH =
  "/private/tmp/claude-501/-Users-elizabethgonzalez/382d6742-2e96-464b-bb09-65d6b612b563/scratchpad/regenerate-ids-log.json";

type LogEntry = {
  name: string;
  oldId: string;
  newId: string;
  modelos: { colorName: string; size: string; modelo: string }[];
  movedFiles: string[];
};

async function generateUniqueId(existingIds: Set<string>): Promise<string> {
  let id = generateShortId();
  while (existingIds.has(id)) id = generateShortId();
  existingIds.add(id);
  return id;
}

async function main() {
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name")
    .order("name");
  if (productsError) throw new Error(productsError.message);
  if (!products || products.length === 0) {
    console.log("No hay productos.");
    return;
  }

  const existingIds = new Set(products.map((p) => p.id));
  const log: LogEntry[] = [];

  for (const product of products) {
    const oldId = product.id;
    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("id, color_name, size")
      .eq("product_id", oldId);
    if (variantsError) throw new Error(`[${product.name}] ${variantsError.message}`);

    const { data: images, error: imagesError } = await supabase
      .from("product_images")
      .select("id, url")
      .eq("product_id", oldId);
    if (imagesError) throw new Error(`[${product.name}] ${imagesError.message}`);

    const newId = await generateUniqueId(existingIds);

    const modelos = (variants ?? []).map((v) => ({
      variantId: v.id,
      colorName: v.color_name,
      size: v.size,
      modelo: `${oldId}-${modeloColorCode(v.color_name)}-${v.size}`,
    }));

    console.log(`\n${product.name}: ${oldId} → ${newId}`);
    for (const m of modelos) console.log(`  ${m.colorName} ${m.size} → modelo="${m.modelo}"`);

    if (DRY_RUN) {
      log.push({
        name: product.name,
        oldId,
        newId,
        modelos: modelos.map(({ colorName, size, modelo }) => ({ colorName, size, modelo })),
        movedFiles: [],
      });
      continue;
    }

    // 1. Mover archivos de Storage de {oldId}/ a {newId}/.
    const { data: files, error: listError } = await supabase.storage.from(BUCKET).list(oldId);
    if (listError) throw new Error(`[${product.name}] listando Storage: ${listError.message}`);

    const movedFiles: string[] = [];
    for (const file of files ?? []) {
      const from = `${oldId}/${file.name}`;
      const to = `${newId}/${file.name}`;
      const { error: moveError } = await supabase.storage.from(BUCKET).move(from, to);
      if (moveError) throw new Error(`[${product.name}] moviendo ${from} → ${to}: ${moveError.message}`);
      movedFiles.push(`${from} → ${to}`);
    }

    // 2. Actualizar las URLs guardadas en product_images para que apunten a la carpeta nueva.
    for (const img of images ?? []) {
      const newUrl = img.url.replace(`/${BUCKET}/${oldId}/`, `/${BUCKET}/${newId}/`);
      if (newUrl === img.url) continue;
      const { error: urlError } = await supabase
        .from("product_images")
        .update({ url: newUrl })
        .eq("id", img.id);
      if (urlError) throw new Error(`[${product.name}] actualizando url de imagen: ${urlError.message}`);
    }

    // 3. Renombrar products.id (cascada automática a product_variants/product_images
    // gracias a on update cascade).
    const { error: renameError } = await supabase
      .from("products")
      .update({ id: newId })
      .eq("id", oldId);
    if (renameError) throw new Error(`[${product.name}] renombrando id: ${renameError.message}`);

    // 4. Guardar el modelo calculado en cada variante (su propio id uuid no cambió).
    for (const m of modelos) {
      const { error: modeloError } = await supabase
        .from("product_variants")
        .update({ modelo: m.modelo })
        .eq("id", m.variantId);
      if (modeloError) throw new Error(`[${product.name}] guardando modelo: ${modeloError.message}`);
    }

    log.push({
      name: product.name,
      oldId,
      newId,
      modelos: modelos.map(({ colorName, size, modelo }) => ({ colorName, size, modelo })),
      movedFiles,
    });
    console.log(`  ✓ ${movedFiles.length} archivos movidos, id y modelos actualizados.`);
  }

  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
  console.log(`\n${DRY_RUN ? "[DRY RUN] " : ""}Listo. Log guardado en ${LOG_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
