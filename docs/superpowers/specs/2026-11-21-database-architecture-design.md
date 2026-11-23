# CampusPro — Enterprise Database Architecture & Schema Specification

**Date:** 2026-11-21  
**Status:** Approved for Implementation (Design Phase)  
**Target Engine:** PostgreSQL 16+ via Prisma ORM  
**Application Scope:** CampusPro Backend (`apps/api`), Shared Contracts (`packages/contracts`), Mobile App (`apps/mobile`), Web Admin (`apps/web`)

---

## 1. Intent & Context

CampusPro (piloted as CampusFlow at Haramaya University Main Campus, Bate) is an enterprise multi-campus super-app consolidating academic life, cafeteria dining, transit ticketing, merchant commerce, student housing, and digital campus credentials.

The existing database schema in `prisma/schema.prisma` establishes core entities (Campuses, Users, Products, Orders, Trips, Events, Housing, and Auth). However, it lacks first-class data models for critical features already implemented in the frontend and mobile apps:
1. **Digital Student ID:** Official university identity credentials, academic affiliations, student card status, and verifiable offline/online QR passes.
2. **Campus Pay Wallet & Double-Entry Financial Ledger:** A zero-floating-point financial ledger tracking student and merchant balances, P2P transfers, top-ups (Telebirr, CBE Birr, Chapa), and transaction receipts with strict balance validation and idempotency.
3. **Dining Hall & Cafeteria Passes:** Meal allowance plans, dietary preference tracking (Non-Fasting, Fasting, Vegetarian, Halal), daily meal quota enforcement, and tamper-proof meal scan redemption logs.
4. **Concurrency & Race-Condition Controls:** Inventory stock decrements, bus seat bookings, and wallet debits must prevent race conditions and double-spending under high-concurrency peak campus moments (lunchtime rush, Friday afternoon transit booking).

This document specifies the complete, production-grade database architecture that achieves full data integrity, auditability, multi-tenant isolation, and performance.

---

## 2. Goals, Non-Goals, and Anti-Goals

### 2.1 Goals
- **Financial Precision & Immutability:** Store all monetary balances and transactions in integer minor units (`BigInt` Ethiopian Birr cents). Enforce strict double-entry bookkeeping (every credit has an offsetting debit) for internal campus wallet operations.
- **Offline & Low-Bandwidth Verifiability:** Provide secure QR payload tokens and nonce tracking to allow gate turnstiles, bus conductors, and dining hall scanners to validate passes even during temporary network interruptions.
- **Multi-Tenant Campus Isolation:** Enforce campus boundary scoping across all operational entities (`campusId` foreign keys and composite indexes).
- **Concurrency & Double-Booking Prevention:** Guarantee zero seat collisions on transport routes, zero overselling of cafeteria inventory, and zero double-spending of wallet balances using optimistic locking (`version` columns) and unique constraints.
- **Auditability & Regulatory Compliance:** Maintain full audit trails for sensitive actions and ensure compliance with Ethiopia's Personal Data Protection Proclamation No. 1321/2024.

### 2.2 Non-Goals
- **External University SIS Replacement:** CampusPro syncs with and reflects university student information system (SIS) data; it is not a general registrar/grading engine.
- **Distributed Microservice Partitioning:** Not splitting database into independent microservices at this stage; maintaining a clean, highly reliable modular monolith in PostgreSQL.
- **Crypto / Blockchain:** All financial ledgering uses standard double-entry relational ledger tables backed by ACID transactions.

### 2.3 Anti-Goals (Things to Strictly Avoid)
- **Floating-point currencies:** Using `Float` or `Double` for any financial value.
- **Blind balance mutations:** Running `UPDATE wallets SET balance = balance + amount` without recording a corresponding immutable ledger entry.
- **Unconstrained seat selection:** Allowing bus seat reservations without database-level `[tripId, seatNumber]` unique constraints.
- **Unbounded queries:** Multi-campus tables queried without `campusId` filtering or indexed keys.

