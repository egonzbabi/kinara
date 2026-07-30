/**
 * Importa el catálogo de códigos postales de México a `postal_codes` (tarea 029).
 * Fuente: https://raw.githubusercontent.com/IcaliaLabs/sepomex/master/lib/sepomex_db.csv
 * (dataset público derivado del catálogo oficial de Correos de México/SEPOMEX,
 * ~154k asentamientos). Columnas confirmadas por orden:
 * d_codigo|d_asenta|d_tipo_asenta|d_mnpio|d_estado|... (el resto no se usa).
 *
 * Corre una sola vez (o para refrescar el catálogo si SEPOMEX publica cambios).
 * Uso: npx tsx scripts/import-postal-codes.ts <ruta-al-csv>
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import type { Database } from "../app/lib/supabase.types";

const [, , csvPath] = process.argv;
if (!csvPath) {
  console.error("Uso: npx tsx scripts/import-postal-codes.ts <ruta-al-csv>");
  process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.error("Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.");
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

type Row = {
  postal_code: string;
  colonia: string;
  tipo_asentamiento: string | null;
  municipio: string;
  estado: string;
};

function parseCsv(path: string): Row[] {
  const content = readFileSync(path, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  const rows: Row[] = [];
  for (const line of lines) {
    const cols = line.split("|");
    const [postalCode, colonia, tipoAsenta, municipio, estado] = cols;
    if (!postalCode || !colonia || !municipio || !estado) continue;
    rows.push({
      postal_code: postalCode.trim(),
      colonia: colonia.trim(),
      tipo_asentamiento: tipoAsenta?.trim() || null,
      municipio: municipio.trim(),
      estado: estado.trim(),
    });
  }
  return rows;
}

async function main() {
  const rows = parseCsv(csvPath);
  console.log(`Parseadas ${rows.length} filas del CSV.`);

  const { count: existing } = await supabase
    .from("postal_codes")
    .select("*", { count: "exact", head: true });
  if (existing && existing > 0) {
    console.error(
      `La tabla postal_codes ya tiene ${existing} filas — bórralas primero si quieres reimportar (evita duplicados).`,
    );
    process.exit(1);
  }

  const BATCH_SIZE = 1000;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("postal_codes").insert(batch);
    if (error) {
      console.error(`✗ Error en el batch ${i}-${i + batch.length}:`, error.message);
      process.exit(1);
    }
    inserted += batch.length;
    process.stdout.write(`\r${inserted}/${rows.length} filas insertadas...`);
  }
  console.log(`\n✓ Importación completa: ${inserted} filas.`);
}

main();
