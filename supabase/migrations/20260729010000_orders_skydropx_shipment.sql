-- Soporte para comprar la guía real de Skydropx desde /admin/pedidos (tarea 028).
-- shipping_provider_name/shipping_service_code son los códigos crudos (no el string
-- legible shipping_carrier) necesarios para volver a cotizar y emparejar la tarifa
-- exacta al momento de comprar la guía, ya en el patrón de tarea 017.
alter table public.orders
  add column shipping_provider_name text,
  add column shipping_service_code text,
  add column skydropx_shipment_id text,
  add column tracking_number text,
  add column tracking_url text,
  add column label_url text;
