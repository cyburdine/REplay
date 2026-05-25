#!/usr/bin/env bash
# Deploy site/dist to cyb-proto4 with atomic-symlink swap.
# Rollback: ssh cyb-proto4 "ln -sfn /opt/REplay/releases/<prev-ts> /opt/REplay/current"

set -euo pipefail

SITE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${HOST:-cyb-proto4}"
REMOTE_BASE="/opt/REplay"
RELEASE_TS="$(date -u +%Y%m%d-%H%M%S)"
REMOTE_RELEASE="$REMOTE_BASE/releases/$RELEASE_TS"
KEEP_RELEASES="${KEEP_RELEASES:-5}"

echo "→ Building site/"
cd "$SITE_DIR"
npm ci
npm run build

echo "→ Creating remote release dir $REMOTE_RELEASE"
ssh "$HOST" "mkdir -p '$REMOTE_RELEASE'"

echo "→ Rsyncing dist/ to $HOST:$REMOTE_RELEASE/"
rsync -az --delete --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r \
    "$SITE_DIR/dist/" "$HOST:$REMOTE_RELEASE/"

echo "→ Atomic symlink swap"
ssh "$HOST" "ln -sfn '$REMOTE_RELEASE' '$REMOTE_BASE/current'"

echo "→ Pruning old releases (keep last $KEEP_RELEASES)"
ssh "$HOST" "cd '$REMOTE_BASE/releases' && ls -1t | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf"

echo "✓ Deployed $RELEASE_TS"
echo "  Live at: https://replay.cyburdine.com/  (after DNS propagation)"
echo "  Direct origin check:"
echo "    curl -kI --resolve replay.cyburdine.com:443:10.0.22.35 https://replay.cyburdine.com/"
