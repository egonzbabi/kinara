import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Faltan VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en las variables de entorno (.env). " +
      "Este cliente es solo para código server-side (auth admin, escrituras de catálogo).",
  );
}

export const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
