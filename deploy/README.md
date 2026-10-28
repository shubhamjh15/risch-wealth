# Deploying to the Ubuntu server (80.225.229.175, rischwealth.com)

> **Out of date.** This describes the old server. Production moved to an
> Oracle AMD Micro in October 2026: see [../DEPLOY.md](../DEPLOY.md) to
> deploy, and [DEPLOY-AMD-MICRO.md](DEPLOY-AMD-MICRO.md) to set up a server.

Everything the app needs (frontend + backend) runs as two Docker
containers, managed by one `docker-compose.yml` at the repo root. The
only thing that lives outside Docker is nginx + the TLS certificate,
because that's a one-time host-level setup, not something that should
rebuild every deploy.

```
Internet --> host nginx (TLS, port 443) --> frontend container :8080 --> backend container
                                              (nginx + built React app)   (Express API, internal only)
```

## One-time server setup

```bash
# Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # log out/in once after this

# nginx + certbot (host-level, for TLS only)
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx

sudo mkdir -p /var/www/rischwealth
sudo chown $USER:$USER /var/www/rischwealth
git clone <repo-url> /var/www/rischwealth
```

Point DNS: `rischwealth.com` and `www.rischwealth.com` A records ->
`80.225.229.175`. Wait for it to propagate before requesting a cert.

## Database password (one-time, before the first start)

The app includes a PostgreSQL database. Create `.env` next to
`docker-compose.yml` with its password (the file is git-ignored):

```bash
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=')" > .env
```

Keep a copy of it somewhere safe. Never run `docker compose down -v` —
that deletes the database volume.

## Start the app (this is the "1-2 commands" part)

```bash
cd /var/www/rischwealth
docker compose up -d --build
```

That's it. Both containers:
- start now,
- restart automatically if they crash (`restart: unless-stopped`),
- and come back up automatically if the whole server reboots, because
  Docker's own service (`docker.service`) is enabled on boot by default
  once installed — no extra systemd unit needed for this app.

Check they're up:

```bash
docker compose ps
docker compose logs -f     # Ctrl+C to stop watching, containers keep running
```

## Configure host nginx (one-time)

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/rischwealth.com
sudo ln -s /etc/nginx/sites-available/rischwealth.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Then get TLS (only works once DNS points here, and the containers are
already running):

```bash
sudo certbot --nginx -d rischwealth.com -d www.rischwealth.com
```

Certbot edits the nginx config in place to add the certificate paths and
the automatic HTTP -> HTTPS redirect — you don't need to write that part
by hand.

Then, once certbot has run, make two more edits to
`/etc/nginx/sites-available/rischwealth.com` (both came out of the SEO
audit):

- **HTTP/2:** change `listen 443 ssl;` to `listen 443 ssl http2;` (and the
  same for the `[::]:443` line).
- **One canonical host:** in the 443 server block, add
  `if ($host = www.rischwealth.com) { return 301 https://rischwealth.com$request_uri; }`,
  and in the port-80 block point the `www` redirect straight at
  `https://rischwealth.com$request_uri` so it's a single hop.

`sudo nginx -t && sudo systemctl reload nginx` afterwards.

## Verify

```bash
curl -s https://rischwealth.com/health                       # -> {"ok":true}
curl -s https://rischwealth.com/api/risk-profiler/config | head -c 100
```

Open `https://rischwealth.com/risk-profiler` in a browser and run through
the quiz — it should reach the report step without any console errors.

## Redeploying after changes

```bash
cd /var/www/rischwealth
git pull
docker compose up -d --build
```

Docker only rebuilds the images whose source actually changed, and
replaces just those containers — the other one keeps running. Host
nginx and the TLS cert are untouched by this.

Database migrations (`be/migrations/*.sql`) run automatically when the
backend starts; nothing to do by hand.

The backend needs outbound HTTPS to `portal.amfiindia.com` for the daily
mutual fund NAV update. Check it after a deploy with
`docker compose logs backend | grep NAV`: you should see
`NAV refresh: N funds updated`.

## Stopping / restarting manually

```bash
docker compose down       # stop and remove both containers
docker compose up -d      # start them again (no rebuild)
docker compose restart    # restart both without rebuilding
```

## Config (optional)

Copy `.env.example` (repo root) to `.env` if you need to override the
backend's `CORS_ORIGIN` allowlist — `docker compose` reads it
automatically. Not needed for the default `rischwealth.com` setup.
