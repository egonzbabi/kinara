-- Códigos de descuento por promotora (tarea 150): 20% con un código por
-- promotora, que se reparte como QR/enlace a sus alumnas y conocidas.
-- Un código por promotora permite saber cuántas ventas trajo cada una (el
-- pedido ya guarda `orders.discount_code`).
create table public.promoter_codes (
  code text primary key check (code = upper(code)),
  -- Puede quedar vacío al crear el código y llenarse después desde el admin.
  promoter_name text not null default '',
  percent integer not null default 20 check (percent between 1 and 90),
  -- Para apagar un código sin borrarlo (el historial de pedidos lo conserva).
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.promoter_codes enable row level security;
-- Sin policies públicas: solo el cliente service_role (server-side) lee/escribe
-- — mismo patrón que discount_signups/orders.
