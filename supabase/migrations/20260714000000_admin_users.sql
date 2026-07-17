-- Cuenta(s) de administrador para el panel de gestión de catálogo (/admin).
-- Sin políticas públicas: solo el service_role (server-side) puede leer/escribir
-- esta tabla. No hay signup UI — se crea con scripts/create-admin.ts.

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Intencionalmente CERO policies (ni select, ni insert, ni update, ni delete).
-- RLS por defecto niega todo a anon/authenticated; solo service_role bypassa RLS.
