/** Reglas del descuento de bienvenida (10% en tu primera compra) — compartidas
 * entre el copy del cliente (checkout, banner) y la validación del servidor. */
export const DISCOUNT_PERCENT = 10;
export const DISCOUNT_MIN_SUBTOTAL_MXN = 799;
export const DISCOUNT_EXPIRY_DAYS = 30;
export const DISCOUNT_CODE_PREFIX = "KINARA10-";

/** Códigos por promotora (tarea 150): empiezan el día que termina el Buen Fin
 * (México central, UTC-6 todo el año) y no tienen fecha de término — se apagan
 * con `promoter_codes.active = false`.
 *
 * El porcentaje es variable: se elige al crear cada código y vive en
 * `promoter_codes.percent`. El código lleva ese número, igual que el de
 * bienvenida (KINARA10-): KINARA<porcentaje>-<IDENTIFICADOR>, ej. KINARA20-ANA. */
export const PROMOTER_CODES_START = "2026-11-18T00:00:00-06:00";
export const PROMOTER_CODES_START_LABEL = "18 de noviembre";
export const DEFAULT_PROMOTER_PERCENT = 20;
export const MIN_PROMOTER_PERCENT = 1;
export const MAX_PROMOTER_PERCENT = 90;
/** Parte inicial de un código de promotora (KINARA20-, KINARA5-…); el resto es el identificador. */
export const PROMOTER_CODE_HEAD = /^KINARA\d{1,2}-/;
