# CampusFlow — Monorepo

<p align="center">
  <strong>Unified Campus Super-App & Digital Services Platform</strong><br>
  <em>Haramaya University Pilot MVP → Ethiopian University Network</em>
</p>

---

## 📌 Project Overview

**CampusFlow** provides a single trusted digital platform for campus service discovery, marketplace orders, verified merchant catalogs, and service bookings.

* **Product Blueprint:** See [campusflow_blueprint.md](./campusflow_blueprint.md) for the complete 16-week execution specification.
* **Target Audience:** Haramaya University students, campus cafes, stationery shops, and campus administration.
* **Legal Compliance:** Compliant with Ethiopia's **Personal Data Protection Proclamation No. 1321/2024** (data minimization, privacy notices, user consent).

---

## 🏗️ Architecture & Monorepo Layout

```text
campusflow/
├── apps/
│   ├── api/                     # 🛡️ NestJS REST API with Swagger (TypeScript)
│   ├── web/                     # 💻 Next.js 14 App Router (Web - TypeScript)
│   └── mobile/                  # 📱 Flutter Android App (Mobile - Dart)
├── packages/
│   ├── contracts/               # 📜 Shared Zod schemas & DTO types
│   ├── config/                  # ⚙️ Shared TypeScript, ESLint, Prettier configs
│   └── design-system/           # 🎨 Shared brand tokens & color palettes
├── prisma/
│   ├── schema.prisma            # 🗄️ PostgreSQL multi-tenant schema
│   └── seed.ts                  # 🌱 Synthetic test data for Haramaya University
├── docker-compose.yml           # 🐳 Local PostgreSQL 16 container
├── package.json                 # 📦 Monorepo root script runner
├── pnpm-workspace.yaml          # 🔗 Workspace definitions
└── turbo.json                   # ⚡ Build and pipeline caching
```

---

## 🚀 Quickstart for Developers

### 1. Prerequisites
Install the following on your machine:
* **Node.js**: v20 LTS or v22 ([Download](https://nodejs.org/))
* **pnpm**: `npm install -g pnpm`
* **Docker Desktop**: For running PostgreSQL locally
* **Flutter SDK**: [flutter.dev](https://flutter.dev) (for mobile app development)

### 2. Install Web & API Dependencies
```bash
pnpm install
```

### 3. Start Local PostgreSQL Database
```bash
docker compose up -d
```

### 4. Setup Database Schema & Seed Data
```bash
# Generate Prisma Client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed Haramaya University sample data
pnpm db:seed
```

### 5. Start Backend API & Web App
```bash
pnpm dev
```
* **Web Application:** [http://localhost:3000](http://localhost:3000)
* **REST API & Swagger Docs:** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
* **Prisma Studio:** `pnpm db:studio` (opens at [http://localhost:5555](http://localhost:5555))

### 6. Run Flutter Mobile App (Android)
```bash
cd apps/mobile
flutter pub get
flutter run
```
* *Note: The Android Emulator automatically communicates with the local NestJS backend at `http://10.0.2.2:4000/api/v1`.*

---

## 👥 5-Person Team Ownership

| Role | Focus Area | Primary Workspace |
|---|---|---|
| **Developer 1 (Lead)** | System architecture, security, CI/CD, contracts | `packages/contracts`, `apps/api`, `.github/` |
| **Developer 2** | Student storefront, merchant dashboard, admin UI | `apps/web` |
| **Developer 3** | Flutter Android app, offline caching, device testing | `apps/mobile` |
| **Developer 4** | Database schema, order lifecycle, migrations | `prisma/`, `apps/api/src/orders` |
| **Developer 5** | Product management, merchant onboarding, QA | Testing, seed data, user feedback |
