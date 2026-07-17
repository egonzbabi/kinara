/**
 * Sube fotos reales por color (extraídas y recortadas del catálogo del proveedor,
 * ver tasks/009-fotos-por-color.md) a Supabase Storage y las registra en
 * product_images con su color_name. Usa SUPABASE_SERVICE_ROLE_KEY (solo local).
 *
 * Uso: npm run upload:color-images
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
  // BICROSSFLARE
  { productId: "2522", colorName: "Negro", file: "bicross_negro.jpg" },
  { productId: "2522", colorName: "Marino", file: "bicross_marino.jpg" },
  { productId: "2522", colorName: "Cocoa", file: "bicross_cocoa.jpg" },
  { productId: "2522", colorName: "Gris", file: "bicross_gris.jpg" },
  { productId: "2522", colorName: "Azul Gris", file: "bicross_azulgris.jpg" },
  { productId: "2522", colorName: "Verde Fresco", file: "bicross_verdefresco.jpg" },
  { productId: "2522", colorName: "Rosa", file: "bicross_rosa.jpg" },
  // CONJUNTO NUBE
  { productId: "2510", colorName: "Negro", file: "conjunto_negro.jpg" },
  { productId: "2510", colorName: "Marino", file: "conjunto_marino.jpg" },
  { productId: "2510", colorName: "Botanica Verde", file: "conjunto_botanicaverde.jpg" },
  { productId: "2510", colorName: "Azul Gris", file: "conjunto_azulgris.jpg" },
  { productId: "2510", colorName: "Melon", file: "conjunto_melon.jpg" },
  { productId: "2510", colorName: "Mulberry", file: "conjunto_mulberry.jpg" },
  // NO LIMITE SHORT
  { productId: "GZ01", colorName: "Negro", file: "nolimite_negro.jpg" },
  { productId: "GZ01", colorName: "Blanco", file: "nolimite_blanco.jpg" },
  // ACCOLADE HOODIE
  { productId: "WY6", colorName: "Negro", file: "accolade_negro.jpg" },
  { productId: "WY6", colorName: "Blanco", file: "accolade_blanco.jpg" },
  // DAILY TOP (parcial: solo Negro y Blanco, Vino y Rosa no tienen foto todavía)
  { productId: "3322", colorName: "Negro", file: "daily_negro.jpg" },
  { productId: "3322", colorName: "Blanco", file: "daily_blanco.jpg" },
];

async function main() {
  console.log(`Subiendo ${IMAGES.length} fotos por color...`);
  let ok = 0;

  for (const item of IMAGES) {
    const buffer = readFileSync(resolve(SRC_DIR, item.file));
    const storagePath = `${item.productId}/${item.colorName.replace(/\s+/g, "-").toLowerCase()}.jpg`;

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
