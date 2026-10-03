#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════
# ShambaPoint Climate — Start All Services
# Run this from the Shamba/ root directory
# ═══════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "🌿  ShambaPoint Climate — Starting All Services" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor DarkGreen
Write-Host ""

# ── 1. Node.js Backend API (port 5000) ──────────────────────────
Write-Host "▶  Starting Node.js Backend API on :5000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
  "cd '$PSScriptRoot\backend'; Write-Host '🟢 Backend API' -ForegroundColor Green; npm run dev" `
  -WindowStyle Normal

Start-Sleep -Seconds 2

# ── 2. Go Geo Microservice (port 5001) ──────────────────────────
Write-Host "▶  Starting Go Geo Microservice on :5001 ..." -ForegroundColor Cyan
if (Test-Path "C:\Program Files\Go\bin") {
  $env:Path = "C:\Program Files\Go\bin;" + $env:Path
}
$goAvailable = Get-Command go -ErrorAction SilentlyContinue
if ($goAvailable) {
  Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "`$env:Path = 'C:\Program Files\Go\bin;' + `$env:Path; cd '$PSScriptRoot\backend-go'; Write-Host '🗺️  Go Geo Service' -ForegroundColor Yellow; go run main.go" `
    -WindowStyle Normal
  Start-Sleep -Seconds 1
} else {
  Write-Host "   ⚠  Go not found — Geo service will run in demo mode (farm map still works)" -ForegroundColor Yellow
}

Start-Sleep -Seconds 3

# ── 3. React Frontend (port 5173) ───────────────────────────────
Write-Host "▶  Starting React Frontend on :5173 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
  "cd '$PSScriptRoot\frontend'; Write-Host '⚛️  React Frontend' -ForegroundColor Magenta; npm run dev" `
  -WindowStyle Normal

Start-Sleep -Seconds 4

# ── Open browser ─────────────────────────────────────────────────
Write-Host ""
Write-Host "✅  All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "   🌐  Frontend     →  http://localhost:5173" -ForegroundColor White
Write-Host "   🔌  Backend API  →  http://localhost:5000/api/health" -ForegroundColor White
Write-Host "   🗺️   Geo Service  →  http://localhost:5001/geo/health" -ForegroundColor White
Write-Host "   🛰️   Farm Map     →  http://localhost:5173/farm-map" -ForegroundColor White
Write-Host ""
Write-Host "   Demo login: +254711000001 / farmer123" -ForegroundColor DarkGray
Write-Host ""

Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"
