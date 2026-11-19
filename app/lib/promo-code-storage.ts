// Código de descuento que llega por el enlace/QR de una promotora (tarea 150),
// ej. https://www.kinarafit.com.mx/tienda?codigo=KINARA20-ANA
//
// Se guarda en este navegador para que la clienta pueda seguir comprando y el
// código ya esté en /checkout. Es un dato funcional (no de medición), así que
// no depende del consentimiento de cookies. Todo va en try/catch: el
// almacenamiento puede estar bloqueado (navegación privada).

const KEY = "kinara-promo-code";
// Solo letras, números y guion: lo que usan los códigos reales.
const VALID = /^[A-Za-z0-9-]{3,40}$/;

export function saveCodeFromSearch(search: string): void {
  try {
    const code = new URLSearchParams(search).get("codigo")?.trim();
    if (code && VALID.test(code)) localStorage.setItem(KEY, code.toUpperCase());
  } catch {
    /* sin almacenamiento: la clienta lo escribe a mano en /checkout */
  }
}

export function readSavedCode(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function clearSavedCode(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nada que limpiar */
  }
}
