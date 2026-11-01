# RISCH Wealth — Backend

Express API. Currently owns one thing: the risk-profiler's question bank,
suitability grid, tier allocations, and the scoring math that turns a set
of answers into a recommended portfolio. This used to live entirely in
the frontend (`fe/src/pages/RiskProfiler/data.js` + `scoring.js`) — it
was moved here so the "weights" aren't stuck in a static JS bundle.

## Run

Locally without Docker:

```bash
npm install
cp .env.example .env   # optional locally; see env vars below
npm start        # http://localhost:4000
npm run dev       # same, but restarts on file changes
```

In dev, the frontend talks to this over Vite's dev-server proxy (see
`fe/vite.config.js`), so no CORS setup is needed locally either.

In production this runs as a Docker container (see `Dockerfile` here and
`docker-compose.yml` at the repo root) — you normally won't run this
directly on the server. Full steps: `../DEPLOY.md`.

### Environment variables (`.env`, see `.env.example`)

- `PORT` — default `4000`.
- `HOST` — default `127.0.0.1` when run directly with `npm start`
  (nothing but a same-machine reverse proxy should reach it). The Docker
  Compose setup overrides this to `0.0.0.0` inside the container, since
  `127.0.0.1` there would mean "only this container," making it
  unreachable from the frontend container too — the container boundary
  itself is what keeps it off the public internet, not the bind address.
- `CORS_ORIGIN` — comma-separated allowlist for direct (non-proxied) API
  access from non-localhost origins. Defaults to `https://rischwealth.com`
  + `https://www.rischwealth.com`. Any `localhost`/`127.0.0.1` origin
  (any port) is always allowed, for local dev. Same-origin requests
  through the nginx/Vite proxy don't need this at all.
- `AMFI_NAV_URL` — optional. Defaults to AMFI's public daily NAV file,
  `https://portal.amfiindia.com/spages/NAVAll.txt`.

## Endpoints

- `GET /api/risk-profiler/config` — question bank + tier allocations, used
  by the frontend to render the quiz and the report.
- `POST /api/risk-profiler/score` — body `{ answers: { q1: <points>, ... } }`
  for all 8 questions. Returns the computed time-horizon/risk-preference
  scores, the recommended tier, and every tier's full allocation +
  granular breakdown (the report needs all four, not just the
  recommended one, for its tabs). This is the only place the tier is
  ever decided — the frontend just displays whatever this returns.

## Where the config lives right now

`src/riskProfiler/config.js` — a hard-coded object (`getActiveConfig()`).
This is a deliberate stepping stone, not the end state:

- **Not yet done:** Postgres-backed config, versioning (so a proposal
  generated last month can still be explained even if weights change
  later), and a superAdmin UI to edit weights from the frontend.
- **Already true today:** the scoring math (`src/riskProfiler/scoring.js`)
  is written to take a `config` object as a parameter rather than
  importing hard-coded constants — so swapping `getActiveConfig()` for a
  real DB read later shouldn't require touching the scoring logic itself.

`POST /score` also validates that every submitted answer's point value
actually matches one of that question's real options
(`validateAnswers` in `scoring.js`) — this catches obviously-tampered
requests, though it isn't full protection since points are still visible
to the browser today. Once questions have stable option ids and the
frontend submits those instead of raw points, this can be tightened to
reject anything except a known option id.

## Planned scope (future phases)

- PostgreSQL for the risk-profiler config (with version history) and for
  client, portfolio, investment, and report data
- RBAC (`superAdmin` and others) so config edits are gated
- Endpoints to replace the current client-side-only contact form
  (`fe/src/pages/Contact.jsx`)
- Authentication, client management, portfolio/investment data, dashboards

## Security notes for when this grows

- No credentials, API keys, or secrets committed to this repo — use
  environment variables / a secrets manager instead.
- All client financial data lives server-side (Postgres, once added),
  never in the frontend bundle or browser storage.
- Keep this service as the only thing with direct database access; the
  frontend should only ever talk to it over an authenticated API.
- This process must not be reachable on the public IP directly. In the
  Docker setup it has no published port at all (see `docker-compose.yml`)
  — only the frontend container can reach it, over the internal Docker
  network.

