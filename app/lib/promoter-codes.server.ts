import { supabaseAdmin } from "./supabase.server";
import QRCode from "qrcode";
import {
  MAX_PROMOTER_PERCENT,
  MIN_PROMOTER_PERCENT,
  PROMOTER_CODE_HEAD,
  PROMOTER_CODES_START,
  PROMOTER_CODES_START_LABEL,
} from "./discount-constants";
import { SITE_URL } from "./seo";

export type PromoterCode = {
  code: string;
  promoterName: string;
  percent: number;
  active: boolean;
};

/** Busca un código de promotora (sin importar mayúsculas). `null` si no existe:
 * en ese caso el código puede ser uno de bienvenida, que se valida aparte. */
export async function findPromoterCode(code: string): Promise<PromoterCode | null> {
  const { data, error } = await supabaseAdmin
    .from("promoter_codes")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();
  if (error) {
    // No se tumba el pago por esto: si la consulta falla, el código se trata
    // como uno de bienvenida (que se valida aparte) y queda el aviso en logs.
    console.error("[promoter-codes] no se pudo consultar promoter_codes:", error);
    return null;
  }
  if (!data) return null;
  return {
    code: data.code,
    promoterName: data.promoter_name,
    percent: data.percent,
    active: data.active,
  };
}

export type PromoterValidationResult = { valid: true } | { valid: false; error: string };

/**
 * Reglas del código de promotora: está activo, ya empezó, y cada correo lo usa
 * una sola vez — contando cualquier código de promotora, no solo este (así una
 * persona no junta el 20% de varias promotoras). El mínimo de compra no aplica.
 */
export async function validatePromoterCode(
  promoter: PromoterCode,
  /** `null` = todavía no se conoce el correo (vista previa en el carrito): se
   * omite solo "una vez por correo"; en /checkout y al cobrar siempre se revisa. */
  email: string | null,
  now: number = Date.now(),
): Promise<PromoterValidationResult> {
  if (!promoter.active) {
    return { valid: false, error: "Este código ya no está disponible." };
  }
  if (now < Date.parse(PROMOTER_CODES_START)) {
    return {
      valid: false,
      error: `Este código empieza el ${PROMOTER_CODES_START_LABEL}. Vuelve ese día y te sigue sirviendo.`,
    };
  }

  if (email === null) return { valid: true };

  const normalizedEmail = email.trim().toLowerCase();
  const { data: allCodes, error: codesError } = await supabaseAdmin
    .from("promoter_codes")
    .select("code");
  if (codesError) return { valid: false, error: "No se pudo validar el código." };

  const codes = (allCodes ?? []).map((c) => c.code);
  const { data: prior, error: priorError } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("customer_email", normalizedEmail)
    .in("discount_code", codes)
    .limit(1)
    .maybeSingle();
  if (priorError) return { valid: false, error: "No se pudo validar el código." };
  if (prior) {
    return { valid: false, error: "Este correo ya usó un código de descuento de promotora." };
  }

  return { valid: true };
}

// ── Admin (/admin/promotoras): alta de códigos, nombre editable, encendido/
// apagado, ventas por código y el enlace/QR que se entrega a cada promotora.

export type AdminPromoter = {
  code: string;
  identifier: string;
  name: string;
  percent: number;
  active: boolean;
  createdAt: string;
  orders: number;
  salesTotal: number;
  link: string;
  qrSvg: string;
};

/** El enlace que se reparte: lleva el código (se guarda y llega escrito a
 * /checkout) y marcas UTM para ver en GA4 cuánto tráfico trae cada promotora. */
/** Lo que va después de KINARA<porcentaje>- (ej. KINARA20-ANA → ANA). */
export function promoterIdentifier(code: string): string {
  return code.replace(PROMOTER_CODE_HEAD, "");
}

export function promoterLink(code: string): string {
  const identifier = promoterIdentifier(code).toLowerCase();
  const params = new URLSearchParams({
    codigo: code,
    utm_source: "promotora",
    utm_medium: "qr",
    utm_campaign: "promotoras",
    utm_content: identifier,
  });
  return `${SITE_URL}/tienda?${params.toString()}`;
}

