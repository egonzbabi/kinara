-- Historial de entradas/salidas manuales de inventario (admin). Cada movimiento
-- ajusta product_variants.stock y deja constancia de cuándo, qué y por qué.
create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  color_name text not null,
  size text not null check (size in ('S', 'M', 'L', 'XL')),
  type text not null check (type in ('entrada', 'salida')),
  quantity integer not null check (quantity > 0),
  concept text not null,
  movement_date date not null default current_date,
  resulting_stock integer not null check (resulting_stock >= 0),
  created_at timestamptz not null default now()
);

create index inventory_movements_created_at_idx on public.inventory_movements (created_at desc);
create index inventory_movements_product_id_idx on public.inventory_movements (product_id);

alter table public.inventory_movements enable row level security;
-- Sin policies públicas: es un registro interno de admin, mismo patrón que
-- contact_messages/orders — solo el cliente service_role (server-side) lee/escribe.

-- RPC atómico: ajusta el stock de la variante y deja el registro del movimiento
-- en una sola transacción (mismo patrón que decrement_variant_stock del checkout,
-- ver tarea 017/orders) — evita que dos movimientos concurrentes sobre la misma
-- variante se pisen, y nunca deja stock negativo.
create or replace function public.register_inventory_movement(
  p_product_id text,
  p_color_name text,
  p_size text,
  p_type text,
  p_quantity integer,
  p_concept text,
  p_movement_date date
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
    (product_id, color_name, size, type, quantity, concept, movement_date, resulting_stock)
  values
    (p_product_id, p_color_name, p_size, p_type, p_quantity, p_concept, p_movement_date, v_new_stock)
  returning * into v_movement;

  return v_movement;
end;
$$;

revoke all on function public.register_inventory_movement(text, text, text, text, integer, text, date)
  from public, anon, authenticated;