---

## 3. Evaluated Approaches & Decision

### Approach 1: Additive Enterprise Schema with In-Prisma Ledger & Optimistic Concurrency (SELECTED)
- **Summary:** Expand `prisma/schema.prisma` with comprehensive models for Student Profiles, Digital ID, Wallets, Ledger Entries, Meal Passes, and concurrency controls (`version` fields). NestJS services manage business transactions using Prisma's interactive ACID transactions (`prisma.$transaction`).
- **Why Selected:** Seamlessly integrates with the monorepo, preserves end-to-end TypeScript type generation via Prisma Client, keeps CI/CD and migrations standard across local and production environments, and delivers complete ACID guarantees.

### Approach 2: Monolithic Schema with PostgreSQL-Native Triggers & Row-Level Security
- **Summary:** Enforce balance non-negativity and multi-tenant isolation via PL/pgSQL database triggers and PostgreSQL Row-Level Security (RLS) policies.
- **Why Rejected:** Splitting business rules between raw SQL triggers and TypeScript NestJS services creates cognitive overhead, complicates local migrations and seed scripting, and prevents compiler-level type checking in TypeScript.

### Approach 3: Event-Sourced & Isolated Subsystem Databases
- **Summary:** Split wallet and ticketing into separate microservice databases with Outbox event sourcing.
- **Why Rejected:** Heavy architectural complexity, eventual consistency risks for real-time meal and bus ticketing, and unnecessary operational burden for the current stage.

---

## 4. Architectural Domain Models & Builder Review Decisions

### 4.1 Identity & Student Profile Subsystem
Students require an institutional profile linking their generic user account to official university data:

```prisma
enum AcademicLevel {
  undergraduate
  postgraduate
  doctoral
  tvet
}

enum StudentIdStatus {
  active
  suspended
  graduated
  lost
}

model StudentProfile {
  id              String          @id @default(uuid()) @db.Uuid
  userId          String          @unique @map("user_id") @db.Uuid
  campusId        String          @map("campus_id") @db.Uuid
  studentIdNumber String          @map("student_id_number") // e.g., "HU-8921" or "RAM/1234/14"
  college         String          // e.g., "College of Computing and Informatics"
  department      String          // e.g., "Software Engineering"
  academicLevel   AcademicLevel   @default(undergraduate) @map("academic_level")
  batchYear       Int             @map("batch_year") // e.g., 2023
  emergencyPhone  String?         @map("emergency_phone")
  idCardStatus    StudentIdStatus @default(active) @map("id_card_status")
  qrSecret        String          @default(uuid()) @map("qr_secret") // TOTP / HMAC seed for dynamic QR
  issuedAt        DateTime        @default(now()) @map("issued_at")
  expiresAt       DateTime        @map("expires_at")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  campus          Campus          @relation(fields: [campusId], references: [id], onDelete: Cascade)
  mealPasses      MealPass[]

  @@unique([campusId, studentIdNumber])
  @@index([campusId, department], name: "idx_student_campus_dept")
  @@map("student_profiles")
}
```

---

### 4.2 Campus Pay Wallet & Double-Entry Ledger Subsystem

#### Resolved Architecture Decisions (from Builder Review):
1. **Wallet Ownership Decoupling:** `Wallet` has nullable `userId` and `businessId`. A personal student wallet has `userId != null`. A merchant store wallet has `businessId != null`. A campus treasury/clearing wallet has `userId == null` and `businessId == null` with a unique campus constraint `@@unique([campusId, walletType])`. This prevents synthetic fake users and cleanly isolates personal vs business revenue.
2. **Double-Entry Top-up Balancing:** External gateway deposits (Telebirr/Chapa/CBE Birr) credit the student wallet and debit the campus `campus_treasury` clearing account. This ensures `SUM(credits) == SUM(debits)` holds true across 100% of ledger transactions.
3. **Payment Reconciliation:** `Payment` model gains optional `walletId` and `walletTransactionId`. For external top-ups, `Payment` manages gateway redirect/webhooks, and when verified, dispatches the `WalletTransaction`. For in-app wallet checkouts, `Payment` records `provider: "campus_wallet"` linked directly to the `WalletTransaction`.

