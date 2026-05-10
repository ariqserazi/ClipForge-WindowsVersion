$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$InstallerScript = Join-Path $ProjectRoot "installer\ClipForge.iss"
$DistDir = Join-Path $ProjectRoot "dist"
$OutputInstaller = Join-Path $DistDir "ClipForge-Windows-Setup.exe"

$Candidates = @(
  "C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
  "C:\Program Files\Inno Setup 6\ISCC.exe"
)

$Iscc = $Candidates | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $Iscc) {
  throw "Inno Setup 6 was not found. Install it from https://jrsoftware.org/isinfo.php, then run npm run installer:win again."
}

if (-not (Test-Path $InstallerScript)) {
  throw "Missing installer script: $InstallerScript"
}

New-Item -ItemType Directory -Path $DistDir -Force | Out-Null

if (Test-Path $OutputInstaller) {
  Remove-Item $OutputInstaller -Force
}

Write-Host "Building ClipForge installer with:"
Write-Host "  $Iscc"
Write-Host ""

& $Iscc $InstallerScript

if ($LASTEXITCODE -ne 0) {
  throw "Inno Setup failed with exit code $LASTEXITCODE."
}

if (-not (Test-Path $OutputInstaller)) {
  throw "Installer build finished, but output was not found: $OutputInstaller"
}

Write-Host ""
Write-Host "Created installer:"
Write-Host "  $OutputInstaller"
