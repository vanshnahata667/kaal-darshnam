param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $root
$url = 'http://localhost:5173'

function Test-HeritageServer {
    try {
        $response = Invoke-WebRequest -Uri "$url/api/config" -UseBasicParsing -TimeoutSec 3
        $config = $response.Content | ConvertFrom-Json
        return $null -ne $config.supabaseUrl -and $null -ne $config.supabaseKey
    } catch { return $false }
}

try {
    if (Test-HeritageServer) {
        Write-Host "Kaal-Darshan is already running: $url/login"
        if (!$NoBrowser) { Start-Process "$url/login" }
        exit 0
    }
    $listener = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
    if ($listener) { throw 'Port 5173 is used by another application. Close that application before starting Kaal-Darshan.' }
    $node = (Get-Command node.exe -ErrorAction SilentlyContinue).Source
    if (!$node) { throw 'Install Node.js 22.13 or newer, then run start-local.cmd again.' }
    if (!(Test-Path -LiteralPath 'node_modules/vinext/dist/cli.js')) {
        $npm = Join-Path (Split-Path $node -Parent) 'node_modules/npm/bin/npm-cli.js'
        if (!(Test-Path -LiteralPath $npm)) { throw 'npm is missing. Repair your Node.js installation.' }
        Write-Host 'Installing project dependencies. An internet connection is required.'
        & $node $npm ci
        if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed. Check your internet connection and try again.' }
    }
    if (!(Test-Path -LiteralPath '.env.local')) {
        throw 'Supabase configuration is missing. Follow SUPABASE-SETUP.md to create .env.local.'
    }
    New-Item -ItemType Directory -Path 'outputs' -Force | Out-Null
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $log = Join-Path $root "outputs/server-$stamp.log"
    $errorLog = Join-Path $root "outputs/server-$stamp-error.log"
    $server = Start-Process -FilePath $node -ArgumentList 'scripts/run-framework.mjs','dev','--host','127.0.0.1' -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput $log -RedirectStandardError $errorLog -PassThru
    Write-Host 'Starting Kaal-Darshan...'
    $ready = $false
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        if (Test-HeritageServer) { $ready = $true; break }
        if ($server.HasExited) { throw "The server stopped. See $errorLog" }
        Start-Sleep -Seconds 2
    }
    if (!$ready) { throw "The server is still starting. Check $log and $errorLog before retrying." }
    Write-Host "Kaal-Darshan is ready: $url/login"
    Write-Host 'The server runs in the background until this computer shuts down.'
    if (!$NoBrowser) { Start-Process "$url/login" }
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
