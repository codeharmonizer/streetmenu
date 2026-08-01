-- StreetMenu Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Vendors table
create table if not exists public.vendors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  description text,
  category text,
  address text,
  lat numeric,
  lng numeric,
  phone text,
  hours text,
  logo_url text,
  plan text default 'free' check (plan in ('free', 'pro')),
  subscription_status text default 'free' check (subscription_status in ('free', 'trial', 'active', 'expired')),
  subscription_starts_at timestamptz,
  subscription_expires_at timestamptz,
  is_active boolean default true,
  reviews_enabled boolean default true,
  is_open boolean default true,
  created_at timestamptz default now()
);

-- Menu items table
create table if not exists public.menu_items (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references public.vendors(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric(10,3) not null default 0,
  photo_url text,
  category text,
  available boolean default true,
  created_at timestamptz default now()
);

-- Scans table (analytics)
create table if not exists public.scans (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references public.vendors(id) on delete cascade not null,
  scanned_at timestamptz default now()
);

-- Reviews table
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references public.vendors(id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  reviewer_name text,
  created_at timestamptz default now()
);

-- Row Level Security (RLS)
alter table public.vendors enable row level security;
alter table public.menu_items enable row level security;
alter table public.scans enable row level security;
alter table public.reviews enable row level security;

-- Vendors policies
create policy "Vendors are publicly readable"
  on public.vendors for select using (true);

create policy "Vendors can be created by authenticated users"
  on public.vendors for insert with check (auth.uid() = user_id);

create policy "Vendors can be updated by their owner"
  on public.vendors for update using (auth.uid() = user_id);

create policy "Vendors can be deleted by their owner"
  on public.vendors for delete using (auth.uid() = user_id);

-- Menu items policies
create policy "Menu items are publicly readable"
  on public.menu_items for select using (true);

create policy "Menu items can be managed by vendor owner"
  on public.menu_items for all using (
    exists (
      select 1 from public.vendors
      where id = menu_items.vendor_id and user_id = auth.uid()
    )
  );


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

-- Scans policies
-- Public scan logging is performed by trusted server code with the service-role key.
create policy "Scans are readable by vendor owner"
  on public.scans for select using (
    exists (
      select 1 from public.vendors
      where id = scans.vendor_id and user_id = auth.uid()
    )
  );

-- Reviews policies
create policy "Reviews are publicly readable"
  on public.reviews for select using (true);

-- Public review submission is performed by trusted server code with the service-role key.

-- ── Online Ordering ──────────────────────────────────────────────────────────

-- Add orders_enabled flag to vendors
alter table public.vendors
  add column if not exists orders_enabled boolean default false;

-- Orders table
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

-- Order items table
create table if not exists public.order_items (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid references public.orders(id) on delete cascade not null,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  name         text not null,
  price        numeric(10,3) not null default 0,
  quantity     integer not null default 1,
  created_at   timestamptz default now()
);

-- Indexes
create index if not exists orders_vendor_id_idx     on public.orders(vendor_id);
create index if not exists orders_order_number_idx  on public.orders(order_number);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- Subscription payment attempts and audit trail
create table if not exists public.subscription_orders (
  id               uuid primary key default uuid_generate_v4(),
  vendor_id        uuid references public.vendors(id) on delete cascade not null,
  status           text not null default 'pending'
                   check (status in ('pending', 'paid', 'failed', 'expired')),
  amount           numeric(10,3) not null,
  epays_payment_id text unique,
  created_at       timestamptz default now(),
  paid_at          timestamptz
);

create table if not exists public.subscription_payments (
  id                    uuid primary key default uuid_generate_v4(),
  subscription_order_id uuid references public.subscription_orders(id) on delete set null,
  vendor_id             uuid references public.vendors(id) on delete cascade not null,
  payment_id            text unique not null,
  amount                numeric(10,3) not null,
  expires_at            timestamptz not null,
  created_at            timestamptz default now()
);

create index if not exists subscription_orders_vendor_idx  on public.subscription_orders(vendor_id);
create index if not exists subscription_orders_status_idx  on public.subscription_orders(status);
create index if not exists subscription_payments_vendor_idx on public.subscription_payments(vendor_id);
create index if not exists subscription_payments_order_idx  on public.subscription_payments(subscription_order_id);

-- Enable RLS
alter table public.orders                enable row level security;
alter table public.order_items           enable row level security;
alter table public.subscription_orders   enable row level security;
alter table public.subscription_payments enable row level security;

-- Orders policies
-- Public order placement is performed by trusted server code with the service-role key.

create policy "Orders are readable by vendor owner"
  on public.orders for select using (
    exists (
      select 1 from public.vendors
      where id = orders.vendor_id and user_id = auth.uid()
    )
  );

create policy "Orders can be updated by vendor owner"
  on public.orders for update
  using (
    exists (
      select 1 from public.vendors
      where id = orders.vendor_id and user_id = auth.uid()
    )
  );

-- Order items policies
-- Public order item creation is performed by trusted server code with the service-role key.

create policy "Order items are readable by vendor owner"
  on public.order_items for select using (
    exists (
      select 1
      from public.orders
      join public.vendors on vendors.id = orders.vendor_id
      where orders.id = order_items.order_id and vendors.user_id = auth.uid()
    )
  );

-- Subscription payment policies
create policy "Vendors can create own subscription orders"
  on public.subscription_orders for insert
  with check (
    vendor_id in (
      select id from public.vendors where user_id = auth.uid()
    )
  );

create policy "Vendors can view own subscription orders"
  on public.subscription_orders for select
  using (
    vendor_id in (
      select id from public.vendors where user_id = auth.uid()
    )
  );

create policy "Vendors can view own subscription payments"
  on public.subscription_payments for select
  using (
    vendor_id in (
      select id from public.vendors where user_id = auth.uid()
    )
  );

-- Admin access table expected by src/app/admin/*
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
create policy "Admins can read own row"
  on public.admins for select using (auth.uid() = user_id);

-- Storage bucket for menu photos
insert into storage.buckets (id, name, public)
  values ('menu-photos', 'menu-photos', true)
  on conflict do nothing;

create policy "Menu photos are publicly readable"
  on storage.objects for select using (bucket_id = 'menu-photos');

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
