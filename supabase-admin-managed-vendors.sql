-- Admin-managed vendors: allow admins to onboard restaurants before vendor email/login exists.
-- Run in Supabase SQL Editor before using the admin create/manage vendor screens.

alter table public.vendors
  alter column user_id drop not null;

alter table public.vendors
  add column if not exists username text,
  add column if not exists vendor_status text not null default 'active',
  add column if not exists invited_email text,
  add column if not exists invited_at timestamptz,
  add column if not exists activated_at timestamptz,
  add column if not exists created_by_admin_id uuid references auth.users(id) on delete set null,
  add column if not exists updated_by_admin_id uuid references auth.users(id) on delete set null,
  add column if not exists last_admin_action_at timestamptz;

update public.vendors
set username = coalesce(username, regexp_replace(lower(slug), '[^a-z0-9_]', '', 'g'))
where username is null;

update public.vendors
set vendor_status = case when user_id is null then 'managed' else 'active' end
where vendor_status is null or vendor_status not in ('managed', 'invited', 'active', 'suspended', 'deleted');

alter table public.vendors
  add constraint vendors_vendor_status_check
  check (vendor_status in ('managed', 'invited', 'active', 'suspended', 'deleted')) not valid;

alter table public.vendors validate constraint vendors_vendor_status_check;

create unique index if not exists vendors_username_unique_idx
  on public.vendors (lower(username))
  where username is not null;

create index if not exists vendors_vendor_status_idx
  on public.vendors (vendor_status);

-- Keep owner policies safe when user_id is nullable.
drop policy if exists "Vendors can be updated by their owner" on public.vendors;
create policy "Vendors can be updated by their owner"
  on public.vendors for update using (user_id is not null and auth.uid() = user_id);

drop policy if exists "Vendors can be deleted by their owner" on public.vendors;
create policy "Vendors can be deleted by their owner"
  on public.vendors for delete using (user_id is not null and auth.uid() = user_id);

drop policy if exists "Menu items can be managed by vendor owner" on public.menu_items;
create policy "Menu items can be managed by vendor owner"
  on public.menu_items for all using (
    exists (
      select 1 from public.vendors
      where id = menu_items.vendor_id
        and vendors.user_id is not null
        and vendors.user_id = auth.uid()
    )
  );

-- Storage policy keeps direct vendor-owned uploads only; admin uploads go through service-role server actions.
drop policy if exists "Menu photos can be uploaded by vendor owner" on storage.objects;
create policy "Menu photos can be uploaded by vendor owner"
  on storage.objects for insert with check (
    bucket_id = 'menu-photos'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.vendors
      where vendors.id::text = (storage.foldername(name))[1]
        and vendors.user_id is not null
        and vendors.user_id = auth.uid()
    )
  );
