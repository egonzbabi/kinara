-- Permite cargar productos sin precio todavía (ej. tarea 018: catálogo parte 2,
-- cargado desde Excel sin precios) sin que aparezcan en la tienda hasta que se
-- les defina un precio real y se publiquen.
alter table public.products alter column price drop not null;
alter table public.products add column if not exists is_draft boolean not null default false;

-- Nunca puede quedar publicado (is_draft = false) un producto sin precio.
alter table public.products
  add constraint products_price_required_unless_draft check (is_draft or price is not null);