## Database (PostgreSQL)

Postgres 17 runs as the `db` service in `docker-compose.yml`. The
backend reaches it over the internal Docker network; it's also published
on the server's loopback (`127.0.0.1:5432`) so admins can connect with
DBeaver / TablePlus / VS Code through an SSH tunnel. Never publish it on
0.0.0.0. Data lives in the
`pgdata` named volume, so it survives restarts and `--build` redeploys.
**`docker compose down -v` deletes the volume and all data — never use
`-v` in production.**

**Setup (once per server):** create `.env` at the repo root (next to
`docker-compose.yml`, not committed):

```bash
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=')" > .env
```

Compose refuses to start without it. Don't change the password after the
database has been created (Postgres only reads it on first start).

**Schema:** `migrations/*.sql`, applied in filename order on every backend
start (`src/db/migrate.js`, tracked in `schema_migrations`, guarded by an
advisory lock). To change the schema, add a new numbered file; never edit
an applied one.

**Tables (001_users_and_sessions.sql, 002_client_accounts.sql):**
- `users`: full_name, employee_id (unique, stored upper-case), email
  (unique, lower-case), phone, password_hash (bcrypt, cost 12), role
  (`client`/`employee`/`admin`), status (`pending`/`active`/`disabled`),
  created_by, timestamps. employee_id is required for staff, empty for
  clients.
