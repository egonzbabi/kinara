/**
 * Sube las 4 fotos del collage del hero de home a Supabase Storage
 * (bucket `product-images`, prefijo `site/`, ya que no hay bucket separado
 * para imágenes editoriales). Las fotos ya vienen redimensionadas/comprimidas
 * con `sips` en el scratchpad de la sesión (ver tasks/024-hero-collage-copy.md).
 *
 * Uso: npx tsx scripts/upload-hero-collage.ts
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import type { Database } from "../app/lib/supabase.types";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.error("Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.");
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);
const BUCKET = "product-images";
const SOURCE_DIR =
  "/private/tmp/claude-501/-Users-elizabethgonzalez/faa00417-021c-452a-97a8-c6c55bbfc77b/scratchpad/hero";

const PHOTOS = ["hero-1.jpg", "hero-2.jpg", "hero-3.jpg", "hero-4.jpg"];

async function main() {
  const urls: string[] = [];
  for (const filename of PHOTOS) {
    const buffer = readFileSync(`${SOURCE_DIR}/${filename}`);
    const storagePath = `site/${filename}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });
    if (uploadError) {
      console.error(`✗ ${filename}: ${uploadError.message}`);
      process.exit(1);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    urls.push(data.publicUrl);
    console.log(`✓ ${filename} -> ${data.publicUrl}`);
  }

  console.log("\nURLs para app/data/images.ts:");
  console.log(JSON.stringify(urls, null, 2));
}

main();
