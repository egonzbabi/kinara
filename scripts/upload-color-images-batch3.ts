/**
 * Tercer lote de fotos por color (tarea 011): LULU TOP (080924) y LULU TOP (2315).
 * Mismo mecanismo que scripts/upload-color-images-batch2.ts.
 *
 * Uso: npm run upload:color-images-3
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Database } from "../app/lib/supabase.types";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.");
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);
const BUCKET = "product-images";
const SRC_DIR =
  "/private/tmp/claude-501/-Users-elizabethgonzalez/382d6742-2e96-464b-bb09-65d6b612b563/scratchpad/kinara-colores";

const IMAGES: { productId: string; colorName: string; file: string }[] = [
  // LULU TOP (080924) — 5/5
  { productId: "080924", colorName: "Hueso", file: "lulubra_hueso.jpg" },
  { productId: "080924", colorName: "Rey", file: "lulubra_rey.jpg" },
  { productId: "080924", colorName: "Lila", file: "lulubra_lila.jpg" },
  { productId: "080924", colorName: "Marino", file: "lulubra_marino.jpg" },
  { productId: "080924", colorName: "Negro", file: "lulubra_negro.jpg" },
  // LULU TOP (2315) — 6/7 (falta P.De Rosa, sin foto confiable en el catálogo)
  { productId: "2315", colorName: "Lila", file: "lulu2315_lila.jpg" },
  { productId: "2315", colorName: "Rojo", file: "lulu2315_rojo.jpg" },
  { productId: "2315", colorName: "Negro", file: "lulu2315_negro.jpg" },
  { productId: "2315", colorName: "Rey", file: "lulu2315_rey.jpg" },
  { productId: "2315", colorName: "Mulberry", file: "lulu2315_mulberry.jpg" },
  { productId: "2315", colorName: "Rosafresa", file: "lulu2315_rosafresa.jpg" },
];

async function main() {
  console.log(`Subiendo ${IMAGES.length} fotos por color (lote 3)...`);
  let ok = 0;

  for (const item of IMAGES) {
    const buffer = readFileSync(resolve(SRC_DIR, item.file));
    const slug = item.colorName
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
    const storagePath = `${item.productId}/${slug}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: true });
    if (uploadError) throw new Error(`Storage upload falló (${storagePath}): ${uploadError.message}`);

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    const { error: insertError } = await supabase.from("product_images").upsert(
      {
        product_id: item.productId,
        color_name: item.colorName,
        url: pub.publicUrl,
        position: 0,
      },
      { onConflict: "product_id,color_name,position" },
    );
    if (insertError) {
      throw new Error(
        `Insert product_images falló (${item.productId} ${item.colorName}): ${insertError.message}`,
      );
    }

    ok++;
    console.log(`✓ ${item.productId} — ${item.colorName}`);
  }

  console.log(`\nListo: ${ok}/${IMAGES.length} fotos por color subidas.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
