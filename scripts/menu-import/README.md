# Menu importer

Creates an admin-managed vendor with its full menu from one JSON file. You get a live
`/m/<slug>` page you can send to a prospect before they've signed up.

```bash
node scripts/menu-import/import.mjs menus/karak-house.json --dry-run        # validate + preview, writes nothing
node scripts/menu-import/import.mjs menus/karak-house.json                  # free plan: first 5 items
node scripts/menu-import/import.mjs menus/karak-house.json --trial-days 90  # Founding 20: full menu, 90-day Pro trial
```

Options: `--no-photos` skips image uploads. `--admin-id <uuid>` records who created the vendor
(it's picked automatically when there is only one admin).

- **Spec format:** see `example.json`. Prices accept `0.5`, `"0.500 BD"` and Arabic digits.
  Photos can be local paths (relative to the JSON file) or direct image URLs. They're uploaded to the
  `menu-photos` bucket.
- **Output:** the live link, the admin edit link and an outreach message, also saved to `<spec>.result.json`.
- **Safety:** a taken slug gets a `-2` suffix. If any step fails, the vendor and its photos are removed.
- **Handing it to the vendor:** there's no self-serve claim flow yet (`invited_email` is stored but
  registration doesn't link it). For now you manage their menu from `/admin/vendors/<id>/menu` when
  they send changes on WhatsApp. That's also a good "done for you" selling point.

To have an agent build specs for you, install `agent-skills/relaxed-menu-builder/SKILL.md` in Claude
Cowork or Hermes Agent.

Spec files in `menus/` contain prospects' details and are git-ignored.
