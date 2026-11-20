# Enterprise Modernization: Payment Gateway, Mobile Alignment & Production CI/CD

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate CampusFlow to enterprise-ready status by implementing a robust multi-mode Telebirr/CBE payment gateway with signature verification, aligning the Flutter mobile app with Impeccable design principles across all 10 services, and establishing production Docker builds and GitHub Actions CI/CD.

**Architecture:** 
- NestJS Payments Module extended with crypto signature validation (HMAC-SHA256 & RSA), webhook authenticity guards, and configurable gateway modes (simulation, sandbox, live).
- Flutter mobile screens upgraded to match web Impeccable design craft with high-contrast type hierarchy and full 10-service navigation.
- Multi-stage Dockerfiles and GitHub Actions workflow orchestrating monorepo typecheck, Prisma DB checks, E2E suites, and Flutter tests.

**Tech Stack:** NestJS, TypeScript, Node.js `crypto`, Prisma, Flutter 3.x, Docker, GitHub Actions, Next.js 14.

---

## Global Constraints
- Zero Floating-Point Financials: All amounts stored and computed strictly as integer minor units (`BigInt` / cents).
- No Broken Mobile Tests: `flutter test` and `flutter analyze` must pass with 0 errors.
- Strict Type Checking: `pnpm typecheck` must pass across all packages.
- Anti-AI-Slop Craft: No eyebrow kickers above headings, no text gradients, high contrast text (>= 4.5:1).

---

## Tasks

### Task 1: Real Telebirr & CBE Birr Payment Gateway Module
- [ ] Add gateway configuration to `.env.example` (`TELEBIRR_APP_ID`, `TELEBIRR_APP_KEY`, `TELEBIRR_SHORT_CODE`, `TELEBIRR_PUBLIC_KEY`, `CBE_BIRR_API_KEY`, `CBE_BIRR_SHORT_CODE`, `PAYMENT_GATEWAY_MODE`)
- [ ] Implement cryptographic signature utility in `apps/api/src/payments/gateway-crypto.ts` (HMAC-SHA256 hashing, parameter sorting, RSA signature verification)
- [ ] Enhance `PaymentsService` in `apps/api/src/payments/payments.service.ts` to support live/sandbox signature creation, redirect URLs, and secure webhook validation
- [ ] Implement signature validation guard / method for incoming webhooks
- [ ] Add unit/integration tests in `apps/api/src/payments/gateway-crypto.spec.ts`

### Task 2: Mobile UI & Service Alignment (`apps/mobile`)
- [ ] Verify `apps/mobile/lib/core/theme/app_theme.dart` and `app_colors.dart` match Impeccable tokens
- [ ] Enhance `ExploreScreen` in `apps/mobile/lib/screens/explore/explore_screen.dart` with cards for all 10 campus services (Directory, Transport, Food, Housing, Events, Learning, Bookings, Wallet)
- [ ] Run `flutter analyze` and `flutter test` to ensure 0 warnings and 100% test pass

### Task 3: Production Docker & CI/CD Pipeline
- [ ] Create `apps/web/public` directory with web manifest and icon placeholder to fix Docker build
- [ ] Validate and polish `apps/api/Dockerfile` and `apps/web/Dockerfile`
- [ ] Create `.github/workflows/ci.yml` with monorepo lint, typecheck, Prisma migration check, E2E test, and Flutter mobile test pipeline
- [ ] Verify Docker compose configuration (`docker compose -f docker-compose.prod.yml config`)

### Task 4: Full System Verification
- [ ] Run `pnpm typecheck`
- [ ] Run `pnpm test:e2e`
- [ ] Run `pnpm test:mobile` and `pnpm analyze:mobile`
- [ ] Run `pnpm check:health`
- [ ] Smoke test web routes
