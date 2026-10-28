# Deploying rischwealth.com

Production is one small Oracle server (Always Free, so it costs nothing):

| | |
|---|---|
| Server | `ubuntu@140.245.220.59` (Oracle AMD Micro, Hyderabad, 1 GB RAM) |
| SSH key | `C:\Users\jha77\risch_key` |
| App folder on the server | `~/risch-wealth` (only `docker-compose.yml` and `.env`) |
| Temporary link | https://risch.140-245-220-59.sslip.io |

## Deploy the latest changes

On the PC, in Git Bash, from the repo root, with Docker Desktop running:

```bash
bash deploy/deploy.sh
```

That's all. It takes about 5 minutes and:

1. backs up the live database to `/var/backups/risch/pre-deploy-<date>.dump`
2. builds the frontend and backend images on the PC
3. copies `docker-compose.yml` to the server
4. sends the images to the server
5. restarts the app (new database migrations run on start) and checks a few pages

Whatever is in the working folder gets deployed, committed or not. Commit
and push first so `main` matches what is live.

Then hard-refresh the browser (Ctrl+Shift+R).

## Why not build on the server

The server has 1 GB of RAM, which is not enough to build the frontend. The
PC is the same kind of processor (x86), so images built here run there.

## Server settings (.env)

Settings live in `~/risch-wealth/.env` on the server, never in git:

```bash
ssh -i ~/risch_key ubuntu@140.245.220.59
nano ~/risch-wealth/.env
```

| Setting | What it is |
|---|---|
| `POSTGRES_PASSWORD` | Database password. Already set; never change it casually |
| `SMTP_PASS` | Gmail App Password for `rischwealth@gmail.com`. Without it no emails are sent (testimonials still wait in the staff portal) |
| `SMTP_USER`, `MAIL_TO` | Sending and receiving address, default `rischwealth@gmail.com` |
| `TESTIMONIAL_LINK_SECRET` | Optional; signs the Approve/Reject links in testimonial emails |

After editing, apply it with
`cd ~/risch-wealth && sudo docker compose up -d --no-build`.

A Gmail App Password is made at Google Account → Security → 2-Step
Verification → App passwords.

## Check that it worked

```bash
ssh -i ~/risch_key ubuntu@140.245.220.59
cd ~/risch-wealth
sudo docker compose ps                 # db (healthy), backend, frontend: Up
sudo docker compose logs -f backend    # errors, "Applied migration ...", mail problems
```

## If a deploy breaks something

Check out the last good commit, deploy again, and if the database was changed,
restore the backup taken just before the deploy:

```bash
git checkout <last-good-commit>
bash deploy/deploy.sh
git checkout main

# only if the data needs rolling back too, on the server:
cd ~/risch-wealth
sudo docker compose stop backend
sudo docker compose exec -T db psql -U risch -d postgres -c "DROP DATABASE risch" -c "CREATE DATABASE risch OWNER risch"
sudo docker compose exec -T db pg_restore -U risch -d risch --no-owner < /var/backups/risch/pre-deploy-YYYY-MM-DD-HHMM.dump
sudo docker compose start backend
```

**Never** run `docker compose down -v`: it deletes the database.

## Backups

- Every night at 02:15 the database is dumped to `/var/backups/risch` (14 days kept).
- Every deploy adds a `pre-deploy-*` dump in the same folder.
- Copy one to the PC now and then:
  `scp -i ~/risch_key "ubuntu@140.245.220.59:/var/backups/risch/*.dump" ~/risch-backups/`

## Setting up a new server from scratch

If the server is lost or moved (Oracle can reclaim idle free servers), follow
[deploy/DEPLOY-AMD-MICRO.md](deploy/DEPLOY-AMD-MICRO.md): network rules, host
setup script, first deploy, nginx/TLS and restoring the database.
