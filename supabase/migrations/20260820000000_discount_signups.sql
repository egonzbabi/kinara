-- Registro de correos que se apuntaron a "10% en tu primera compra" (tarea 070).
-- Cada correo tiene un único código, de un solo uso, ligado a ese correo.
create table public.discount_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  code text not null unique,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index discount_signups_code_idx on public.discount_signups (code);

alter table public.discount_signups enable row level security;
-- Sin policies públicas: solo el cliente service_role (server-side) lee/escribe
-- — mismo patrón que contact_messages/orders/inventory_movements.

-- Deja constancia en el pedido de qué código de bienvenida se usó, si aplica.
alter table public.orders add column discount_code text;
