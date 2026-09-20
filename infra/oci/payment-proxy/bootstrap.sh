#!/usr/bin/env bash
set -euo pipefail

# Recreate the OCI Always Free payment proxy VM and static IP.
# Requires OCI CLI auth in ~/.oci/config.
# Required:
#   export OCI_COMPARTMENT_OCID=ocid1.compartment...  # or tenancy/root compartment OCID
# Optional:
#   export OCI_PROFILE=DEFAULT
#   export OCI_PREFIX=relaxedmenu-payments
#   export OCI_REGION=us-ashburn-1
#   export OCI_ADMIN_CIDR=x.x.x.x/32
#   export OCI_SHAPE=VM.Standard.A1.Flex
#   export OCI_OCPUS=1 OCI_MEMORY_GB=6
#   export OCI_SSH_PUBLIC_KEY_PATH=~/.ssh/oci_payment_proxy.pub

PROFILE="${OCI_PROFILE:-DEFAULT}"
PREFIX="${OCI_PREFIX:-relaxedmenu-payments}"
COMPARTMENT_ID="${OCI_COMPARTMENT_OCID:?export OCI_COMPARTMENT_OCID first}"
REGION="${OCI_REGION:-}"
SHAPE="${OCI_SHAPE:-VM.Standard.A1.Flex}"
OCPUS="${OCI_OCPUS:-1}"
MEMORY_GB="${OCI_MEMORY_GB:-6}"
VCN_CIDR="${OCI_VCN_CIDR:-10.40.0.0/16}"
SUBNET_CIDR="${OCI_SUBNET_CIDR:-10.40.1.0/24}"
SSH_KEY_PATH="${OCI_SSH_PUBLIC_KEY_PATH:-$HOME/.ssh/oci_payment_proxy.pub}"
DOMAIN="${PAYMENT_PROXY_DOMAIN:-payments.relaxedmenu.beyounded.com}"

command -v oci >/dev/null || { echo "oci CLI is required" >&2; exit 1; }
command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }

OCI_ARGS=(--profile "$PROFILE")
if [[ -n "$REGION" ]]; then OCI_ARGS+=(--region "$REGION"); fi

mkdir -p "$(dirname "$SSH_KEY_PATH")"
if [[ ! -f "$SSH_KEY_PATH" ]]; then
  ssh-keygen -t ed25519 -N '' -C "oci-payment-proxy" -f "${SSH_KEY_PATH%.pub}" >/dev/null
fi

if [[ -z "${OCI_ADMIN_CIDR:-}" ]]; then
  ADMIN_CIDR="$(curl -fsSL https://api.ipify.org)/32"
else
  ADMIN_CIDR="$OCI_ADMIN_CIDR"
fi

echo "Using SSH admin CIDR: $ADMIN_CIDR"

find_or_create_vcn() {
  local existing
  existing=$(oci "${OCI_ARGS[@]}" network vcn list --compartment-id "$COMPARTMENT_ID" --display-name "$PREFIX-vcn" --lifecycle-state AVAILABLE --query 'data[0].id' --raw-output)
  [[ -n "$existing" && "$existing" != null ]] && { echo "$existing"; return; }
  oci "${OCI_ARGS[@]}" network vcn create --compartment-id "$COMPARTMENT_ID" --display-name "$PREFIX-vcn" --cidr-block "$VCN_CIDR" --dns-label payvcn --wait-for-state AVAILABLE --query 'data.id' --raw-output
}

find_or_create_igw() {
  local vcn_id="$1" existing
  existing=$(oci "${OCI_ARGS[@]}" network internet-gateway list --compartment-id "$COMPARTMENT_ID" --vcn-id "$vcn_id" --display-name "$PREFIX-igw" --lifecycle-state AVAILABLE --query 'data[0].id' --raw-output)
  [[ -n "$existing" && "$existing" != null ]] && { echo "$existing"; return; }
  oci "${OCI_ARGS[@]}" network internet-gateway create --compartment-id "$COMPARTMENT_ID" --vcn-id "$vcn_id" --is-enabled true --display-name "$PREFIX-igw" --wait-for-state AVAILABLE --query 'data.id' --raw-output
}

