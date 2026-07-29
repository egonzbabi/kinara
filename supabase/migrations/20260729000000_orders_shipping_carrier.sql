-- Persiste la paquetería/servicio de Skydropx elegido y los días estimados de
-- entrega al momento de la cotización (tarea 027) — ya se calculaban en
-- api.create-checkout-session.tsx pero se perdían al crear el pedido.
alter table public.orders
  add column shipping_carrier text,
  add column shipping_days integer;
