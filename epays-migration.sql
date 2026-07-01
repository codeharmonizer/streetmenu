-- ============================================================
-- ePays Payment Integration — Supabase SQL Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================
-- Purpose: create a local subscription order before redirecting to ePays,
-- then log vendor subscription payments for audit trail after ePays verifies
-- the callback. The callback updates the existing `vendors` table.
-- ============================================================

create table if not exists public.subscription_orders (
  id               uuid primary key default gen_random_uuid(),
  vendor_id        uuid not null references public.vendors(id) on delete cascade,
  status           text not null default 'pending'
                   check (status in ('pending', 'paid', 'failed', 'expired')),
  amount           numeric(10, 3) not null,
  epays_payment_id text unique,
  created_at       timestamptz not null default now(),
  paid_at          timestamptz
);

create index if not exists subscription_orders_vendor_idx
  on public.subscription_orders (vendor_id);

create index if not exists subscription_orders_status_idx
  on public.subscription_orders (status);

alter table public.subscription_orders enable row level security;

-- Vendors can create and view their own pending payment attempts. Payment
-- completion is done by the callback route through the service-role client.
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'subscription_orders'
      and policyname = 'vendor can create own subscription orders'
  ) then
    create policy "vendor can create own subscription orders"
      on public.subscription_orders for insert
      with check (
        vendor_id in (
          select id from public.vendors where user_id = auth.uid()
        )
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'subscription_orders'
      and policyname = 'vendor can view own subscription orders'
  ) then
    create policy "vendor can view own subscription orders"
      on public.subscription_orders for select
      using (
        vendor_id in (
          select id from public.vendors where user_id = auth.uid()
        )
      );
  end if;
end $$;

create table if not exists public.subscription_payments (
  id                    uuid primary key default gen_random_uuid(),
  subscription_order_id uuid references public.subscription_orders(id) on delete set null,
  vendor_id             uuid not null references public.vendors(id) on delete cascade,
  payment_id            text not null unique,          -- ePays paymentId (dedup key)
  amount                numeric(10, 3) not null,
  expires_at            timestamptz not null,          -- what subscription_expires_at was set to
  created_at            timestamptz not null default now()
);

-- Existing installs may already have subscription_payments without this column.
alter table public.subscription_payments
  add column if not exists subscription_order_id uuid references public.subscription_orders(id) on delete set null;

-- Indexes for fast lookup by vendor/order
create index if not exists subscription_payments_vendor_idx
  on public.subscription_payments (vendor_id);

create index if not exists subscription_payments_order_idx
  on public.subscription_payments (subscription_order_id);

-- RLS: vendors can view their own payment history; only service role can insert
alter table public.subscription_payments enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'subscription_payments'
      and policyname = 'vendor can view own payments'
  ) then
    create policy "vendor can view own payments"
      on public.subscription_payments for select
      using (
        vendor_id in (
          select id from public.vendors where user_id = auth.uid()
        )
      );
  end if;
end $$;

-- ============================================================
-- The `vendors` table should have:
--   plan                       text ('free' | 'pro')
--   subscription_status        text
--   subscription_starts_at     timestamptz
--   subscription_expires_at    timestamptz
-- The callback sets plan='pro' and subscription_status='active'.
-- ============================================================
