import type { Route } from "./+types/api.cart-prices";
import { supabaseAdmin } from "~/lib/supabase.server";
import { applyPromo } from "~/lib/promo";

// Precios vigentes de los productos del carrito (tarea 148). El carrito vive en
// el navegador con el precio de cuando se agregó; si empezó o terminó una
// promoción desde entonces, /checkout lo actualiza con esto antes de que la
// clienta vea un total distinto al que se le va a cobrar.
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let ids: unknown;
  try {
    ids = (await request.json()).productIds;
  } catch {
    return Response.json({ error: "Cuerpo de la solicitud inválido" }, { status: 400 });
  }
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 50 || ids.some((i) => typeof i !== "string")) {
    return Response.json({ error: "Productos inválidos" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id, price, compare_at")
    .in("id", ids as string[])
    .eq("is_draft", false);
  if (error) {
    console.error("[cart-prices] error consultando products:", error);
    return Response.json({ error: "No se pudieron consultar los precios" }, { status: 500 });
  }

  const prices: Record<string, number> = {};
  for (const p of data ?? []) {
    if (p.price != null) prices[p.id] = applyPromo(p.price, p.compare_at).price;
  }
  return Response.json({ prices });
}
