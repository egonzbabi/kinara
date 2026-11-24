-- "Próximamente" administrable desde el admin (tarea 152). Antes vivía como
-- lista fija en app/data/comingSoon.ts; aquí cada prenda es una fila con su
-- foto y su orden. Tabla aparte de `products` a propósito: una prenda sin
-- precio, colores ni stock no debe poder colarse en el catálogo, el feed de
-- Merchant Center, el sitemap, el inventario ni el carrito.
create table public.coming_soon_items (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  -- Foto subida desde el admin (URL pública de Supabase Storage).
  image_url text,
  -- Foto estática anterior (public/proximamente/{base}-480.webp y -800.webp),
  -- solo para las prendas que ya estaban antes de esta tabla.
  image_base text,
  -- Orden en el carrusel: menor primero.
  position integer not null default 0,
  -- Para ocultar una prenda sin borrarla.
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (image_url is not null or image_base is not null)
);

alter table public.coming_soon_items enable row level security;

-- Lectura pública solo de las visibles; escribir solo con service_role
-- (server-side), mismo patrón que products.
create policy "Public read active coming_soon_items" on public.coming_soon_items
  for select using (active);

-- Las 7 prendas que ya se mostraban, en el mismo orden.
insert into public.coming_soon_items (name, image_base, position) values
  ('Flexi Listón T-Shirt', 'flexi-liston-tshirt', 1),
  ('Enterizo Sculpt One',  'enterizo-sculpt-one', 2),
  ('Enterizo Sprint One',  'enterizo-sprint-one', 3),
  ('Eclipse Legging',      'aura-legging',        4),
  ('Aura Skirt Set',       'aura-skirt-set',      5),
  ('Pulse Jacket',         'pulse-jacket',        6),
  ('Aura Flow Pants',      'aura-flow-pants',     7);
