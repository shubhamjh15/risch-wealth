# RISCH Wealth

Website for RISCH Wealth, a Bengaluru wealth firm: React frontend (`fe/`),
Express API (`be/`) and Postgres, in Docker, live at https://rischwealth.com.

**Before deploying, or touching the server, DNS or backups, read
[DEPLOY.md](DEPLOY.md).** It has the architecture, commands, rollback steps and
the current open items.

## Deploying

- **Pushing to `main` on remote `mine` deploys to the live site, automatically,
  in about 2 minutes** (GitHub Actions, unless the push only changes `.md` files).
- Work on `redesign`. To deploy, when asked: `git push mine redesign redesign:main`.
- A question like "can we deploy?" is not a go-ahead. Answer it and wait.
- A failed site check rolls back by itself. Rollback restores code, not data.
- Don't use `origin` (`omkatiyar`): this account can only read it. Commit as
  `shubhamjh15`, which this repo is already configured to do.

## Never

- `docker compose down -v` on the server: it deletes the database.
- Test accounts or test testimonials on the live site. Use the throwaway copy
  described in DEPLOY.md.
- Anything paid. The client refuses Oracle Pay As You Go, so hosting has to stay
  on Always Free. Say what something costs before suggesting it.

## Limits on agents

The auto-mode safety check blocks agents from reading the production database,
adding SSH keys to the server, and running `deploy.sh --rollback`. Don't work
around that: give the user the command to run.

## Compliance

RISCH is an AMFI mutual fund and APMI PMS **distributor**, not a SEBI adviser or
portfolio manager. Site copy must not present the service as "advice", project
returns, or use branded model portfolios.

## Testimonials are anonymous right now

At the client's request (2026-11-01), the 15 cards in
`fe/src/data/testimonials.js` show no name, photo, initial or employer until real
testimonials arrive. The quotes are placeholder copy, not real client statements.
Don't add those details back unless asked. `git revert cd1e35d` restores them.
Testimonials submitted through the site still show their name and photo after
approval.
