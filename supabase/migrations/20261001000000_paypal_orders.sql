-- Soporte para pagos con PayPal además de Stripe (tarea 131).

-- `stripe_session_id` dejó de ser universal: un pedido pagado con PayPal no
-- tiene uno. `payment_provider` distingue cuál de los dos lo generó.
alter table public.orders
  alter column stripe_session_id drop not null;

alter table public.orders
  add column payment_provider text not null default 'stripe'
    check (payment_provider in ('stripe', 'paypal')),
  add column paypal_order_id text;

create unique index orders_paypal_order_id_key
  on public.orders (paypal_order_id)
  where paypal_order_id is not null;

-- Snapshot del carrito ya validado server-side (precios, stock, envío,
-- descuento) mientras el comprador aprueba el pago en PayPal. Stripe no
-- necesita esto porque la propia Checkout Session guarda esos datos en su
-- metadata; PayPal no tiene un objeto equivalente con espacio suficiente, así
-- que se referencia esta fila desde `purchase_units[0].custom_id`.
create table public.pending_checkouts (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.pending_checkouts enable row level security;
-- Sin policies públicas: solo el cliente service_role (server-side) lee/escribe,
-- igual que `orders` (ver REQUISITOS.md, tarea 007).
