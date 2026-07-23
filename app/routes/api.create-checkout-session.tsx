import type { Route } from "./+types/api.create-checkout-session";
import { getStripe } from "~/lib/stripe.server";
import { supabaseAdmin } from "~/lib/supabase.server";
import { chunkMetadata } from "~/lib/orders.server";
import { estimateParcel, SHIPPING_FEE_MXN } from "~/lib/shipping";
import { getShippingRates, type ShippingAddress } from "~/lib/skydropx.server";
import type { CartItem } from "~/context/CartContext";

interface ChosenShipping {
  providerName: string;
  serviceCode: string;
  total: number;
}

interface CheckoutRequest {
  items: CartItem[];
  address: ShippingAddress;
  shipping: ChosenShipping;
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: CheckoutRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Cuerpo de la solicitud inválido" }, { status: 400 });
  }

  const items = body.items;
  const address = body.address;
  const shipping = body.shipping;
  if (!items || items.length === 0) {
    return Response.json({ error: "El carrito está vacío" }, { status: 400 });
  }
  if (!address || !shipping || !shipping.providerName || !shipping.serviceCode) {
    return Response.json({ error: "Faltan datos de envío" }, { status: 400 });
  }

  for (const item of items) {
    if (
      !item.productId ||
      !item.color ||
      !item.size ||
      !Number.isInteger(item.qty) ||
      item.qty < 1 ||
      item.qty > 50
    ) {
      return Response.json({ error: "Cantidad o datos de línea inválidos" }, { status: 400 });
    }
  }

  // ── Precio y stock confiables: el carrito vive en el navegador, así que
  // nunca se confía en item.price — se recalcula todo contra Supabase.
  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const { data: products, error: productsError } = await supabaseAdmin
    .from("products")
    .select("id, name, price")
    .in("id", productIds);
  if (productsError) {
    console.error("[checkout] error consultando products:", productsError);
    return Response.json({ error: "No se pudo validar el carrito" }, { status: 500 });
  }
  const productById = new Map((products ?? []).map((p) => [p.id, p]));

  const { data: variants, error: variantsError } = await supabaseAdmin
    .from("product_variants")
    .select("product_id, color_name, size, stock")
    .in("product_id", productIds);
  if (variantsError) {
    console.error("[checkout] error consultando product_variants:", variantsError);
    return Response.json({ error: "No se pudo validar el carrito" }, { status: 500 });
  }

  const variantByKey = new Map(
    (variants ?? []).map((v) => [`${v.product_id}|${v.color_name}|${v.size}`, v]),
  );

  // Suma cantidades repetidas del mismo producto+color+talla antes de comparar contra stock.
  const requestedByKey = new Map<string, number>();
  for (const item of items) {
    const key = `${item.productId}|${item.color}|${item.size}`;
    requestedByKey.set(key, (requestedByKey.get(key) ?? 0) + item.qty);
  }

  const missing: string[] = [];
  const outOfStock: string[] = [];
  const trustedItems: {
    productId: string;
    productName: string;
    colorName: string;
    size: string;
    quantity: number;
    price: number;
  }[] = [];
  let subtotal = 0;

  for (const item of items) {
    const key = `${item.productId}|${item.color}|${item.size}`;
    const product = productById.get(item.productId);
    const variant = variantByKey.get(key);
    const label = `${item.name} — ${item.color} (${item.size})`;

    if (!product || product.price == null || !variant) {
      missing.push(label);
      continue;
    }
    const requestedTotal = requestedByKey.get(key) ?? item.qty;
    if (variant.stock < requestedTotal) {
      outOfStock.push(`${label}: quedan ${variant.stock}, se pidieron ${requestedTotal}`);
      continue;
    }

    trustedItems.push({
      productId: item.productId,
      productName: product.name,
      colorName: item.color,
      size: item.size,
      quantity: item.qty,
      price: product.price,
    });
    subtotal += product.price * item.qty;
  }

  if (missing.length > 0) {
    return Response.json(
      { error: `Estos artículos ya no están disponibles: ${missing.join("; ")}. Quítalos del carrito.` },
      { status: 400 },
    );
  }
  if (outOfStock.length > 0) {
    return Response.json({ error: `Sin stock suficiente — ${outOfStock.join("; ")}` }, { status: 400 });
  }

  // ── Envío confiable: igual que el precio de producto, nunca se confía en el
  // total de envío que manda el cliente — se vuelve a cotizar server-side y se
  // empareja la tarifa elegida por provider_name + service_code (el id de
  // cotización de Skydropx es efímero y cambia en cada llamada).
  let shippingFee: number;
  let shippingCarrier: string;
  if (shipping.providerName === "fallback") {
    shippingFee = SHIPPING_FEE_MXN;
    shippingCarrier = "Envío estándar";
  } else {
    const totalQty = items.reduce((n, i) => n + i.qty, 0);
    const freshRates = await getShippingRates(address, [estimateParcel(totalQty)]);
    const match = freshRates.find(
      (r) => r.providerName === shipping.providerName && r.serviceCode === shipping.serviceCode,
    );
    if (!match) {
      return Response.json(
        { error: "Esa tarifa de envío ya no está disponible. Vuelve a cotizar e intenta de nuevo." },
        { status: 400 },
      );
    }
    shippingFee = match.total;
    shippingCarrier = `${match.providerDisplayName} · ${match.serviceName}`;
  }

  const itemsJson = JSON.stringify(trustedItems);
  const addressJson = JSON.stringify(address);
  const metadata: Record<string, string> = {
    ...chunkMetadata("items_json", itemsJson),
    ...chunkMetadata("shipping_address_json", addressJson),
    subtotal: String(subtotal),
    shipping_fee: String(shippingFee),
    shipping_carrier: shippingCarrier,
  };

  const line_items: Array<{
    price_data: {
      currency: string;
      product_data: { name: string };
      unit_amount: number;
    };
    quantity: number;
  }> = trustedItems.map((i) => ({
    price_data: {
      currency: "mxn",
      product_data: { name: `${i.productName} · ${i.colorName} · Talla ${i.size}` },
      unit_amount: Math.round(i.price * 100),
    },
    quantity: i.quantity,
  }));
  line_items.push({
    price_data: {
      currency: "mxn",
      product_data: { name: `Envío · ${shippingCarrier}` },
      unit_amount: Math.round(shippingFee * 100),
    },
    quantity: 1,
  });

  const origin = new URL(request.url).origin;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      payment_method_types: ["card", "oxxo"],
      customer_email: address.email,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancelado`,
      metadata,
      payment_intent_data: { metadata },
    });
    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] error creando la Checkout Session:", err);
    const message = err instanceof Error ? err.message : "No se pudo iniciar el pago";
    return Response.json({ error: message }, { status: 500 });
  }
}
