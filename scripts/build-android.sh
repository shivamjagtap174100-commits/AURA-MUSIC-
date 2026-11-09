#!/usr/bin/env bash
# ==============================================================================
# AURA MUSIC - Android APK & AAB Automated Build Script (Bash)
# ==============================================================================

set -e

TARGET=${1:-"apk-debug"}

echo "=========================================================="
echo "       AURA MUSIC — Android Build Generator              "
echo "=========================================================="

echo -e "\n[Step 1/3] Building Web Assets (Vite + TypeScript)..."
npm run build

echo -e "\n[Step 2/3] Syncing Capacitor Native Android Project..."
npx cap sync android

echo -e "\n[Step 3/3] Compiling Android Gradle Target: $TARGET..."
cd android

chmod +x gradlew

if [ "$TARGET" == "apk-debug" ] || [ "$TARGET" == "all" ]; then
    echo "Building Debug APK..."
    ./gradlew assembleDebug
    echo -e "\n✓ Debug APK created at: android/app/build/outputs/apk/debug/app-debug.apk"
fi

if [ "$TARGET" == "apk-release" ] || [ "$TARGET" == "all" ]; then
    echo "Building Release APK..."
    ./gradlew assembleRelease
    echo -e "\n✓ Release APK created at: android/app/build/outputs/apk/release/app-release-unsigned.apk"
fi

if [ "$TARGET" == "aab" ] || [ "$TARGET" == "all" ]; then
    echo "Building Google Play AAB Bundle..."
    ./gradlew bundleRelease
    echo -e "\n✓ Google Play AAB created at: android/app/build/outputs/bundle/release/app-release.aab"
fi

cd ..
echo "=========================================================="
echo "Android Build Completed Successfully!"
echo "=========================================================="

