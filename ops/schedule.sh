#!/bin/bash
# Install, remove or inspect the local schedule (a launchd agent running ops/run-jobs.sh every 15 minutes).
#   ops/schedule.sh install | uninstall | status
# The label comes from SITE_NAME in config/settings.py (the product name lives in one place).
set -euo pipefail
cd "$(dirname "$0")/.."
REPO="$(pwd)"
NAME="$(sed -n 's/^SITE_NAME = "\(.*\)"/\1/p' config/settings.py | tr '[:upper:] ' '[:lower:]-')"
LABEL="local.${NAME:-timeline}.run-jobs"
DEST="$HOME/Library/LaunchAgents/$LABEL.plist"
case "${1:-status}" in
  install)
    mkdir -p var/logs "$HOME/Library/LaunchAgents"
    sed -e "s#@LABEL@#$LABEL#g" -e "s#@REPO@#$REPO#g" ops/launchd/run-jobs.plist >"$DEST"
    launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
    launchctl bootstrap "gui/$(id -u)" "$DEST"
    echo "installed $LABEL ($DEST): every 15 minutes; logs in $REPO/var/logs/"
    ;;
  uninstall)
    launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
    rm -f "$DEST"
    echo "removed $LABEL"
    ;;
  status)
    if launchctl print "gui/$(id -u)/$LABEL" >/dev/null 2>&1; then
      launchctl print "gui/$(id -u)/$LABEL" | grep -E "state|last exit|runs" || true
    else
      echo "$LABEL is not installed (make schedule-install)"
    fi
    ls -t var/logs/run-jobs-*.log 2>/dev/null | head -1 | xargs -I{} tail -5 {} || true
    ;;
  *) echo "usage: $0 install|uninstall|status" >&2; exit 2 ;;
esac
