-- Permite renombrar products.id y que se propague automáticamente a las tablas hijas
-- (antes solo había on delete cascade). Necesario para regenerar el id de productos
-- existentes hacia un código interno generado por el programa (ver tarea 016).
alter table public.product_variants
  drop constraint if exists product_variants_product_id_fkey,
  add constraint product_variants_product_id_fkey
    foreign key (product_id) references public.products(id)
    on update cascade on delete cascade;

alter table public.product_images
  drop constraint if exists product_images_product_id_fkey,
  add constraint product_images_product_id_fkey
    foreign key (product_id) references public.products(id)
    on update cascade on delete cascade;

-- Código de "modelo" por variante (color×talla), ej. "2522-MARINO-M" — el código de
-- negocio/logística que antes vivía en products.id. Editable desde el admin; no es
-- único a nivel de base de datos (una variante nueva puede empezar sin asignar).
alter table public.product_variants
  add column if not exists modelo text;
