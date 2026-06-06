# One command: build a shareable Android APK for testers.
# Run: npm run build:apk

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host ""
Write-Host "=== AiShopy: building tester APK ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".\android\gradlew.bat")) {
  Write-Host "Android folder missing - running expo prebuild (one-time)..." -ForegroundColor Yellow
  npx expo prebuild --platform android --no-install
}

Write-Host "Building release APK (may take several minutes the first time)..." -ForegroundColor Yellow
Set-Location ".\android"
& .\gradlew.bat assembleRelease
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$ApkPath = (Resolve-Path ".\app\build\outputs\apk\release\app-release.apk").Path
Write-Host ""
Write-Host "Done! Send this file to your testers:" -ForegroundColor Green
Write-Host $ApkPath -ForegroundColor White
Write-Host ""
Start-Process -FilePath "explorer.exe" -ArgumentList "/select,$ApkPath"
