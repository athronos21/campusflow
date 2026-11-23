# Full-Stack Core-Code Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate all hardcoded stubs, mocks, and demo fallbacks across Backend (NestJS), Web Frontend (Next.js 14), and Mobile (Flutter), ensuring 100% core-coded execution against real PostgreSQL data and live API endpoints.

**Architecture:** 
- Backend: Add `AssistantModule` in `apps/api` for contextual campus queries backed by Prisma models, and enhance `AnnouncementsService` with rich metadata.
- Web: Replace static arrays in `marketplace`, `profile`, and `maintenance` pages with live `apiClient` calls to `/products`, `/student/me`, `/wallet/me`, and `/moderation/reports`.
- Mobile: Update `announcement_service`, `marketplace_service`, and `ai_assistant_service` to call live backend endpoints with structured JSON deserialization.

**Tech Stack:** NestJS 10.x, Prisma ORM 5.x, Next.js 14 (React 18), Flutter 3.x, TypeScript 5.x, Zod.

**Spec:** [`docs/design-system-and-ui-spec.md`](file:///c:/Users/Athronos/Desktop/campuspro/docs/design-system-and-ui-spec.md) and [`docs/superpowers/specs/2026-11-21-database-architecture-design.md`](file:///c:/Users/Athronos/Desktop/campuspro/docs/superpowers/specs/2026-11-21-database-architecture-design.md)

## Global Constraints

- Zero Floating-Point Financials: All amounts stored and computed strictly as integer minor units (`BigInt` / cents).
- Strict Type Checking: `pnpm typecheck` must pass across all packages with 0 errors.
- Clean Mobile Analysis: `pnpm analyze:mobile` and `pnpm test:mobile` must pass with 0 errors.
- Real Database Persistence: No hardcoded demo arrays or fake static lists as primary data source.

## Review Focus

1. **Unauthenticated Profile/Wallet Access:** Requesting `/student/me` or `/wallet/me` without a valid bearer token must return 401 Unauthorized.
2. **Empty Marketplace/Catalog Results:** When no products exist in the database, the UI must render an informative empty state with a creation CTA rather than crashing or showing stale demo items.
3. **P2P Minor Unit Precision:** Marketplace item prices in Birr must convert reliably between ETB floating display and minor unit cents (1 ETB = 100 cents).
4. **Mobile Network Resilience:** If the mobile client is offline or network fails, services should gracefully return empty lists or cached state instead of throwing unhandled exceptions.
5. **Campus Query Context Isolation:** The campus assistant queries must strictly filter by the student's `campusId` tenant boundary.

---

### Task 1: Backend Campus AI Assistant & Announcements API Enhancement

**Files:**
- Create: `apps/api/src/assistant/dto/assistant-query.dto.ts`
- Create: `apps/api/src/assistant/assistant.service.ts`
- Create: `apps/api/src/assistant/assistant.controller.ts`
- Create: `apps/api/src/assistant/assistant.module.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/announcements/announcements.service.ts`

**Interfaces:**
- Consumes: `PrismaService`, `Trip`, `Announcement`, `MealPlan`, `Campus`
- Produces: `POST /api/v1/assistant/query` endpoint returning `{ answer: string, sources?: string[] }`, and enriched `GET /api/v1/announcements`

- [ ] **Step 1: Create `apps/api/src/assistant/dto/assistant-query.dto.ts`**
  Define `AssistantQueryDto` with `query: string` and optional `campusId?: string`.

- [ ] **Step 2: Implement `AssistantService` in `apps/api/src/assistant/assistant.service.ts`**
  Implement dynamic answers querying real database tables:
  - Transport queries inspect `this.prisma.trip.findMany` for active routes and departure times.
  - Dining queries inspect `this.prisma.mealPlan.findMany`.
  - Academic & event queries inspect `this.prisma.announcement.findMany` and `this.prisma.event.findMany`.
  - Fallback provides structured campus directory assistance.

- [ ] **Step 3: Implement `AssistantController` and `AssistantModule`**
  Create controller with `@Post('query')` exposing the endpoint with Swagger decorators. Register in `AppModule`.

- [ ] **Step 4: Enhance `AnnouncementsService`**
  Include author details (`displayName`) and campus metadata in `findAll()`.

- [ ] **Step 5: Verify NestJS API builds cleanly**
  Run: `pnpm --filter @campusflow/api build`
  Expected: Build succeeds with 0 errors.

---

### Task 2: Web Frontend Live Integration (Marketplace, Profile, Maintenance)

**Files:**
- Modify: `apps/web/app/marketplace/page.tsx`
- Modify: `apps/web/app/profile/page.tsx`
- Modify: `apps/web/app/maintenance/page.tsx`

**Interfaces:**
- Consumes: `/products`, `/student/me`, `/wallet/me`, `/moderation/reports` via `apiClient`
- Produces: Dynamic interactive UI connected to live PostgreSQL data

- [ ] **Step 1: Wire `apps/web/app/marketplace/page.tsx` to Live Products API**
  Replace `INITIAL_ITEMS` static array with `useEffect` calling `apiClient<Product[]>('/products')`. Map category and price formatting. Connect modal creation to `POST /products/business/:businessId`.

- [ ] **Step 2: Wire `apps/web/app/profile/page.tsx` to Real Student & Wallet APIs**
  Replace hardcoded student ID and static wallet balance (`1,420.50 ETB`) with live `apiClient('/student/me')` and `apiClient('/wallet/me')`. Display real QR code and dynamic transaction history.

- [ ] **Step 3: Wire `apps/web/app/maintenance/page.tsx` to Reports API**
  Connect work orders / maintenance form to `apiClient.post('/moderation/reports')` and fetch existing reports via `apiClient.get('/moderation/reports')`.

- [ ] **Step 4: Verify Web App typechecks cleanly**
  Run: `pnpm --filter @campusflow/web typecheck`
  Expected: 0 errors.

---

### Task 3: Mobile Frontend Live Services (Announcements, Marketplace, Assistant)

**Files:**
- Modify: `apps/mobile/lib/core/api/api_endpoints.dart`
- Modify: `apps/mobile/lib/models/marketplace_item.dart`
- Modify: `apps/mobile/lib/services/announcement_service.dart`
- Modify: `apps/mobile/lib/services/marketplace_service.dart`
- Modify: `apps/mobile/lib/services/ai_assistant_service.dart`

**Interfaces:**
- Consumes: `ApiEndpoints.announcements`, `ApiEndpoints.products`, `ApiEndpoints.assistant`
- Produces: Live Dart services for mobile screens

- [ ] **Step 1: Add Missing Endpoints to `ApiEndpoints`**
  Add `announcements = '/announcements'` and `assistantQuery = '/assistant/query'`.

- [ ] **Step 2: Update `MarketplaceItem` and `MarketplaceService`**
  Add `fromJson` constructor to `MarketplaceItem`. Update `MarketplaceService.getItems()` to fetch from `ApiEndpoints.products` and parse items.

- [ ] **Step 3: Update `AnnouncementService`**
  Update `AnnouncementService.getAnnouncements()` to fetch from `ApiEndpoints.announcements`.

- [ ] **Step 4: Update `AiAssistantService`**
  Update `AiAssistantService.getAnswer(query)` to send POST request to `ApiEndpoints.assistantQuery` with live response and fallback.

- [ ] **Step 5: Verify Flutter Mobile App Analysis & Tests**
  Run: `pnpm analyze:mobile && pnpm test:mobile`
  Expected: 0 warnings, 0 errors, all tests pass.

---

### Task 4: Full System End-to-End Verification

- [ ] **Step 1: Run contracts validation**
  Run: `pnpm test:contracts`
  Expected: All contract tests pass.

- [ ] **Step 2: Run services unit tests**
  Run: `pnpm test:services`
  Expected: Unit test suite passes.

- [ ] **Step 3: Run payment cryptography tests**
  Run: `pnpm test:payments`
  Expected: Crypto validation passes.

- [ ] **Step 4: Run monorepo typecheck**
  Run: `pnpm typecheck`
  Expected: All packages pass typecheck cleanly.
