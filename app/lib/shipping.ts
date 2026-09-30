// Fallback si Skydropx no devuelve ninguna tarifa (caída del servicio, dirección
// no cotizable, etc.) — sin esto el checkout se bloquearía por completo.
// El pedido guarda el total cobrado, así que cambiar esta constante solo afecta pedidos nuevos.
export const SHIPPING_FEE_MXN = 150;

// Red de seguridad: descarta cualquier tarifa de Skydropx por debajo de este
// mínimo. Ninguna paquetería real cobra menos que esto — una tarifa así de baja
// es un dato mal configurado del lado del proveedor (ver caso PuntoPost $1.19),
// no una tarifa real que debamos ofrecerle al cliente.
export const MIN_SHIPPING_RATE_MXN = 50;

// Estimado automático de peso por prenda (decisión del usuario: no agregar un
// campo de peso real a `products`). Caja estándar única para toda prenda.
export const ESTIMATED_ITEM_WEIGHT_KG = 0.3;
export const PACKAGING_WEIGHT_KG = 0.2;
export const PARCEL_DIMENSIONS_CM = { height: 10, width: 25, length: 35 };

export function estimateParcel(totalQty: number) {
  const weight = Math.max(0.5, totalQty * ESTIMATED_ITEM_WEIGHT_KG + PACKAGING_WEIGHT_KG);
  return { weight: Math.round(weight * 100) / 100, ...PARCEL_DIMENSIONS_CM };
}
