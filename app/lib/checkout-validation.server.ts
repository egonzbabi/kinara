import { supabaseAdmin } from "~/lib/supabase.server";
import { estimateParcel, SHIPPING_FEE_MXN } from "~/lib/shipping";
import { getShippingRates, type ShippingAddress } from "~/lib/skydropx.server";
import { validateDiscountCode } from "~/lib/discount-signups.server";
import { DISCOUNT_MIN_SUBTOTAL_MXN } from "~/lib/discount-constants";
import { formatPrice } from "~/lib/formatPrice";
import type { CartItem } from "~/context/CartContext";

interface ChosenShipping {
  providerName: string;
  serviceCode: string;
  total: number;
}

export interface CheckoutRequest {
  items: CartItem[];
  address: ShippingAddress;
  shipping: ChosenShipping;
  discountCode?: string;
}

export interface TrustedItem {
  productId: string;
  productName: string;
  modelo: string | null;
  colorName: string;
  size: string;
  quantity: number;
  price: number;
}

export interface ValidatedCheckout {
  trustedItems: TrustedItem[];
  subtotal: number;
  shippingFee: number;
  shippingCarrier: string;
  shippingDays: number | null;
  shippingProviderName: string | null;
  shippingServiceCode: string | null;
  discountApplies: boolean;
  discountCode: string | null;
}

export type ValidationResult =
  | { ok: true; data: ValidatedCheckout }
  | { ok: false; status: number; error: string };

/**
 * Validación server-side del carrito/envío/descuento, compartida por los dos
 * proveedores de pago (Stripe y PayPal, tarea 131) — nunca se confía en lo que
 * manda el cliente sobre precio, stock o tarifa de envío, se recalcula todo
 * aquí contra Supabase y Skydropx antes de cobrar nada.
 */
export async function validateCheckout(body: CheckoutRequest): Promise<ValidationResult> {
  const items = body.items;
  const address = body.address;
  const shipping = body.shipping;
  if (!items || items.length === 0) {
    return { ok: false, status: 400, error: "El carrito está vacío" };
  }
  if (!address || !shipping || !shipping.providerName || !shipping.serviceCode) {
    return { ok: false, status: 400, error: "Faltan datos de envío" };
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
      return { ok: false, status: 400, error: "Cantidad o datos de línea inválidos" };
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
    return { ok: false, status: 500, error: "No se pudo validar el carrito" };
  }
  const productById = new Map((products ?? []).map((p) => [p.id, p]));

  const { data: variants, error: variantsError } = await supabaseAdmin
    .from("product_variants")
    .select("product_id, color_name, size, stock, modelo")
    .in("product_id", productIds);
  if (variantsError) {
    console.error("[checkout] error consultando product_variants:", variantsError);
    return { ok: false, status: 500, error: "No se pudo validar el carrito" };
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
  const trustedItems: TrustedItem[] = [];
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
      modelo: variant.modelo,
      colorName: item.color,
      size: item.size,
      quantity: item.qty,
      price: product.price,
    });
    subtotal += product.price * item.qty;
  }

  if (missing.length > 0) {
    return {
      ok: false,
      status: 400,
      error: `Estos artículos ya no están disponibles: ${missing.join("; ")}. Quítalos del carrito.`,
    };
  }
  if (outOfStock.length > 0) {
    return { ok: false, status: 400, error: `Sin stock suficiente — ${outOfStock.join("; ")}` };
  }

  // ── Envío confiable: igual que el precio de producto, nunca se confía en el
  // total de envío que manda el cliente — se vuelve a cotizar server-side y se
  // empareja la tarifa elegida por provider_name + service_code (el id de
  // cotización de Skydropx es efímero y cambia en cada llamada).
  let shippingFee: number;
  let shippingCarrier: string;
  let shippingDays: number | null;
  let shippingProviderName: string | null;
  let shippingServiceCode: string | null;
  if (shipping.providerName === "fallback") {
    shippingFee = SHIPPING_FEE_MXN;
    shippingCarrier = "Envío estándar";
    shippingDays = null;
    shippingProviderName = null;
    shippingServiceCode = null;
  } else {
    const totalQty = items.reduce((n, i) => n + i.qty, 0);
    const freshRates = await getShippingRates(address, [estimateParcel(totalQty)]);
    const match = freshRates.find(
      (r) => r.providerName === shipping.providerName && r.serviceCode === shipping.serviceCode,
    );
    if (!match) {
      return {
        ok: false,
        status: 400,
        error: "Esa tarifa de envío ya no está disponible. Vuelve a cotizar e intenta de nuevo.",
      };
    }
    shippingFee = match.total;
    shippingCarrier = `${match.providerDisplayName} · ${match.serviceName}`;
    shippingDays = match.days;
    shippingProviderName = match.providerName;
    shippingServiceCode = match.serviceCode;
  }

  // ── Código de descuento de bienvenida: se valida aquí (correo, primera
  // compra, código sin usar/vencido) contra el subtotal de PRODUCTOS que ya se
  // recalculó arriba — nunca contra lo que mande el cliente, ni contra el total
  // con envío incluido (ver tarea 070).
  let discountApplies = false;
  const discountCode = body.discountCode?.trim();
  if (discountCode) {
    if (subtotal < DISCOUNT_MIN_SUBTOTAL_MXN) {
      return {
        ok: false,
        status: 400,
        error: `Ese código requiere una compra mínima de ${formatPrice(DISCOUNT_MIN_SUBTOTAL_MXN)} en productos, sin contar el envío.`,
      };
    }
    const validation = await validateDiscountCode(discountCode, address.email);
    if (!validation.valid) {
      return { ok: false, status: 400, error: validation.error };
    }
    discountApplies = true;
  }

  return {
    ok: true,
    data: {
      trustedItems,
      subtotal,
      shippingFee,
      shippingCarrier,
      shippingDays,
      shippingProviderName,
      shippingServiceCode,
      discountApplies,
      discountCode: discountApplies && discountCode ? discountCode.toUpperCase() : null,
    },
  };
}