/** PNG grande del QR (para descargar y mandar por WhatsApp). */
export async function promoterQrPng(code: string): Promise<Buffer> {
  return QRCode.toBuffer(promoterLink(code), {
    type: "png",
    width: 1024,
    margin: 3,
    errorCorrectionLevel: "M",
  });
}

export async function listPromotersForAdmin(): Promise<AdminPromoter[]> {
  const { data: rows, error } = await supabaseAdmin
    .from("promoter_codes")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`No se pudieron cargar las promotoras: ${error.message}`);
  const promoters = rows ?? [];

  // Ventas por código: pedidos no cancelados que usaron ese código.
  const salesByCode = new Map<string, { orders: number; total: number }>();
  if (promoters.length > 0) {
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from("orders")
      .select("discount_code, total, status")
      .in(
        "discount_code",
        promoters.map((p) => p.code),
      );
    if (ordersError) throw new Error(`No se pudieron cargar las ventas: ${ordersError.message}`);
    for (const o of orders ?? []) {
      if (!o.discount_code || o.status === "cancelled") continue;
      const acc = salesByCode.get(o.discount_code) ?? { orders: 0, total: 0 };
      acc.orders += 1;
      acc.total += Number(o.total);
      salesByCode.set(o.discount_code, acc);
    }
  }

  return Promise.all(
    promoters.map(async (p) => {
      const link = promoterLink(p.code);
      const sales = salesByCode.get(p.code);
      return {
        code: p.code,
        identifier: promoterIdentifier(p.code),
        name: p.promoter_name,
        percent: p.percent,
        active: p.active,
        createdAt: p.created_at,
        orders: sales?.orders ?? 0,
        salesTotal: sales?.total ?? 0,
        link,
        qrSvg: await QRCode.toString(link, {
          type: "svg",
          margin: 1,
          errorCorrectionLevel: "M",
        }),
      };
    }),
  );
}

/** Deja solo letras A-Z y números (sin acentos ni espacios) en mayúsculas. */
export function normalizeIdentifier(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 20);
}

/** El porcentaje se elige al crear y queda escrito en el código
 * (KINARA<porcentaje>-<IDENTIFICADOR>). No se cambia después: para otro
 * porcentaje se crea otro código y se apaga el anterior. */
export async function createPromoter(
  rawIdentifier: string,
  name: string,
  rawPercent: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const identifier = normalizeIdentifier(rawIdentifier);
  if (!identifier) {
    return { ok: false, error: "Escribe un identificador con letras o números (ej. ANA o P01)." };
  }
  const percent = Number(rawPercent);
  if (!Number.isInteger(percent) || percent < MIN_PROMOTER_PERCENT || percent > MAX_PROMOTER_PERCENT) {
    return {
      ok: false,
      error: `El descuento debe ser un número entero entre ${MIN_PROMOTER_PERCENT} y ${MAX_PROMOTER_PERCENT}.`,
    };
  }
  const code = `KINARA${percent}-${identifier}`;
  const { error } = await supabaseAdmin.from("promoter_codes").insert({
    code,
    promoter_name: name.trim().slice(0, 80),
    percent,
  });
  if (error) {
    if ((error as { code?: string }).code === "23505") {
      return { ok: false, error: `Ya existe el código ${code}.` };
    }
    return { ok: false, error: `No se pudo crear el código: ${error.message}` };
  }
  return { ok: true };
}

export async function updatePromoter(
  code: string,
  fields: { name?: string; active?: boolean },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const update: { promoter_name?: string; active?: boolean } = {};
  if (fields.name !== undefined) update.promoter_name = fields.name.trim().slice(0, 80);
  if (fields.active !== undefined) update.active = fields.active;
  const { error } = await supabaseAdmin
    .from("promoter_codes")
    .update(update)
    .eq("code", code.trim().toUpperCase());
  if (error) return { ok: false, error: `No se pudo guardar: ${error.message}` };
  return { ok: true };
}
