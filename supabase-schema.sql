-- Noor e Kala: run this once in Supabase SQL Editor before deploying.
create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  key text unique not null check (key ~ '^[a-z0-9-]+$'),
  label text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  mrp numeric(10,2) check (mrp is null or mrp >= price),
  cat text not null references categories(key),
  img text not null,
  images jsonb not null default '[]'::jsonb,
  "desc" text,
  featured boolean not null default false,
  new boolean not null default false,
  stock integer check (stock is null or stock >= 0),
  sold_out boolean not null default false,
  enquiry boolean not null default false,
  note text,
  reviews jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists store_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text,
  address text,
  customer_note text,
  items jsonb not null,
  total numeric(10,2) not null,
  status text not null default 'new' check (status in ('new','confirmed','paid','making','shipped','delivered','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists store_owners (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- Image bucket used by the owner dashboard.
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do nothing;

alter table categories enable row level security;
alter table products enable row level security;
alter table store_settings enable row level security;
alter table orders enable row level security;
alter table store_owners enable row level security;

create or replace function public.is_store_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.store_owners where user_id = auth.uid());
$$;

drop policy if exists "Public can browse categories" on categories;
drop policy if exists "Public can browse products" on products;
drop policy if exists "Public can read site settings" on store_settings;
drop policy if exists "Customers can create orders" on orders;
drop policy if exists "Public can view product images" on storage.objects;
drop policy if exists "Store owners manage categories" on categories;
drop policy if exists "Store owners manage products" on products;
drop policy if exists "Store owners manage settings" on store_settings;
drop policy if exists "Store owners manage orders" on orders;
drop policy if exists "Store owners upload product images" on storage.objects;
drop policy if exists "Owners manage categories" on categories;
drop policy if exists "Owners manage products" on products;
drop policy if exists "Owners manage settings" on store_settings;
drop policy if exists "Owners manage orders" on orders;
drop policy if exists "Owners upload product images" on storage.objects;

create policy "Public can browse categories" on categories for select using (is_active = true);
create policy "Public can browse products" on products for select using (is_active = true);
create policy "Public can read site settings" on store_settings for select using (key = 'site');
create policy "Customers can create orders" on orders for insert with check (true);

-- Only registered store owners manage the catalogue and order board.
create policy "Store owners manage categories" on categories for all to authenticated using (public.is_store_owner()) with check (public.is_store_owner());
create policy "Store owners manage products" on products for all to authenticated using (public.is_store_owner()) with check (public.is_store_owner());
create policy "Store owners manage settings" on store_settings for all to authenticated using (public.is_store_owner()) with check (public.is_store_owner());
create policy "Store owners manage orders" on orders for all to authenticated using (public.is_store_owner()) with check (public.is_store_owner());
create policy "Store owners upload product images" on storage.objects for all to authenticated using (bucket_id = 'product-images' and public.is_store_owner()) with check (bucket_id = 'product-images' and public.is_store_owner());
create policy "Public can view product images" on storage.objects for select using (bucket_id = 'product-images');

-- After creating the owner in Authentication > Users, replace the email and run this line once:
-- insert into public.store_owners (user_id) select id from auth.users where email = 'OWNER_EMAIL' on conflict (user_id) do nothing;
