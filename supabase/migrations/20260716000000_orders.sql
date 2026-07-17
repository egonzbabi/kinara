-- Tabla de pedidos (tarea 007, cobros con Stripe Checkout Sessions hospedado).
create table public.orders (
  id text primary key, -- "ORD-LX3F9A2B" (Date.now().toString(36).toUpperCase())
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  items jsonb not null default '[]', -- [{ productId, productName, colorName, size, quantity, price }]
  subtotal numeric not null,
  shipping_fee numeric not null,
  total numeric not null,
  currency text not null default 'mxn',
  status text not null default 'processing'
    check (status in ('processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address jsonb not null default '{}',
  stripe_session_id text not null,
  created_at timestamptz not null default now()
);

create unique index orders_stripe_session_id_key on public.orders (stripe_session_id);

alter table public.orders enable row level security;
-- Sin policies públicas: solo el cliente service_role (server-side) puede leer/escribir,
-- igual que `admins` (ver REQUISITOS.md, tarea 015).

-- RPC atómico de decremento de stock: evita perder decrementos si dos pedidos concurrentes
-- tocan la misma variante (single UPDATE en vez de leer-calcular-escribir desde la app).
create or replace function public.decrement_variant_stock(p_variant_id uuid, p_qty integer)
returns integer
language sql
security definer
set search_path = public
as $$
  update public.product_variants
     set stock = greatest(0, stock - p_qty)
   where id = p_variant_id
  returning stock;
$$;

revoke all on function public.decrement_variant_stock(uuid, integer) from public, anon, authenticated;
