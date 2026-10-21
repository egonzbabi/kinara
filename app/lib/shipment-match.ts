/**
 * Emparejamiento pedido ↔ guía de Skydropx (tarea 147). Regla ESTRICTA a
 * propósito: un error aquí significa mandarle a una clienta el rastreo de otra.
 * Solo hay coincidencia automática cuando, para exactamente UNA guía, coinciden
 * el nombre, el código postal y el teléfono o el correo. Cualquier otro caso
 * (ninguna, varias, datos incompletos) NO se envía solo.
 */
export type MatchOrder = {
  customerName: string;
  email: string | null;
  phone: string | null;
  postalCode: string | null;
  createdAt: string;
};

export type MatchShipment = {
  id: string;
  createdAt: string;
  recipient: {
    name: string | null;
    phone: string | null;
    email: string | null;
    postalCode: string | null;
  } | null;
  trackingNumber: string | null;
};

export type MatchResult<S extends MatchShipment> =
  | { kind: "match"; shipment: S }
  | { kind: "none" }
  | { kind: "ambiguous"; count: number };

export function normalizeName(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");
}

/** Últimos 10 dígitos (ignora +52, 044, espacios y guiones). Vacío si hay menos de 10. */
export function normalizePhone(value: string | null | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : "";
}

export function normalizePostalCode(value: string | null | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length === 5 ? digits : "";
}

export function normalizeEmail(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function matchShipmentToOrder<S extends MatchShipment>(
  order: MatchOrder,
  shipments: S[],
  /** Guías ya asignadas a otro pedido (id de envío y número de rastreo). */
  used: { shipmentIds: Set<string>; trackingNumbers: Set<string> },
): MatchResult<S> {
  const name = normalizeName(order.customerName);
  const cp = normalizePostalCode(order.postalCode);
  const phone = normalizePhone(order.phone);
  const email = normalizeEmail(order.email);
  // Sin nombre, código postal y al menos teléfono o correo no se arriesga nada.
  if (!name || !cp || (!phone && !email)) return { kind: "none" };

  const orderTime = new Date(order.createdAt).getTime();
  const candidates = shipments.filter((s) => {
    const r = s.recipient;
    if (!r || !s.trackingNumber) return false;
    if (used.shipmentIds.has(s.id) || used.trackingNumbers.has(s.trackingNumber)) return false;
    // Una guía no puede ser anterior al pedido (margen de 5 min por desfases de reloj).
    if (new Date(s.createdAt).getTime() < orderTime - 5 * 60_000) return false;
    if (normalizeName(r.name) !== name) return false;
    if (normalizePostalCode(r.postalCode) !== cp) return false;
    const phoneOk = phone !== "" && normalizePhone(r.phone) === phone;
    const emailOk = email !== "" && normalizeEmail(r.email) === email;
    return phoneOk || emailOk;
  });

  if (candidates.length === 1) return { kind: "match", shipment: candidates[0] };
  if (candidates.length === 0) return { kind: "none" };
  return { kind: "ambiguous", count: candidates.length };
}
