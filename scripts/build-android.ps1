# ==============================================================================
# AURA MUSIC - Android APK & AAB Automated Build Script (PowerShell)
# ==============================================================================

param (
    [string]$Target = "apk-debug" # Options: "apk-debug", "apk-release", "aab", "all"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       AURA MUSIC — Android Build Generator              " -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Cyan

# Step 1: Build Web App
Write-Host "`n[Step 1/3] Building Web Assets (Vite + TypeScript)..." -ForegroundColor Yellow
npm.cmd run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Web build failed! Please check code errors." -ForegroundColor Red
    exit 1
}

# Step 2: Sync with Capacitor Android
Write-Host "`n[Step 2/3] Syncing Capacitor Native Android Project..." -ForegroundColor Yellow
npx.cmd cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "Capacitor sync failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Run Gradle
Write-Host "`n[Step 3/3] Compiling Android Gradle Target: $Target..." -ForegroundColor Yellow

Set-Location android

if ($Target -eq "apk-debug" -or $Target -eq "all") {
    Write-Host "Building Debug APK..." -ForegroundColor Cyan
    .\gradlew.bat assembleDebug
    Write-Host "`n✓ Debug APK created at: android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Green
}

if ($Target -eq "apk-release" -or $Target -eq "all") {
    Write-Host "Building Release APK..." -ForegroundColor Cyan
    .\gradlew.bat assembleRelease
    Write-Host "`n✓ Release APK created at: android\app\build\outputs\apk\release\app-release-unsigned.apk" -ForegroundColor Green
}

if ($Target -eq "aab" -or $Target -eq "all") {
    Write-Host "Building Google Play AAB Bundle..." -ForegroundColor Cyan
    .\gradlew.bat bundleRelease
    Write-Host "`n✓ Google Play AAB created at: android\app\build\outputs\bundle\release\app-release.aab" -ForegroundColor Green
}

Set-Location ..
Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "Android Build Completed Successfully!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
