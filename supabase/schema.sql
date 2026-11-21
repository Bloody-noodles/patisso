-- Pâtissö demo-order schema foundation.
-- Apply only to a dedicated Supabase project. Do not reuse another app's tables.
-- Access is intentionally service-role-only; do not add public anon policies.

create extension if not exists pgcrypto;

create table if not exists public.patisso_demo_orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (length(reference) between 8 and 20),
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 8),
  total_tsh integer not null check (total_tsh >= 0),
  special_instructions text not null default '' check (length(special_instructions) <= 240),
  status text not null default 'confirmed' check (status in ('confirmed', 'completed', 'cancelled')),
  tracking_token_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists patisso_demo_orders_created_at_idx
  on public.patisso_demo_orders (created_at desc);

create index if not exists patisso_demo_orders_status_idx
  on public.patisso_demo_orders (status);

alter table public.patisso_demo_orders enable row level security;

-- No anon/authenticated policies are created by design.
-- A future server-side API must validate every order against the shared menu
-- and use the Supabase service-role key from server-only environment variables.
-- Never expose the service-role key to browser code.

create or replace function public.set_patisso_order_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists patisso_demo_orders_updated_at on public.patisso_demo_orders;
create trigger patisso_demo_orders_updated_at
before update on public.patisso_demo_orders
for each row execute function public.set_patisso_order_updated_at();
