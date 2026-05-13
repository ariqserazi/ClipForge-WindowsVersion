$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$CepRoot = Join-Path $env:APPDATA "Adobe\CEP\extensions"
$InstallPath = Join-Path $CepRoot "ClipForge"
$TempPath = Join-Path ([System.IO.Path]::GetTempPath()) ("clipforge-setup-" + [System.Guid]::NewGuid().ToString())

function Write-Step {
  param([string] $Message)
  Write-Host ""
  Write-Host "== $Message =="
}

function Test-Command {
  param([string] $Command)
  $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Test-Tool {
  param(
    [string] $Command,
    [string[]] $ExtraPaths
  )

  if (Test-Command $Command) {
    return $true
  }

  foreach ($ToolPath in $ExtraPaths) {
    if (Test-Path $ToolPath) {
      return $true
    }
  }

  return $false
}

function Install-FfmpegIfMissing {
  $FfmpegPaths = @(
    "C:\ffmpeg\bin\ffmpeg.exe",
    "C:\Program Files\ffmpeg\bin\ffmpeg.exe",
    "C:\Program Files (x86)\ffmpeg\bin\ffmpeg.exe"
  )

  $FfprobePaths = @(
    "C:\ffmpeg\bin\ffprobe.exe",
    "C:\Program Files\ffmpeg\bin\ffprobe.exe",
    "C:\Program Files (x86)\ffmpeg\bin\ffprobe.exe"
  )

  $HasFfmpeg = Test-Tool -Command "ffmpeg.exe" -ExtraPaths $FfmpegPaths
  $HasFfprobe = Test-Tool -Command "ffprobe.exe" -ExtraPaths $FfprobePaths

  if ($HasFfmpeg -and $HasFfprobe) {
    Write-Host "ffmpeg and ffprobe were found."
    return
  }

  Write-Host "ffmpeg or ffprobe was not found."

  if (-not (Test-Command "winget.exe")) {
    throw "winget is not available. Install ffmpeg manually at C:\ffmpeg\bin, then run this setup again."
  }

  Write-Host "Trying to install ffmpeg with winget..."
  & winget install --id Gyan.FFmpeg --exact --accept-source-agreements --accept-package-agreements

  if ($LASTEXITCODE -ne 0) {
    throw "winget could not install ffmpeg. Install ffmpeg manually at C:\ffmpeg\bin, then run this setup again."
  }

  $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")

  $HasFfmpeg = Test-Tool -Command "ffmpeg.exe" -ExtraPaths $FfmpegPaths
  $HasFfprobe = Test-Tool -Command "ffprobe.exe" -ExtraPaths $FfprobePaths

  if (-not ($HasFfmpeg -and $HasFfprobe)) {
    throw "ffmpeg was installed, but this window still cannot find ffmpeg.exe and ffprobe.exe. Restart Windows or install ffmpeg at C:\ffmpeg\bin."
  }

  Write-Host "ffmpeg and ffprobe are ready."
}

function Enable-CepDebugMode {
  $CsxsVersions = @("11", "12", "13")

  foreach ($Version in $CsxsVersions) {
    $KeyPath = "HKCU:\Software\Adobe\CSXS.$Version"

    if (-not (Test-Path $KeyPath)) {
      New-Item -Path $KeyPath -Force | Out-Null
    }

    New-ItemProperty -Path $KeyPath -Name "PlayerDebugMode" -Value "1" -PropertyType String -Force | Out-Null
    Write-Host "Enabled CEP debug mode for CSXS.$Version"
  }
}

function Install-ClipForgeExtension {
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
  }
  finally {
    if (Test-Path $TempPath) {
      Remove-Item $TempPath -Recurse -Force
    }
  }
}

try {
  Write-Host "ClipForge Windows setup"
  Write-Host "This will install ffmpeg if needed, enable Premiere Pro CEP debug mode, and install ClipForge."

  Write-Step "Checking ffmpeg"
  Install-FfmpegIfMissing

  Write-Step "Enabling Premiere Pro extension support"
  Enable-CepDebugMode

  Write-Step "Installing ClipForge"
  Install-ClipForgeExtension

  Write-Host ""
  Write-Host "ClipForge setup finished."
  Write-Host ""
  Write-Host "Installed here:"
  Write-Host "  $InstallPath"
  Write-Host ""
  Write-Host "Now restart Adobe Premiere Pro."
  Write-Host "Then open ClipForge from:"
  Write-Host "  Window > Extensions > ClipForge"
  Write-Host "or:"
  Write-Host "  Window > Extensions Legacy > ClipForge"
}
catch {
  Write-Host ""
  Write-Host "ClipForge setup did not finish."
  Write-Host $_.Exception.Message
  Write-Host ""
  Write-Host "If this is an ffmpeg problem, install ffmpeg manually at:"
  Write-Host "  C:\ffmpeg\bin"
  Write-Host "Then run Install-ClipForge-Windows.bat again."
  exit 1
}