```prisma
enum WalletStatus {
  active
  frozen
  closed
}

enum WalletType {
  student
  merchant
  campus_treasury
  system_fee
}

enum LedgerEntryType {
  credit // Money entering the wallet
  debit  // Money leaving the wallet
}

enum TransactionCategory {
  topup_telebirr
  topup_cbe_birr
  topup_chapa
  p2p_transfer
  merchant_payment
  transport_payment
  cafeteria_payment
  housing_deposit
  refund
  system_fee
}

enum TransactionState {
  pending
  succeeded
  failed
  reversed
}

model Wallet {
  id           String       @id @default(uuid()) @db.Uuid
  campusId     String       @map("campus_id") @db.Uuid
  userId       String?      @unique @map("user_id") @db.Uuid
  businessId   String?      @unique @map("business_id") @db.Uuid
  walletType   WalletType   @default(student) @map("wallet_type")
  currency     String       @default("ETB") @db.Char(3)
  balanceMinor BigInt       @default(0) @map("balance_minor")
  status       WalletStatus @default(active)
  version      Int          @default(1) // Optimistic locking
  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")

  user         User?        @relation(fields: [userId], references: [id], onDelete: Cascade)
  business     Business?    @relation(fields: [businessId], references: [id], onDelete: Cascade)
  campus       Campus       @relation(fields: [campusId], references: [id], onDelete: Cascade)
  entries      LedgerEntry[]
  payments     Payment[]    @relation("WalletPayments")

  @@unique([campusId, walletType], name: "uq_campus_wallet_type")
  @@index([campusId, status], name: "idx_wallets_campus_status")
  @@map("wallets")
}

model WalletTransaction {
  id                  String              @id @default(uuid()) @db.Uuid
  referenceNumber     String              @unique @map("reference_number") // e.g. "TXN-202611-9482"
  idempotencyKey      String?             @unique @map("idempotency_key")
  campusId            String              @map("campus_id") @db.Uuid
  category            TransactionCategory
  state               TransactionState    @default(pending)
  amountMinor         BigInt              @map("amount_minor")
  feeMinor            BigInt              @default(0) @map("fee_minor")
  currency            String              @default("ETB") @db.Char(3)
  description         String
  metadata            Json?               // Gateway details, orderId, reservationId, etc.
  createdAt           DateTime            @default(now()) @map("created_at")
  completedAt         DateTime?           @map("completed_at")

  entries             LedgerEntry[]
  payments            Payment[]           @relation("TransactionPayments")

  @@index([campusId, createdAt(sort: Desc)], name: "idx_tx_campus_created")
  @@map("wallet_transactions")
}

model LedgerEntry {
  id             String            @id @default(uuid()) @db.Uuid
  transactionId  String            @map("transaction_id") @db.Uuid
  walletId       String            @map("wallet_id") @db.Uuid
  entryType      LedgerEntryType   @map("entry_type")
  amountMinor    BigInt            @map("amount_minor")
  currency       String            @default("ETB") @db.Char(3)
  balanceAfter   BigInt            @map("balance_after")
  createdAt      DateTime          @default(now()) @map("created_at")

  transaction    WalletTransaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  wallet         Wallet            @relation(fields: [walletId], references: [id], onDelete: Restrict)

  @@index([walletId, createdAt(sort: Desc)], name: "idx_ledger_wallet_created")
  @@map("ledger_entries")
}
```

---

### 4.3 Cafeteria Dining & Meal Pass Subsystem

