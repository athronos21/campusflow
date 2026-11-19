# CampusFlow (CampusPro) — Monorepo

<p align="center">
  <strong>Unified Campus Super-App & Digital Services Platform</strong><br>
  <em>Haramaya University Pilot MVP → Nationwide Ethiopian University Network</em>
</p>

---

## Executive Overview

**CampusFlow** is an enterprise-grade digital super-app designed for university campuses across Ethiopia, piloted at **Haramaya University Main Campus**. It consolidates essential student life, food orders, intercity bus ticketing, off-campus accommodation, campus events, academic resources, and local service appointments into a single, high-performance platform.

* **Product Blueprint:** Built against the full 16-week execution specification in [campusflow_blueprint.md](./campusflow_blueprint.md).
* **Target Audience:** Haramaya University students, campus cafes, stationery stores, transport operators, and campus administration.
* **Legal Compliance:** Compliant with Ethiopia's **Personal Data Protection Proclamation No. 1321/2024** (strict data minimization, explicit consent, user-controlled data rights).
* **Financial Integrity:** Zero floating-point rounding errors. All prices, rents, and payments are stored strictly as integer minor units (`BigInt` in Ethiopian Birr cents).

---

## The 10 Core CampusFlow Services

| Service # | Domain | Key Capabilities | Client Access |
| :--- | :--- | :--- | :--- |
| **01** | **Digital Campus & Directory** | Verified campus directory, administrative notices, student profiles, and multi-campus support. | `/directory` (Web & Mobile) |
| **02** | **Transport & Bus Ticketing** | Daily bus shuttles to Dire Dawa & Harar, weekend Selam Bus coaches to Addis Ababa. Seat selection grid & digital QR boarding passes. | `/transport` (Web & Mobile) |
| **03** | **Student Marketplace** | Verified campus merchant shops, real-time stock toggling, categorized catalog items. | `/shop/[id]` (Web & Mobile) |
| **04** | **Food Pre-orders & Pickup** | Fast cafeteria pickup ordering between lectures. Real-time SSE order tracking with Web Audio chimes. | `/orders` (Web & Mobile) |
| **05** | **Housing & Accommodations** | Off-campus rooms & apartments in Bate & Main Gate. Filters for water, electricity, and WiFi. In-person viewing scheduler. | `/housing` (Web & Mobile) |
| **06** | **Campus Events & Passes** | University hackathons, guest lectures, and student festivals. 1-click RSVP with verified digital QR pass generation. | `/events` (Web & Mobile) |
| **07** | **Academic Resource Bank** | Community course repository for lecture slides, past final exams, and lab manuals with live download tracking. | `/learning` (Web & Mobile) |
| **08** | **Digital Payments (Telebirr/CBE)** | Telebirr USSD quick-dial code generation (`*127*1*251911223344*...#`), CBE Birr instructions, and webhook verification. | Orders & Transport Drawers |
| **09** | **Local Services & Appointments** | Thesis printing & hardcover binding, laptop diagnostics & OS repair, campus laundry, barbershop bookings. | `/bookings` (Web & Mobile) |
| **10** | **Business Admin & Trust** | Zero-cost merchant order queue with audio chimes, admin merchant verification reviews, dispute resolution. | `/merchant/*`, `/admin/*` |

---

## Architecture & Monorepo Layout

```text
campusflow/
├── apps/
│   ├── api/                     # NestJS 10 REST API with OpenAPI Swagger docs
│   ├── web/                     # Next.js 14 App Router (React, Tailwind CSS, Lucide)
│   └── mobile/                  # Flutter 3.x Mobile App (Android & iOS with Dio HTTP client)
├── packages/
│   ├── contracts/               # Shared Zod schemas, DTOs & TypeScript types
│   ├── config/                  # Shared TypeScript, ESLint, Prettier configs
│   └── design-system/           # Brand tokens and Ethiopian theme palettes
├── prisma/
│   ├── schema.prisma            # Multi-tenant PostgreSQL schema
│   └── seed.ts                  # Seed script (campuses, merchants, buses, housing, events, notes)
├── scripts/
│   └── test-e2e-flow.ts         # 13-point automated End-to-End integration test suite
├── docker-compose.yml           # Local PostgreSQL 16 container definition
├── package.json                 # Monorepo workspace configuration
├── pnpm-workspace.yaml          # pnpm workspace mapping
└── turbo.json                   # Turborepo pipeline orchestration
```

