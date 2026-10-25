#!/usr/bin/env bash
# One-time setup for an Oracle AMD Micro (VM.Standard.E2.1.Micro: x86,
# 1 GB RAM) running Ubuntu 24.04. Run as the ubuntu user:
#   bash setup-micro.sh
#
# The Micro is too small to build the images itself, so they are built on an
# x86 machine and copied over (see DEPLOY-AMD-MICRO.md). This script only
# prepares the host: swap, Docker, nginx, certbot and the firewall.
set -euo pipefail

# 1 GB RAM is not enough for Postgres + Node + nginx on its own.
if ! swapon --show | grep -q /swapfile; then
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-swap.conf >/dev/null
sudo sysctl -p /etc/sysctl.d/99-swap.conf >/dev/null

sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nginx certbot python3-certbot-nginx unattended-upgrades

if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
fi
sudo usermod -aG docker "$USER"

# Oracle's Ubuntu images reject everything but SSH in iptables, on top of
# the VCN security list. Open 80 and 443, above that image's catch-all
# REJECT rule (its position differs between images), and keep it across reboots.
for port in 80 443; do
  sudo iptables -D INPUT -m state --state NEW -p tcp --dport "$port" -j ACCEPT 2>/dev/null || true
  reject=$(sudo iptables -L INPUT --line-numbers -n | awk '$2 == "REJECT" { print $1; exit }')
  sudo iptables -I INPUT "${reject:-1}" -m state --state NEW -p tcp --dport "$port" -j ACCEPT
done
sudo netfilter-persistent save

mkdir -p ~/risch-wealth
echo
echo "Host ready. Log out and back in once so the docker group applies."
