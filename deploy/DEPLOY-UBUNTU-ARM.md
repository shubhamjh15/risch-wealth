# Deploying rischwealth.com on Ubuntu 24.04 ARM (Oracle A1.Flex)

This guide covers moving the site to a new server, for example the
client's own Oracle account. `deploy/README.md` covers the original
one-off setup; this file is written for a migration.

## 1. What runs where

```
Browser
  │  DNS: Cloudflare, A record, grey cloud (DNS only)
  ▼
host nginx  :80 / :443          TLS (Let's Encrypt), HTTP/2, www → apex redirect
  │  proxy_pass 127.0.0.1:8080
  ▼
frontend container (nginx 1.27) prerendered React pages + /assets/*
  │  /api/*, /health → backend:4000  (Docker network only)
  ▼
backend container (Node 20, Express 5)
  │  DATABASE_URL → db:5432           outbound HTTPS → portal.amfiindia.com (daily NAVs)
  ▼
db container (Postgres 17)      data in the named volume <project>_pgdata
```

- **Process manager:** Docker. Every service has `restart: unless-stopped`,
  and `docker.service` starts at boot, so the stack comes back on its own
  after a crash or reboot. No PM2 or systemd unit is involved.
- **ARM:** `node:20-alpine`, `nginx:1.27-alpine` and `postgres:17-alpine`
  all publish arm64 images. Nothing needs cross-compiling.
- **Only nginx and the certificate live on the host.** Everything else is
  `docker compose up -d --build` from the repo root.
- **Ports:** only 80 and 443 (and 22 for SSH) are public. The frontend is
  bound to `127.0.0.1:8080` and Postgres to `127.0.0.1:5432`. The backend
  has no published port.

## 2. Configuration

There is one `.env` file, at the repo root next to `docker-compose.yml`.
It is git-ignored, so it only exists on the server.

| Variable | Required | Notes |
|---|---|---|
| `POSTGRES_PASSWORD` | yes | Compose won't start without it. Postgres only reads it the **first time** the volume is created. If you edit it later, the backend can no longer connect (see §8 to rotate it). |
| `CORS_ORIGIN` | no | Comma-separated list. Defaults to `https://rischwealth.com,https://www.rischwealth.com`. |

`docker-compose.yml` already sets these for the backend, so they don't go in `.env`:
`PORT=4000`, `HOST=0.0.0.0`, `NODE_ENV=production` (this is what makes
the session cookie `Secure`), and `DATABASE_URL`, which is built from the
password.

Optional overrides, almost never needed: `AMFI_NAV_URL` and
`AMFI_HISTORY_URL` (backend), and `VITE_API_BASE_URL` (frontend, build-time;
leave it unset so the app calls `/api` on its own origin).

There are no other secrets. There's no JWT secret (sessions are random
tokens with their hashes stored in Postgres), no SMTP, and no third-party
API keys.

## 3. Before you start: copy everything off the old server

Do this while you still have access to the old developer's VM
(`80.225.229.175`), even if you plan to boot from the image. The image is
a snapshot. Anything written after it was taken (new client sign-ups,
recorded orders, risk assessments) exists only on the old server.

```bash
# Find the repo directory. Compose records it on every container.
docker ps --format '{{.Names}}'
APP=$(docker inspect -f '{{ index .Config.Labels "com.docker.compose.project.working_dir" }}' \
      $(docker ps -q --filter label=com.docker.compose.service=backend))
echo "$APP"
cd "$APP"

git status --short          # should print nothing (no local edits)
git log -1 --oneline        # expect 009fe1b "Completed What We Provide Page"
docker volume ls            # note the <project>_pgdata name

# Secrets and config
cp .env ~/risch-env.backup
sudo cp -a /etc/nginx/sites-available ~/nginx-sites.backup
sudo tar czf ~/letsencrypt.tgz -C / etc/letsencrypt

# Database (custom format, restores with pg_restore)
docker compose exec -T db pg_dump -U risch -Fc risch > ~/risch-$(date +%F).dump
```

Copy them to your machine with
`scp ubuntu@80.225.229.175:'~/risch-*' ~/letsencrypt.tgz ~/nginx-sites.backup -r .`
and keep `.env` and the dump somewhere private. The dump holds client
PII and portfolio data.

> `deploy/README.md` says the app lives in `/var/www/rischwealth`, but
> the backend change log mentions `/var/www/risch-wealth` and an nginx
> site named `risch-wealth`. Trust the `working_dir` label above, not
> either document.

## 4. Oracle Cloud: instance and network

1. **Image compatibility.** On the imported custom image, go to *Edit
   details → Compatible shapes* and make sure `VM.Standard.A1.Flex` is
   listed.
