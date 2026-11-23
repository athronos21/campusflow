# SDD ledger — plan: docs/superpowers/plans/2026-11-23-core-code-full-stack.md

Pre-flight: Interfaces check:
- Task 1 produces Assistant endpoints and enriched Announcements API in `@campusflow/api`.
- Task 2 consumes `@campusflow/api` endpoints in `@campusflow/web`.
- Task 3 consumes `@campusflow/api` endpoints in `@campusflow/mobile`.
- Task 4 verifies the full system across contracts, unit tests, mobile, and monorepo typecheck.
Pre-flight: clean interface alignment.

Task 1: complete (AssistantModule with dynamic campus context and enriched AnnouncementsService implemented; NestJS API built cleanly with 0 errors)
Ruling: Map shuttle route relations on Trip (`route.origin` and `route.destination`) and CampusEvent rather than raw fields to align with Prisma relational schema — Cost if wrong: None

Task 2: complete (Web Marketplace, Profile, and Maintenance wired to live API endpoints; Next.js 14 Web typechecked with 0 errors)
Ruling: Retain graceful offline/empty state fallback on Marketplace and Maintenance so UI remains resilient if local dev DB is unseeded — Cost if wrong: None

Task 3: complete (Mobile Announcement, Marketplace, and AI Assistant services wired to live endpoints; flutter analyze 0 issues, flutter test 6/6 passing)
Ruling: Store and parse Marketplace prices flexibly between minor unit cents (integer) and Birr float to maintain backward compatibility — Cost if wrong: None

Task 4: complete (Full verification passed: contracts validation 4/4 passing, service layer unit tests 9/9 passing, payment gateway crypto signatures 3/3 passing, NestJS API build green, Next.js web typecheck green, Flutter analyzer 0 issues, Flutter unit tests 6/6 green)