find_or_create_route_table() {
  local vcn_id="$1" igw_id="$2" existing rules
  existing=$(oci "${OCI_ARGS[@]}" network route-table list --compartment-id "$COMPARTMENT_ID" --vcn-id "$vcn_id" --display-name "$PREFIX-public-rt" --lifecycle-state AVAILABLE --query 'data[0].id' --raw-output)
  [[ -n "$existing" && "$existing" != null ]] && { echo "$existing"; return; }
  rules=$(jq -nc --arg igw "$igw_id" '[{"cidrBlock":"0.0.0.0/0","networkEntityId":$igw,"description":"default internet route"}]')
  oci "${OCI_ARGS[@]}" network route-table create --compartment-id "$COMPARTMENT_ID" --vcn-id "$vcn_id" --display-name "$PREFIX-public-rt" --route-rules "$rules" --wait-for-state AVAILABLE --query 'data.id' --raw-output
}

find_or_create_security_list() {
  local vcn_id="$1" existing ingress egress
  existing=$(oci "${OCI_ARGS[@]}" network security-list list --compartment-id "$COMPARTMENT_ID" --vcn-id "$vcn_id" --display-name "$PREFIX-public-sl" --lifecycle-state AVAILABLE --query 'data[0].id' --raw-output)
  [[ -n "$existing" && "$existing" != null ]] && { echo "$existing"; return; }
  ingress=$(jq -nc --arg admin "$ADMIN_CIDR" '[
    {"protocol":"6","source":$admin,"description":"SSH from admin IP","tcpOptions":{"destinationPortRange":{"min":22,"max":22}}},
    {"protocol":"6","source":"0.0.0.0/0","description":"HTTP for ACME/redirect","tcpOptions":{"destinationPortRange":{"min":80,"max":80}}},
    {"protocol":"6","source":"0.0.0.0/0","description":"HTTPS payment proxy","tcpOptions":{"destinationPortRange":{"min":443,"max":443}}}
  ]')
  egress='[{"protocol":"all","destination":"0.0.0.0/0","description":"all outbound incl ePays"}]'
  oci "${OCI_ARGS[@]}" network security-list create --compartment-id "$COMPARTMENT_ID" --vcn-id "$vcn_id" --display-name "$PREFIX-public-sl" --ingress-security-rules "$ingress" --egress-security-rules "$egress" --wait-for-state AVAILABLE --query 'data.id' --raw-output
}

find_or_create_subnet() {
  local vcn_id="$1" rt_id="$2" sl_id="$3" existing
  existing=$(oci "${OCI_ARGS[@]}" network subnet list --compartment-id "$COMPARTMENT_ID" --vcn-id "$vcn_id" --display-name "$PREFIX-public-subnet" --lifecycle-state AVAILABLE --query 'data[0].id' --raw-output)
  [[ -n "$existing" && "$existing" != null ]] && { echo "$existing"; return; }
  oci "${OCI_ARGS[@]}" network subnet create --compartment-id "$COMPARTMENT_ID" --vcn-id "$vcn_id" --display-name "$PREFIX-public-subnet" --cidr-block "$SUBNET_CIDR" --dns-label paysubnet --route-table-id "$rt_id" --security-list-ids "[\"$sl_id\"]" --prohibit-public-ip-on-vnic false --wait-for-state AVAILABLE --query 'data.id' --raw-output
}

get_ad() {
  [[ -n "${OCI_AD_NAME:-}" ]] && { echo "$OCI_AD_NAME"; return; }
  local tenancy
  tenancy=$(awk -v p="[$PROFILE]" '$0==p{f=1;next} /^\[/{f=0} f && $1 ~ /^tenancy=/{sub(/^tenancy=/,"",$1); print $1}' ~/.oci/config | tail -1)
  oci "${OCI_ARGS[@]}" iam availability-domain list --compartment-id "$tenancy" --query 'data[0].name' --raw-output
}

get_ubuntu_2404_image() {
  oci "${OCI_ARGS[@]}" compute image list \
    --compartment-id "$COMPARTMENT_ID" \
    --operating-system "Canonical Ubuntu" \
    --operating-system-version "24.04" \
    --shape "$SHAPE" \
    --sort-by TIMECREATED --sort-order DESC --all \
    --query 'data[0].id' --raw-output
}

