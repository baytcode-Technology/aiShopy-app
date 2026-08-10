# Dev Android build — avoids Windows MAX_PATH failures on native modules.
# Run: npm run android

$ErrorActionPreference = "Stop"
$Root = (Split-Path -Parent $PSScriptRoot) | ForEach-Object { $_.TrimEnd('\') }
$CxxStagingDir = "C:\z\a"

Set-Location $Root

$GradleHome = "C:\gradle"
if (-not (Test-Path $GradleHome)) {
  New-Item -ItemType Directory -Path $GradleHome -Force | Out-Null
}
$env:GRADLE_USER_HOME = $GradleHome

Write-Host "GRADLE_USER_HOME=$GradleHome (short path for Windows native builds)" -ForegroundColor DarkGray

function Ensure-Ninja {
  $NinjaDir = "C:\ninja"
  $NinjaExe = Join-Path $NinjaDir "ninja.exe"
  if (Test-Path $NinjaExe) {
    Write-Host "Using Ninja: $NinjaExe" -ForegroundColor DarkGray
    return
  }

  Write-Host "Installing Ninja 1.12.1 to $NinjaDir (fixes Windows MAX_PATH builds)..." -ForegroundColor Yellow
  New-Item -ItemType Directory -Path $NinjaDir -Force | Out-Null
  $zipPath = Join-Path $env:TEMP "ninja-win.zip"
  $url = "https://github.com/ninja-build/ninja/releases/download/v1.12.1/ninja-win.zip"
  Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing
  Expand-Archive -Path $zipPath -DestinationPath $NinjaDir -Force
  Remove-Item $zipPath -Force -ErrorAction SilentlyContinue

  if (-not (Test-Path $NinjaExe)) {
    throw "Failed to install Ninja to $NinjaExe"
  }
  Write-Host "Ninja installed: $NinjaExe" -ForegroundColor Green
}

function Remove-NativeCacheDir {
  param([string]$Dir)
  if (-not (Test-Path -LiteralPath $Dir)) { return }

  Write-Host "Removing stale native cache: $Dir" -ForegroundColor DarkGray
  try {
    Remove-Item -LiteralPath $Dir -Recurse -Force -ErrorAction Stop
    return
  } catch {
    if ($Dir -match '^[A-Za-z]:\\') {
      return
    }
    $longPath = if ($Dir.StartsWith("\\?\")) { $Dir } else { "\\?\$($Dir.TrimEnd('\'))" }
    cmd /c rd /s /q "$longPath" 2>$null | Out-Null
    if (Test-Path -LiteralPath $Dir) {
      Remove-Item -LiteralPath $Dir -Recurse -Force -ErrorAction SilentlyContinue
    }
  }
}

Ensure-Ninja

$longPaths = Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -ErrorAction SilentlyContinue
if ($longPaths.LongPathsEnabled -ne 1) {
  Write-Host "NOTE: Windows long paths are disabled. Using short CMake staging at $CxxStagingDir." -ForegroundColor Yellow
  Write-Host "If the build still fails, ask an admin to enable long paths, or build from WSL2:" -ForegroundColor Yellow
  Write-Host "  cd /mnt/c/float-360/katlogue/aiShopy-app && npm run android" -ForegroundColor DarkGray
}

$NativeCacheDirs = @(
  "$Root\android\app\.cxx",
  "$CxxStagingDir",
  "$Root\node_modules\react-native-screens\android\.cxx",
  "$Root\node_modules\expo-modules-core\android\.cxx",
  "$Root\node_modules\react-native-reanimated\android\.cxx",
  "$Root\node_modules\react-native-worklets\android\.cxx"
)
foreach ($dir in $NativeCacheDirs) {
  Remove-NativeCacheDir -Dir $dir
}

if (Test-Path "$Root\android\gradlew.bat") {
  & "$Root\android\gradlew.bat" --stop 2>$null | Out-Null
}

# --all-arch makes Expo use reactNativeArchitectures from android/gradle.properties (arm64-v8a only)
# instead of every ABI reported by the connected device (often arm64 + armeabi-v7a).
npx expo run:android --all-arch @args
exit $LASTEXITCODE
