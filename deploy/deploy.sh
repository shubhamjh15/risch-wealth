#!/usr/bin/env bash
# Deploys this working tree to a server that's already running (see DEPLOY.md;
# a new server's first deploy is in DEPLOY-AMD-MICRO.md). GitHub Actions runs
# this on every push to main (.github/workflows/deploy.yml). It also works by
# hand, from the repo root in Git Bash with Docker Desktop running:
#   bash deploy/deploy.sh
#   bash deploy/deploy.sh --rollback    back to the version before the last deploy
#
# The server is too small to build images, so they're built here and copied
# over. If the site doesn't answer afterwards, the previous version goes back
# and this exits with an error. Override the defaults with
#   SERVER=ubuntu@1.2.3.4 KEY=~/other_key bash deploy/deploy.sh
set -euo pipefail

SERVER=${SERVER:-ubuntu@140.245.220.59}
KEY=${KEY:-$HOME/risch_key}
# Each must answer 200. /api/testimonials also proves the database is reachable.
CHECK_PATHS=${CHECK_PATHS:-/ /health /testimonials /api/testimonials}
remote() { ssh -i "$KEY" "$SERVER" "$@"; }

# Code only: migrations that already ran stay, and so does the data.
rollback() {
  echo "Rolling back to the previous version"
  remote 'cd ~/risch-wealth && sudo docker tag risch-wealth-frontend:previous risch-wealth-frontend:latest && sudo docker tag risch-wealth-backend:previous risch-wealth-backend:latest && cp docker-compose.previous.yml docker-compose.yml && sudo docker compose up -d --no-build'
}

# Asks this server for rischwealth.com directly, whatever DNS points at. The
# backend takes a while to start on this server, so each path gets a minute.
check_site() {
  local ip=${SERVER#*@} path code try
  for path in $CHECK_PATHS; do
    for try in 1 2 3 4 5 6 7 8 9 10 11 12; do
      code=$(curl -s -m 20 -o /dev/null -w '%{http_code}' --resolve "rischwealth.com:443:$ip" "https://rischwealth.com$path" || true)
      [ "$code" = 200 ] && break
      sleep 5
    done
    echo "$path -> $code"
    [ "$code" = 200 ] || return 1
  done
}

cd "$(dirname "$0")/.."

if [ "${1:-}" = "--rollback" ]; then
  rollback
  check_site
  exit
fi

echo "Deploying $(git rev-parse --short HEAD) to $SERVER"
if [ -n "$(git status --porcelain)" ]; then
  echo "Note: uncommitted changes are included in this deploy."
fi

echo "1/5 Backing up the live database"
remote 'cd ~/risch-wealth && sudo docker compose exec -T db pg_dump -U risch -Fc risch > /var/backups/risch/pre-deploy-$(date +%F-%H%M).dump && ls -t /var/backups/risch | head -1'

echo "2/5 Building images"
# The project name must stay risch-wealth: the server looks for images
# named risch-wealth-frontend and risch-wealth-backend.
POSTGRES_PASSWORD=unused docker compose -p risch-wealth build

echo "3/5 Sending images (10+ minutes from the PC, depending on the upload speed)"
remote 'cd ~/risch-wealth && sudo docker tag risch-wealth-frontend:latest risch-wealth-frontend:previous && sudo docker tag risch-wealth-backend:latest risch-wealth-backend:previous && cp docker-compose.yml docker-compose.previous.yml'
docker save risch-wealth-frontend:latest risch-wealth-backend:latest | gzip -1 | remote 'gunzip | sudo docker load'

echo "4/5 Copying docker-compose.yml"
scp -q -i "$KEY" docker-compose.yml "$SERVER:~/risch-wealth/"

echo "5/5 Restarting the app"
if ! remote 'cd ~/risch-wealth && sudo docker compose up -d --no-build && sleep 10 && sudo docker compose ps --format "{{.Service}}: {{.Status}}" && sudo docker compose logs backend --since 30s 2>&1 | tail -5' || ! check_site; then
  echo "The new version failed its checks."
  remote 'cd ~/risch-wealth && sudo docker compose logs backend --since 5m 2>&1 | tail -30' || true
  rollback
  exit 1
fi

# Old untagged images only; :latest and :previous stay.
remote 'sudo docker image prune -f >/dev/null'
echo "Done. Hard-refresh the browser (Ctrl+Shift+R) to see the changes."