2. **Shape.** `VM.Standard.A1.Flex`. 1 OCPU / 6 GB is plenty for this
   site, and 2 OCPU / 12 GB makes Docker builds faster. If you get "out
   of capacity", try a smaller size first, then each fault domain.
   Hyderabad has a single availability domain. Upgrading to PAYG usually
   clears this, and Always Free usage stays free on PAYG.
3. **Networking.** Use a VCN with a public subnet, an internet gateway,
   and a default route. In the security list (or an NSG), add ingress
   TCP 80 and 443 from `0.0.0.0/0`, and TCP 22 from your own IP only.
4. **Reserved public IP.** Attach one so the address survives if the
   instance is ever recreated. That's the IP that goes into Cloudflare.
5. **Host firewall.** Oracle's Ubuntu images ship iptables rules that
   reject everything except SSH, even when the security list allows it.
   An image of the old server already has 80/443 open, but check anyway:

   ```bash
   sudo iptables -L INPUT -n --line-numbers
   # If 80/443 aren't ACCEPTed above the final REJECT line (usually line 6):
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80  -j ACCEPT
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
   sudo netfilter-persistent save
   ```

Then choose **Path A** (boot from the image) or **Path B** (fresh server).

## 5A. Path A: boot from the imported image

The image already contains Docker, the repo, `.env`, the Postgres
volume, the nginx config and the certificate.

```bash
ssh ubuntu@<NEW_IP>

# The stack should already be up, because the restart policy runs at boot.
cd <APP dir from §3>
docker compose ps                         # db (healthy), backend, frontend: Up
curl -s localhost:8080/health             # {"ok":true}
docker compose logs backend | tail -20    # "RISCH backend listening", no migration errors
```

**Security, do this now:** the image carries the old developer's SSH
access. Edit `~/.ssh/authorized_keys` (and any other user's) so only the
key you supplied when creating the instance remains. Also check
`sudo ls /home` for extra accounts.

**Refresh the data** with a fresh dump from the old server, taken as
close to the DNS switch as possible (§3):

```bash
scp risch-YYYY-MM-DD.dump ubuntu@<NEW_IP>:~
docker compose stop backend
docker compose exec -T db psql -U risch -d postgres \
  -c 'DROP DATABASE risch' -c 'CREATE DATABASE risch OWNER risch'
docker compose exec -T db pg_restore -U risch -d risch --no-owner < ~/risch-YYYY-MM-DD.dump
docker compose start backend
```

Bring the code up to date if the repo has moved on since the image was
taken: `git pull && docker compose up -d --build`.

Go to §6.

## 5B. Path B: fresh Ubuntu 24.04 (aarch64) server

```bash
sudo apt update && sudo apt -y upgrade
sudo apt install -y git nginx certbot python3-certbot-nginx
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER      # log out and back in once
```

**Code and config.** Pick a directory and keep it. The compose project
name, and so the database volume name, comes from the directory name.
If you clone into a different directory later, you get a new, empty
database.

```bash
sudo mkdir -p /var/www/risch-wealth && sudo chown $USER: /var/www/risch-wealth
git clone https://github.com/<org>/risch-wealth.git /var/www/risch-wealth
cd /var/www/risch-wealth

# Either reuse the old password (cp ~/risch-env.backup .env) or make a new one.
# A new one is fine here, because this is a brand-new volume.
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=')" > .env
chmod 600 .env
```

**Database first, then the app.** Restore before the backend's first
start. Otherwise its migrations create empty tables that clash with the
restore.

```bash
docker compose up -d db
docker compose exec -T db pg_restore -U risch -d risch --no-owner < ~/risch-YYYY-MM-DD.dump
docker compose up -d --build       # first ARM build takes a few minutes
docker compose ps
curl -s localhost:8080/health      # {"ok":true}
```

The dump includes `schema_migrations`, so the backend skips migrations
that have already been applied.

*No data to bring over?* Run `docker compose up -d --build`, then create
the first admin:
`docker compose exec backend npm run user:create-admin -- EMP001 you@rischwealth.com "Full Name"`.
It prints a one-time password.

**nginx + TLS.** Either option keeps the site working through the DNS
switch:

- **Option 1: copy the old certificate (no downtime).**
  `sudo tar xzf ~/letsencrypt.tgz -C /`, then install the config below.
- **Option 2: get a new certificate before the switch, by DNS challenge.**
  Install `python3-certbot-dns-cloudflare`, create a Cloudflare API token
  with *Zone → DNS → Edit* on rischwealth.com, and run
  `sudo certbot certonly --dns-cloudflare --dns-cloudflare-credentials ~/.cf.ini -d rischwealth.com -d www.rischwealth.com`.

(The old way also works: install `deploy/nginx.conf` and run
`certbot --nginx` after the DNS switch. HTTPS is down for those few
minutes.)

Save the following as `/etc/nginx/sites-available/rischwealth.com`. It
reproduces what's live today: HTTP/2, a single canonical host, and
HTTP → HTTPS.

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name rischwealth.com www.rischwealth.com;
    return 301 https://rischwealth.com$request_uri;
}

