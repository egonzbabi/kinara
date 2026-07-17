-- Soporte de imagen por color: cada foto de producto puede asociarse a un color
-- específico (para que el swatch cambie la imagen mostrada). NULL = imagen genérica
-- del producto (comportamiento anterior, se mantiene como fallback).

alter table public.product_images
  add column if not exists color_name text;

alter table public.product_images
  drop constraint if exists product_images_product_id_position_key;

alter table public.product_images
  add constraint product_images_product_id_color_position_key
  unique (product_id, color_name, position);
