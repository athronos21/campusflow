# CampusFlow Full Database Build & Provisioning Script
# Haramaya University Pilot MVP - Ethiopian Higher Education Super-App

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🛠️  CampusFlow Full Database Build & Provisioning" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Generate Prisma Client
Write-Host "`n[1/5] Generating Prisma Client Types & Models..." -ForegroundColor Yellow
npx.cmd prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Prisma Client generation failed!" -ForegroundColor Red
    exit 1
}

# 2. Verify / Start PostgreSQL Container
$targetPort = 5432
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match 'DATABASE_URL="?postgresql://[^:]+:[^@]+@[^:]+:(\d+)/') {
        $targetPort = [int]$matches[1]
    }
}

Write-Host "`n[2/5] Checking PostgreSQL Database Connection (Port $targetPort)..." -ForegroundColor Yellow
$portCheck = Test-NetConnection -ComputerName 127.0.0.1 -Port $targetPort -InformationLevel Quiet -WarningAction SilentlyContinue

if (-not $portCheck) {
    Write-Host "PostgreSQL is not responding on port $targetPort. Starting Docker container..." -ForegroundColor Yellow
    docker-compose up -d postgres
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n[ACTION REQUIRED] Docker Desktop is not currently running." -ForegroundColor Red
        Write-Host "Please launch Docker Desktop from your Windows Start Menu." -ForegroundColor White
        Write-Host "Once Docker Desktop shows 'Engine running', re-run: pnpm db:build" -ForegroundColor Cyan
        exit 1
    }

    Write-Host "Waiting for PostgreSQL engine to accept connections..." -ForegroundColor Gray
    $retries = 10
    while ($retries -gt 0) {
        Start-Sleep -Seconds 2
        $portCheck = Test-NetConnection -ComputerName 127.0.0.1 -Port $targetPort -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($portCheck) { break }
        $retries--
    }
}

if ($portCheck) {
    Write-Host "[OK] PostgreSQL is healthy and accepting connections on port $targetPort." -ForegroundColor Green
} else {
    Write-Host "[ERROR] Could not connect to PostgreSQL on port $targetPort." -ForegroundColor Red
    exit 1
}

# 3. Synchronize Schema & Deploy Migrations
Write-Host "`n[3/5] Synchronizing Schema & Applying Engine Constraints..." -ForegroundColor Yellow
npx.cmd prisma db push --skip-generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Database synchronization failed!" -ForegroundColor Red
    exit 1
}

npx.cmd ts-node scripts/apply-constraints.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "Applying database constraints failed!" -ForegroundColor Red
    exit 1
}

# 4. Seed Database
Write-Host "`n[4/5] Seeding Database with Pilot Entities & Clearing Accounts..." -ForegroundColor Yellow
npx.cmd prisma db seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "Database seed failed!" -ForegroundColor Red
    exit 1
}

# 5. Run Verification Suite
Write-Host "`n[5/5] Running End-to-End Database Lifecycle Verification (18 Checks)..." -ForegroundColor Yellow
npx.cmd ts-node scripts/test-e2e-flow.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "E2E verification failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n====================================================" -ForegroundColor Green
Write-Host "🎉 WHOLE DATABASE BUILT, MIGRATED & VERIFIED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
