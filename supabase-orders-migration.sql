-- Relaxed Menu Online Ordering Migration (hardened)
-- Public customers place/read orders through trusted server actions using the
-- service-role key, so anonymous Supabase clients must not get global order RLS.

-- 1. Add orders_enabled flag to vendors
alter table public.vendors
  add column if not exists orders_enabled boolean default false;

-- 2. Orders table
create table if not exists public.orders (
  id           uuid primary key default uuid_generate_v4(),
  vendor_id    uuid references public.vendors(id) on delete cascade not null,
  order_number text unique not null,
  status       text not null default 'pending'
               check (status in ('pending','accepted','ready','completed','rejected')),
  customer_name  text,
  customer_phone text,
  note           text,
  total          numeric(10,3) not null default 0,
  created_at     timestamptz default now()
);

-- 3. Order items table
create table if not exists public.order_items (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid references public.orders(id) on delete cascade not null,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  name         text not null,
  price        numeric(10,3) not null default 0,
  quantity     integer not null default 1,
  created_at   timestamptz default now()
);

-- 4. Indexes
create index if not exists orders_vendor_id_idx on public.orders(vendor_id);
create index if not exists orders_order_number_idx on public.orders(order_number);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- 5. Enable RLS
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- 6. Remove unsafe legacy public policies if present
drop policy if exists "Orders are publicly insertable" on public.orders;
drop policy if exists "Orders are publicly readable" on public.orders;
drop policy if exists "Order items are publicly insertable" on public.order_items;
drop policy if exists "Order items are publicly readable" on public.order_items;

-- 7. Vendor-owner read/update policies for authenticated dashboard users
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
    where schemaname = 'public' and tablename = 'orders'
      and policyname = 'Orders can be updated by vendor owner'
  ) then
    create policy "Orders can be updated by vendor owner"
      on public.orders for update
      using (
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
