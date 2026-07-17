import { useEffect } from "react";
import { Link, redirect } from "react-router";
import type Stripe from "stripe";
import type { Route } from "./+types/checkout.success";
import { getStripe } from "~/lib/stripe.server";
import { ensureOrderFromCheckoutSession, type OrderItem } from "~/lib/orders.server";
import { supabaseAdmin } from "~/lib/supabase.server";
import { useCart } from "~/context/CartContext";
import { formatPrice } from "~/lib/formatPrice";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Pedido confirmado · KINARA" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) throw redirect("/tienda");

  let session: Stripe.Checkout.Session;
  try {
    const stripe = getStripe();
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error("[checkout.success] no se pudo recuperar la sesión:", err);
    throw redirect("/checkout/cancelado");
  }

  // El query param por sí solo nunca autoriza la pantalla de éxito — se verifica
  // el estado real de la sesión contra Stripe server-side.
  if (session.payment_status !== "paid") {
    return { status: "pending" as const, orderId: null, items: [] as OrderItem[], total: 0 };
  }

  const result = await ensureOrderFromCheckoutSession(session);
  if (!result) {
    return { status: "pending" as const, orderId: null, items: [] as OrderItem[], total: 0 };
  }

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, items, total")
    .eq("id", result.orderId)
    .maybeSingle();

  return {
    status: "paid" as const,
    orderId: result.orderId,
    items: (order?.items as OrderItem[] | null) ?? [],
    total: order?.total ?? 0,
  };
}

export default function CheckoutSuccess({ loaderData }: Route.ComponentProps) {
  const { clear } = useCart();

  useEffect(() => {
    if (loaderData.status === "paid") clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaderData.status]);

  if (loaderData.status === "pending") {
    return (
      <div className="pad flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <h1 className="font-display text-[clamp(30px,4vw,44px)]">Confirmando tu pago…</h1>
        <p className="max-w-[46ch] text-muted">
          Si pagaste en OXXO, tu pedido se confirma en cuanto se registre el pago (puede
          tardar unos minutos). Te avisaremos cuando esté listo.
        </p>
        <Link to="/tienda" className="btn btn-outline mt-2">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="pad flex flex-col items-center gap-6 py-20 text-center">
      <h1 className="font-display text-[clamp(34px,5vw,52px)]">¡Gracias por tu compra!</h1>
      <p className="text-muted">
        Pedido <span className="font-medium text-espresso">{loaderData.orderId}</span>
      </p>

      <div className="w-full max-w-md rounded-xl bg-bone p-6 text-left">
        <ul className="flex flex-col gap-3 divide-y divide-line">
          {loaderData.items.map((item, i) => (
            <li key={i} className={i > 0 ? "pt-3" : undefined}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium">{item.productName}</span>
                <span className="whitespace-nowrap text-sm">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
              <p className="text-[13px] text-muted">
                {item.colorName} · Talla {item.size} · x{item.quantity}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
          <span className="font-medium">Total</span>
          <span className="font-display text-xl">{formatPrice(loaderData.total)}</span>
        </div>
      </div>

      <Link to="/tienda" className="btn btn-clay mt-2">
        Seguir comprando
      </Link>
    </div>
  );
}
