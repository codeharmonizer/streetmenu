#!/usr/bin/env bash
set -euo pipefail

HOST="${PAYMENT_PROXY_HOST:-ubuntu@157.151.217.65}"
SSH_KEY="${PAYMENT_PROXY_SSH_KEY:-$HOME/.ssh/oci_payment_proxy}"
REMOTE_DIR="/opt/relaxedmenu-payment-proxy"
SECRET="${PAYMENT_PROXY_SECRET:-}"
if [[ -z "$SECRET" ]]; then
  SECRET="$(openssl rand -base64 48 | tr -d '\n')"
  echo "Generated PAYMENT_PROXY_SECRET for VM. Save the matching value in Vercel production env."
fi

scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
  infra/oci/payment-proxy/service/proxy-server.mjs \
  infra/oci/payment-proxy/service/relaxedmenu-payment-proxy.service \
  infra/oci/payment-proxy/nginx-site.conf \
  "$HOST:/tmp/"

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$HOST" \
  "PAYMENT_PROXY_SECRET=$(printf %q "$SECRET") bash -s" <<'REMOTE'
set -euo pipefail

sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs nginx certbot python3-certbot-nginx iptables-persistent ca-certificates curl jq

if ! id payment-proxy >/dev/null 2>&1; then
  sudo useradd --system --home-dir /opt/relaxedmenu-payment-proxy --shell /usr/sbin/nologin payment-proxy
fi

sudo mkdir -p /opt/relaxedmenu-payment-proxy
sudo cp /tmp/proxy-server.mjs /opt/relaxedmenu-payment-proxy/proxy-server.mjs
sudo chown -R payment-proxy:payment-proxy /opt/relaxedmenu-payment-proxy
sudo chmod 0755 /opt/relaxedmenu-payment-proxy
sudo chmod 0644 /opt/relaxedmenu-payment-proxy/proxy-server.mjs

sudo install -o root -g root -m 0644 /tmp/relaxedmenu-payment-proxy.service /etc/systemd/system/relaxedmenu-payment-proxy.service
sudo install -o root -g root -m 0644 /tmp/nginx-site.conf /etc/nginx/sites-available/payments-relaxedmenu
sudo ln -sf /etc/nginx/sites-available/payments-relaxedmenu /etc/nginx/sites-enabled/payments-relaxedmenu

sudo tee /etc/relaxedmenu-payment-proxy.env >/dev/null <<EOF
PORT=3001
PAYMENT_PROXY_SECRET=${PAYMENT_PROXY_SECRET}
EPAYS_MODE_TYPE=live
EOF
sudo chmod 0600 /etc/relaxedmenu-payment-proxy.env
sudo chown root:root /etc/relaxedmenu-payment-proxy.env

sudo systemctl daemon-reload
sudo systemctl enable --now relaxedmenu-payment-proxy
sudo systemctl restart relaxedmenu-payment-proxy

# Ensure Oracle image firewall allows web traffic before the image's early REJECT.
sudo iptables -C INPUT -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 5 -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT
sudo iptables -C INPUT -p tcp -m state --state NEW -m tcp --dport 443 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 6 -p tcp -m state --state NEW -m tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save

sudo nginx -t
sudo certbot --nginx \
  -d payments.relaxedmenu.beyounded.com \
  --non-interactive \
  --agree-tos \
  --register-unsafely-without-email \
  --redirect \
  --keep-until-expiring
sudo systemctl reload nginx

systemctl is-active relaxedmenu-payment-proxy
curl -fsS http://127.0.0.1:3001/health
REMOTE

echo
printf 'PAYMENT_PROXY_BASE_URL=https://payments.relaxedmenu.beyounded.com\n'
echo 'PAYMENT_PROXY_SECRET=<same value supplied to this deploy script; store it in Vercel production env>'
