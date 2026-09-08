-- Número de referencia corto y secuencial por movimiento ("folio"), para
-- poder aclarar algo puntual de un movimiento (ej. por teléfono o en el
-- concepto de otro) sin tener que usar el id (uuid) — mucho más cómodo de
-- decir/escribir en voz alta que un uuid.
alter table public.inventory_movements add column folio bigint;

-- Backfill: numera los movimientos ya existentes en el orden en que
-- ocurrieron (created_at), no el orden físico de la tabla.
with numbered as (
  select id, row_number() over (order by created_at) as rn
  from public.inventory_movements
)
update public.inventory_movements m
set folio = numbered.rn
from numbered
where numbered.id = m.id;

alter table public.inventory_movements alter column folio set not null;
alter table public.inventory_movements add constraint inventory_movements_folio_key unique (folio);

-- Secuencia para que cada movimiento nuevo tome el folio siguiente
-- automáticamente, arrancando después del máximo ya usado.
create sequence if not exists public.inventory_movements_folio_seq;
select setval(
  'public.inventory_movements_folio_seq',
  coalesce((select max(folio) from public.inventory_movements), 0)
);
alter table public.inventory_movements
  alter column folio set default nextval('public.inventory_movements_folio_seq');
alter sequence public.inventory_movements_folio_seq owned by public.inventory_movements.folio;
