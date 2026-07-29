import "dotenv/config";

const BASE_URL = process.env.SKYDROPX_BASE_URL;
const CLIENT_ID = process.env.SKYDROPX_CLIENT_ID;
const CLIENT_SECRET = process.env.SKYDROPX_CLIENT_SECRET;

export type ShippingAddress = {
  name: string;
  phone: string;
  email: string;
  street1: string;
  postalCode: string;
  areaLevel1: string;
  areaLevel2: string;
  areaLevel3: string;
};

export type Parcel = {
  weight: number;
  height: number;
  width: number;
  length: number;
};

export type ShippingRate = {
  id: string;
  providerName: string;
  providerDisplayName: string;
  serviceName: string;
  serviceCode: string;
  total: number;
  currency: string;
  days: number | null;
};

export type ShipmentResult = {
  shipmentId: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  labelUrl: string | null;
};

// Códigos de Carta Porte (SAT) usados por defecto al comprar una guía: "4G" es
// el código genérico de empaque (caja) del catálogo c_TipoDeEmbalaje, "01010101"
// es el código genérico "producto no encontrado en el catálogo" de c_ClaveProdServ
// — ambos descubiertos probando contra el sandbox de Skydropx (no documentados
// públicamente). Si el catálogo de productos de la tienda alguna vez necesita
// declarar un giro específico (ropa) para Carta Porte, ajustar aquí.
export const SAT_PACKAGE_TYPE_DEFAULT = "4G";
export const SAT_CONSIGNMENT_NOTE_DEFAULT = "01010101";

let cachedToken: { value: string; expiresAt: number } | null = null;

function requireConfig() {
  if (!BASE_URL || !CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      "Faltan SKYDROPX_BASE_URL / SKYDROPX_CLIENT_ID / SKYDROPX_CLIENT_SECRET en las variables de entorno (.env).",
    );
  }
  return { baseUrl: BASE_URL, clientId: CLIENT_ID, clientSecret: CLIENT_SECRET };
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const { baseUrl, clientId, clientSecret } = requireConfig();
  const res = await fetch(`${baseUrl}/api/v1/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    throw new Error(`Skydropx OAuth falló: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.value;
}

function toSkydropxAddress(address: ShippingAddress) {
  return {
    country_code: "MX",
    postal_code: address.postalCode,
    area_level1: address.areaLevel1,
    area_level2: address.areaLevel2,
    area_level3: address.areaLevel3,
    name: address.name,
    street1: address.street1,
    phone: address.phone,
    email: address.email,
  };
}

