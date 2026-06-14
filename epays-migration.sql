-- ============================================================
-- ePays Payment Integration — Supabase SQL Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add payment columns to orders table
alter table public.orders
  add column if not exists payment_status  text not null default 'unpaid'
    check (payment_status in ('unpaid', 'pending_payment', 'paid', 'failed')),
  add column if not exists payment_id      text,
  add column if not exists payment_amount  numeric(10, 3);

-- 2. Index for fast lookup by payment_id (used in callback dedup)
create index if not exists orders_payment_id_idx
  on public.orders (payment_id)
  where payment_id is not null;

-- ============================================================
-- No new tables needed — orders already has RLS policies.
-- payment_status / payment_id / payment_amount are updated by
-- the server-side callback route using the service role key,
-- so no additional RLS policies are required.
-- ============================================================
