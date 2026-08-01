-- ScanBite launch traffic indexes
-- Safe to run multiple times.

create index if not exists vendors_slug_idx
  on public.vendors(slug);

create index if not exists vendors_user_id_idx
  on public.vendors(user_id);

create index if not exists menu_items_vendor_sort_order_idx
  on public.menu_items(vendor_id, sort_order, created_at);

create index if not exists menu_items_vendor_available_sort_idx
  on public.menu_items(vendor_id, available desc, sort_order, created_at);

create index if not exists scans_vendor_scanned_at_idx
  on public.scans(vendor_id, scanned_at desc);

create index if not exists reviews_vendor_created_at_idx
  on public.reviews(vendor_id, created_at desc);

create index if not exists orders_vendor_status_created_at_idx
  on public.orders(vendor_id, status, created_at desc);
