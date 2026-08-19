-- Run this once AFTER creating the owner in Authentication > Users.
-- Replace OWNER_EMAIL below with that owner's exact email address.

create table if not exists public.store_owners (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.store_owners enable row level security;

create or replace function public.is_store_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.store_owners where user_id = auth.uid());
$$;

insert into public.store_owners (user_id)
select id from auth.users where email = 'OWNER_EMAIL'
on conflict (user_id) do nothing;

drop policy if exists "Owners manage categories" on categories;
drop policy if exists "Owners manage products" on products;
drop policy if exists "Owners manage settings" on store_settings;
drop policy if exists "Owners manage orders" on orders;
drop policy if exists "Owners upload product images" on storage.objects;

create policy "Store owners manage categories" on categories for all to authenticated using (public.is_store_owner()) with check (public.is_store_owner());
create policy "Store owners manage products" on products for all to authenticated using (public.is_store_owner()) with check (public.is_store_owner());
create policy "Store owners manage settings" on store_settings for all to authenticated using (public.is_store_owner()) with check (public.is_store_owner());
create policy "Store owners manage orders" on orders for all to authenticated using (public.is_store_owner()) with check (public.is_store_owner());
create policy "Store owners upload product images" on storage.objects for all to authenticated using (bucket_id = 'product-images' and public.is_store_owner()) with check (bucket_id = 'product-images' and public.is_store_owner());
