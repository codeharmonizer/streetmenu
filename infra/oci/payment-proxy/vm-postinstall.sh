#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${PAYMENT_PROXY_DOMAIN:-payments.relaxedmenu.beyounded.com}"

sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
  nginx \
  curl \
  jq \
  ca-certificates \
  certbot \
  python3-certbot-nginx \
  iptables-persistent \
  unattended-upgrades

sudo tee /etc/nginx/sites-available/payments-relaxedmenu >/dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    location = /health {
        default_type text/plain;
        return 200 "ok\\n";
    }

    location / {
        return 404;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/payments-relaxedmenu /etc/nginx/sites-enabled/payments-relaxedmenu
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx

# Oracle-provided Ubuntu images can include an early REJECT before UFW chains.
sudo iptables -C INPUT -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 5 -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT
sudo iptables -C INPUT -p tcp -m state --state NEW -m tcp --dport 443 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 6 -p tcp -m state --state NEW -m tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save

sudo certbot --nginx \
  -d "$DOMAIN" \
  --non-interactive \
  --agree-tos \
  --register-unsafely-without-email \
  --redirect

sudo nginx -t
sudo systemctl reload nginx

curl -fsS "https://${DOMAIN}/health"
echo
curl -fsS https://api.ipify.org
echo
systemctl is-active nginx
systemctl is-active certbot.timer
