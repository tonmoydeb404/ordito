# Ordito installer for Windows.
# Usage:
# @brand:start usage
#   irm https://raw.githubusercontent.com/tonmoydeb404/ordito/main/setup/windows.ps1 | iex
# @brand:end usage
$ErrorActionPreference = "Stop"

$Repo = "tonmoydeb404/ordito"
$Version = if ($env:ORDITO_VERSION) { $env:ORDITO_VERSION } else { "latest" }

if ($env:PROCESSOR_ARCHITECTURE -ne "AMD64") {
    Write-Host "Only x64 builds are currently published for Windows."
    Write-Host "Download other builds manually from: https://github.com/$Repo/releases/latest"
    exit 1
}

Write-Host "==> Fetching release info ($Version)..."
$releaseUrl = if ($Version -eq "latest") {
    "https://api.github.com/repos/$Repo/releases/latest"
} else {
    "https://api.github.com/repos/$Repo/releases/tags/$Version"
}
$release = Invoke-RestMethod -Uri $releaseUrl
$asset = $release.assets | Where-Object { $_.name -like "*_x64-setup.exe" } | Select-Object -First 1

if (-not $asset) {
    Write-Host "Could not find a Windows build for $Version."
    exit 1
}

$installerPath = Join-Path $env:TEMP $asset.name

Write-Host "==> Downloading Ordito..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $installerPath

Write-Host "==> Installing Ordito (silent)..."
Start-Process -FilePath $installerPath -ArgumentList "/S" -Wait

Remove-Item $installerPath -ErrorAction SilentlyContinue

Write-Host "==> Done! Launch Ordito from the Start menu."
