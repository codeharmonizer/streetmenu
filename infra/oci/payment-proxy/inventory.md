# OCI Payment Proxy Inventory

This is the OCI Always Free VM used as the static-egress payment proxy for Relaxed Menu ePays calls.

## Public endpoints

| Purpose | Value |
|---|---|
| Payment proxy domain | `https://payments.relaxedmenu.beyounded.com` |
| Health check | `https://payments.relaxedmenu.beyounded.com/health` |
| Reserved/static public IP | `157.151.217.65` |
| ePays allowlist IP | `157.151.217.65` |

## OCI resources

| Resource | Value |
|---|---|
| Region | `us-ashburn-1` / `iad` |
| Compartment | Root tenancy `ocid1.tenancy.oc1..aaaaaaaaqklrkx2bd4rizmkfk252fopoyezvgcse7fv43y7ww2iugebvs7xa` |
| VCN | `relaxedmenu-payments-vcn` |
| VCN OCID | `ocid1.vcn.oc1.iad.amaaaaaaj7bobbqaspwmuavcnfvp76xlaffkjrmco6zfnwococxwrlm5zydq` |
| Public subnet | `relaxedmenu-payments-public-subnet` |
| Subnet OCID | `ocid1.subnet.oc1.iad.aaaaaaaaijx7qscvlqo4qakcggaykrozhhvudhjwuim2tu2rymg4zkmodjtq` |
| Instance | `relaxedmenu-payments-vm` |
| Instance OCID | `ocid1.instance.oc1.iad.anuwcljrj7bobbqc7azvghcanlrosoyh5yuqgj23q7pu3yypoocrlr34n2aa` |
| Shape | `VM.Standard.A1.Flex` — 1 OCPU, 6 GB RAM |
| OS | Canonical Ubuntu 24.04 aarch64 |

## SSH

```bash
ssh -i ~/.ssh/oci_payment_proxy ubuntu@157.151.217.65
```

Do not commit the private SSH key or OCI API private key.

## Verified state

- DNS `payments.relaxedmenu.beyounded.com` resolves to `157.151.217.65`.
- `https://payments.relaxedmenu.beyounded.com/health` returns `ok`.
- HTTP redirects to HTTPS.
- Let's Encrypt certificate is installed and certbot timer is active.
- `curl https://api.ipify.org` from the VM returns `157.151.217.65`.
- Nginx is active.

## OCI/Ubuntu notes

The Oracle Ubuntu image had an early iptables `REJECT` before UFW chains. If ports 80/443 are refused even though OCI security lists and nginx are correct, insert persistent ACCEPT rules before the REJECT using `iptables-persistent`:

```bash
sudo iptables -C INPUT -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 5 -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT
sudo iptables -C INPUT -p tcp -m state --state NEW -m tcp --dport 443 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 6 -p tcp -m state --state NEW -m tcp --dport 443 -j ACCEPT
sudo apt-get install -y iptables-persistent
sudo netfilter-persistent save
```
