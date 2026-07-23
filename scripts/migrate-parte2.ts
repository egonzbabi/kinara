/**
 * Migración de la "parte 2" del catálogo (ver tasks/018-catalogo-parte-2.md).
 * Crea los productos nuevos como borrador (sin precio, is_draft=true — no aparecen
 * en la tienda hasta que se les defina un precio real y se publiquen desde /admin),
 * y completa YUCA BRA (que ya existía a medias) con sus colores/stock reales.
 *
 * Uso: npx tsx scripts/migrate-parte2.ts
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../app/lib/supabase.types";
import { generateShortId, modeloColorCode } from "../app/lib/slug";
import { SEED_PRODUCTS_PARTE2 } from "./seed-data-parte2";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.");
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

async function generateUniqueId(): Promise<string> {
  for (let attempts = 0; attempts < 5; attempts++) {
    const id = generateShortId();
    const { data } = await supabase.from("products").select("id").eq("id", id).maybeSingle();
    if (!data) return id;
  }
  throw new Error("No se pudo generar un id único para el producto");
}

async function main() {
  console.log(`Migrando ${SEED_PRODUCTS_PARTE2.length} productos de la parte 2...`);
  let created = 0;
  let completed = 0;

  for (const p of SEED_PRODUCTS_PARTE2) {
    const productId = p.existingProductId ?? (await generateUniqueId());

    if (!p.existingProductId) {
      const { error: productError } = await supabase.from("products").upsert({
        id: productId,
        slug: p.slug,
        name: p.name,
        category: p.category,
        kind: p.kind,
        price: null,
        compare_at: null,
        description: p.description,
        materials: p.materials,
        badge: null,
        is_new: false,
        is_bestseller: false,
        is_draft: true,
      });
      if (productError) throw new Error(`Insert products falló para ${p.name}: ${productError.message}`);
      created++;
      console.log(`✓ (nuevo, borrador) ${productId} ${p.name}`);
    } else {
      console.log(`✓ (completando) ${productId} ${p.name}`);
      completed++;
    }

    for (const color of p.colors) {
      for (const size of ["S", "M", "L", "XL"] as const) {
        const stock = color.stock[size];
        const { error: variantError } = await supabase.from("product_variants").upsert(
          {
            product_id: productId,
            color_name: color.name,
            color_hex: color.hex,
            size,
            stock,
            modelo: `${p.modelo}-${modeloColorCode(color.name)}-${size}`,
          },
          { onConflict: "product_id,color_name,size" },
        );
        if (variantError) {
          throw new Error(
            `Insert product_variants falló para ${p.name} ${color.name} ${size}: ${variantError.message}`,
          );
        }
      }
    }
  }

  console.log(`\nListo: ${created} productos nuevos (borrador), ${completed} completados.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
