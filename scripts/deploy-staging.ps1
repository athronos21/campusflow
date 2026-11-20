# ==============================================================================
# CampusFlow - Staging Deployment Automation Script (PowerShell)
# Pilot MVP: Haramaya University Higher Ed Platform
# ==============================================================================

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🚀 CampusFlow Staging Deployment & Health Automation" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Prerequisite Checks
Write-Host "`n[1/5] Checking Docker & Environment Prerequisites..." -ForegroundColor Yellow

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is required but not found in PATH."
    exit 1
}

if (-not (Test-Path ".env")) {
    Write-Warning "No .env file found. Copying .env.example if available..."
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env from .env.example." -ForegroundColor Green
    }
}

# 2. Validate Docker Compose Configuration
Write-Host "`n[2/5] Validating Production Docker Compose Config..." -ForegroundColor Yellow
docker compose -f docker-compose.prod.yml config > $null
if ($LASTEXITCODE -ne 0) {
    Write-Error "docker-compose.prod.yml configuration validation failed."
    exit 1
}
Write-Host "Docker compose configuration is valid." -ForegroundColor Green

# 3. Database Schema Sync & Seed
Write-Host "`n[3/5] Syncing Database Schema and Seed Data..." -ForegroundColor Yellow
pnpm.cmd db:push
if ($LASTEXITCODE -ne 0) {
    Write-Warning "db:push encountered an issue or requires active Postgres connection."
} else {
    Write-Host "Database schema push successful." -ForegroundColor Green
}

pnpm.cmd db:seed
if ($LASTEXITCODE -ne 0) {
    Write-Warning "db:seed encountered an issue. Skipping seed step."
} else {
    Write-Host "Database seed successful." -ForegroundColor Green
}

# 4. Build & Launch Staging Containers
Write-Host "`n[4/5] Building & Launching Multi-Stage Docker Containers..." -ForegroundColor Yellow
Write-Host "Running: docker compose -f docker-compose.prod.yml up -d --build" -ForegroundColor Gray
docker compose -f docker-compose.prod.yml up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start staging containers via docker-compose."
    exit 1
}

# 5. Service Probing & Verification
Write-Host "`n[5/5] Probing Staging Endpoints..." -ForegroundColor Yellow

$maxAttempts = 15
$apiReady = $false
for ($i = 1; $i -le $maxAttempts; $i++) {
    try {
        $res = Invoke-WebRequest -Uri "http://localhost:4000/api/docs" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        if ($res.StatusCode -eq 200) {
            $apiReady = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 2
    }
}

if ($apiReady) {
    Write-Host "[PASS] API Staging Service is healthy on http://localhost:4000" -ForegroundColor Green
} else {
    Write-Warning "[WARN] API Staging Service probe timed out."
}

Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "🎉 Staging Deployment Complete!" -ForegroundColor Green
Write-Host "   Web UI:     http://localhost:3000" -ForegroundColor White
Write-Host "   API Docs:   http://localhost:4000/api/docs" -ForegroundColor White
Write-Host "   Postgres:   localhost:5432 (DB: campusflow_db)" -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Cyan
