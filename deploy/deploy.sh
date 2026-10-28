#!/usr/bin/env bash
# Deploys this working tree to production (see DEPLOY.md). Run from the repo
# root in Git Bash, with Docker Desktop running:
#   bash deploy/deploy.sh
#
# The server is too small to build images, so they're built here (this PC is
# x86 like the server) and copied over. Override the defaults with
#   SERVER=ubuntu@1.2.3.4 KEY=~/other_key bash deploy/deploy.sh
set -euo pipefail

SERVER=${SERVER:-ubuntu@140.245.220.59}
KEY=${KEY:-$HOME/risch_key}
remote() { ssh -i "$KEY" "$SERVER" "$@"; }

cd "$(dirname "$0")/.."
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

echo "3/5 Copying docker-compose.yml"
scp -q -i "$KEY" docker-compose.yml "$SERVER:~/risch-wealth/"

echo "4/5 Sending images (a few minutes)"
docker save risch-wealth-frontend:latest risch-wealth-backend:latest | gzip -1 | remote 'gunzip | sudo docker load'

echo "5/5 Restarting the app"
remote 'cd ~/risch-wealth && sudo docker compose up -d --no-build && sleep 10 && sudo docker compose ps --format "{{.Service}}: {{.Status}}" && sudo docker compose logs backend --since 30s 2>&1 | tail -5'

# Asks this server for rischwealth.com directly, whatever DNS points at.
ip=${SERVER#*@}
for path in / /testimonials /api/testimonials; do
  echo "$path -> $(curl -s -m 20 -o /dev/null -w '%{http_code}' --resolve "rischwealth.com:443:$ip" "https://rischwealth.com$path")"
done
echo "Done. Hard-refresh the browser (Ctrl+Shift+R) to see the changes."
