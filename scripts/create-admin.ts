/**
 * Crea (o actualiza la contraseña de) una cuenta de admin para /admin.
 * Uso: npx tsx scripts/create-admin.ts <email> <password> [nombre]
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { hashPassword } from "../app/lib/auth.server";
import type { Database } from "../app/lib/supabase.types";

const [, , email, password, name] = process.argv;
if (!email || !password) {
  console.error("Uso: npx tsx scripts/create-admin.ts <email> <password> [nombre]");
  process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.error("Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.");
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

async function main() {
  const password_hash = hashPassword(password);
  const { error } = await supabase
    .from("admins")
    .upsert({ email, password_hash, name: name || email }, { onConflict: "email" });
  if (error) throw new Error(`No se pudo crear/actualizar el admin: ${error.message}`);
  console.log(`✓ Admin listo: ${email}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
