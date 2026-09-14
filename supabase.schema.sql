-- Run this once in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.fursa_users (
  id uuid primary key,
  name text not null,
  username text not null,
  phone text not null,
  email text not null,
  country text,
  service text not null check (service in ('chat','mikopo','ajira')),
  activation_fee integer not null check (activation_fee in (14000,15000,16000)),
  activated boolean not null default false,
  activated_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.fursa_users(id) on delete cascade,
  customer_reference text not null unique,
  zonmpay_reference text,
  service text not null check (service in ('chat','mikopo','ajira')),
  service_label text not null,
  amount integer not null check (amount in (14000,15000,16000)),
  payer_phone text not null,
  payment_status text not null default 'PENDING',
  admin_status text not null default 'pending' check (admin_status in ('pending','approved','rejected')),
  customer_confirmed boolean not null default false,
  customer_confirmed_at timestamptz,
  provider_response jsonb,
  failure_reason text,
  admin_note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists payment_requests_user_id_idx on public.payment_requests(user_id);
create index if not exists payment_requests_status_idx on public.payment_requests(payment_status, admin_status);

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.payment_requests(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.fursa_users enable row level security;
alter table public.payment_requests enable row level security;
alter table public.admin_notifications enable row level security;

-- No public policies are created. The server uses SUPABASE_SERVICE_ROLE_KEY.
