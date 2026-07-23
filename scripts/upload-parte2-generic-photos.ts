/**
 * Sube una foto genérica (position 0, color_name null) por producto para los
 * productos de la parte 2 donde se encontró y verificó una foto real (ver
 * tasks/018-catalogo-parte-2.md). Las fotos ya vienen recortadas (sin texto/UI
 * de proveedor) en el scratchpad de la sesión.
 *
 * Uso: npx tsx scripts/upload-parte2-generic-photos.ts
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
const CROPPED_DIR =
  "/private/tmp/claude-501/-Users-elizabethgonzalez/382d6742-2e96-464b-bb09-65d6b612b563/scratchpad/cropped";

// productId (ver salida de migrate-parte2.ts) -> archivo recortado ya verificado.
const PHOTOS: Record<string, string> = {
  z2gep2ik: "IMG_2175.jpg", // WRINKLE SHORT
  rva62zma: "IMG_2043.jpg", // CONJUNTO CAMUFLAJE
  b6qq5u7o: "IMG_2118.jpg", // BOTTEE SET
  dfp1c34z: "IMG_2148.jpg", // ENTERIZO LARGO
  hebysq8o: "IMG_2065.jpg", // LEISURE PANTS
  cvun2ie8: "IMG_2154.jpg", // ZIPPER FALDA
  mbksmyj1: "IMG_2081.jpg", // CONJUNTO BI COLOR SHORT
  "4d5pyoec": "IMG_2172.jpg", // ALL OUT PANTS
  b0qfoka7: "IMG_2090.jpg", // LEGGIN FLARE
  a33unpjw: "IMG_2104.jpg", // SET ESSENTAL
  w7fztofn: "IMG_2255.jpg", // SEAMLESS SOFTESS
  aahwibg2: "IMG_2248.jpg", // BUTTON
};

async function main() {
  let ok = 0;
  for (const [productId, filename] of Object.entries(PHOTOS)) {
    const buffer = readFileSync(`${CROPPED_DIR}/${filename}`);
    const storagePath = `${productId}/generic-0.jpg`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });
    if (uploadError) {
      console.error(`✗ Storage upload falló para ${productId}: ${uploadError.message}`);
      continue;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    const { error: imageError } = await supabase.from("product_images").upsert(
      { product_id: productId, url: data.publicUrl, position: 0, color_name: null },
      { onConflict: "product_id,color_name,position" },
    );
    if (imageError) {
      console.error(`✗ Insert product_images falló para ${productId}: ${imageError.message}`);
      continue;
    }

    ok++;
    console.log(`✓ ${productId} <- ${filename}`);
  }
  console.log(`\nListo: ${ok}/${Object.keys(PHOTOS).length} fotos subidas.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
