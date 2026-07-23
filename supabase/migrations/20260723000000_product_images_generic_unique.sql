-- El constraint `unique (product_id, color_name, position)` no protege las fotos
-- genéricas (color_name = null), porque en SQL dos NULL nunca se consideran
-- iguales entre sí. Esto permitía que una carrera entre dos guardados del
-- formulario de admin (ej. doble clic en "Guardar", o guardar mientras una foto
-- todavía se estaba subiendo) dejara dos filas idénticas en la misma posición.
-- Un índice único parcial sí cubre el caso de NULL explícitamente.
create unique index if not exists product_images_generic_position_key
  on public.product_images (product_id, position)
  where color_name is null;