function originAddress(): ShippingAddress {
  const required = [
    "SKYDROPX_ORIGIN_NAME",
    "SKYDROPX_ORIGIN_PHONE",
    "SKYDROPX_ORIGIN_EMAIL",
    "SKYDROPX_ORIGIN_STREET1",
    "SKYDROPX_ORIGIN_POSTAL_CODE",
    "SKYDROPX_ORIGIN_AREA_LEVEL1",
    "SKYDROPX_ORIGIN_AREA_LEVEL2",
    "SKYDROPX_ORIGIN_AREA_LEVEL3",
  ] as const;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Faltan variables de origen de Skydropx en .env: ${missing.join(", ")}`);
  }

  return {
    name: process.env.SKYDROPX_ORIGIN_NAME!,
    phone: process.env.SKYDROPX_ORIGIN_PHONE!,
    email: process.env.SKYDROPX_ORIGIN_EMAIL!,
    street1: process.env.SKYDROPX_ORIGIN_STREET1!,
    postalCode: process.env.SKYDROPX_ORIGIN_POSTAL_CODE!,
    areaLevel1: process.env.SKYDROPX_ORIGIN_AREA_LEVEL1!,
    areaLevel2: process.env.SKYDROPX_ORIGIN_AREA_LEVEL2!,
    areaLevel3: process.env.SKYDROPX_ORIGIN_AREA_LEVEL3!,
  };
}

async function createQuotation(addressTo: ShippingAddress, parcels: Parcel[]): Promise<string> {
  const { baseUrl } = requireConfig();
  const token = await getAccessToken();

  const res = await fetch(`${baseUrl}/api/v1/quotations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      quotation: {
        address_from: toSkydropxAddress(originAddress()),
        address_to: toSkydropxAddress(addressTo),
        parcels,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Skydropx quotation falló: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { id: string };
  return data.id;
}

type SkydropxRateResponse = {
  success: boolean;
  id: string;
  provider_name: string;
  provider_display_name: string;
  provider_service_name: string;
  provider_service_code: string;
  total: string | number;
  currency_code: string;
  days: number | null;
};

async function pollQuotation(id: string): Promise<ShippingRate[]> {
  const { baseUrl } = requireConfig();
  const token = await getAccessToken();

  for (let attempt = 0; attempt < 30; attempt++) {
    const res = await fetch(`${baseUrl}/api/v1/quotations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Skydropx poll falló: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as {
      is_completed: boolean;
      rates: SkydropxRateResponse[];
    };

    if (data.is_completed) {
      return data.rates
        .filter((r) => r.success)
        .map((r) => ({
          id: r.id,
          providerName: r.provider_name,
          providerDisplayName: r.provider_display_name,
          serviceName: r.provider_service_name,
          serviceCode: r.provider_service_code,
          total: Number(r.total),
          currency: r.currency_code,
          days: r.days,
        }))
        .sort((a, b) => a.total - b.total);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Skydropx quotation ${id} no terminó de cotizar a tiempo`);
}

/**
 * Cotiza envío real con Skydropx. Devuelve [] (nunca lanza) si la API falla,
 * hace timeout, o no hay ninguna tarifa `success: true` — el llamador decide
 * el fallback (ver `app/lib/shipping.ts`).
 */
export async function getShippingRates(
  addressTo: ShippingAddress,
  parcels: Parcel[],
): Promise<ShippingRate[]> {
  try {
    const quotationId = await createQuotation(addressTo, parcels);
    return await pollQuotation(quotationId);
  } catch (err) {
    console.error("[skydropx] no se pudo cotizar el envío:", err);
    return [];
  }
}

function toShipmentAddress(address: ShippingAddress, reference: string) {
  return { ...toSkydropxAddress(address), reference };
}

async function createShipment(params: {
  quotationId: string;
  rateId: string;
  addressTo: ShippingAddress;
  parcels: Parcel[];
}): Promise<string> {
  const { baseUrl } = requireConfig();
  const token = await getAccessToken();

  const res = await fetch(`${baseUrl}/api/v1/shipments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      shipment: {
        quotation_id: params.quotationId,
        rate_id: params.rateId,
        address_from: toShipmentAddress(originAddress(), "Bodega"),
        address_to: toShipmentAddress(params.addressTo, "Domicilio del comprador"),
        consignment_note: SAT_CONSIGNMENT_NOTE_DEFAULT,
        package_type: SAT_PACKAGE_TYPE_DEFAULT,
        parcels: params.parcels,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Skydropx shipment creation falló: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { data: { id: string } };
  return data.data.id;
}

type SkydropxPackageResource = {
  type: string;
  attributes: {
    tracking_status: string;
    tracking_number: string | null;
    tracking_url_provider: string | null;
    label_url: string | null;
  };
};

async function pollShipment(shipmentId: string): Promise<ShipmentResult> {
  const { baseUrl } = requireConfig();
  const token = await getAccessToken();

  for (let attempt = 0; attempt < 30; attempt++) {
    const res = await fetch(`${baseUrl}/api/v1/shipments/${shipmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error(`Skydropx shipment poll falló: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as {
      data: { attributes: { workflow_status: string; error_detail: string | null } };
      included: SkydropxPackageResource[];
    };
    const status = data.data.attributes.workflow_status;

    if (status === "success") {
      const pkg = data.included.find((r) => r.type === "package");
      return {
        shipmentId,
        trackingNumber: pkg?.attributes.tracking_number ?? null,
        trackingUrl: pkg?.attributes.tracking_url_provider ?? null,
        labelUrl: pkg?.attributes.label_url ?? null,
      };
    }
    if (status !== "in_progress" && status !== "pending") {
      throw new Error(
        `Skydropx no pudo generar la guía (estado: ${status}): ${data.data.attributes.error_detail ?? "sin detalle"}`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  throw new Error(`Skydropx shipment ${shipmentId} no terminó de procesarse a tiempo`);
}

/**
 * Compra una guía real con Skydropx (tiene costo, descuenta del saldo de la
 * cuenta) — nunca se llama automáticamente al pagar; solo cuando el admin lo
 * pide explícitamente desde `/admin/pedidos`. El `quotationId` de la compra
 * original ya expiró para cuando esto se llama, así que se vuelve a cotizar
 * fresco y se empareja por `providerName`+`serviceCode`, igual que
 * `api.create-checkout-session.tsx` hace para validar el precio al pagar.
 */
export async function purchaseShipment(params: {
  addressTo: ShippingAddress;
  parcels: Parcel[];
  providerName: string;
  serviceCode: string;
}): Promise<ShipmentResult> {
  const quotationId = await createQuotation(params.addressTo, params.parcels);
  const rates = await pollQuotation(quotationId);
  const rate = rates.find(
    (r) => r.providerName === params.providerName && r.serviceCode === params.serviceCode,
  );
  if (!rate) {
    throw new Error(
      "Esa tarifa de envío ya no está disponible en Skydropx. Vuelve a intentar — se recotizará con las tarifas vigentes.",
    );
  }

  const shipmentId = await createShipment({
    quotationId,
    rateId: rate.id,
    addressTo: params.addressTo,
    parcels: params.parcels,
  });

  return await pollShipment(shipmentId);
}
