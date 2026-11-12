-- Historial de estatus de rastreo que devuelve Skydropx (tarea 147).
-- Sirve para ver la secuencia real de estatus de un envío (guía creada,
-- recolectado, en tránsito, entregado...) y decidir cuándo avisar a la clienta.
-- Solo se agrega una fila cuando el estatus cambia respecto al último guardado.
create table public.shipment_status_log (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders (id) on delete cascade,
  skydropx_shipment_id text not null,
  tracking_status text not null,
  seen_at timestamptz not null default now()
);

create index shipment_status_log_order_seen_idx
  on public.shipment_status_log (order_id, seen_at);

alter table public.shipment_status_log enable row level security;
-- Sin policies públicas: solo el cliente service_role (server-side) lee/escribe,
-- igual que `orders` (ver REQUISITOS.md, tarea 007).