---

## Quickstart Guide

### 1. Prerequisites
* **Node.js**: v20 LTS or v22
* **pnpm**: `npm install -g pnpm`
* **Docker Desktop**: For running PostgreSQL locally
* **Flutter SDK**: v3.22+ (for mobile app)

### 2. Install Monorepo Dependencies
```bash
pnpm install
```

### 3. Verify Environment Health & Diagnostics
Run the automated health and toolchain doctor:
```bash
pnpm check:health
```

### 4. Start Database & Seed Data
```bash
# Start Docker PostgreSQL container
docker compose up -d

# Push schema to database and generate Prisma Client
pnpm db:generate
pnpm db:push

# Seed Haramaya University sample dataset
pnpm db:seed
```

### 5. Run Automated Test Suites
Verify all 10 services, database operations, and mobile unit tests:
```bash
# End-to-End integration test suite (Database & Services)
pnpm test:e2e

# Flutter mobile unit tests (Currency formatters & precision)
pnpm test:mobile

# Flutter mobile static analyzer check
pnpm analyze:mobile
```
*Expected Output:* `ALL END-TO-END VERIFICATION CHECKS PASSED (13/13)` and `All tests passed! (2/2)`

### 6. Launch Development Servers
```bash
pnpm dev
```
* **Web Portal:** [http://localhost:3000](http://localhost:3000)
* **API Documentation (Swagger):** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
* **Prisma Studio:** `pnpm db:studio` (available at [http://localhost:5555](http://localhost:5555))

### 7. Run Flutter Mobile App (Android)
```bash
cd apps/mobile
flutter pub get
flutter run
```
*Note: Android Emulator communicates automatically with the local API at `http://10.0.2.2:4000/api/v1`.*

---

## Seeded Demo Credentials

Use these pre-configured accounts to test role-based access:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Student** | `student@haramaya.edu.et` | `password123` | Order pickup meals, book bus seats, request housing viewings, RSVP for hackathons, download study notes. |
| **Merchant** | `merchant@haramayacafe.et` | `password123` | Merchant dashboard, live audio-alert order queue, catalog stock toggles, transaction reconciliation. |
| **Admin** | `admin@campusflow.et` | `password123` | Campus verification portal, approve/reject merchants, dispute moderation, campus announcements. |

---

## Security & Ethiopian Data Compliance

* **Proclamation No. 1321/2024:** Student data is collected strictly on an opt-in basis with data minimization principles. Personal phone numbers and student identifiers are protected from public scraping.
* **JWT Authentication:** Stateful user sessions signed with RS256/HS256 tokens and injected automatically into `apiClient` and Dio HTTP interceptors.
* **Server-Sent Events (SSE):** Merchant live order queues update without polling via `GET /api/v1/orders/stream`, accompanied by instant client-side Web Audio synthesis alerts.
* **No Direct DB Access:** Client applications (Next.js and Flutter) communicate exclusively via versioned REST API endpoints (`/api/v1`).

---

## Strategic Playbooks & Operational Documentation

Comprehensive operational and strategic guides for executing the live campus rollout:

1. **[Pilot Launch Sprint Plan](./docs/pilot-launch-sprint-plan.md):** 14-day execution schedule covering cloud staging deployment, on-site merchant counter hardware setup, student alpha activation, and metrics.
2. **[Haramaya Merchant & Student Playbook](./docs/haramaya-onboarding-playbook.md):** Merchant acquisition pitch script, in-store QR table tent checklist, out-of-stock protocol, and student Telegram channels.
3. **[University Systems Integration Architecture](./docs/university-systems-integration.md):** Roadmap for institutional Single Sign-On (SSO / SAML / OIDC), Registrar SIS course sync, and campus Wi-Fi captive portal zero-rating.
