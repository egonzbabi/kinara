-- Catálogo propio de códigos postales de México (SEPOMEX) para validar/
-- autocompletar Estado, Alcaldía/Municipio y Colonia en /checkout contra el CP
-- real (tarea 029) — antes eran 3 campos de texto libre sin relación entre sí.
-- Se importa una sola vez con scripts/import-postal-codes.ts desde el dataset
-- público https://github.com/IcaliaLabs/sepomex (derivado del catálogo oficial
-- de Correos de México). Confirmado sobre el dataset completo: cada CP tiene
-- exactamente un estado y un municipio (nunca más de uno), y varias colonias.
create table public.postal_codes (
  id bigint generated always as identity primary key,
  postal_code text not null,
  colonia text not null,
  tipo_asentamiento text,
  municipio text not null,
  estado text not null
);

create index postal_codes_postal_code_idx on public.postal_codes (postal_code);

alter table public.postal_codes enable row level security;
-- Sin policies públicas: es un catálogo de referencia sin datos sensibles,
-- pero se consulta siempre server-side (`api.postal-code.tsx` vía
-- `service_role`), igual que `admins`/`orders` — nunca se necesita RLS pública.