server {
    # Ubuntu 24.04 ships nginx 1.24, so http2 goes on the listen line.
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name rischwealth.com www.rischwealth.com;
    server_tokens off;

    ssl_certificate     /etc/letsencrypt/live/rischwealth.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rischwealth.com/privkey.pem;
    # Option 2 (certonly) doesn't create these two files. Drop both lines
    # if they don't exist; nginx's defaults are fine.
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    if ($host = www.rischwealth.com) {
        return 301 https://rischwealth.com$request_uri;
    }

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Bare-IP and unknown-host requests get no response.
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 444;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/rischwealth.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## 6. Test before touching DNS

From your own machine, point the domain at the new IP for a single request:

```bash
curl -s  --resolve rischwealth.com:443:<NEW_IP> https://rischwealth.com/health
curl -sI --resolve rischwealth.com:443:<NEW_IP> https://rischwealth.com/about        # 200
curl -s  --resolve rischwealth.com:443:<NEW_IP> https://rischwealth.com/api/risk-profiler/config | head -c 80
```

To use the browser, add `<NEW_IP> rischwealth.com` to your hosts file.
Sign in to the employee portal and check that a known client's portfolio
shows.

## 7. DNS cutover (Cloudflare)

1. Take the final dump on the old server and restore it on the new one
   (§5A or §5B). Anything written on the old server after this point is
   lost, so do it right before step 2 at a quiet hour.
2. In Cloudflare DNS, change the `rischwealth.com` A record to `<NEW_IP>`.
   Change `www` too if it's an A record (a CNAME to the apex follows
   automatically). Keep it **grey-cloud (DNS only)**. Cloudflare's "Auto"
   TTL is 5 minutes.
3. The registrar transfer doesn't affect this. DNS already resolves
   through Cloudflare's nameservers, so leave the NS records alone.
4. After propagation:

   ```bash
   sudo certbot renew --dry-run      # renewal works from the new IP
   systemctl list-timers | grep certbot
   ```

5. Leave the old VM running but unused for a few days, then shut it down.

> If you ever switch the record to orange-cloud (proxied), set
> Cloudflare SSL/TLS to **Full (strict)**. Note that the backend will
> then see Cloudflare's IPs, unless nginx's `real_ip` module is
> configured for them.

## 8. Day-to-day operations

```bash
cd <APP dir>

# Deploy new code
git pull && docker compose up -d --build
docker image prune -f                     # reclaim disk from old builds

# Logs and status
docker compose ps
docker compose logs -f backend
docker compose logs backend | grep NAV    # "NAV refresh: N funds updated"

# Accounts (staff are created by an admin; clients sign up themselves)
docker compose exec backend npm run user:list
docker compose exec backend npm run user:create-admin -- <EMPID> <email> "<Full Name>"
docker compose exec backend npm run user:disable -- <email or EMPID>

# Database shell (or SSH-tunnel 5432 for DBeaver/TablePlus)
docker compose exec db psql -U risch risch
```

**Never** run `docker compose down -v`. It deletes the database volume.

**Backups.** Nothing is automated in the repo. Add a nightly dump and
copy it off the box (OCI Object Storage, for example):

```bash
sudo mkdir -p /var/backups/risch && sudo chown $USER: /var/backups/risch
crontab -e
# 02:15 nightly, keep 14 days
15 2 * * * cd <APP dir> && docker compose exec -T db pg_dump -U risch -Fc risch > /var/backups/risch/risch-$(date +\%F).dump && find /var/backups/risch -name '*.dump' -mtime +14 -delete
```

Test a restore once into a throwaway database. An untested backup isn't
a backup.

**OS updates:** `sudo apt install unattended-upgrades` (security patches).
Docker restarts the containers after a reboot.

**Rotating the database password** (good hygiene after a handover):

```bash
NEW=$(openssl rand -base64 32 | tr -d '/+=')
docker compose exec -T db psql -U risch -d risch -c "ALTER USER risch PASSWORD '$NEW'"
sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$NEW|" .env
docker compose up -d backend          # picks up the new DATABASE_URL
```

## 9. Handover checklist

- [ ] Repo moved to (or forked into) a GitHub org the client owns, and the old developer's access removed
- [ ] Old SSH keys removed from the server; port 22 restricted to known IPs
- [ ] `docker compose exec backend npm run user:list`: disable staff accounts that shouldn't exist
- [ ] `.env` and a recent dump stored somewhere private, outside the server
- [ ] Nightly backup cron running, and one restore tested
- [ ] `certbot renew --dry-run` passes on the new IP
- [ ] Old VM shut down once the new one has run cleanly for a few days
