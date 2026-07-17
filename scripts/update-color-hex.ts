/**
 * Tarea 012: ajustar product_variants.color_hex para que el círculo del swatch
 * refleje el color real fotografiado en product_images, en vez del hex genérico
 * aproximado usado originalmente para nombrar el color.
 *
 * Uso: npm run update:color-hex
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

type Row = { product_id: string; color_name: string; sampled_hex: string };

const raw = JSON.parse(
  readFileSync(
    "/private/tmp/claude-501/-Users-elizabethgonzalez/382d6742-2e96-464b-bb09-65d6b612b563/scratchpad/hex-recalc/FINAL.json",
    "utf-8",
  ),
) as Row[];

// CONJUNTO NUBE / Botanica Verde excluida: la foto muestra un azul marino, no verde —
// posible mezcla con la foto de "Marino" del mismo producto. Requiere revisión aparte
// antes de tocar su hex (ver notas de la tarea 012).
const rows = raw.filter((r) => !(r.product_id === "2510" && r.color_name === "Botanica Verde"));

async function main() {
  console.log(`Actualizando ${rows.length} colores...`);
  let ok = 0;
  for (const r of rows) {
    const { error } = await supabase
      .from("product_variants")
      .update({ color_hex: r.sampled_hex })
      .eq("product_id", r.product_id)
      .eq("color_name", r.color_name);
    if (error) {
      throw new Error(`Update falló (${r.product_id} ${r.color_name}): ${error.message}`);
    }
    ok++;
    console.log(`✓ ${r.product_id} — ${r.color_name} → ${r.sampled_hex}`);
  }
  console.log(`\nListo: ${ok}/${rows.length} colores actualizados.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
