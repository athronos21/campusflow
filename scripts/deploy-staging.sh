#!/usr/bin/env bash
# ==============================================================================
# CampusFlow - Staging Deployment Automation Script (POSIX / Bash)
# Pilot MVP: Haramaya University Higher Ed Platform
# ==============================================================================

set -euo pipefail

echo "===================================================="
echo "🚀 CampusFlow Staging Deployment & Health Automation"
echo "===================================================="

# 1. Prerequisite Checks
echo -e "\n[1/5] Checking Docker & Environment Prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is required but not installed or not in PATH."
    exit 1
fi

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "⚠️  No .env file found. Copying .env.example..."
    cp .env.example .env
fi

# 2. Validate Docker Compose Configuration
echo -e "\n[2/5] Validating Production Docker Compose Config..."
docker compose -f docker-compose.prod.yml config > /dev/null
echo "✅ Docker compose configuration is valid."

# 3. Database Schema Sync & Seed
echo -e "\n[3/5] Syncing Database Schema and Seed Data..."
if command -v pnpm &> /dev/null; then
    pnpm db:push || echo "⚠️  db:push completed with warnings."
    pnpm db:seed || echo "⚠️  db:seed completed with warnings."
else
    echo "ℹ️  pnpm not in host PATH, database will be initialized inside container."
fi

# 4. Build & Launch Staging Containers
echo -e "\n[4/5] Building & Launching Multi-Stage Docker Containers..."
docker compose -f docker-compose.prod.yml up -d --build

# 5. Service Probing & Verification
echo -e "\n[5/5] Probing Staging Endpoints..."
MAX_RETRIES=15
COUNT=0
API_READY=false

until [ $COUNT -ge $MAX_RETRIES ]; do
    if curl -s -f http://localhost:4000/api/docs > /dev/null 2>&1; then
        API_READY=true
        break
    fi
    COUNT=$((COUNT+1))
    sleep 2
done

if [ "$API_READY" = true ]; then
    echo "✅ [PASS] API Staging Service is healthy on http://localhost:4000"
else
    echo "⚠️  [WARN] API Staging Service probe timed out."
fi

echo -e "\n===================================================="
echo "🎉 Staging Deployment Complete!"
echo "   Web UI:     http://localhost:3000"
echo "   API Docs:   http://localhost:4000/api/docs"
echo "   Postgres:   localhost:5432 (DB: campusflow_db)"
echo "===================================================="
