-- ============================================================
-- ePays Payment Integration — Supabase SQL Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================
-- Purpose: log vendor subscription payments for audit trail.
-- Vendor subscription_status / expires_at are updated on the
-- existing `vendors` table by the callback route.
-- ============================================================

create table if not exists public.subscription_payments (
  id          uuid primary key default gen_random_uuid(),
  vendor_id   uuid not null references public.vendors(id) on delete cascade,
  payment_id  text not null unique,          -- ePays paymentId (dedup key)
  amount      numeric(10, 3) not null,
  expires_at  timestamptz not null,          -- what subscription_expires_at was set to
  created_at  timestamptz not null default now()
);

-- Index for fast lookup by vendor
create index if not exists subscription_payments_vendor_idx
  on public.subscription_payments (vendor_id);

-- RLS: vendors can view their own payment history; only service role can insert
alter table public.subscription_payments enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'subscription_payments' and policyname = 'vendor can view own payments'
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
-- No changes needed to the `vendors` table — it already has:
--   subscription_status      text
--   subscription_starts_at   timestamptz
--   subscription_expires_at  timestamptz
-- These are updated directly by the callback route.
-- ============================================================
