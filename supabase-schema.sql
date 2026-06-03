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

-- Scans policies
create policy "Scans are publicly insertable"
  on public.scans for insert with check (true);

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

create policy "Reviews are publicly insertable"
  on public.reviews for insert with check (true);

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

-- Enable RLS
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Orders policies
create policy "Orders are publicly insertable"
  on public.orders for insert with check (true);

create policy "Orders are publicly readable"
  on public.orders for select using (true);

create policy "Orders can be updated by vendor owner"
  on public.orders for update
  using (
    exists (
      select 1 from public.vendors
      where id = orders.vendor_id and user_id = auth.uid()
    )
  );

-- Order items policies
create policy "Order items are publicly insertable"
  on public.order_items for insert with check (true);

create policy "Order items are publicly readable"
  on public.order_items for select using (true);

-- Storage bucket for menu photos
insert into storage.buckets (id, name, public)
  values ('menu-photos', 'menu-photos', true)
  on conflict do nothing;

create policy "Menu photos are publicly readable"
  on storage.objects for select using (bucket_id = 'menu-photos');

create policy "Menu photos can be uploaded by authenticated users"
  on storage.objects for insert with check (
    bucket_id = 'menu-photos' and auth.role() = 'authenticated'
  );

create policy "Menu photos can be deleted by uploader"
  on storage.objects for delete using (
    bucket_id = 'menu-photos' and auth.uid()::text = (storage.foldername(name))[1]
  );