CLOUD_INIT=$(mktemp)
cat > "$CLOUD_INIT" <<EOF
#cloud-config
package_update: true
packages:
  - nginx
  - curl
  - jq
  - ca-certificates
  - certbot
  - python3-certbot-nginx
  - iptables-persistent
write_files:
  - path: /var/www/html/health
    permissions: '0644'
    content: |
      ok
runcmd:
  - systemctl enable --now ssh
  - systemctl enable --now nginx
  - iptables -C INPUT -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT 2>/dev/null || iptables -I INPUT 5 -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT
  - iptables -C INPUT -p tcp -m state --state NEW -m tcp --dport 443 -j ACCEPT 2>/dev/null || iptables -I INPUT 6 -p tcp -m state --state NEW -m tcp --dport 443 -j ACCEPT
  - netfilter-persistent save
EOF

VCN_ID=$(find_or_create_vcn)
IGW_ID=$(find_or_create_igw "$VCN_ID")
RT_ID=$(find_or_create_route_table "$VCN_ID" "$IGW_ID")
SL_ID=$(find_or_create_security_list "$VCN_ID")
SUBNET_ID=$(find_or_create_subnet "$VCN_ID" "$RT_ID" "$SL_ID")
AD_NAME=$(get_ad)
IMAGE_ID=$(get_ubuntu_2404_image)

SHAPE_CONFIG_ARGS=()
if [[ "$SHAPE" == *Flex* ]]; then
  SHAPE_CONFIG_ARGS=(--shape-config "{\"ocpus\":$OCPUS,\"memoryInGBs\":$MEMORY_GB}")
fi

INSTANCE_ID=$(oci "${OCI_ARGS[@]}" compute instance launch \
  --compartment-id "$COMPARTMENT_ID" \
  --availability-domain "$AD_NAME" \
  --display-name "$PREFIX-vm" \
  --shape "$SHAPE" \
  "${SHAPE_CONFIG_ARGS[@]}" \
  --image-id "$IMAGE_ID" \
  --subnet-id "$SUBNET_ID" \
  --assign-public-ip false \
  --ssh-authorized-keys-file "$SSH_KEY_PATH" \
  --user-data-file "$CLOUD_INIT" \
  --wait-for-state RUNNING \
  --query 'data.id' --raw-output)

VNIC_ID=$(oci "${OCI_ARGS[@]}" compute instance list-vnics --compartment-id "$COMPARTMENT_ID" --instance-id "$INSTANCE_ID" --query 'data[0].id' --raw-output)
PRIVATE_IP_ID=$(oci "${OCI_ARGS[@]}" network private-ip list --vnic-id "$VNIC_ID" --query 'data[0].id' --raw-output)
PUBLIC_IP_ID=$(oci "${OCI_ARGS[@]}" network public-ip list --compartment-id "$COMPARTMENT_ID" --scope REGION --lifetime RESERVED --all | jq -r --arg name "$PREFIX-static-ip" '.data[] | select(."display-name"==$name) | .id' | head -1)

if [[ -z "$PUBLIC_IP_ID" ]]; then
  PUBLIC_IP=$(oci "${OCI_ARGS[@]}" network public-ip create --compartment-id "$COMPARTMENT_ID" --display-name "$PREFIX-static-ip" --lifetime RESERVED --private-ip-id "$PRIVATE_IP_ID" --wait-for-state ASSIGNED --query 'data."ip-address"' --raw-output)
else
  PUBLIC_IP=$(oci "${OCI_ARGS[@]}" network public-ip update --public-ip-id "$PUBLIC_IP_ID" --private-ip-id "$PRIVATE_IP_ID" --force --query 'data."ip-address"' --raw-output)
fi

cat <<OUT
DONE
Static IP: $PUBLIC_IP
Domain target: $DOMAIN
Instance OCID: $INSTANCE_ID
SSH: ssh -i ${SSH_KEY_PATH%.pub} ubuntu@$PUBLIC_IP
Next: point DNS, then run vm-postinstall.sh on the VM.
OUT
