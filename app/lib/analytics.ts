/**
 * Google Analytics 4 (tarea 004) — Consent Mode + eventos de e-commerce.
 *
 * El Measurement ID viene siempre de `VITE_GA_MEASUREMENT_ID` (nunca
 * hardcodeado, ver REQUISITOS.md) — si no está configurado, `trackEvent` no
 * hace nada (no revienta en local/preview sin la variable).
 *
 * Consent Mode: por defecto `analytics_storage` arranca "denied" (ver script
 * inline en `root.tsx`, que corre ANTES de cargar gtag.js) — ningún evento
 * se manda con datos completos hasta que el visitante acepta cookies en
 * `CookieConsentBanner`. La elección se guarda en localStorage
 * (`kinara-cookie-consent`) para no volver a preguntar.
 */

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as
  | string
  | undefined;

const CONSENT_STORAGE_KEY = "kinara-cookie-consent";
type ConsentValue = "granted" | "denied";

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

export function getStoredConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(CONSENT_STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    // Modo privado, cuota agotada, etc. — se trata como "todavía no eligió".
    return null;
  }
}

export function setStoredConsent(value: ConsentValue) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Igual se aplica el consentimiento a la sesión actual aunque no
    // pueda persistirse — solo se le va a volver a preguntar la próxima vez.
  }
  gtag("consent", "update", { analytics_storage: value });
}

function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!GA_MEASUREMENT_ID) return;
  gtag("event", name, params);
}

type GA4Item = {
  id: string;
  name: string;
  price: number;
  category?: string;
  quantity?: number;
};

function toGaItem(item: GA4Item) {
  return {
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    ...(item.category ? { item_category: item.category } : {}),
    ...(item.quantity !== undefined ? { quantity: item.quantity } : {}),
  };
}

export function trackViewItem(item: GA4Item) {
  trackEvent("view_item", {
    currency: "MXN",
    value: item.price,
    items: [toGaItem(item)],
  });
}

export function trackAddToCart(item: GA4Item & { quantity: number }) {
  trackEvent("add_to_cart", {
    currency: "MXN",
    value: item.price * item.quantity,
    items: [toGaItem(item)],
  });
}

export function trackBeginCheckout(items: GA4Item[], value: number) {
  trackEvent("begin_checkout", {
    currency: "MXN",
    value,
    items: items.map(toGaItem),
  });
}

export function trackPurchase(params: {
  transactionId: string;
  value: number;
  shipping?: number;
  items: GA4Item[];
}) {
  trackEvent("purchase", {
    transaction_id: params.transactionId,
    currency: "MXN",
    value: params.value,
    ...(params.shipping !== undefined ? { shipping: params.shipping } : {}),
    items: params.items.map(toGaItem),
  });
}
