# Deploying rischwealth.com

The one guide for shipping this site, written so a new session or person can
do it without any other context. To build a replacement server or recover
data, see [deploy/DEPLOY-AMD-MICRO.md](deploy/DEPLOY-AMD-MICRO.md).

## Context

RISCH Wealth is a Bengaluru wealth firm (AMFI mutual fund and APMI PMS
distributor). The site is a React frontend, an Express API and Postgres, all
in Docker.

In October 2026 production moved to a new Oracle account. The client will not
use Oracle Pay As You Go, because they don't want a card that can be charged
automatically, so everything must stay inside Always Free. Free ARM (A1)
capacity in Hyderabad was unavailable, so the site runs on the much smaller
free x86 Micro. That is why images are built elsewhere and shipped to it: 1 GB
of RAM can't build the frontend. Since 2026-11-01 GitHub Actions does this on
every push to `main`. Don't suggest anything paid without saying what it costs.

```
Internet -> Cloudflare DNS (DNS only, no proxy)
         -> host nginx on the server (TLS, redirects)        port 443
         -> frontend container (nginx + prerendered React)   127.0.0.1:8080
         -> backend container (Express), /api only           internal
         -> db container (Postgres 17, volume risch-wealth_pgdata)
```

| | |
|---|---|
| Live site | https://rischwealth.com |
| Server | `ubuntu@140.245.220.59`, Oracle `risch-micro`, `VM.Standard.E2.1.Micro`, Hyderabad, 1 GB RAM + 4 GB swap |
| SSH key | `C:\Users\jha77\risch_key` on the PC |
| App folder on the server | `~/risch-wealth`: only `docker-compose.yml` and `.env`, no git checkout |
| Host nginx site | `/etc/nginx/sites-available/risch-wealth`, plus certificates from certbot |
| DNS | Cloudflare account `Rischwealth@gmail.com`: A record `rischwealth.com`, CNAME `www`. Keep them **DNS only** |
| Git | Work on `redesign`; `main` on remote `mine` (`shubhamjh15/risch-wealth`) is what's live. This repo commits as `shubhamjh15`. Remote `origin` (`omkatiyar`) is read-only for this account |

## Rules for whoever deploys

- **Pushing to `main` deploys to the live site**, within minutes. Push to `main`
  only when asked to deploy, or for a push that only changes `.md` files. "Can
  we deploy?" is a question, not a go-ahead. Work on `redesign` until then.
- **Agents are blocked** by the auto-mode safety check from reading the
  production database, adding SSH keys to the server and running
  `deploy.sh --rollback`. Don't work around that: give the user the command.
- **Never run `docker compose down -v`** on the server: it deletes the database.
- **Use a throwaway copy for anything that writes data** (see "Test before
  deploying"). Don't create test accounts or testimonials on the live site.

## Deploy

Push to `main` on the `mine` remote:

```bash
git push mine redesign redesign:main
```

GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml))
then runs `deploy/deploy.sh`, in **about 2 minutes**. Follow it at
https://github.com/shubhamjh15/risch-wealth/actions. A failed run shows red and
GitHub emails the person who pushed. Pushes that change only `.md` files don't
deploy, and two quick pushes deploy one after the other. To re-run without a new
commit, use **Run workflow** on that page.

An agent can watch the run without logging in, while the repo is public (`gh` is
not logged in on the PC):

```bash
curl -s "https://api.github.com/repos/shubhamjh15/risch-wealth/actions/runs?per_page=1" | grep -E '"(head_sha|status|conclusion)"'
```

Only the app goes out this way. Changes to `.env` or to the host nginx site
(`deploy/nginx.conf`) are made by hand on the server.

The script:

1. backs up the live database to `/var/backups/risch/pre-deploy-<date>.dump`
2. builds the frontend and backend images
3. tags what's running as `:previous` and streams the new images to the server
4. copies `docker-compose.yml` to the server
5. restarts what changed (migrations run when the backend starts) and checks
   that `/`, `/health`, `/testimonials` and `/api/testimonials` answer 200

