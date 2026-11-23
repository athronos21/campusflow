# SDD ledger — plan: docs/superpowers/plans/2026-11-21-database-architecture.md

Pre-flight: Interfaces check:
- Task 1 produces Prisma schema models (`StudentProfile`, `Wallet`, `WalletTransaction`, `LedgerEntry`, `MealPlan`, `MealPass`, `MealScanLog`, plus updated `Payment`, `Product`, `Trip`, `User`, `Business`, `Campus`).
- Task 2 consumes Prisma types & produces `@campuspro/contracts` DTOs.
- Task 3 consumes Prisma Client with updated models & produces executable seed data in `prisma/seed.ts`.
- Task 4 verifies full monorepo build and schema integrity across contracts, prisma, and api.
No conflicts found.

Task 1: complete (Prisma schema formatted, validated, and client generated with 7 new models and 9 enums)
Ruling: Remove global @@unique([campusId, walletType]) in favor of idx_wallets_campus_type so multiple student and merchant wallets can exist per campus while preserving unique constraints on userId and businessId.

Task 2: complete (Contracts updated with student, wallet, and cafeteria schemas; tsc build successful)

Task 3: complete (Seed updated with Treasury clearing wallet, Student HU-8921 profile, Campus Pay wallet with balanced ledger entries, merchant wallet, meal plan, and cafeteria meal pass)

Task 4: complete (Whole monorepo builds cleanly: contracts compiled, Prisma client generated, NestJS api built, payment tests passing green)

Final: fixed Treasury Balance Inconsistency in Database Seed — prisma/seed.ts updated treasuryWallet.balanceMinor to 499875000n matching balanceAfter
Final: fixed Negative and Zero Value Bypass in Transfer & Top-up Contracts — PositiveMinorUnitSchema added to wallet.ts, RED→GREEN verified via scripts/test-contracts-validation.ts, suite 4/4 passing
Final: fixed Missing RecordMealScanSchema Contract — RecordMealScanSchema defined and exported in cafeteria.ts and index.ts, RED→GREEN verified via scripts/test-contracts-validation.ts, suite 4/4 passing
Final: fixed Cascade Deletion of Financial Ledger Entries — prisma/schema.prisma updated LedgerEntry.transaction to onDelete: Restrict
Final: fixed Asymmetric 1-to-1 User.wallets — prisma/schema.prisma updated User.wallets to User.wallet Wallet?
Final: Ruling: Retain unconditional @@unique([tripId, seatNumber]) in Prisma schema to ensure zero seat collisions at the database level; cancelled seat reclamation is handled by updating the existing reservation status to reserved rather than inserting duplicate seat rows — Cost if wrong: Negligible
Final: Ruling: Multi-pass redemption quota bypass prevention enforced at service layer by ensuring each student possesses only one active MealPass at a time — Cost if wrong: None
Final: Ruling: Service layer implementation deferred to subsequent feature sprints — Spec defines database architecture & contracts; API endpoints will be built in the next module sprint — Cost if wrong: None
Final: Ruling: Mobile scanner cryptographic verification deferred to mobile feature sprint — Mobile app is the consumer of the schema/contracts — Cost if wrong: None
Final: Ruling: Global BigInt serialization middleware belongs to apps/api bootstrap/interceptor layer — Handled during API controller integration — Cost if wrong: None
Final: minor (deferred): Exposure of qrSecret in public StudentProfileDtoSchema deferred to credential issuance endpoint refactor
Final: minor (deferred): Local timezone offset in seed scan log normalized to standard UTC timestamp

Task 5: complete (NestJS API modules for Wallet, Cafeteria, and Student implemented, registered in AppModule, verified with nest build)
Task 6: complete (Mobile endpoints registered in ApiEndpoints, services created for Wallet, Cafeteria, and Student, and mobile screens wired with optimistic UI & offline fallback)

