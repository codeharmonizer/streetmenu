-- Relaxed Menu production hardening migration
-- Safe to run on existing Supabase projects before launch.

-- Admin access table expected by src/app/admin/*
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='admins' and policyname='Admins can read own row'
  ) then
    create policy "Admins can read own row"
      on public.admins for select using (auth.uid() = user_id);
  end if;
end $$;


-- Server-side anonymous action rate limiting. Fingerprints are one-way hashes;
-- no raw IP/user-agent values are stored.
create table if not exists public.public_action_rate_limits (
  id bigserial primary key,
  action text not null check (action in ('scan', 'review', 'order')),
  vendor_id uuid references public.vendors(id) on delete cascade,
  fingerprint text not null,
  created_at timestamptz not null default now()
);
alter table public.public_action_rate_limits enable row level security;
create index if not exists public_action_rate_limits_lookup_idx
  on public.public_action_rate_limits (action, fingerprint, created_at desc);

-- Public writes now go through trusted server actions/service role only.
drop policy if exists "Scans are publicly insertable" on public.scans;
drop policy if exists "Reviews are publicly insertable" on public.reviews;
drop policy if exists "Orders are publicly insertable" on public.orders;
drop policy if exists "Orders are publicly readable" on public.orders;
drop policy if exists "Order items are publicly insertable" on public.order_items;
drop policy if exists "Order items are publicly readable" on public.order_items;

-- Authenticated vendor dashboard read access for own orders.
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders'
      and policyname = 'Orders are readable by vendor owner'
  ) then
    create policy "Orders are readable by vendor owner"
      on public.orders for select using (
        exists (
          select 1 from public.vendors
          where id = orders.vendor_id and user_id = auth.uid()
        )
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'order_items'
      and policyname = 'Order items are readable by vendor owner'
  ) then
    create policy "Order items are readable by vendor owner"
      on public.order_items for select using (
        exists (
          select 1
          from public.orders
          join public.vendors on vendors.id = orders.vendor_id
          where orders.id = order_items.order_id and vendors.user_id = auth.uid()
        )
      );
  end if;
end $$;

-- Tighten storage path ownership: first folder must be the authenticated user's vendor id.
drop policy if exists "Menu photos can be uploaded by authenticated users" on storage.objects;
drop policy if exists "Menu photos can be deleted by uploader" on storage.objects;
drop policy if exists "Menu photos can be uploaded by vendor owner" on storage.objects;
drop policy if exists "Menu photos can be updated by vendor owner" on storage.objects;
drop policy if exists "Menu photos can be deleted by vendor owner" on storage.objects;

create policy "Menu photos can be uploaded by vendor owner"
  on storage.objects for insert with check (
    bucket_id = 'menu-photos'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.vendors
      where vendors.id::text = (storage.foldername(name))[1]
        and vendors.user_id = auth.uid()
    )
  );

create policy "Menu photos can be updated by vendor owner"
  on storage.objects for update using (
    bucket_id = 'menu-photos'
    and exists (
      select 1 from public.vendors
      where vendors.id::text = (storage.foldername(name))[1]
        and vendors.user_id = auth.uid()
    )
  );

create policy "Menu photos can be deleted by vendor owner"
  on storage.objects for delete using (
    bucket_id = 'menu-photos'
    and exists (
      select 1 from public.vendors
      where vendors.id::text = (storage.foldername(name))[1]
        and vendors.user_id = auth.uid()
    )
  );
