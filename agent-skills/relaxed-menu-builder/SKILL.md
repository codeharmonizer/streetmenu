---
name: relaxed-menu-builder
description: Build a ready-to-send Relaxed Menu QR menu for a Bahrain food business from its Instagram account, a menu photo, or a price list. Use when asked to "build a menu for @handle", "pre-build menus for these vendors", or to turn a menu image into a Relaxed Menu.
---

# Relaxed Menu builder

You turn a food business's public menu into a live Relaxed Menu (relaxedmenu.beyounded.com/m/<slug>)
that the founder can send to the owner as a free, already-built demo.

The repo lives at `~/Developer/streetmenu`. The importer is `scripts/menu-import/import.mjs`.
Never write to the database any other way.

## Inputs you may get

- An Instagram handle or URL (most common)
- A photo or screenshot of a menu board or printed menu
- A pasted price list (WhatsApp text, Talabat page text)
- A list of several of the above → process them one at a time

## Workflow

1. **Collect the menu.**
   - Instagram: open the profile. Read the bio (name, area, hours, WhatsApp number), the pinned posts,
     the Highlights named Menu / المنيو / Prices / الأسعار, and recent posts showing prices.
   - Menu photos: read every item and price. Only take prices you can clearly see.
   - Do not guess. If a price isn't visible, leave the item out and note it in `"notes"`.
2. **Write the spec** to `~/Developer/streetmenu/menus/<slug>.json`, following `scripts/menu-import/example.json`:
   - `vendor.name`: the business name as the owner writes it (Arabic or English).
   - `vendor.slug`: short, lowercase, Latin letters and hyphens only (`karak-house`). Required when the name is Arabic.
   - `vendor.instagram`, `vendor.phone` (with +973), `vendor.hours`, `vendor.address`, `vendor.category` when known.
   - `items[]`: `name`, `price` in **BD** (0.500, not 500 fils), `category`, optional `description`.
     Keep the menu's own order. Use the language the vendor uses. If they're bilingual, prefer Arabic
     for the name and put the English in the description.
   - `photo`: only a local file path you saved yourself or a direct image URL. Leave it out if unsure.
     Instagram CDN links expire, so download the image first.
   - `"source"`: where the data came from. `"notes"`: anything missing or uncertain.
3. **Dry run** and fix every error and warning that makes sense:
   `cd ~/Developer/streetmenu && node scripts/menu-import/import.mjs menus/<slug>.json --dry-run`
   (Add `--trial-days 90` for Founding 20 vendors. Without it, only the first 5 items are imported,
   which is the free plan limit.)
4. **Stop and show the founder** the dry-run output: vendor, link, item count and any notes.
   Ask for a yes before importing. Importing creates a public page with the vendor's name on it.
5. **Import** on approval: the same command without `--dry-run`. It prints the live link and a
   ready-made Arabic message, and saves `menus/<slug>.result.json` with the Arabic and English versions.
6. **Report back**: the live link, the admin edit link, and the message. **Do not send the message yourself.**
   The founder sends it personally.

## Rules

- Public information only. Never log in as the vendor, never message the vendor, never follow or like
  anything from the founder's account unless told to.
- One vendor per spec file. If the slug is taken, the importer adds `-2` on its own.
- Currency is always BD with up to 3 decimals.
- If a menu has more than 40 items, import the 15 best-sellers (pinned or most-shown items) and note it.
  A demo should load fast and look finished.
- If something fails, the importer rolls back automatically. Fix the spec and run it again.
