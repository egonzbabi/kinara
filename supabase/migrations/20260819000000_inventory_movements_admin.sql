-- Registra quién hizo cada movimiento de inventario (tarea 066). admin_name es un
-- snapshot del nombre al momento del movimiento (sobrevive si el admin se borra o
-- se renombra después); admin_id es la referencia real, nula si el admin se borró.
alter table public.inventory_movements
  add column admin_id uuid references public.admins(id) on delete set null,
  add column admin_name text not null default 'Admin';

alter table public.inventory_movements alter column admin_name drop default;

-- register_inventory_movement ahora recibe también quién hizo el movimiento — es un
-- cambio de firma (2 parámetros nuevos), así que Postgres lo trataría como una
-- sobrecarga distinta en vez de un reemplazo; se quita la versión vieja primero.
drop function if exists public.register_inventory_movement(text, text, text, text, integer, text, date);

create or replace function public.register_inventory_movement(
  p_product_id text,
  p_color_name text,
  p_size text,
  p_type text,
  p_quantity integer,
  p_concept text,
  p_movement_date date,
  p_admin_id uuid,
  p_admin_name text
)
returns public.inventory_movements
language plpgsql
security definer
set search_path = public
as $$
declare
  v_variant_id uuid;
  v_current_stock integer;
  v_new_stock integer;
  v_movement public.inventory_movements;
begin
  if p_type not in ('entrada', 'salida') then
    raise exception 'Tipo de movimiento inválido: %', p_type;
  end if;
  if p_quantity <= 0 then
    raise exception 'La cantidad debe ser mayor a 0';
  end if;

  select id, stock into v_variant_id, v_current_stock
    from public.product_variants
   where product_id = p_product_id and color_name = p_color_name and size = p_size
   for update;

  if not found then
    raise exception 'No existe esa combinación de color y talla para este producto';
  end if;

  v_new_stock := v_current_stock + (case when p_type = 'entrada' then p_quantity else -p_quantity end);

  if v_new_stock < 0 then
    raise exception 'Stock insuficiente: disponible %, se intentó sacar %', v_current_stock, p_quantity;
  end if;

  update public.product_variants set stock = v_new_stock where id = v_variant_id;

  insert into public.inventory_movements
    (product_id, color_name, size, type, quantity, concept, movement_date, resulting_stock, admin_id, admin_name)
  values
    (p_product_id, p_color_name, p_size, p_type, p_quantity, p_concept, p_movement_date, v_new_stock, p_admin_id, p_admin_name)
  returning * into v_movement;

  return v_movement;
end;
$$;

revoke all on function public.register_inventory_movement(
  text, text, text, text, integer, text, date, uuid, text
) from public, anon, authenticated;