#### Resolved Architecture Decisions (from Builder Review):
1. **Administrative & Purchasable Support:** `MealPlan` features optional `priceMinor BigInt? @map("price_minor")` and `billingDurationDays Int?`. This seamlessly supports both free government/university board assignments (`priceMinor: null` or `0`) and paid cafeteria subscriptions for non-board students.
2. **Dining POS & Point-of-Sale Integration:** À la carte meals bought at the cafeteria counter flow through standard merchant orders (`Order` / `OrderItem`) or direct `Payment` using `cafeteria_payment` category. `MealScanLog` remains dedicated to official meal pass quota redemptions (one scan per meal window).

```prisma
enum DietaryPreference {
  non_fasting
  fasting
  vegetarian
  halal
}

enum MealPeriod {
  breakfast
  lunch
  dinner
}

model MealPlan {
  id                  String            @id @default(uuid()) @db.Uuid
  campusId            String            @map("campus_id") @db.Uuid
  name                String            // e.g., "Haramaya Boarding Student Plan", "Semester Dining Subscription"
  description         String?
  priceMinor          BigInt?           @map("price_minor") // null/0 for free university board
  billingDurationDays Int?              @map("billing_duration_days") // e.g. 120 days per semester
  isActive            Boolean           @default(true) @map("is_active")
  createdAt           DateTime          @default(now()) @map("created_at")

  campus              Campus            @relation(fields: [campusId], references: [id], onDelete: Cascade)
  passes              MealPass[]

  @@map("meal_plans")
}

model MealPass {
  id                String            @id @default(uuid()) @db.Uuid
  studentProfileId  String            @map("student_profile_id") @db.Uuid
  mealPlanId        String            @map("meal_plan_id") @db.Uuid
  dietaryPreference DietaryPreference @default(non_fasting) @map("dietary_preference")
  passCode          String            @unique @map("pass_code") // e.g., "HU-DINING-PASS-NONFASTING-2026"
  validFrom         DateTime          @map("valid_from")
  validUntil        DateTime          @map("valid_until")
  isActive          Boolean           @default(true) @map("is_active")
  createdAt         DateTime          @default(now()) @map("created_at")

  studentProfile    StudentProfile    @relation(fields: [studentProfileId], references: [id], onDelete: Cascade)
  mealPlan          MealPlan          @relation(fields: [mealPlanId], references: [id], onDelete: Restrict)
  scans             MealScanLog[]

  @@index([studentProfileId, isActive], name: "idx_meal_pass_student")
  @@map("meal_passes")
}

model MealScanLog {
  id          String     @id @default(uuid()) @db.Uuid
  mealPassId  String     @map("meal_pass_id") @db.Uuid
  scannedById String     @map("scanned_by_id") @db.Uuid // Staff User ID who scanned the pass
  mealPeriod  MealPeriod @map("meal_period")
  scannedDate DateTime   @db.Date @map("scanned_date") // Calendar date for daily quota check
  scannedAt   DateTime   @default(now()) @map("scanned_at")
  diningHall  String     @map("dining_hall") // e.g., "Main Campus Dining Hall B"

  mealPass    MealPass   @relation(fields: [mealPassId], references: [id], onDelete: Cascade)
  scannedBy   User       @relation("StaffMealScans", fields: [scannedById], references: [id], onDelete: Restrict)

  // Enforces at most ONE scan per meal period per day per meal pass
  @@unique([mealPassId, scannedDate, mealPeriod], name: "uq_meal_pass_daily_period")
  @@index([scannedDate, mealPeriod, diningHall], name: "idx_meal_scans_date_hall")
  @@map("meal_scan_logs")
}
```

---

### 4.4 Hardened Commerce, Ticketing & Payments Subsystem

#### Product Model:
- Added `version Int @default(1)` for optimistic locking on stock decrements during concurrent ordering.

#### Trip Model:
- Added `version Int @default(1)` for seat count synchronization.
- Preserved `@unique([tripId, seatNumber])` on `TicketReservation` to mathematically prevent double-booking.

#### Payment Model:
- Added `walletId String? @map("wallet_id") @db.Uuid` and `walletTransactionId String? @map("wallet_transaction_id") @db.Uuid`.
- Added `"campus_wallet"` to the supported payment providers.

