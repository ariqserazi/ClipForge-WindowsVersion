$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$CepRoot = Join-Path $env:APPDATA "Adobe\CEP\extensions"
$InstallPath = Join-Path $CepRoot "ClipForge"
$TempPath = Join-Path ([System.IO.Path]::GetTempPath()) ("clipforge-install-" + [System.Guid]::NewGuid().ToString())

$ExcludeDirectories = @(
  "node_modules",
  ".git",
  "dist",
  "installer\output"
)

$ExcludeFiles = @(
  ".DS_Store",
  "*.exe",
  "*.zip"
)

New-Item -ItemType Directory -Path $CepRoot -Force | Out-Null
New-Item -ItemType Directory -Path $TempPath -Force | Out-Null

try {
  $StagingPath = Join-Path $TempPath "ClipForge"
  Copy-Item -Path $ProjectRoot -Destination $StagingPath -Recurse -Force

  foreach ($Directory in $ExcludeDirectories) {
    $PathToRemove = Join-Path $StagingPath $Directory
    if (Test-Path $PathToRemove) {
      Remove-Item $PathToRemove -Recurse -Force
    }
  }

  foreach ($Pattern in $ExcludeFiles) {
    Get-ChildItem -Path $StagingPath -Filter $Pattern -Recurse -Force -ErrorAction SilentlyContinue |
      Remove-Item -Force -ErrorAction SilentlyContinue
  }

  if (Test-Path $InstallPath) {
    Remove-Item $InstallPath -Recurse -Force
  }

  Copy-Item -Path $StagingPath -Destination $InstallPath -Recurse -Force

  Write-Host "ClipForge installed to:"
  Write-Host "  $InstallPath"
  Write-Host ""
  Write-Host "Next steps:"
  Write-Host "  1. Run npm run debug:win if CEP debug mode is not enabled yet."
  Write-Host "  2. Restart Adobe Premiere Pro."
  Write-Host "  3. Open ClipForge from Window > Extensions or Window > Extensions Legacy."
}
finally {
  if (Test-Path $TempPath) {
    Remove-Item $TempPath -Recurse -Force
  }
}
