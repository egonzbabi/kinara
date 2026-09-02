-- Permite "Única" como talla (además de S/M/L/XL) — para productos que no
-- manejan tallas reales (accesorios: bolsas, gorras, cinturones, etc.),
-- ver tarea 081. Se actualiza en las 3 tablas que restringen `size`.
alter table public.product_variants
  drop constraint if exists product_variants_size_check,
  add constraint product_variants_size_check check (size in ('S', 'M', 'L', 'XL', 'Única'));

alter table public.inventory_movements
  drop constraint if exists inventory_movements_size_check,
  add constraint inventory_movements_size_check check (size in ('S', 'M', 'L', 'XL', 'Única'));

alter table public.inventory_counts
  drop constraint if exists inventory_counts_size_check,
  add constraint inventory_counts_size_check check (size in ('S', 'M', 'L', 'XL', 'Única'));
