import { useEffect, useRef } from "react";
import type { CartItem } from "~/context/CartContext";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: Record<string, unknown>) => {
        render: (el: HTMLElement) => void;
        close?: () => void;
      };
    };
  }
}

type Address = {
  name: string;
  email: string;
  phone: string;
  street1: string;
  postalCode: string;
  areaLevel1: string;
  areaLevel2: string;
  areaLevel3: string;
};

type ChosenShipping = {
  providerName: string;
  serviceCode: string;
  total: number;
};

// El SDK de PayPal se carga una sola vez (diferido, nunca en el load inicial
// de /checkout — ver regla de performance de scripts de terceros en
// CLAUDE.md) y se reutiliza si el componente se vuelve a montar.
let sdkPromise: Promise<void> | null = null;
function loadPaypalSdk(clientId: string): Promise<void> {
  if (window.paypal) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=MXN&intent=capture`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar el SDK de PayPal"));
    document.body.appendChild(script);
  });
  return sdkPromise;
}

/**
 * Botón "Pagar con PayPal" (tarea 131) — alternativa al Checkout de Stripe
 * existente (tarjeta/OXXO), sin tocar ese flujo. `createOrder` manda el mismo
 * carrito/dirección/envío/descuento que Stripe a `/api/create-paypal-order`,
 * que revalida todo server-side exactamente igual
 * (ver checkout-validation.server.ts). La captura real del pago sucede en el
 * loader de `/checkout/success`, no aquí — `onApprove` solo redirige.
 */
export function PayPalButton({
  items,
  address,
  shipping,
  discountCode,
  onError,
}: {
  items: CartItem[];
  address: Address;
  shipping: ChosenShipping;
  discountCode: string;
  onError: (message: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ items, address, shipping, discountCode });
  stateRef.current = { items, address, shipping, discountCode };

  useEffect(() => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;
    if (!clientId) {
      onError("PayPal no está configurado todavía.");
      return;
    }
    let cancelled = false;
    let buttons: ReturnType<NonNullable<Window["paypal"]>["Buttons"]> | null = null;

    loadPaypalSdk(clientId)
      .then(() => {
        if (cancelled || !containerRef.current || !window.paypal) return;
        buttons = window.paypal.Buttons({
          style: { layout: "horizontal", color: "gold", label: "paypal", height: 48 },
          createOrder: async () => {
            const current = stateRef.current;
            const res = await fetch("/api/create-paypal-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: current.items,
                address: current.address,
                shipping: current.shipping,
                discountCode: current.discountCode.trim() || undefined,
              }),
            });
            const data = await res.json();
            if (!data.id) throw new Error(data.error || "No se pudo iniciar el pago con PayPal");
            return data.id as string;
          },
          onApprove: async (data: { orderID: string }) => {
            window.location.href = `/checkout/success?paypal_order_id=${data.orderID}`;
          },
          onError: (err: unknown) => {
            console.error("[paypal-button]", err);
            onError("No se pudo completar el pago con PayPal. Intenta de nuevo.");
          },
        });
        buttons.render(containerRef.current);
      })
      .catch((err) => {
        console.error("[paypal-button] no se pudo cargar el SDK:", err);
        onError("No se pudo cargar PayPal. Intenta de nuevo.");
      });

    return () => {
      cancelled = true;
      buttons?.close?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} />;
}
