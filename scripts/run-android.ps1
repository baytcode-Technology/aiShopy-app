# Dev Android build — avoids Windows MAX_PATH failures on native modules.
# Run: npm run android

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$GradleHome = "C:\gradle"
if (-not (Test-Path $GradleHome)) {
  New-Item -ItemType Directory -Path $GradleHome -Force | Out-Null
}
$env:GRADLE_USER_HOME = $GradleHome

Write-Host "GRADLE_USER_HOME=$GradleHome (short path for Windows native builds)" -ForegroundColor DarkGray

# Drop stale CMake/Ninja metadata (often pins Cursor sandbox cache paths > 260 chars).
$NativeCacheDirs = @(
  "$Root\node_modules\react-native-screens\android\.cxx",
  "$Root\node_modules\expo-modules-core\android\.cxx",
  "$Root\node_modules\react-native-reanimated\android\.cxx",
  "$Root\node_modules\react-native-worklets\android\.cxx"
)
foreach ($dir in $NativeCacheDirs) {
  if (Test-Path $dir) {
    Write-Host "Removing stale native cache: $dir" -ForegroundColor DarkGray
    Remove-Item -Recurse -Force $dir
  }
}

if (Test-Path "$Root\android\gradlew.bat") {
  & "$Root\android\gradlew.bat" --stop 2>$null | Out-Null
}

# --all-arch makes Expo use reactNativeArchitectures from android/gradle.properties (arm64-v8a only)
# instead of every ABI reported by the connected device (often arm64 + armeabi-v7a).
npx expo run:android --all-arch @args
exit $LASTEXITCODE
