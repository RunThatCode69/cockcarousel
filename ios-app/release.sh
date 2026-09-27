#!/usr/bin/env bash
# Autonomous ship:  bash release.sh beta     -> TestFlight
#                   bash release.sh release  -> App Store, submitted for review
# Reads .env (Team ID + App Store Connect API key). Bumps the build number every run.
set -euo pipefail
cd "$(dirname "$0")"
[ -f .env ] || { echo "✖ .env missing — copy .env.example to .env and fill it in"; exit 1; }
set -a; source .env; set +a
command -v fastlane >/dev/null || { echo "▶ installing fastlane"; brew install fastlane || sudo gem install fastlane -NV; }
npx cap sync ios
cd fastlane && fastlane "${1:-beta}"