If a check fails, it puts the previous version back and the run goes red. The
site stays up throughout, with only a few seconds of downtime at the restart.

Then hard-refresh the browser (Ctrl+Shift+R). Old tabs keep showing old code.

**By hand, if GitHub is unavailable.** On the PC, in Git Bash, from the repo
root, with Docker Desktop running, on the commit that `main` points to:

```bash
git status                # should be clean: uncommitted changes would go live too
bash deploy/deploy.sh
```

This takes 10 to 30 minutes, because the upload depends on the PC's connection.
If an agent runs it, run it in the background, and don't pipe it through `tail`.

**What Actions needs** (already set up): the repo secret `DEPLOY_SSH_KEY` holds
a key used only for this, whose public half is in the server's
`~/.ssh/authorized_keys` as `github-actions-deploy@risch-wealth`, and the
server's host key is pinned in the workflow. A new server means updating both.
To cut off Actions' access, delete that line from `authorized_keys`. The private
key is also at `C:\Users\jha77\risch_deploy_key` on the PC.

## Check that it worked

```bash
curl -s https://rischwealth.com/health      # {"ok":true}
ssh -i ~/risch_key ubuntu@140.245.220.59
cd ~/risch-wealth
sudo docker compose ps                      # db (healthy), backend and frontend Up
sudo docker compose logs backend --since 10m
```

Good to know:

- `backend: Up 3 hours` right after a deploy is normal when its code didn't
  change. Compose only recreates what changed.
- Don't compare image IDs to see what's running: the running container's ID
  can differ from the tagged one even when the code is the same. To be sure,
  compare file hashes between the container and the commit, ignoring line
  endings (images built by hand on the PC come from Windows files with CRLF;
  those built by Actions have LF).
- `/client-portal` and `/employee-portal` redirect to login when logged out,
  and their API calls return 401 first. That is correct, not an error.
- A browser visit sees 404 at `/nope` on purpose; unknown pages are real 404s.

After a change to login, orders or testimonials, ask the user to try it with
a real account. Agents can't read the production database: the auto-mode safety
check blocks it, and that block shouldn't be worked around.

## Test before deploying

Run a full throwaway copy on the PC. Port 5432 is taken by another project
here, so use an override file kept **outside** the repo:

```yaml
# compose.e2e.yml
services:
  db:
    ports: !reset []
  frontend:
    ports: !override ["127.0.0.1:8091:80"]
```

```bash
POSTGRES_PASSWORD=e2etest123 docker compose -p risch-e2e -f docker-compose.yml -f compose.e2e.yml up -d --build
docker exec risch-e2e-backend-1 node src/db/userAdmin.js create-admin ADM1 admin@e2e.test "E2E Admin"   # prints a password
# test at http://127.0.0.1:8091
POSTGRES_PASSWORD=e2etest123 docker compose -p risch-e2e -f docker-compose.yml -f compose.e2e.yml down -v
```

The `-p risch-e2e` matters: `down -v` then only touches the throwaway copy. It
has no mail password, so emails are only logged. API calls that change data
must send `Content-Type: application/json`, or they get a 415.

## Server settings (.env)

These live in `~/risch-wealth/.env` on the server, never in git.

| Setting | What it is |
|---|---|
| `POSTGRES_PASSWORD` | Database password. Set when the database was created; changing only this line breaks the backend (see the new-server guide for rotating it) |
| `SMTP_PASS` | Gmail App Password for `rischwealth@gmail.com` (Google Account > Security > 2-Step Verification > App passwords). Without it no mail is sent, and testimonials still wait in the staff portal |
| `SMTP_USER`, `MAIL_TO` | Sender and recipient, both default to `rischwealth@gmail.com` |
| `CORS_ORIGIN` | Extra origins allowed to call the API |
| `TESTIMONIAL_LINK_SECRET` | Optional. Signs the Approve/Reject links in emails. If unset it's derived from the database password, so changing that password breaks links already sent |

