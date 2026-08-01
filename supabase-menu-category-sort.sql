-- Persistable ordering for vendor/customer menu categories and items.
-- Existing rows are backfilled deterministically by created_at.

alter table public.menu_items
  add column if not exists sort_order integer not null default 0;

with ranked as (
  select
    id,
    row_number() over (
      partition by vendor_id
      order by created_at asc, id asc
    ) - 1 as rn
  from public.menu_items
)
update public.menu_items mi
set sort_order = ranked.rn
from ranked
where mi.id = ranked.id
  and mi.sort_order = 0;

create index if not exists menu_items_vendor_sort_order_idx
  on public.menu_items (vendor_id, sort_order, created_at);
