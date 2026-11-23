# Database Architecture & Subsystem Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete, production-grade PostgreSQL database schema for CampusPro with Prisma ORM, introducing Digital Student IDs, Campus Pay double-entry financial wallets, Cafeteria dining passes, optimistic locking, and verified seed data.

**Architecture:** Extend `prisma/schema.prisma` with 7 new models and 9 enums, add optimistic concurrency version columns to commerce and transit models, update `@campuspro/contracts` with corresponding DTOs and Zod validation schemas, and update `prisma/seed.ts` to populate realistic campus data matching the mobile application.

**Tech Stack:** PostgreSQL 16+, Prisma ORM 5.x, TypeScript 5.x, NestJS 10.x, Zod, Turbo repo, pnpm.

**Spec:** [`docs/superpowers/specs/2026-11-21-database-architecture-design.md`](file:///c:/Users/Athronos/Desktop/campuspro/docs/superpowers/specs/2026-11-21-database-architecture-design.md)

## Global Constraints

- All financial values must be stored in `BigInt` minor units (Ethiopian Birr cents, 1 ETB = 100 cents); no floating-point numbers.
- Strict double-entry accounting: every `WalletTransaction` must generate balanced debit and credit `LedgerEntry` records (`SUM(credits) == SUM(debits)`).
- Every primary operational entity must include a `campusId` foreign key and composite indexing for tenant isolation.
- Unique constraints must enforce business invariants at the database engine level (e.g., `[tripId, seatNumber]`, `[campusId, studentIdNumber]`, `[mealPassId, scannedDate, mealPeriod]`).
- Optimistic locking using integer `version` columns on high-concurrency models (`Product`, `Trip`, `Wallet`).

## Review Focus

1. **Negative Wallet Balance Overdraft:** An application race condition attempts simultaneous debits; the version check and non-negative balance guard must reject concurrent overdrafts.
2. **Duplicate Cafeteria Meal Redemption:** A student attempts to scan their dining QR code twice within the same breakfast window; database constraint `uq_meal_pass_daily_period` must throw a unique violation.
3. **Double Bus Seat Reservation:** Two passengers book seat 14 on trip HU-DD at the exact same millisecond; composite unique constraint `[tripId, seatNumber]` must accept only one and fail the other.
4. **Unbalanced Ledger Transaction:** A top-up or transfer creates mismatched debit and credit entries; transaction validation must guarantee credits equal debits.
5. **Decoupled Wallet Integrity:** A campus treasury wallet must have `userId: null` and `businessId: null` while enforcing `uq_campus_wallet_type`.

---

### Task 1: Prisma Schema Expansion & Relations

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Consumes: Existing models (`Campus`, `User`, `Business`, `Payment`, `Product`, `Trip`, `TicketReservation`)
- Produces: Updated schema exporting `StudentProfile`, `Wallet`, `WalletTransaction`, `LedgerEntry`, `MealPlan`, `MealPass`, `MealScanLog`, plus updated `Payment`, `Product`, `Trip`, `User`, `Business`, `Campus`

- [ ] **Step 1: Check existing Prisma schema formatting and status**
  Run: `pnpm prisma validate`
  Expected: Schema is valid.

- [ ] **Step 2: Add Enums to `prisma/schema.prisma`**
  Add `AcademicLevel`, `StudentIdStatus`, `WalletStatus`, `WalletType`, `LedgerEntryType`, `TransactionCategory`, `TransactionState`, `DietaryPreference`, `MealPeriod`.

- [ ] **Step 3: Update Core Models with Concurrency Fields and Relations**
  - Add `studentProfiles StudentProfile[]`, `wallets Wallet[]`, `walletTransactions WalletTransaction[]`, `mealPlans MealPlan[]` to `Campus`.
  - Add `studentProfile StudentProfile?`, `wallets Wallet[]`, `staffMealScans MealScanLog[] @relation("StaffMealScans")` to `User`.
  - Add `wallet Wallet?` to `Business`.
  - Add `version Int @default(1)` to `Product`.
  - Add `version Int @default(1)` to `Trip`.
  - Add `walletId String? @map("wallet_id") @db.Uuid`, `walletTransactionId String? @map("wallet_transaction_id") @db.Uuid`, and relations `wallet`, `walletTransaction` to `Payment`.

- [ ] **Step 4: Add New Domain Models to `prisma/schema.prisma`**
  - Add `StudentProfile` with `@@unique([campusId, studentIdNumber])` and `idx_student_campus_dept`.
  - Add `Wallet` with `version Int @default(1)`, `balanceMinor BigInt`, and `@@unique([campusId, walletType])`.
  - Add `WalletTransaction` with `referenceNumber String @unique`, `idempotencyKey String? @unique`, and `idx_tx_campus_created`.
  - Add `LedgerEntry` with `entryType`, `amountMinor`, `balanceAfter`, and `idx_ledger_wallet_created`.
  - Add `MealPlan` with optional `priceMinor BigInt?`, `billingDurationDays Int?`.
  - Add `MealPass` with `passCode String @unique` and `idx_meal_pass_student`.
  - Add `MealScanLog` with `@@unique([mealPassId, scannedDate, mealPeriod])` and `idx_meal_scans_date_hall`.

- [ ] **Step 5: Run Prisma Format & Validate**
  Run: `pnpm prisma format && pnpm prisma validate`
  Expected: Schema formatted cleanly and passes validation without errors.

- [ ] **Step 6: Generate Prisma Client**
  Run: `pnpm prisma generate`
  Expected: Prisma Client generated successfully with all new models and relations.

---

### Task 2: Shared Contracts & Type Definitions

**Files:**
- Create: `packages/contracts/src/student.ts`
- Create: `packages/contracts/src/wallet.ts`
- Create: `packages/contracts/src/cafeteria.ts`
- Modify: `packages/contracts/src/payments.ts`
- Modify: `packages/contracts/src/index.ts`

**Interfaces:**
- Consumes: `@prisma/client` types and Zod
- Produces: Contract schemas and TypeScript DTOs for Digital ID, Wallet/Ledger, Cafeteria Passes, and Payment Providers

- [ ] **Step 1: Write `packages/contracts/src/student.ts`**
  Define `AcademicLevelSchema`, `StudentIdStatusSchema`, `StudentProfileDto`, `CreateStudentProfileSchema`, and `VerifyStudentIdSchema`.

- [ ] **Step 2: Write `packages/contracts/src/wallet.ts`**
  Define `WalletStatusSchema`, `WalletTypeSchema`, `TransactionCategorySchema`, `WalletDto`, `WalletTransactionDto`, `LedgerEntryDto`, `InitiateWalletTransferSchema`, and `WalletTopupSchema`.

- [ ] **Step 3: Write `packages/contracts/src/cafeteria.ts`**
  Define `DietaryPreferenceSchema`, `MealPeriodSchema`, `MealPlanDto`, `MealPassDto`, `MealScanLogDto`, `VerifyMealPassSchema`, and `RecordMealScanSchema`.

- [ ] **Step 4: Update `packages/contracts/src/payments.ts`**
  Add `'campus_wallet'` to `PaymentProviderSchema`. Add `walletId?: string | null` and `walletTransactionId?: string | null` to `PaymentDto`.

- [ ] **Step 5: Export new contracts from `packages/contracts/src/index.ts`**
  Export all types and schemas from `./student`, `./wallet`, and `./cafeteria`.

- [ ] **Step 6: Build and typecheck `@campuspro/contracts`**
  Run: `pnpm --filter @campuspro/contracts build`
  Expected: TypeScript build completes with exit code 0.

---

### Task 3: Comprehensive Seed Data Update

**Files:**
- Modify: `prisma/seed.ts`

**Interfaces:**
- Consumes: Prisma Client with updated models
- Produces: Executable database seed creating campus treasury wallets, student profile (`HU-8921`), personal wallet with starting balance `1,250.00 ETB` (`125000` cents), double-entry ledger records, boarding meal plan, and active dining pass

- [ ] **Step 1: Read and inspect existing `prisma/seed.ts`**
  Verify existing user IDs, campuses, and businesses in `prisma/seed.ts`.

- [ ] **Step 2: Add Campus Treasury Clearing Wallets to Seed**
  For each seeded campus (e.g. Haramaya Main Campus), upsert a `Wallet` with `walletType: 'campus_treasury'`, `userId: null`, `businessId: null`, and initial reserve balance.

- [ ] **Step 3: Add Student Profile for Pilot Student**
  Upsert `StudentProfile` for Tigist Haile / pilot student:
  - `studentIdNumber: 'HU-8921'`
  - `college: 'College of Computing and Informatics'`
  - `department: 'Software Engineering'`
  - `batchYear: 2023`
  - `idCardStatus: 'active'`
  - `expiresAt: 2027-07-07T00:00:00Z`

- [ ] **Step 4: Seed Personal Student Wallet with Double-Entry Ledger**
  - Create student `Wallet` with `balanceMinor: 125000n` (1,250.00 ETB).
  - Create `WalletTransaction` with `category: 'topup_telebirr'`, `state: 'succeeded'`, `amountMinor: 125000n`.
  - Create two balanced `LedgerEntry` records:
    1. Student Wallet: `entryType: 'credit'`, `amountMinor: 125000n`, `balanceAfter: 125000n`.
    2. Campus Treasury: `entryType: 'debit'`, `amountMinor: 125000n`.

- [ ] **Step 5: Seed Merchant Store Wallets**
  Create merchant `Wallet` with `walletType: 'merchant'` linked to seeded businesses (`businessId`).

- [ ] **Step 6: Seed Cafeteria Meal Plan & Student Dining Pass**
  - Create `MealPlan` ("Haramaya Boarding Student Plan", `priceMinor: null`, `isActive: true`).
  - Create `MealPass` for the student:
    - `dietaryPreference: 'non_fasting'`
    - `passCode: 'HU-DINING-PASS-NONFASTING-2026'`
    - `validFrom: new Date()`
    - `validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)`
    - `isActive: true`
  - Create a sample `MealScanLog` for today's breakfast scanned by campus staff.

- [ ] **Step 7: Verify Seed Script Compilation**
  Run: `pnpm tsx --dry-run prisma/seed.ts` or typecheck `seed.ts`
  Expected: No TypeScript or Prisma schema compilation errors.

---

### Task 4: End-to-End Build and Schema Integrity Verification

**Files:**
- Verify: Entire monorepo build across `packages/contracts`, `prisma`, and `apps/api`

- [ ] **Step 1: Run turbo build across api and contracts**
  Run: `pnpm turbo run build --filter=@campuspro/contracts --filter=@campuspro/api`
  Expected: Successful build across all packages.

- [ ] **Step 2: Verify Schema and Invariant Consistency**
  Verify all 612+ lines of Prisma schema, relations, unique constraints, and indexes match the design specification.
