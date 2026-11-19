# Haramaya University Merchant & Student Onboarding Playbook

## Context & Objectives

Haramaya University Main Campus is situated near the town of Bate in Eastern Ethiopia, serving over 20,000 students and academic staff. During peak class changes (10:00 AM coffee break, 12:00 PM lunch, and 5:00 PM tea), campus cafeterias and stationery stores experience extreme overcrowding, long wait times, and cash bottlenecks.

This playbook provides actionable, step-by-step procedures for signing up and supporting campus merchants and activating students.

---

## 1. Merchant Onboarding & Acquisition

### Target Pilot Merchants (Cohort 1)

1. **Haramaya Campus Cafe & Snack (Near Student Union / Library):** Freshly brewed Buna, Ful, Sambusa, Sandwiches.
2. **Afras Campus Stationery & Printing (Opposite Registrar):** Hardcover thesis binding, course syllabus printing, lab manual sales.
3. **Campus Tech & Electronics Repair (Main Gate 1):** Laptop charging adapters, diagnostics, OS installations, phone screen protectors.
4. **Haramaya Student Union Express Bus Shuttle:** Daily routes to Harar (Jugol Gate) and Dire Dawa (Ras Hotel).

---

### The Merchant Pitch Script

> *"Ato [Merchant Name], during the 12:00 PM rush, your counter has 40 students waiting simultaneously. Staff struggle to hear orders over noise, change runs short, and students leave without buying because the line is too long.*
>
> *With CampusFlow, students order and customize their meal on their phone 15 minutes before their class ends. Your counter device sounds an audio chime with the order ticket. Your kitchen prepares it without chaos. When ready, tap 'Ready'—the student walks straight to your pickup window, shows their order number, and collects it.*
>
> *Zero hardware costs. No expensive POS machines. During our pilot, there are 0% platform transaction commissions."*

---

### In-Store Physical Setup Checklist

- [ ] **Counter Device:** Low-cost 8" Android tablet or dedicated smartphone on a stable stand behind the counter.
- [ ] **Power & Connection:** Permanent USB charging cable and campus Wi-Fi / Ethio Telecom 4G connection.
- [ ] **Browser Pin:** Open Chrome to `https://app.campusflow.et/merchant/orders` and add shortcut to the Android Home Screen.
- [ ] **Sound Volume:** Adjust device volume to 80% to ensure audio alerts (`playChime()`) are clearly audible during kitchen cooking.
- [ ] **QR Counter Tent Stand:** Place acrylic QR stand at the collection window: *"Have an Order? Pick Up Here"*.

---

## 2. Student Activation & Growth Playbook

### Core Student Value Proposition

1. **Save 20 Minutes Daily:** Skip the lunch rush queue between back-to-back lectures.
2. **Guaranteed Bus Seats:** Avoid standing at the Main Gate wondering if the bus to Harar or Dire Dawa has empty seats.
3. **Academic Sharing:** Download verified past exam questions and lecture notes uploaded by top senior students.
4. **Safe Housing Discovery:** View verified rooms in Bate with confirmed water and power amenities without paying shady brokers.

---

### Grassroots Campus Launch Channels

| Channel | Method | Expected Reach |
| :--- | :--- | :--- |
| **Telegram Channel** | Launch official `@HaramayaCampusFlow` channel and student discussion group. Post daily bus timetables and cafeteria lunch specials. | 2,500+ subscribers |
| **Dorm Ambassadors** | Recruit 1 male and 1 female representative per dorm block. Provide branded lanyards and T-shirts. | Word-of-mouth in 20+ blocks |
| **Library Notice Boards** | High-visibility A3 posters near the main library entrance and science laboratories featuring QR download codes. | Constant foot traffic |
| **Student Union Partnership** | Official endorsement by the Haramaya University Student Union leadership during welcome orientation and hackathons. | Campus-wide credibility |

---

## 3. Operational Protocols & Issue Escalation

### Out-of-Stock Item Protocol
If a cafe runs out of a popular item (e.g., Ful or Sambusa):
1. The cashier navigates to `/merchant/menu`.
2. Switches the toggle next to the product from `Available` to `Sold Out`.
3. The item immediately grays out on student mobile screens, preventing invalid pre-orders.

### Customer Dispute & Refund Protocol
Under **Proclamation No. 1321/2024** and commercial fair practice:
- If an order cannot be fulfilled (e.g., kitchen power outage), the merchant taps `Cancel Order`.
- An automatic alert notifies the customer.
- The student can initiate a dispute or request assistance through `/admin/complaints` for resolution.
