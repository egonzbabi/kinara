import { supabaseAdmin } from "./supabase.server";
import { DISCOUNT_CODE_PREFIX, DISCOUNT_EXPIRY_DAYS } from "./discount-constants";

// Sin O/0/I/1 — se leen fácil y no se confunden al copiar el código a mano.
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type DiscountSignup = {
  id: string;
  email: string;
  code: string;
  usedAt: string | null;
  createdAt: string;
};

function mapRow(row: {
  id: string;
  email: string;
  code: string;
  used_at: string | null;
  created_at: string;
}): DiscountSignup {
  return {
    id: row.id,
    email: row.email,
    code: row.code,
    usedAt: row.used_at,
    createdAt: row.created_at,
  };
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23505";
}

function generateCode(): string {
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return `${DISCOUNT_CODE_PREFIX}${suffix}`;
}

/** Crea el código de bienvenida para un correo, o devuelve el que ya tenía —
 * un correo nunca recibe más de un código (así "primera compra" tiene sentido). */
export async function getOrCreateDiscountSignup(
  email: string,
): Promise<{ signup: DiscountSignup; isNew: boolean }> {
  const normalizedEmail = email.trim().toLowerCase();

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("discount_signups")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle();
  if (existingError) throw new Error(`No se pudo verificar el registro: ${existingError.message}`);
  if (existing) return { signup: mapRow(existing), isNew: false };

  // El choque más probable es por el código (al azar) — el índice único lo
  // garantiza en vez de confiar solo en la baja probabilidad de colisión.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const { data, error } = await supabaseAdmin
      .from("discount_signups")
      .insert({ email: normalizedEmail, code })
      .select()
      .single();
    if (!error) return { signup: mapRow(data), isNew: true };
    if (!isUniqueViolation(error)) {
      throw new Error(`No se pudo crear el código: ${error.message}`);
    }
    // Si chocó por el correo (alguien se registró en paralelo), usar ese registro.
    const { data: raceWinner } = await supabaseAdmin
      .from("discount_signups")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (raceWinner) return { signup: mapRow(raceWinner), isNew: false };
  }
  throw new Error("No se pudo generar un código único, intenta de nuevo.");
}

export type DiscountValidationResult =
  | { valid: true; signup: DiscountSignup }
  | { valid: false; error: string };

/**
 * Valida un código al pagar: existe, coincide el correo del pedido (para que no
 * se pueda compartir/revender), no se usó, no venció, y no hay ya un pedido
 * pagado con ese correo (así se cumple "primera compra"). El mínimo de $799 se
 * revisa aparte, contra el subtotal de productos que ya calculó el servidor —
 * no aquí, para no mezclar esta validación con el cálculo del carrito.
 */
export async function validateDiscountCode(
  code: string,
  email: string,
): Promise<DiscountValidationResult> {
  const normalizedCode = code.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();

  const { data: signup, error } = await supabaseAdmin
    .from("discount_signups")
    .select("*")
    .eq("code", normalizedCode)
    .maybeSingle();
  if (error) return { valid: false, error: "No se pudo validar el código." };
  if (!signup) return { valid: false, error: "Ese código no existe." };
  if (signup.email !== normalizedEmail) {
    return {
      valid: false,
      error: "Este código solo se puede usar con el correo con el que te registraste.",
    };
  }
  if (signup.used_at) {
    return { valid: false, error: "Este código ya fue utilizado." };
  }
  const ageMs = Date.now() - new Date(signup.created_at).getTime();
  if (ageMs > DISCOUNT_EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
    return { valid: false, error: "Este código ya venció." };
  }

  const { data: priorOrder } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("customer_email", normalizedEmail)
    .limit(1)
    .maybeSingle();
  if (priorOrder) {
    return { valid: false, error: "Este código es solo para tu primera compra." };
  }

  return { valid: true, signup: mapRow(signup) };
}

export async function markDiscountCodeUsed(code: string): Promise<void> {
  const normalizedCode = code.trim().toUpperCase();
  const { error } = await supabaseAdmin
    .from("discount_signups")
    .update({ used_at: new Date().toISOString() })
    .eq("code", normalizedCode);
  if (error) {
    console.error(`[discount-signups] no se pudo marcar como usado el código ${normalizedCode}:`, error);
  }
}

/** Lista completa para el admin (`/admin/registros`) — sirve como lista de
 * correos para campañas, además de mostrar si ya usaron su código. */
export async function listDiscountSignups(): Promise<DiscountSignup[]> {
  const { data, error } = await supabaseAdmin
    .from("discount_signups")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar los registros: ${error.message}`);
  return (data ?? []).map(mapRow);
}
