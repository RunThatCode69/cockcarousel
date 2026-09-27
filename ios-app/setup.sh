#!/usr/bin/env bash
# One-time setup on the Mac. Run from the ios-app folder:  bash setup.sh
# Needs: Xcode (App Store), Xcode command line tools, Node 18+. CocoaPods is NOT needed (Capacitor 7 uses SPM).
set -euo pipefail
cd "$(dirname "$0")"
echo "▶ installing node deps"; npm install
if [ ! -d ios ]; then echo "▶ creating Xcode project"; npx cap add ios --packagemanager SPM; fi
echo "▶ generating icons + splash"; npm run assets
echo "▶ configuring Info.plist (hide status bar, landscape+portrait, iPhone only)"
PL=ios/App/App/Info.plist
/usr/libexec/PlistBuddy -c "Delete :UIStatusBarHidden" "$PL" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :UIStatusBarHidden bool true" "$PL"
/usr/libexec/PlistBuddy -c "Delete :UIViewControllerBasedStatusBarAppearance" "$PL" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :UIViewControllerBasedStatusBarAppearance bool false" "$PL"
/usr/libexec/PlistBuddy -c "Delete :UIRequiresFullScreen" "$PL" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :UIRequiresFullScreen bool true" "$PL"
/usr/libexec/PlistBuddy -c "Delete :ITSAppUsesNonExemptEncryption" "$PL" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :ITSAppUsesNonExemptEncryption bool false" "$PL"   # skips the export-compliance question on every upload
# iPhone only (no iPad screenshots needed for review)
sed -i '' 's/TARGETED_DEVICE_FAMILY = "1,2";/TARGETED_DEVICE_FAMILY = 1;/g' ios/App/App.xcodeproj/project.pbxproj
echo "▶ syncing web build into the app"; npx cap sync ios
echo
echo "✅ Xcode project ready at ios/App/App.xcworkspace"
echo "   Next: copy .env.example to .env, fill in your Team ID + App Store Connect API key, then:  npm run release"
echo "   (or open it in Xcode:  npm run open)"
