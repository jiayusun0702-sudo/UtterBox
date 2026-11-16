# Packages the extension for each store target into ../dist/*.zip
# Usage: powershell -File build.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$distDir = Join-Path $root "..\dist"
$sharedFiles = @("background.js", "common.js", "popup.html", "popup.js", "icons")

if (Test-Path $distDir) { Remove-Item $distDir -Recurse -Force }
New-Item -ItemType Directory -Path $distDir | Out-Null

function New-Package($name, $manifestFile) {
    $stageDir = Join-Path $distDir "stage-$name"
    New-Item -ItemType Directory -Path $stageDir | Out-Null
    foreach ($item in $sharedFiles) {
        Copy-Item (Join-Path $root $item) (Join-Path $stageDir $item) -Recurse
    }
    Copy-Item (Join-Path $root $manifestFile) (Join-Path $stageDir "manifest.json")
    $zipPath = Join-Path $distDir "utterbox-$name.zip"
    Compress-Archive -Path (Join-Path $stageDir "*") -DestinationPath $zipPath -Force
    Remove-Item $stageDir -Recurse -Force
    Write-Host "Built $zipPath"
}

New-Package "chromium" "manifest.json"
New-Package "firefox" "manifest.firefox.json"
