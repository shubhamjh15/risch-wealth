# Building a new server for rischwealth.com

Use this if the server is lost, Oracle reclaims it, or the site moves. For
normal releases use [../DEPLOY.md](../DEPLOY.md), which also explains why the
setup looks like this.

Target: an Always Free `VM.Standard.E2.1.Micro` (x86, 1 GB RAM) with Ubuntu
24.04, in the `risch-network` VCN, Hyderabad.

## 1. Create the instance (Oracle console)

- **Image:** Canonical Ubuntu 24.04, and pick a build **without** `aarch64` in
  its name. The Micro rejects ARM builds.
- **Shape:** Virtual machine > Specialty and previous generation >
  `VM.Standard.E2.1.Micro`.
- **Network:** existing VCN `risch-network`, `public subnet-risch-network`,
  with a public IPv4 address.
- **SSH key:** paste the contents of `C:\Users\jha77\risch_key.pub`.

The VCN's default security list must allow ingress TCP `80,443` from
`0.0.0.0/0` (Networking > VCN > Security > Default Security List). `risch-network`
already has this.

## 2. Prepare the host

```bash
scp -i ~/risch_key deploy/setup-micro.sh ubuntu@SERVER:~
ssh -i ~/risch_key ubuntu@SERVER 'bash setup-micro.sh'
```

This adds 4 GB swap, Docker, nginx and certbot, opens 80/443 above Oracle's
catch-all REJECT rule in iptables, creates `~/risch-wealth` and
`/var/backups/risch`, and adds the nightly database backup. It's safe to run
again.

## 3. First deploy

`deploy/deploy.sh` backs up a running database first, so it fails on an empty
server. The first time, by hand from the repo root on the PC:

```bash
ssh -i ~/risch_key ubuntu@SERVER 'cd ~/risch-wealth && umask 077 && echo "POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d "/+=")" > .env'
POSTGRES_PASSWORD=unused docker compose -p risch-wealth build
docker save risch-wealth-frontend:latest risch-wealth-backend:latest postgres:17-alpine \
  | gzip -1 | ssh -i ~/risch_key ubuntu@SERVER 'gunzip | sudo docker load'
scp -i ~/risch_key docker-compose.yml ubuntu@SERVER:~/risch-wealth/
ssh -i ~/risch_key ubuntu@SERVER 'cd ~/risch-wealth && sudo docker compose up -d --no-build'
```

The `-p risch-wealth` name matters: compose on the server looks for images
called `risch-wealth-frontend` and `risch-wealth-backend`, because its folder is
`risch-wealth`. Add `SMTP_PASS` to `.env` afterwards (see DEPLOY.md). Later
releases use `deploy/deploy.sh` with `SERVER=ubuntu@<ip>`, or update its default.

## 4. Restore the data

Copy a dump to the server, then in `~/risch-wealth`:

```bash
sudo docker compose stop backend
sudo docker compose exec -T db psql -U risch -d postgres -c "DROP DATABASE risch" -c "CREATE DATABASE risch OWNER risch"
sudo docker compose exec -T db pg_restore -U risch -d risch --no-owner < risch-YYYY-MM-DD.dump
sudo docker compose start backend     # applies any newer migrations
```

With no data to bring over, skip this and create a first admin:
`sudo docker compose exec backend npm run user:create-admin -- EMP001 you@rischwealth.com "Full Name"`.

## 5. nginx and TLS

```bash
sudo cp ~/nginx.conf /etc/nginx/sites-available/risch-wealth    # after: scp deploy/nginx.conf ubuntu@SERVER:~
sudo ln -sf /etc/nginx/sites-available/risch-wealth /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Certificates, either way:

- **Same domain, old disk available:** copy `/etc/letsencrypt` from the old
  server, so HTTPS works the moment DNS switches.
- **Otherwise:** after DNS points here, run
  `sudo certbot --nginx -d rischwealth.com -d www.rischwealth.com`.

After certbot, make two edits to the site and reload nginx:

- HTTP/2: `listen 443 ssl http2;`, and the same on the `[::]:443` line.
- One canonical host: in the 443 block add
  `if ($host = www.rischwealth.com) { return 301 https://rischwealth.com$request_uri; }`,
  and in the port-80 block send `www` straight to
  `https://rischwealth.com$request_uri`.

## 6. Test, then switch DNS

Test against the new server before touching DNS:

```bash
curl -s --resolve rischwealth.com:443:SERVER https://rischwealth.com/health
```

Then in Cloudflare (account `Rischwealth@gmail.com`), DNS > Records, edit only
the **A record** for `rischwealth.com`. Keep it **DNS only**, and leave the
`www` CNAME and the `google-site-verification` TXT record alone. The domain has
no MX records, so its email isn't affected. To undo, put the old IP back; it
takes effect within minutes. Afterwards run `sudo certbot renew --dry-run`.

**Before switching**, check whether the old server has data newer than your
dump. Anything saved there after the dump is left behind. Keep the old server
until that's settled.

## Rotating the database password

```bash
NEW=$(openssl rand -base64 32 | tr -d '/+=')
sudo docker compose exec -T db psql -U risch -d risch -c "ALTER USER risch PASSWORD '$NEW'"
sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$NEW|" .env
sudo docker compose up -d --no-build backend
```

## Recovering data from a custom image

This is how the data moved in October 2026, when the old server couldn't be
reached but its boot volume had been saved as a custom image. An x86 server
can't boot an ARM image, but it can read the files on it.

1. Export the image to a bucket: Compute > Custom images > Export, format
   **QCOW2** (not `.oci`).
2. Create a pre-authenticated request (object reads) for the file, and download
   it on the new server with `curl -f -o old.qcow2 "<url>"`.
3. Mount it read-only:

```bash
sudo apt install -y qemu-utils && sudo modprobe nbd max_part=8
sudo qemu-nbd --read-only --connect=/dev/nbd0 ~/old.qcow2
sudo mkdir -p /mnt/old && sudo mount -o ro,noload /dev/nbd0p1 /mnt/old
# database files: /mnt/old/var/lib/docker/volumes/risch-wealth_pgdata/_data
# certificates:   /mnt/old/etc/letsencrypt
# nginx site:     /mnt/old/etc/nginx/sites-available/risch-wealth
```

4. Start a temporary Postgres on a copy of the files, and dump it. ARM-written
   Postgres 17 files started fine on x86, using the same `postgres:17-alpine`:

```bash
sudo docker volume create oldpg
sudo cp -a /mnt/old/var/lib/docker/volumes/risch-wealth_pgdata/_data/. /var/lib/docker/volumes/oldpg/_data/
sudo docker run -d --name oldpg -v oldpg:/var/lib/postgresql/data postgres:17-alpine
sudo docker exec oldpg pg_dump -U risch -Fc risch > ~/risch-old.dump
```

5. Restore that dump (section 4), then clean up:

```bash
sudo docker rm -f oldpg && sudo docker volume rm oldpg
sudo umount /mnt/old && sudo qemu-nbd --disconnect /dev/nbd0 && rm ~/old.qcow2
```

## If free ARM capacity appears

An A1 instance has 6 GB of RAM or more, but the images here are x86 and won't
run on it. It would need building on the server, with
`docker compose up -d --build` from a git checkout, instead of this guide's
build-and-ship method.
