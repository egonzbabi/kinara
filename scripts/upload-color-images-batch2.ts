/**
 * Segundo lote de fotos por color (tarea 010): CHAQUETA FIT, LILIA CHAQUETA,
 * TECNO PREMIUM, CHAMARRA NIKKA, ZIPPER BRA, SWIFT LEGGIN, PASTEL FALDA,
 * ALIGH LEGGIN. Mismo mecanismo que scripts/upload-color-images.ts.
 *
 * Uso: npm run upload:color-images-2
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
  // CHAQUETA FIT (JV001) — falta P.De Rosa (sin foto confiable en el catálogo)
  { productId: "JV001", colorName: "Negro", file: "chaquetafit_negro.jpg" },
  { productId: "JV001", colorName: "Marino", file: "chaquetafit_marino.jpg" },
  { productId: "JV001", colorName: "Café", file: "chaquetafit_cafe.jpg" },
  { productId: "JV001", colorName: "Azulgris", file: "chaquetafit_azulgris.jpg" },
  { productId: "JV001", colorName: "Lila", file: "chaquetafit_lila.jpg" },
  // LILIA CHAQUETA (JV024) — 2/2
  { productId: "JV024", colorName: "Rey", file: "lilia_rey.jpg" },
  { productId: "JV024", colorName: "Negro", file: "lilia_negro.jpg" },
  // TECNO PREMIUM (080225) — 4/4
  { productId: "080225", colorName: "Negro", file: "tecno_negro.jpg" },
  { productId: "080225", colorName: "Blanco", file: "tecno_blanco.jpg" },
  { productId: "080225", colorName: "Café", file: "tecno_cafe.jpg" },
  { productId: "080225", colorName: "Rosa", file: "tecno_rosa.jpg" },
  // CHAMARRA NIKKA (080624) — falta Café (diseño distinto a Tecno Premium, sin foto confiable)
  { productId: "080624", colorName: "Negro", file: "nikka_negro.jpg" },
  { productId: "080624", colorName: "Hueso", file: "nikka_hueso.jpg" },
  { productId: "080624", colorName: "Rosa", file: "nikka_rosa.jpg" },
  // ZIPPER BRA (2509) — falta Vino (candidatas eran rojo brillante, no vino)
  { productId: "2509", colorName: "Negro", file: "zipperbra_negro.jpg" },
  { productId: "2509", colorName: "Rey", file: "zipperbra_rey.jpg" },
  // SWIFT LEGGIN (JV002) — 8/8
  { productId: "JV002", colorName: "Negro", file: "swift_negro.jpg" },
  { productId: "JV002", colorName: "Marino", file: "swift_marino.jpg" },
  { productId: "JV002", colorName: "Vino", file: "swift_vino.jpg" },
  { productId: "JV002", colorName: "P.De Rosa", file: "swift_pderosa.jpg" },
  { productId: "JV002", colorName: "Café", file: "swift_cafe.jpg" },
  { productId: "JV002", colorName: "Camel", file: "swift_camel.jpg" },
  { productId: "JV002", colorName: "Azul Gris", file: "swift_azulgris.jpg" },
  { productId: "JV002", colorName: "Lila", file: "swift_lila.jpg" },
  // PASTEL FALDA (JV014) — 3/3
  { productId: "JV014", colorName: "Negro", file: "falda_negro.jpg" },
  { productId: "JV014", colorName: "Rosa", file: "falda_rosa.jpg" },
  { productId: "JV014", colorName: "Blanco", file: "falda_blanco.jpg" },
  // ALIGH LEGGIN (2420) — solo 1/3 (Negro y Rey sin foto confiable, quedan ocultos)
  { productId: "2420", colorName: "Vino", file: "aligh_vino.jpg" },
];

async function main() {
  console.log(`Subiendo ${IMAGES.length} fotos por color (lote 2)...`);
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
