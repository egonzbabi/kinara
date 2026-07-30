-- Mensajes del formulario de /contacto (tarea 032). Se guardan siempre, aunque
-- el envío de correo (Resend) falle o no esté configurado todavía — el
-- mensaje nunca se pierde solo porque el email no salió.
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  email_sent boolean not null default false,
  email_error text,
  created_at timestamptz not null default now()
);

create index contact_messages_created_at_idx on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;
-- Sin policies públicas: solo el cliente service_role (server-side, la action
-- de /contacto) puede insertar/leer — mismo patrón que admins/orders.
