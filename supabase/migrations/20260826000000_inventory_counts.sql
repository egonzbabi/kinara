-- Conteo físico de inventario (admin): guarda, por cada combinación de
-- producto+color+talla, el número que el admin contó a mano en papel junto al
-- stock del sistema al momento de guardarlo — para comparar ambas existencias
-- y ver las diferencias, sin tocar product_variants.stock (esto es un reporte
-- de conteo, no un ajuste; para corregir el stock real se usa
-- inventory_movements, ya existente, tarea 064).
create table public.inventory_counts (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  color_name text not null,
  size text not null check (size in ('S', 'M', 'L', 'XL')),
  system_stock integer not null,
  counted_stock integer not null check (counted_stock >= 0),
  counted_at date not null default current_date,
  updated_at timestamptz not null default now(),
  unique (product_id, color_name, size)
);

create index inventory_counts_product_id_idx on public.inventory_counts (product_id);

alter table public.inventory_counts enable row level security;
-- Sin policies públicas: registro interno de admin, mismo patrón que
-- inventory_movements/contact_messages — solo service_role (server-side) lee/escribe.
