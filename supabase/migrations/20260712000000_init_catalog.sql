-- Catálogo de productos Kinara: productos, variantes (color+talla+stock) e imágenes.
-- Lectura pública (anon/authenticated), escritura solo vía service_role (RLS por defecto la bloquea).

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  category text not null check (category in ('mujer', 'hombre', 'accesorios')),
  kind text not null,
  price numeric(10, 2) not null,
  compare_at numeric(10, 2),
  description text,
  materials text,
  badge text,
  is_new boolean not null default false,
  is_bestseller boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  color_name text not null,
  color_hex text,
  size text not null check (size in ('S', 'M', 'L', 'XL')),
  stock integer not null default 0 check (stock >= 0),
  unique (product_id, color_name, size)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  url text not null,
  position integer not null default 0,
  unique (product_id, position)
);

create index if not exists product_variants_product_id_idx on public.product_variants (product_id);
create index if not exists product_images_product_id_idx on public.product_images (product_id);

alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;

-- Lectura pública del catálogo (sin policy de insert/update/delete: anon nunca puede escribir).
create policy "Public read products" on public.products
  for select using (true);

create policy "Public read product_variants" on public.product_variants
  for select using (true);

create policy "Public read product_images" on public.product_images
  for select using (true);

-- Bucket de Storage para las fotos de producto (lectura pública, escritura solo service_role).
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read product-images bucket" on storage.objects
  for select using (bucket_id = 'product-images');
