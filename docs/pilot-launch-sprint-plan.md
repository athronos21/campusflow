# 🚀 CampusFlow Pilot Launch Sprint Plan (Haramaya University)

## 📌 Executive Summary

This 14-day sprint plan guides the founding team from local monorepo validation to a live, operational pilot at **Haramaya University (Main Campus, Bate)**. 

* **Pilot Target:** 5 verified merchants (2 Cafeterias, 1 Stationery/Binding Shop, 1 Tech Diagnostics, 1 Bus Shuttle Operator).
* **Target Audience:** ~500 registered students across Agriculture, Computing, and Health Science colleges.
* **Core North Star Metric:** ≥ 85% order fulfillment rate with < 10-minute turnaround time for cafe pickups.

---

## 🗓️ 14-Day Sprint Calendar

### Phase 1: Cloud Staging & Production Deployment (Days 1 – 4)

| Day | Focus Area | Deliverables & Actions |
| :--- | :--- | :--- |
| **Day 1** | **Server Infrastructure** | Provision VPS / Cloud VM (Ubuntu 22.04 LTS with Docker & Nginx Reverse Proxy). Set up SSL certificates via Let's Encrypt for `api.campusflow.et` and `app.campusflow.et`. |
| **Day 2** | **Database & Migrations** | Deploy PostgreSQL 16 container with automated daily volume backups to S3-compatible cold storage. Run `prisma db push` and verify initial seed state. |
| **Day 3** | **API & Web Deployment** | Deploy `@campusflow/api` (NestJS on PM2 / Docker) and `@campusflow/web` (Next.js 14 standalone output). Connect production `NEXT_PUBLIC_API_URL`. |
| **Day 4** | **Smoke & Load Testing** | Run `scripts/doctor.ts` and `scripts/test-e2e-flow.ts` against the live staging environment. Verify real-time SSE order streams over WebSocket/HTTPS. |

---

### Phase 2: Merchant Onboarding & Equipment Setup (Days 5 – 8)

| Day | Focus Area | Deliverables & Actions |
| :--- | :--- | :--- |
| **Day 5** | **Merchant Station Setup** | Visit pilot merchants in person at Haramaya Main Campus and Bate. Set up merchant Android tablets or smartphones with `/merchant/orders` pinned to home screen. |
| **Day 6** | **Audio & Notification Test** | Ensure browser audio permissions are granted for Web Audio order alert chimes. Test counter pickup workflow with real staff. |
| **Day 7** | **Physical Collateral** | Print and distribute branded table tents, window stickers, and QR code posters: *"Order Ahead on CampusFlow — Skip the Lunch Line"*. |
| **Day 8** | **Merchant Training** | Conduct 30-minute training sessions with cafeteria cashier staff: accepting orders, changing status (`preparing` → `ready`), and verifying Telebirr payment reference codes. |

---

### Phase 3: Student Alpha & Campus Ambassador Activation (Days 9 – 11)

| Day | Focus Area | Deliverables & Actions |
| :--- | :--- | :--- |
| **Day 9** | **Ambassador Briefing** | Recruit 10 active student ambassadors across dorm blocks (Block 21–28). Distribute student onboarding guides and APK download links for testing. |
| **Day 10** | **Telegram Channel Launch** | Launch the official verified student channel `@HaramayaCampusFlow`. Announce the pilot launch with an introductory explainer video and step-by-step order guide. |
| **Day 11** | **Incentive Rollout** | Activate the *"First 100 Students"* promo code offering a complimentary buna (coffee) or snack credit sponsored by the student union. |

---

### Phase 4: Full Campus Pilot Launch & Review (Days 12 – 14)

| Day | Focus Area | Deliverables & Actions |
| :--- | :--- | :--- |
| **Day 12** | **Go-Live Day** | Open campus food ordering from 07:30 AM (morning coffee rush). Founding team on-site at cafe counters to assist students and staff. |
| **Day 13** | **Transport & Shuttle Activation** | Open weekend bus bookings for Harar and Dire Dawa shuttles via `/transport`. Distribute digital QR boarding passes. |
| **Day 14** | **Sprint Retrospective** | Aggregate pilot metrics (total orders, Telebirr payment success rate, student feedback ratings). Prepare Sprint 2 roadmap. |

---

## 📊 Key Performance Indicators (KPIs)

1. **Active Student Accounts:** > 250 verified accounts within first 7 days.
2. **Order Volume:** > 60 daily orders during peak 12:00 – 14:00 lunch rush.
3. **Queue Time Reduction:** Average pickup wait reduced from 18 minutes to < 3 minutes.
4. **Payment Reliability:** > 98% Telebirr and CBE transaction verification without manual merchant reconciliation.
5. **System Uptime:** 99.5% uptime on API and real-time SSE stream connections.
