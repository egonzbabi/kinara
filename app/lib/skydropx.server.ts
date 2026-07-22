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
  providerName: string;
  providerDisplayName: string;
  serviceName: string;
  serviceCode: string;
  total: number;
  currency: string;
  days: number | null;
};

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
