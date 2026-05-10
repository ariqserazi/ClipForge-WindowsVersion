$ErrorActionPreference = "Stop"

$CsxsVersions = @("11", "12", "13")

foreach ($Version in $CsxsVersions) {
  $KeyPath = "HKCU:\Software\Adobe\CSXS.$Version"

  if (-not (Test-Path $KeyPath)) {
    New-Item -Path $KeyPath -Force | Out-Null
  }

  New-ItemProperty -Path $KeyPath -Name "PlayerDebugMode" -Value "1" -PropertyType String -Force | Out-Null
  Write-Host "Enabled CEP debug mode for HKCU\Software\Adobe\CSXS.$Version"
}

Write-Host ""
Write-Host "CEP debug mode is enabled. Restart Adobe Premiere Pro before opening ClipForge."
