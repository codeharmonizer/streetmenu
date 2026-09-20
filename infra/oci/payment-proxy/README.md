# OCI Payment Proxy

Relaxed Menu uses an OCI Always Free Ubuntu VM to provide a stable outbound IP for ePays API calls.

```text
Relaxed Menu app / Vercel
  -> https://payments.relaxedmenu.beyounded.com/API/...
  -> OCI VM outbound IP 157.151.217.65
  -> ePays
```

## Why this exists

Vercel/serverless outbound IPs are not static enough for provider IP allowlisting. ePays should whitelist:

```text
157.151.217.65
```

## Runtime configuration in the app

Set these in the app environment when the payment proxy service is ready:

```bash
PAYMENT_PROXY_BASE_URL=https://payments.relaxedmenu.beyounded.com
PAYMENT_PROXY_SECRET=<strong shared secret>
```

The app's `src/lib/epays.ts` keeps the same ePays client API but sends ePays requests to `PAYMENT_PROXY_BASE_URL` when configured. The proxy must forward compatible `/API/Initiate` and `/API/ProcessPayment` form-encoded requests to ePays.

## Files

| File | Purpose |
|---|---|
| `inventory.md` | Current live OCI resource inventory and verification notes |
| `bootstrap.sh` | Recreate VCN/subnet/security list/VM/static IP from OCI CLI |
| `nginx-site.conf` | Nginx site shape used on the VM before/after app reverse proxying |
| `vm-postinstall.sh` | VM package, HTTPS, and firewall setup commands |

## Current live endpoint

```bash
curl https://payments.relaxedmenu.beyounded.com/health
# ok
```

## Deployment notes

- Keep ePays callback ownership in the main app unless there is a strong reason to move it. The callback route can still call ePays verification through the OCI proxy, which gives the static source IP while keeping DB mutation/idempotency in the app.
- Do not expose ePays credentials or `PAYMENT_PROXY_SECRET` to client-side code.
- Keep Cloudflare for `payments.relaxedmenu.beyounded.com` in DNS-only mode unless explicitly testing proxy compatibility.
