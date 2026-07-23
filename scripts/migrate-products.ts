/**
 * Migración única: sube las imágenes de public/productos a Supabase Storage
 * e inserta el catálogo (productos + variantes color/talla/stock) desde
 * scripts/seed-data.ts. Usa SUPABASE_SERVICE_ROLE_KEY (solo local, nunca en el cliente).
 *
 * Uso: npm run migrate:products
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve, extname } from "node:path";
import type { Database } from "../app/lib/supabase.types";
import { SEED_PRODUCTS } from "./seed-data";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env. " +
      "Agrega tu service_role key en .env (Project Settings -> API Keys en Supabase) y vuelve a correr este script.",
  );
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

const BUCKET = "product-images";
const PUBLIC_DIR = resolve(import.meta.dirname, "..", "public");

function contentTypeFor(path: string): string {
  const ext = extname(path).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

async function uploadImage(localImage: string, productId: string): Promise<string> {
  const localPath = resolve(PUBLIC_DIR, localImage.replace(/^\//, ""));
  const fileBuffer = readFileSync(localPath);
  const storagePath = `${productId}${extname(localImage)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
    contentType: contentTypeFor(localImage),
    upsert: true,
  });
  if (error) throw new Error(`Storage upload falló para ${productId}: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function main() {
  console.log(`Migrando ${SEED_PRODUCTS.length} productos...`);
  let ok = 0;

  for (const p of SEED_PRODUCTS) {
    const imageUrl = await uploadImage(p.localImage, p.id);

    const { error: productError } = await supabase.from("products").upsert({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      kind: p.kind,
      price: p.price,
      compare_at: null,
      description: p.description,
      materials: p.materials,
      badge: p.badge,
      is_new: p.isNew,
      is_bestseller: p.isBestseller,
      is_draft: false,
    });
    if (productError) throw new Error(`Insert products falló para ${p.id}: ${productError.message}`);

    const { error: imageError } = await supabase.from("product_images").upsert(
      {
        product_id: p.id,
        url: imageUrl,
        position: 0,
        color_name: null,
      },
      { onConflict: "product_id,color_name,position" },
    );
    if (imageError) throw new Error(`Insert product_images falló para ${p.id}: ${imageError.message}`);

    for (const color of p.colors) {
      for (const size of ["S", "M", "L", "XL"] as const) {
        const stock = color.stock[size];
        const { error: variantError } = await supabase.from("product_variants").upsert(
          {
            product_id: p.id,
            color_name: color.name,
            color_hex: color.hex,
            size,
            stock,
          },
          { onConflict: "product_id,color_name,size" },
        );
        if (variantError) {
          throw new Error(
            `Insert product_variants falló para ${p.id} ${color.name} ${size}: ${variantError.message}`,
          );
        }
      }
    }

    ok++;
    console.log(`✓ ${p.id} ${p.name}`);
  }

  console.log(`\nListo: ${ok}/${SEED_PRODUCTS.length} productos migrados.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