- `sessions`: SHA-256 hash of the session token (the token itself only
  ever lives in the browser's cookie), user, expiry (7 days), IP, user
  agent. Expired rows are purged every 6 hours.

## Accounts (`src/auth/`, `src/admin/`)

One `users` table, two portals:

- **Clients** (`role = 'client'`) sign up themselves on `/client-login`:
  `POST /api/auth/signup { fullName, email, phone?, password }`. Active
  immediately. No employee ID.
- **Staff** (`employee` / `admin`) have **no public sign-up**. Admins
  create them from the Team accounts panel on `/employee-login`
  (`/api/admin/staff`, admin-only: list, create, reset password,
  disable/activate, change role; an admin can't change their own
  account there). Disabling or resetting a password signs the person
  out everywhere.
- `POST /api/auth/login { identifier, password, portal }`: portal
  `client` accepts client emails only; `staff` accepts staff email or
  employee ID only. A wrong portal looks like a wrong password.
- `POST /api/auth/logout`, `GET /api/auth/me`.
- Session: httpOnly, SameSite=Lax cookie `risch_session` (Secure in
  production), 7 days; only its SHA-256 hash is stored.
- Sign-up and login are rate-limited to 20 requests per IP per 15 min.
  `/api/auth` and `/api/admin` reject non-JSON writes (415), which with
  SameSite cookies blocks cross-site form (CSRF) attacks.

**First admin** (once, on the server):

```bash
docker compose exec backend npm run user:create-admin -- RW001 you@rischwealth.com "Your Name"
```

It prints a one-time temporary password. After that, manage everyone
from the site. The CLI remains for recovery:

```bash
docker compose exec backend npm run user:list
docker compose exec backend npm run user:make-admin -- RW101
docker compose exec backend npm run user:approve -- RW101
docker compose exec backend npm run user:disable -- RW101
```

## Client portal and staff inbox (`src/client/`, `src/staff/`)

- `/api/client/*` (clients only; every query is scoped to the signed-in
  client): `GET overview` (profile, latest risk profile, recent
  requests, request topics), `PATCH profile { fullName?, phone? }`,
  `GET risk-profiles`, `GET risk-profiles/:id/report` (a saved
  assessment's full proposal data, rebuilt from its stored answers with
  the same scoring; 409 if it was taken on an older questionnaire
  version), `POST requests { topic, message }` (max 10 open).
- Risk profiler: `POST /api/risk-profiler/score` still works for anyone;
  when a signed-in client submits, the result (answers, scores, tier,
  allocation, optional amount, config version) is saved to
  `risk_profiles` and the response includes `savedToAccount: true`.
- `/api/staff/*` (employees and admins): `GET dashboard` (client count,
  pending requests, latest requests; admins also get active portfolios,
  held funds, latest NAV date and the latest purchases), `GET
  requests?status=` (default open + in progress; `open`, `in_progress`,
  `closed`, `all`; includes `counts` per status),
  `PATCH requests/:id { status }`.
- `POST /api/auth/password { currentPassword, newPassword }` for any
  signed-in user; signs out their other devices.
- Tables (003_client_portal.sql): `risk_profiles`, `client_requests`.

## Client portfolios (`src/portfolio/`, `src/admin/orders.js`)

Portfolios are built from **purchase orders that admins record** for
each client (no external APIs). Current values come from AMFI's free
daily NAV file.

- **Tables** (004_portfolio.sql):
  - `funds`: **only the funds clients hold**. A fund is added the first
    time an order uses it, with its AMFI scheme code, name, AMC,
    category, asset class (Equity, Debt, Hybrid, Commodities,
    International, Other) and latest NAV.
  - `nav_history`: the daily NAV of those funds (for a performance
    chart later).
  - `transactions`: each client's orders. Type is `purchase` only for
    now. Orders are never deleted; a mistake is **voided** with a reason,
    and who entered or voided it is recorded.
  - `nav_imports`: one row per NAV update run.
- **NAV updates** (`src/portfolio/amfi.js`): the backend downloads the
  AMFI file (about 1.5 MB, around 14,000 schemes) and updates the NAV
  of the funds in `funds` only. It runs 10 s after start and then every
  hour, but only if no successful update happened in the last 6 hours.
  Admins can also run it with "Update now". Fund search for the order
  form uses an in-memory copy of the file (refreshed every 6 hours);
  nothing else from it is stored.
- **Maths** (`src/portfolio/calc.js`): units, invested, current value,
  gain, absolute return, and XIRR per fund, per asset class and overall.
  XIRR is shown only once money has been invested for 30 days. A fund
  with no NAV yet is valued at cost.
- **Admin API** (`/api/admin/*`, admins only):
  - `GET clients?q=`: search clients.
  - `GET schemes?q=`: search AMFI funds by name, AMC, scheme code or
    ISIN. Returns a suggested asset class, plus the stored class if a
    client already holds the fund.
  - `GET portfolios?q=&page=`: every active client with current value,
    invested, number of funds and last purchase recorded (10 per page).
  - `GET clients/:id/portfolio`: client details, holdings plus every
    order, including voided ones.
  - `POST orders { userId, schemeCode, assetClass?, tradeDate, amount, nav, units?, folio?, notes? }`.
    The date can't be in the future. Units default to amount ÷ NAV; an
    override must be within 1% of that (stamp duty). A buying NAV more
    than 20× away from the fund's current NAV is rejected, which catches
    a NAV typed for the wrong fund. Passing `assetClass` sets it for the
    fund (so for every client holding it).
  - `POST orders/:id/void { reason }`.
  - `GET nav-status`, `POST nav-refresh`.
- **Client API:** `GET /api/client/portfolio` (summary, allocation with
  per-class XIRR, holdings) and
  `GET /api/client/transactions?page=&from=&to=&fund=` (10 per page).
- DATE columns are returned as `YYYY-MM-DD` strings (`src/db/pool.js`),
  so trade dates never shift with the server's timezone.

**Backups:** not automated yet. Manual dump:

```bash
docker compose exec db pg_dump -U risch risch > backup-$(date +%F).sql
```

## Change log

Newest first. Frontend changes are listed in `../fe/README.md`.

**Portfolio value chart**
- Migration 006: `funds.history_from` (how far back `nav_history` has been
  filled for a fund).
- `src/portfolio/history.js`: fills `nav_history` with past NAVs from
  AMFI's historical NAV report (same public source, no key), downloaded
  per fund house (AMFI's fund-house codes are listed in the file; an
  unknown one is found by a one-off scan) in one-year windows, keeping
  only held funds' rows. Runs after every recorded purchase and with the
  hourly NAV check; does nothing once every fund is filled back to its
  first purchase.
- `buildHistory` in `calc.js`: value per NAV date = units held that day ×
  that day's NAV (carried over holidays), plus the amount invested so far.
- `GET /api/client/portfolio/history` and
  `GET /api/admin/clients/:id/history` return `{ points, complete }`.

**Session status**
- `GET /api/auth/status` returns `{ user }`, `null` when nobody is signed
  in (200, not 401), for public pages that adapt to a signed-in client.

**Risk proposal download**
- Migration 005: `risk_profiles.age` (saved from now on; older
  assessments have none). `POST /api/risk-profiler/score` accepts `age`
  and returns `riskProfileId` when saved.
- `GET /api/client/risk-profiles/:id/report` for the portal's "Download
  proposal (PDF)".

**NAV refresh result**
- `POST /api/admin/nav-refresh` also returns `fundsChanged` (funds that
  moved to a newer NAV date). Same-date NAVs are still rewritten, so
  AMFI's occasional corrections are picked up.

**Staff portal**
- `GET /api/staff/dashboard`, `GET /api/admin/portfolios`, request counts
  per status, client phone/status in the admin client view, and
  `nav-status` now reports the latest NAV date across held funds.

**Client portfolios**
- Migration 004 (`funds`, `nav_history`, `transactions`, `nav_imports`).
  Admin order entry and void API, AMFI daily NAV import for held funds
  only, portfolio and XIRR calculations, client portfolio and
  transactions endpoints. See "Client portfolios" above.

**Client portal**
- Migration 003 (`risk_profiles`, `client_requests`), client portal API,
  staff request inbox API, self-service password change, risk-profiler
  results saved for signed-in clients.

**Client accounts, admin-managed staff**
- Migration 002: `client` role, nullable employee_id (required for
  staff), phone, created_by.
- Public sign-up now creates client accounts only. Staff are created by
  admins (`src/admin/routes.js`); `SIGNUP_AUTO_APPROVE` is no longer
  used. Login takes a `portal`. JSON-only guard on account endpoints.
  New CLI: `user:create-admin`.

**PostgreSQL + employee accounts**
- New `db` service (postgres:17-alpine, `pgdata` volume, healthcheck;
  the backend waits for it). Requires `POSTGRES_PASSWORD` in `.env`.
- Migration runner, `users` and `sessions` tables, sign-up / login /
  logout / me endpoints, account CLI (`npm run user:*`). See "Database"
  and "Employee accounts" above.
- New dependencies: `pg`, `bcryptjs`, `express-rate-limit`. JSON bodies
  limited to 20 KB.

The earlier entries below didn't change the backend's own code; they're
about how it's deployed and reached.

**Private-wealth redesign (frontend only)**
- No API changes. The contact form still has no endpoint here. For now
  the frontend opens a pre-filled email to the firm's inbox instead. A
  future `POST /api/enquiries` (send and/or store) should replace that.
  It will need the same care as client data, since enquiries can include
  investable-asset details.
- The risk profiler's result screen now labels the output a preliminary
  assessment, not a recommendation. The tier logic in
  `src/riskProfiler/` is unchanged.

**SEO audit fixes**
- `robots.txt` (served by the frontend) now has `Disallow: /api/`, so
  search engines don't crawl these endpoints.
- The frontend container's nginx now gzips responses, including JSON
  from `/api/` (`gzip_types` includes `application/json`).
- HTTP/2 on the host nginx, plus a `www.rischwealth.com` →
  `rischwealth.com` redirect, so every browser request comes from
  `https://rischwealth.com`, which the default `CORS_ORIGIN` already allows.

**Production actually running on Docker**
- Docker Engine + Compose plugin installed on the server
  (`get.docker.com`). The `ubuntu` user is in the `docker` group.
- The host nginx site (`/etc/nginx/sites-available/risch-wealth`) was
  still serving an old static build from `/var/www/risch-wealth`, so
  nothing proxied `/api` and the live risk profiler couldn't reach this
  service. It now proxies everything to the frontend container
  (`127.0.0.1:8080`), which proxies `/api/` and `/health` here. The
  pre-switch config is backed up at `~/risch-wealth-nginx.backup`.
- Check it's live with `curl -s https://rischwealth.com/health`, which
  should return `{"ok":true}`, not HTML.
- Deploy: `git pull && docker compose up -d --build` from the repo root.
  `docker compose restart` doesn't pick up code changes.
