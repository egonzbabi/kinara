import type { Route } from "./+types/api.shipping-quote";
import { getShippingRates, type ShippingAddress } from "~/lib/skydropx.server";
import { estimateParcel, SHIPPING_FEE_MXN } from "~/lib/shipping";
import type { CartItem } from "~/context/CartContext";

interface ShippingQuoteRequest {
  items: Pick<CartItem, "qty">[];
  address: ShippingAddress;
}

const REQUIRED_ADDRESS_FIELDS: (keyof ShippingAddress)[] = [
  "name",
  "phone",
  "email",
  "street1",
  "postalCode",
  "areaLevel1",
  "areaLevel2",
  "areaLevel3",
];

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: ShippingQuoteRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Cuerpo de la solicitud inválido" }, { status: 400 });
  }

  const { items, address } = body;
  if (!items || items.length === 0) {
    return Response.json({ error: "El carrito está vacío" }, { status: 400 });
  }
  if (!address || REQUIRED_ADDRESS_FIELDS.some((field) => !address[field])) {
    return Response.json({ error: "Faltan datos de la dirección de envío" }, { status: 400 });
  }

  const totalQty = items.reduce((n, i) => n + i.qty, 0);
  const parcels = [estimateParcel(totalQty)];

  const rates = await getShippingRates(address, parcels);

  if (rates.length === 0) {
    return Response.json({
      rates: [
        {
          providerName: "fallback",
          providerDisplayName: "Envío estándar",
          serviceName: "Estándar",
          serviceCode: "fallback",
          total: SHIPPING_FEE_MXN,
          currency: "mxn",
          days: null,
        },
      ],
    });
  }

  return Response.json({ rates });
}