```prisma
model Payment {
  id                  String             @id @default(uuid()) @db.Uuid
  orderId             String?            @map("order_id") @db.Uuid
  reservationId       String?            @map("reservation_id") @db.Uuid
  walletId            String?            @map("wallet_id") @db.Uuid
  walletTransactionId String?            @map("wallet_transaction_id") @db.Uuid
  provider            String             // telebirr, cbe_birr, chapa, campus_wallet, cash_on_pickup, cash_at_station
  providerReference   String?            @map("provider_reference")
  amountMinor         BigInt             @map("amount_minor")
  currency            String             @default("ETB") @db.Char(3)
  status              PaymentStatus      @default(pending)
  createdAt           DateTime           @default(now()) @map("created_at")

  order               Order?             @relation(fields: [orderId], references: [id], onDelete: Cascade)
  reservation         TicketReservation? @relation(fields: [reservationId], references: [id], onDelete: Cascade)
  wallet              Wallet?            @relation("WalletPayments", fields: [walletId], references: [id], onDelete: SetNull)
  walletTransaction   WalletTransaction? @relation("TransactionPayments", fields: [walletTransactionId], references: [id], onDelete: SetNull)

  @@unique([provider, providerReference])
  @@map("payments")
}
```

---

## 5. Performance, Indexing & Multi-Tenant Storage Strategy

1. **Multi-Tenant Scoping:** All critical entities (`StudentProfile`, `Wallet`, `WalletTransaction`, `MealPlan`, `Product`, `Order`, `Business`, `HousingListing`, `Trip`) carry `campusId` foreign keys and composite indexes (`[campusId, ...]`).
2. **Reverse Chronological Listing Indexes:** User feed queries are indexed with `(userId, createdAt DESC)`.
3. **Optimistic Locking:** Hot rows (`wallets`, `products`, `trips`) feature integer `version` fields.
4. **Integer Financial Uniformity:** All currency amounts are `BigInt` minor units (cents).

---

## 6. Constraints & Invariant Checklist

| Invariant | Implementation Mechanism |
|-----------|--------------------------|
| Non-negative wallet balance | Optimistic version check in transaction + Application boundary assertion |
| Double-entry ledger balance | Every transaction creates balanced Debit & Credit `LedgerEntry` rows in a single `prisma.$transaction` |
| No double-booking of seats | Unique composite index `@@unique([tripId, seatNumber])` on `TicketReservation` |
| One cafeteria meal per window | Unique composite index `@@unique([mealPassId, scannedDate, mealPeriod])` on `MealScanLog` |
| Single wallet per student | Unique constraint `@@unique([userId])` on `Wallet` |
| Single wallet per business | Unique constraint `@@unique([businessId])` on `Wallet` |
| Unique student ID per campus | Unique composite constraint `@@unique([campusId, studentIdNumber])` on `StudentProfile` |
| Idempotent payments & webhooks | Unique constraint on `[provider, providerReference]` and `idempotencyKey` |

---

## 7. Migration & Rollout Plan

1. **Phase 1: Prisma Schema Update:** Update `prisma/schema.prisma` with all resolved models.
2. **Phase 2: Validation via Prisma Format:** Execute `pnpm prisma format` and `pnpm prisma validate` to confirm schema validity.
3. **Phase 3: Seed Script Update:** Extend `prisma/seed.ts` with mock student profiles (`HU-8921`), active wallets with initial ledger entries, meal plans, and cafeteria meal passes.
4. **Phase 4: Contracts Synchronization:** Update `packages/contracts` to expose the new DTOs and Zod validation schemas for Digital ID, Wallet, and Cafeteria Dining.

---

## 8. What is Left to the Builder

- Creating migration files with `pnpm prisma migrate dev`.
- Writing NestJS service methods in `apps/api` for ledger balance calculation, wallet debit/credit transactions, and meal pass verification.
- Integrating offline dynamic QR TOTP generation in the mobile app.
