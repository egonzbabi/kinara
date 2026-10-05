import "dotenv/config";

const BASE_URL = process.env.PAYPAL_BASE_URL;
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

function requireConfig() {
  if (!BASE_URL || !CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      "Faltan PAYPAL_BASE_URL / PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET en las variables de entorno (.env).",
    );
  }
  return { baseUrl: BASE_URL, clientId: CLIENT_ID, clientSecret: CLIENT_SECRET };
}

/** Convierte centavos (enteros, mismo formato que usa Stripe en este proyecto) a un string de 2 decimales como lo exige la API de PayPal, ej. 89900 -> "899.00". */
export function centsToAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const { baseUrl, clientId, clientSecret } = requireConfig();
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`PayPal OAuth falló: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.value;
}

async function paypalFetch(path: string, init: RequestInit & { body?: string } = {}) {
  const { baseUrl } = requireConfig();
  const token = await getAccessToken();
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`PayPal API falló (${path}): ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export interface PaypalOrderItem {
  name: string;
  unitAmountCents: number;
  quantity: number;
}

export interface CreatePaypalOrderParams {
  pendingCheckoutId: string;
  items: PaypalOrderItem[];
  shippingFeeCents: number;
  totalCents: number;
}

/**
 * Crea una orden de PayPal (intent CAPTURE). `custom_id` guarda el id de la
 * fila en `pending_checkouts` — es como recuperamos, al capturar, el carrito
 * ya validado server-side (precio/stock/envío/descuento), igual que la
 * metadata de una Stripe Checkout Session (ver checkout-validation.server.ts).
 */
export async function createPaypalOrder(params: CreatePaypalOrderParams): Promise<string> {
  const itemTotalCents = params.items.reduce((n, i) => n + i.unitAmountCents * i.quantity, 0);

  const data = (await paypalFetch("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: params.pendingCheckoutId,
          amount: {
            currency_code: "MXN",
            value: centsToAmount(params.totalCents),
            breakdown: {
              item_total: { currency_code: "MXN", value: centsToAmount(itemTotalCents) },
              shipping: { currency_code: "MXN", value: centsToAmount(params.shippingFeeCents) },
            },
          },
          items: params.items.map((i) => ({
            name: i.name.slice(0, 127),
            unit_amount: { currency_code: "MXN", value: centsToAmount(i.unitAmountCents) },
            quantity: String(i.quantity),
          })),
        },
      ],
      application_context: {
        brand_name: "KINARA",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    }),
  })) as { id: string };

  return data.id;
}

export interface PaypalCaptureResult {
  status: string;
  captureId: string | null;
  customId: string | null;
}

interface RawPaypalOrder {
  status: string;
  purchase_units?: { custom_id?: string; payments?: { captures?: { id: string }[] } }[];
}

function extractCaptureResult(data: RawPaypalOrder): PaypalCaptureResult {
  const unit = data.purchase_units?.[0];
  return {
    status: data.status,
    captureId: unit?.payments?.captures?.[0]?.id ?? null,
    customId: unit?.custom_id ?? null,
  };
}

/** Captura el pago de una orden ya aprobada por el comprador en PayPal. */
export async function capturePaypalOrder(orderId: string): Promise<PaypalCaptureResult> {
  const data = (await paypalFetch(`/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    body: "{}",
  })) as RawPaypalOrder;
  return extractCaptureResult(data);
}

/** Consulta el estado de una orden sin capturarla. */
export async function getPaypalOrder(orderId: string): Promise<PaypalCaptureResult> {
  const data = (await paypalFetch(`/v2/checkout/orders/${orderId}`)) as RawPaypalOrder;
  return extractCaptureResult(data);
}

/**
 * Captura el pago si todavía no se había capturado, o recupera el resultado
 * de una captura ya hecha sin volver a intentarlo — PayPal rechaza una
 * segunda captura sobre la misma orden (`ORDER_ALREADY_CAPTURED`), y
 * `/checkout/success` puede recargarse (igual que con Stripe).
 */
export async function getOrCapturePaypalOrder(orderId: string): Promise<PaypalCaptureResult> {
  const existing = await getPaypalOrder(orderId);
  if (existing.status === "COMPLETED") return existing;
  return capturePaypalOrder(orderId);
}

/**
 * Verifica que un webhook realmente venga de PayPal (equivalente a
 * `stripe.webhooks.constructEvent`, pero PayPal no firma el body con un
 * secreto compartido — hay que pedirle a su propia API que valide la firma
 * de transmisión contra el Webhook ID registrado en el Dashboard).
 */
export async function verifyPaypalWebhookSignature(
  headers: {
    authAlgo: string | null;
    certUrl: string | null;
    transmissionId: string | null;
    transmissionSig: string | null;
    transmissionTime: string | null;
  },
  rawBody: string,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.error("[paypal] falta PAYPAL_WEBHOOK_ID en .env");
    return false;
  }
  if (
    !headers.authAlgo ||
    !headers.certUrl ||
    !headers.transmissionId ||
    !headers.transmissionSig ||
    !headers.transmissionTime
  ) {
    return false;
  }

  const data = (await paypalFetch("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: JSON.stringify({
      auth_algo: headers.authAlgo,
      cert_url: headers.certUrl,
      transmission_id: headers.transmissionId,
      transmission_sig: headers.transmissionSig,
      transmission_time: headers.transmissionTime,
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  })) as { verification_status: string };

  return data.verification_status === "SUCCESS";
}
