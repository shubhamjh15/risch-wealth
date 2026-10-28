# Running rischwealth.com on an Oracle AMD Micro (free tier)

Production runs on an Always Free `VM.Standard.E2.1.Micro` (x86, 1 GB RAM)
with Ubuntu 24.04, in the `risch-network` VCN (Hyderabad). It replaced the
A1 ARM server in October 2026, when no A1 capacity was available.

The Micro has too little memory to build the Docker images, so images are
built on an x86 PC and copied to the server. The server has no git
checkout: just `~/risch-wealth/docker-compose.yml` and `.env`.

## 1. Network (once per VCN)

The VCN's default security list must allow ingress TCP `80,443` from
`0.0.0.0/0` (Networking → VCN → Security → Default Security List).

## 2. Host setup (once per server)

```bash
scp deploy/setup-micro.sh ubuntu@SERVER:~ && ssh ubuntu@SERVER 'bash setup-micro.sh'
```

Adds 4 GB swap, Docker, nginx, certbot, and opens 80/443 in the host
firewall above Oracle's catch-all REJECT rule.

## 3. Deploy (every release)

`bash deploy/deploy.sh` does all of this (see [../DEPLOY.md](../DEPLOY.md)).
By hand, from the repo root on the PC (Docker Desktop running):

```bash
POSTGRES_PASSWORD=x docker compose -p risch-wealth build
docker save risch-wealth-frontend risch-wealth-backend postgres:17-alpine \
  | gzip -1 | ssh ubuntu@SERVER 'gunzip | sudo docker load'
scp docker-compose.yml ubuntu@SERVER:~/risch-wealth/
ssh ubuntu@SERVER 'cd ~/risch-wealth && sudo docker compose up -d --no-build'
```

The `-p risch-wealth` project name matters: compose on the server looks for
images named `risch-wealth-backend` and `risch-wealth-frontend`. Migrations
run when the backend starts. On a first deploy, create `.env` on the server
with a strong `POSTGRES_PASSWORD` before `up`.

## 4. nginx and TLS

The live site config is `/etc/nginx/sites-available/risch-wealth` (the
certbot-managed version of `deploy/nginx.conf`, with www → apex and
HTTP → HTTPS redirects). For a new domain or lost certificates:
`sudo certbot --nginx -d rischwealth.com -d www.rischwealth.com` after DNS
points at the server.

## 5. Backups

A cron job dumps the database nightly at 02:15 to `/var/backups/risch`,
keeping 14 days, and a second one uploads each dump to the `risch-backups`
Object Storage bucket through a write-only pre-authenticated request, so a
copy survives losing the server. See `crontab -l` on the server.

Always Free instances that stay idle for a week can be reclaimed by
Oracle. If that happens: create a new Micro, run sections 1–3, then restore
the newest dump from the bucket:

```bash
sudo docker compose up -d db
sudo docker compose exec -T db pg_restore -U risch -d risch --no-owner < risch-YYYY-MM-DD.dump
sudo docker compose up -d --no-build
```

## 6. Recovering data from a custom image

How the data came across in October 2026, when the old server was not
reachable but its boot volume had been saved as a custom image: export the
image to a bucket as QCOW2, download it on the new server through a
pre-authenticated request, then

```bash
sudo apt install -y qemu-utils && sudo modprobe nbd max_part=8
sudo qemu-nbd --read-only --connect=/dev/nbd0 old.qcow2
sudo mount -o ro,noload /dev/nbd0p1 /mnt/old
# database files: /mnt/old/var/lib/docker/volumes/risch-wealth_pgdata/_data
# certificates:   /mnt/old/etc/letsencrypt
```

Copy the database files into a fresh Docker volume, start a temporary
`postgres:17-alpine` on it, `pg_dump -Fc`, and restore that dump as above.
ARM-written Postgres 17 files started fine on x86.
