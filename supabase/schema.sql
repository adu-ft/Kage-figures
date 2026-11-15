-- Kage Figures · Supabase Database Schema
-- Run this script once in your Supabase Dashboard -> SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  customer_phone text not null,
  shipping_address text not null,
  locality text not null,
  city text not null,
  state text not null,
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  delivery_estimate text,
  items jsonb not null default '[]'::jsonb,
  subtotal_inr integer not null check (subtotal_inr >= 0),
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_orders_pincode on public.orders (pincode);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text not null default 'footer_dispatch',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Allow anonymous storefront visitors to submit new orders & newsletter signups
-- while preventing public reading of other customers' order/contact records.
drop policy if exists "Allow public order insert" on public.orders;
create policy "Allow public order insert"
  on public.orders
  for insert
  to anon, authenticated
  with check (
    length(trim(order_number)) > 0
    and length(trim(customer_name)) >= 3
    and length(trim(customer_phone)) >= 10
    and length(trim(pincode)) = 6
  );

drop policy if exists "Allow public newsletter insert" on public.newsletter_subscribers;
create policy "Allow public newsletter insert"
  on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (
    length(trim(email)) >= 5
    and position('@' in email) > 1
  );
