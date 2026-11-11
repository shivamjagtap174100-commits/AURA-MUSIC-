# ==============================================================================
# AURA MUSIC - Android APK & AAB Automated Build Script (PowerShell)
# ==============================================================================

param (
    [string]$Target = "apk-debug" # Options: "apk-debug", "apk-release", "aab", "all", "studio"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       AURA MUSIC — Android Build Generator              " -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Cyan

# Detect JDK
if (-not $env:JAVA_HOME) {
    $msJdk = Get-ChildItem -Path "C:\Program Files\Microsoft" -Filter "jdk-*" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
    if ($msJdk) {
        $env:JAVA_HOME = $msJdk
        $env:PATH = "$msJdk\bin;" + $env:PATH
        Write-Host "Auto-configured JAVA_HOME: $env:JAVA_HOME" -ForegroundColor DarkCyan
    }
}

# Step 1: Build Web App
Write-Host "`n[Step 1/3] Compiling Web Assets (Vite + TypeScript)..." -ForegroundColor Yellow
npm.cmd run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Web build failed! Please check code errors." -ForegroundColor Red
    exit 1
}

# Step 2: Sync with Capacitor Android Native Project
Write-Host "`n[Step 2/3] Syncing Capacitor Native Android Project..." -ForegroundColor Yellow
npx.cmd cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "Capacitor sync failed!" -ForegroundColor Red
    exit 1
}

# Open in Android Studio if requested
if ($Target -eq "studio") {
    Write-Host "`nOpening Android Project in Android Studio..." -ForegroundColor Cyan
    npx.cmd cap open android
    exit 0
}

# Step 3: Gradle Build
Write-Host "`n[Step 3/3] Compiling Android Native Target: $Target..." -ForegroundColor Yellow

Set-Location android

try {
    if ($Target -eq "apk-debug" -or $Target -eq "all") {
        Write-Host "Compiling Debug APK..." -ForegroundColor Cyan
        .\gradlew.bat assembleDebug
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✓ Debug APK created at: android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Green
        }
    }

    if ($Target -eq "apk-release" -or $Target -eq "all") {
        Write-Host "Compiling Release APK..." -ForegroundColor Cyan
        .\gradlew.bat assembleRelease
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✓ Release APK created at: android\app\build\outputs\apk\release\app-release-unsigned.apk" -ForegroundColor Green
        }
    }

    if ($Target -eq "aab" -or $Target -eq "all") {
        Write-Host "Compiling Google Play AAB Bundle..." -ForegroundColor Cyan
        .\gradlew.bat bundleRelease
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✓ Google Play AAB created at: android\app\build\outputs\bundle\release\app-release.aab" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "Gradle compilation notice: $_" -ForegroundColor Yellow
    Write-Host "Tip: You can also open the project directly in Android Studio via: npm run android:open" -ForegroundColor White
} finally {
    Set-Location ..
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "Android Build Pipeline Complete!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
