import type { Route } from "./+types/api.validate-code";
import { supabaseAdmin } from "~/lib/supabase.server";
import { applyPromo, isPromoEligible, PROMO_CHECKOUT_GRACE_MS } from "~/lib/promo";
import {
  previewPromoterDiscount,
  resolveDiscount,
  type DiscountLine,
} from "~/lib/discount-resolution.server";

// Vista previa del descuento de un código para /checkout (tarea 150): dice si
// el código sirve y cuánto descuenta, con la MISMA regla que el cobro
// (`resolveDiscount`). No cobra ni marca nada como usado; el cobro real vuelve
// a validar todo en `validateCheckout`.
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: { code?: unknown; email?: unknown; items?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Cuerpo de la solicitud inválido" }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const items = Array.isArray(body.items) ? body.items : [];
  // Sin correo = vista previa del carrito (solo códigos de promotora, sin la
  // regla de "una vez por correo", que se revisa en /checkout y al cobrar).
  if (
    !code ||
    code.length > 40 ||
    email.length > 200 ||
    items.length === 0 ||
    items.length > 50
  ) {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const requested: Array<{ productId: string; qty: number }> = [];
  for (const raw of items) {
    const it = raw as { productId?: unknown; qty?: unknown };
    if (
      typeof it.productId !== "string" ||
      typeof it.qty !== "number" ||
      !Number.isInteger(it.qty) ||
      it.qty < 1 ||
      it.qty > 50
    ) {
      return Response.json({ error: "Datos inválidos" }, { status: 400 });
    }
    requested.push({ productId: it.productId, qty: it.qty });
  }

  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("id, price, compare_at")
    .in("id", Array.from(new Set(requested.map((r) => r.productId))));
  if (error) {
    console.error("[validate-code] error consultando products:", error);
    return Response.json({ error: "No se pudo validar el código" }, { status: 500 });
  }
  const byId = new Map((products ?? []).map((p) => [p.id, p]));

  const lines: DiscountLine[] = [];
  for (const r of requested) {
    const p = byId.get(r.productId);
    if (!p || p.price == null) continue;
    lines.push({
      price: applyPromo(p.price, p.compare_at, Date.now(), PROMO_CHECKOUT_GRACE_MS).price,
      qty: r.qty,
      codeEligible: isPromoEligible(p.compare_at),
    });
  }
  if (lines.length === 0) {
    return Response.json({ valid: false, error: "No se pudo validar el código." });
  }

  const resolution = email
    ? await resolveDiscount({ code, email, lines })
    : await previewPromoterDiscount({ code, lines });
  if (!resolution.ok) return Response.json({ valid: false, error: resolution.error });
  return Response.json({
    valid: true,
    percent: resolution.percent,
    discount: resolution.discountTotal,
  });
}
