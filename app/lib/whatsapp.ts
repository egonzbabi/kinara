/**
 * WhatsApp del negocio (tarea 145). Un solo número (WhatsApp Business de la
 * oficina) atendido por dos personas con dispositivos vinculados, así que el
 * enlace siempre apunta al mismo número. Formato internacional sin "+": 52 +
 * 10 dígitos.
 */
export const WHATSAPP_NUMBER = "525512735325";

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const GENERAL_MESSAGE = "Hola, tengo una consulta sobre Kinara.";

/** Mensaje inicial desde una prenda: menciona el nombre y el color si ya lo eligió. */
export function productMessage(productName: string, color?: string | null): string {
  const prenda = color ? `${productName} en color ${color}` : productName;
  return `Hola, tengo una consulta sobre ${prenda}.`;
}