Apply changes with `cd ~/risch-wealth && sudo docker compose up -d --no-build`.

`TRUST_PROXY` is set to 2 in `docker-compose.yml`: there are two nginx hops in
front of the backend. Rate limits and session IPs depend on it, so change it
only if the number of proxies changes. With the wrong value, every visitor
appears to share one IP.

## Everyday commands

On the server, in `~/risch-wealth`:

```bash
sudo docker compose exec backend npm run user:list
sudo docker compose exec backend npm run user:create-admin -- <EMPID> <email> "<Full Name>"
sudo docker compose exec backend npm run user:disable -- <email or EMPID>
sudo docker compose logs backend | grep NAV     # the NAV import needs outbound HTTPS to portal.amfiindia.com
sudo docker compose restart                     # restart without rebuilding
```

## If a deploy breaks something

A failed check rolls back by itself. If the checks passed but something is still
wrong, go back to the version before the last deploy straight away (on the PC,
no build or upload):

```bash
bash deploy/deploy.sh --rollback
```

Then fix `main`, because the next push deploys whatever it holds. To undo a bad
commit: `git revert <commit> && git push mine main`.

Rolling back restores code only: migrations that already ran stay. Only if the
data must be rolled back too (**this loses anything saved since the
backup**), on the server:

```bash
cd ~/risch-wealth
sudo docker compose stop backend
sudo docker compose exec -T db psql -U risch -d postgres -c "DROP DATABASE risch" -c "CREATE DATABASE risch OWNER risch"
sudo docker compose exec -T db pg_restore -U risch -d risch --no-owner < /var/backups/risch/pre-deploy-YYYY-MM-DD-HHMM.dump
sudo docker compose start backend
```

## Backups

- Every night at 02:15 the database is dumped to `/var/backups/risch`, and
  dumps older than 14 days are deleted. Each deploy adds a `pre-deploy-*` dump.
- **These are only on the server.** Oracle can reclaim idle Always Free
  servers, which would take the backups with it, so copy them off regularly:

```bash
scp -i ~/risch_key "ubuntu@140.245.220.59:/var/backups/risch/*.dump" ~/risch-backups/
```

## Open items (as of 2026-11-01)

Delete each line here once it's done.

- **Rollback not proven on a broken release:** the automatic rollback ran on
  2026-11-01 after a check made to fail, but with identical images on both sides.
  No rollback has yet swapped between two different versions. After the next
  real failure or `--rollback`, confirm the running image changed, then delete
  this line.
- **Public repo:** client names and portraits are still in this repo's code and
  history, and in the LinkedIn list in `README.md`, all publicly readable. Make
  it private, which still leaves Actions 2,000 free minutes a month.
- **Testimonials are anonymous for now:** at the client's request, the names,
  portraits and employers came off on 2026-11-01 until real testimonials arrive
  (see `fe/src/data/testimonials.js`). The quotes that remain are still
  placeholder copy, and should be replaced by real ones. `git revert cd1e35d`
  brings the old cards back.
- **Old server:** `80.225.229.175` is still running and served the site until
  DNS moved on 2026-11-01. The new database came from a disk image of Oct 20.
  Confirm nothing was added on the old site after that, and only then shut it
  down.
- **Off-server backups:** not set up. The plan was a nightly upload to a
  `risch-backups` Oracle bucket through a write-only pre-authenticated request.
- **Temporary link:** https://risch.140-245-220-59.sslip.io and the bare IP are
  served by the nginx site `test-ip`. Once nobody uses them:
  `sudo rm /etc/nginx/sites-enabled/test-ip && sudo systemctl reload nginx`.
- **Export file:** delete `risch-image.qcow2` from the `risch-export` bucket
  once the old server's data question is settled.
- **Compliance wording:** the home page says "We manage portfolios", but RISCH
  is a distributor, not a portfolio manager. The client should review it.
