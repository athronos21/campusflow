# CampusFlow Web UI/UX Redesign — Haramaya Daylight Ledger

**Date:** 2026-11-24  
**Scope:** `apps/web` only (Student Web, Auth, Merchant Portal, Admin/Moderator Portal, Shared Components & Design Tokens). `apps/mobile` and `apps/api` are explicitly out of scope.  
**Status:** Ready for user approval (builder check resolved)

---

## 1. Intent & Why

The current `apps/web` application suffers from fragmented layouts, broken mobile navigation, generic SaaS styling (`slate-100` + `indigo-600`), and a confusing mix of static mock data and live API screens:

- **Broken navigation & orphaned routes:** `components/layout/navbar.tsx` hides primary links below `md:` with no mobile drawer or bottom bar, omits `/bookings`, `/marketplace`, and `/maintenance` (leaving them discoverable only in the footer), and `merchant/layout.tsx` / `admin/layout.tsx` use fixed `w-64` sidebars that break on narrow screens.
- **Static vs. live disconnect:** `app/page.tsx` renders hardcoded shuttles, dishes, housing listings, and a "Sample Student" card alongside a static wallet explainer and oversized sandbox credential block, whereas `/directory`, `/transport`, `/orders`, `/housing`, `/events`, and `/learning` hit live `/api/v1` endpoints.
- **Inconsistent UI patterns:** Pages mix raw HTML buttons/modals (`fixed inset-0`), Radix `Dialog` (`marketplace`, `maintenance`), and native browser `alert()` / `confirm()` calls (`cart-context.tsx`, `transport/page.tsx`, `orders/page.tsx`, `bookings/page.tsx`, `cart/page.tsx`). Loading and empty states vary wildly across pages.

This redesign replaces the visual identity and unifies the information architecture of `apps/web` around **Haramaya Daylight Ledger**—a high-contrast, sunlight-readable, low-bandwidth web workspace built for Ethiopian university students, campus merchants, and administrators.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
1. **Unified Responsive App Shell:** Every Student, Merchant, and Admin route works cleanly from `360px` mobile browsers to `1440px` desktop screens, with zero orphaned routes and smooth role-gated switching.
2. **Haramaya Daylight Visual System:** Replace the generic Indigo/Slate look with a warm daylight limestone canvas, Ethiopian Highland Forest Green primary authority, Harar Terracotta/Amber operational accents, crisp hairline borders, and tabular monospace typography for ETB prices, USSD strings, and ticket codes.
3. **Real-Data-First Entry (`/`):** Rework `/` into a live Campus Pulse hub backed by real API queries (with graceful fallback states when the backend or session is unavailable) and a compact, non-intrusive Pilot Quick-Login strip.
4. **Cohesive Component & Feedback Grammar:** Replace every `alert()` / `confirm()` and hand-rolled modal overlay with accessible Radix `Dialog` sheets/modals, an inline Toast/Notification provider, consistent page headers, filter toolbars, skeleton/loading states, and empty/auth-prompt states.
5. **Signature Ticket & Pass Stub Language:** Unify Student Digital ID, Shuttle Boarding Passes, Order Pickup QR Passes, Service Booking Passes, and Event RSVP Tickets under one recognizable perforated-stub / pass card aesthetic.

### Non-Goals
- Modifying `apps/mobile` (Flutter), `apps/api` endpoints, database schemas, or `@campusflow/contracts` DTOs. *(Note: `apps/api/src/auth/auth.service.ts` currently assigns `role: 'student'` to all new signups rather than promoting the first signup to `campus_admin`, and `apps/api/src/moderation/moderation.service.ts` `verifyBusiness` updates `BusinessStatus.verified` without adding a `merchant` membership. Because `apps/api` is out of scope for this web-only redesign, `apps/web` will honor whatever roles the backend returns cleanly; updating `apps/api` for first-user-admin & auto-merchant-role-on-approval can follow separately if needed.)*
- Inventing backend endpoints that do not exist (existing routes keep their current API integrations and fallback behavior).
- Changing financial math or currency handling (all money remains integer minor units formatted via `formatETB()`).

### Anti-Goals
- Generic "AI slop" (floating gradient blobs, low-contrast pastel text on white, nested pointless cards, decorative animations that slow low-end Android browsers).
- Breaking outdoor sunlight readability (no low-contrast grey-on-grey text or dark-first student screens).
- Calling `next/font/google` in a way that fails offline builds; fonts must use safe CSS stacks / locally available system/self-hosted definitions that build cleanly offline.

---

## 3. Constraints

- **Framework & Dependencies:** Next.js 14.2.3 App Router, React 18, Tailwind CSS 3.4, Radix UI (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-avatar`, `@radix-ui/react-label`, `@radix-ui/react-separator`, `@radix-ui/react-slot`), `lucide-react`, `qrcode.react`, `class-variance-authority`, `tailwind-merge`. Keep bundle size light; avoid heavy new chart/animation libraries.
- **Design System Sync:** Keep `apps/web/app/globals.css` and `apps/web/tailwind.config.ts` CSS variables aligned with `DESIGN.md` (which will be updated at finish) and avoid breaking `packages/design-system` exports used elsewhere in the monorepo (`apps/mobile` or tests).
- **Role-Gated Portal Architecture & Shell Ownership:**
  - **Student `AppShell` owns public/student routes AND `/merchant/register`:** Any signed-in student or prospective vendor can apply to open a campus shop from `/merchant/register` inside the Student `AppShell`, and after submission sees a "Pending System Admin Approval" confirmation card (no direct `/admin/verifications` button unless the user holds an admin role).
  - **Strict Role Checks in Navigation & Portal Layouts:** Normalize role checks across `apps/web` to recognize `campus_admin`, `campus_moderator`, `admin`, and `merchant`. Header/drawer/footer links to `/merchant/dashboard` appear only for `merchant` / admin roles, and links to `/admin/verifications` appear only for `campus_admin` / `campus_moderator` / `admin` roles (non-merchants see "Open a Campus Shop" linking to `/merchant/register`).
  - **Layout-Level Access Gates (`/merchant/*` & `/admin/*`):** `app/merchant/layout.tsx` checks authenticated roles (`merchant`, `campus_admin`, `campus_moderator`, `admin`); `app/admin/layout.tsx` checks (`campus_admin`, `campus_moderator`, `admin`). Unauthorized or signed-out visitors see a clean **Access Restricted / Sign-In Gate** card (with Sign In, Register Shop where applicable, and Back to Student Hub actions) instead of exposing operational dashboards.
  - **Auth Role Preservation (`login/page.tsx` & `register/page.tsx`):** Fix `login/page.tsx` and `register/page.tsx` so backend `/auth/login` & `/auth/register` memberships/roles are preserved faithfully instead of Better Auth short-circuiting with hardcoded `roles: ['student']` when an admin or merchant signs in.
- **Functional Preservation:** Preserve Better Auth + `/auth/login` fallback in `lib/auth-context.tsx`, single-merchant cart enforcement in `lib/cart-context.tsx` (replacing `confirm()` with an in-app confirmation dialog), SSE live streams on `/orders` and `/merchant/orders`, Web Audio order chimes on `/merchant/orders`, Telebirr/CBE Birr USSD & mock payment verification flows, and all QR code generation.
- **Accessibility & Touch Ergonomics:** Minimum `44x44px` touch targets on mobile interactive controls, WCAG AA+ contrast for sunlight readability, semantic landmarks (`header`, `nav`, `main`, `aside`, `footer`), keyboard-navigable Radix dialogs and menus.

---

## 4. Approaches Considered

1. **Approach A — Haramaya Daylight Ledger (Selected):** Full visual system replacement + unified responsive Student/Merchant/Admin shell + live-data `/` Campus Pulse + standardized Radix Dialog/Toast primitives + signature Boarding-Pass/Ticket-Stub motif. *Trade-off:* Touches tokens, shell, and all 18+ `apps/web` routes; light-first by default for outdoor readability (with clean dark-mode token support).
2. **Approach B — Bate Night-Desk:** Dark-first split-pane dispatch workspace with persistent icon rail. *Trade-off:* Strong for indoor desktop operators, poor outdoor sunlight legibility for students on phones.
3. **Approach C — Unified Shell & Token Refresh:** Keep current page structures and `/` static layout, swapping only CSS colors, mobile navbar menu, and `alert()` dialogs. *Trade-off:* Fastest, but leaves the cluttered Home page and inconsistent card-grid UX intact.

**Why Approach A:** Directly eliminates both the visual genericism and the structural IA mess across all web personas without sacrificing outdoor student usability or desktop operator speed.

---

## 5. Visual World & Design Tokens (`Haramaya Daylight Ledger`)

### 5.1 Color System (CSS Variables in `apps/web/app/globals.css` & `tailwind.config.ts`)
- **Canvas & Surfaces (Light / Daylight Default):**
  - `--background`: `#FAF8F5` (Warm Limestone Canvas — reduces harsh white glare in sunlight while keeping crisp contrast)
  - `--card` / `--popover`: `#FFFFFF` (Pure Paper Surface)
  - `--muted`: `#F2EFE9` (Warm Stone Well)
  - `--border` / `--input`: `#E2DDD5` (Hairline Travertine Border)
  - `--foreground`: `#161815` (Deep Charcoal Ink — >14:1 contrast on canvas)
  - `--muted-foreground`: `#57534E` (Warm Stone-600 — >=5.5:1 contrast)
- **Brand & Operational Accents:**
  - `--primary`: `#14532D` (Haramaya Highland Forest Green — academic trust, verified authority; hover `#166534`)
  - `--primary-foreground`: `#FFFFFF`
  - `--secondary`: `#B45309` (Harar Ochre / Terracotta — shuttles, live urgency, campus highlights)
  - `--secondary-foreground`: `#FFFFFF`
  - `--accent`: `#ECE7DE` (Warm Sand Hover/Selection Tint)
  - `--ring`: `#14532D`
- **Semantic Status Colors:**
  - **Success / Verified / Ready:** `#047857` text / `#ECFDF5` bg / `#A7F3D0` border
  - **Warning / Preparing / Pending:** `#B45309` text / `#FFFBEB` bg / `#FDE68A` border
  - **Danger / Emergency / Cancelled:** `#BE123C` text / `#FFF1F2` bg / `#FECDD3` border
  - **Info / Academic:** `#0F766E` text / `#F0FDFA` bg / `#99F6E4` border
- **Dark Mode Support (`.dark`):** Deep Obsidian-Pine (`#0C110E` canvas, `#141C17` surface, `#26322B` border, `#F5F3EE` ink, `#22C55E` / `#F59E0B` accents) so dark mode remains coherent if toggled.

### 5.2 Typography & Rhythm
- **Sans / UI Stack:** Clean geometric/humanist stack with zero external network build dependency (`'Plus Jakarta Sans'`? No—avoid generic AI defaults; use `'Public Sans', 'Segoe UI', system-ui, -apple-system, sans-serif` or `'Archivo', 'Segoe UI', system-ui, sans-serif` for headings via CSS utility class `.font-display` + clean system sans body). Specifically:
  - `.font-display`: `'Archivo', 'Segoe UI', system-ui, -apple-system, sans-serif` with tight tracking (`-0.025em`) and bold/black weights for page titles, fares, and metrics.
  - Body (`font-sans`): `'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif` at `14px–16px` with `1.5` line-height.
  - `.font-mono`: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` with `tabular-nums` for ETB prices, USSD strings (`*127#`), order IDs, student IDs, and ticket codes.
- **Border Radius & Elevation:**
  - Sharper, more architectural geometry: `--radius: 0.625rem` (`10px`), cards `rounded-xl` (`12px`) with `1px solid` warm stone border (`shadow-xs` subtle depth instead of soft blurry shadows).

### 5.3 Signature Visual Move: The Perforated Campus Stub
Used for **Digital Student ID**, **Shuttle Boarding Passes**, **Food Pickup QR Passes**, **Service Appointment Passes**, and **Event Tickets**:
- Two-zone card split by a dashed horizontal or vertical perforation line (`border-dashed border-stone-300`) with semicircular side notches (`-left-2` / `-right-2` circular cutouts matching the parent canvas), crisp QR block on one side, monospace reference/seat/status stamp on the other.

---

## 6. Unified Navigation & Shell Architecture

### 6.1 Student & Public Shell (`components/layout/app-shell.tsx`, replacing ad-hoc `Navbar` + `Footer` wrappers)
Instead of repeating `<Navbar />` + `<main>` + `<Footer />` in 15+ files, introduce a cohesive **AppShell** (plus updated `Navbar` and `Footer` exports so imports stay clean or migrate cleanly):
1. **Top Utility Strip (Institutional Bar):** Compact single-line strip (`bg-[#11241A] text-stone-200`) showing active campus (`Haramaya University • Bate`), live local East Africa Time (`EAT` updated client-side instead of hardcoded `14:45`), and one-tap **Campus Clinic (`025-553-0112`)** / **Security (`025-553-0333`)** emergency trigger.
2. **Primary Header Bar (Sticky, `h-16`):**
   - Left: Mobile Menu button (`< md`, `44x44px`) + **CampusFlow** emblem (Forest Green monogram + crisp wordmark).
   - Center (`>= md`): Clean primary links covering core daily destinations (`Pulse` `/`, `Directory` `/directory`, `Transport` `/transport`, `Housing` `/housing`, `Academic` `/learning`) plus a **"More Campus"** Radix Dropdown Menu for `Events` (`/events`), `Bookings` (`/bookings`), `Marketplace` (`/marketplace`), and `Maintenance` (`/maintenance`) — **zero orphaned routes**.
   - Right: Live **My Orders** quick-link (when signed in), **Cart** button with live badge count, **Role Portal Pill** (`/merchant/dashboard` or `/admin/verifications` only when authorized; otherwise a subtle `Sell on Campus` link to `/merchant/register`), and **Account / Auth** pill (Avatar + initials + dropdown/profile link + Sign Out).
3. **Mobile Navigation Drawer + Bottom Quick-Bar (`< md`):**
   - Slide-over Radix Dialog drawer listing the student pillars (`Daily Essentials`, `Transit & Living`, `Academic & Campus`, `Profile & Digital ID`, plus `Open a Campus Shop` `/merchant/register`), and showing `Merchant Portal` / `Admin Panel` links **only** when the signed-in user holds the corresponding role.
   - Sticky Mobile Bottom Bar (`md:hidden`) with 4 high-frequency thumbs-reach tabs (`Pulse`, `Directory`, `Transport`, `Orders`, plus `Menu` sheet trigger) with `>=44px` tap targets.
4. **Compact Grounded Footer:** Streamlined 3-column daylight footer with campus info, student service links, `Register Campus Shop` (`/merchant/register`), role-gated portal links (only shown to authorized roles or labeled clearly as Partner/Admin Sign-In via `/login`), Proclamation No. 1321/2024 compliance badge, and integer-cents accounting note.

### 6.2 Merchant Portal Shell (`app/merchant/(portal)/layout.tsx`)
- **Route-Group Isolation:** Move `dashboard`, `orders`, and `menu` under `app/merchant/(portal)/` so `app/merchant/register/page.tsx` stays outside the merchant operator gate and renders inside the Student `AppShell`.
- **Role Gate:** `app/merchant/(portal)/layout.tsx` requires `merchant` (or `campus_admin` / `campus_moderator` / `admin`) role; otherwise renders a clean Access Restricted gate card inside a minimal daylight frame with `Sign In` (`/login`), `Register a Campus Shop` (`/merchant/register`), and `Return to Campus Hub` (`/`).
- **Responsive Drawer + Desktop Rail:** Fixed `w-64` deep forest-charcoal rail (`bg-[#0F1F16]`) on `lg+`, collapsing into a sticky top header + slide-over mobile drawer below `lg` so merchants on phones/tablets can operate the Live Order Queue without horizontal overflow.
- **Nav items:** Dashboard (`/merchant/dashboard`), Live Order Queue (`/merchant/orders`), Menu & Catalog (`/merchant/menu`), and "Back to Student Hub" (`/`).

### 6.3 Admin / Moderator Portal Shell (`app/admin/layout.tsx`)
- **Role Gate:** Requires `campus_admin` / `campus_moderator` / `admin` role; otherwise renders a clean Administrator Access Gate card with `Sign In` (`/login`) and `Return to Campus Hub` (`/`).
- **Responsive Drawer + Desktop Rail:** Matching deep slate-burgundy/charcoal governance rail (`bg-[#171316]`) with responsive mobile top bar + drawer below `lg`.
- **Nav items:** Merchant Verifications (`/admin/verifications`), Complaints & Reports (`/admin/complaints`), and "Back to Student Hub" (`/`).

---

## 7. Shared UI Primitives & Global Feedback

1. **Toast / Notification Provider (`components/ui/toast.tsx` + `ToastProvider` in `app/layout.tsx`):**
   - Replaces **all** `alert(...)` calls in `transport/page.tsx`, `orders/page.tsx`, `bookings/page.tsx`, `cart/page.tsx`, etc.
   - Supports `success`, `error`, `info`, `warning` variants with auto-dismiss and manual close.
2. **Confirm Dialog (`components/ui/confirm-dialog.tsx`):**
   - Built on Radix `Dialog` to replace `confirm(...)` calls (including single-merchant cart replacement in `lib/cart-context.tsx` via an async/callback confirmation flow or inline cart switch modal, and ticket cancellation in `transport/page.tsx`).
3. **Standardized Page Header (`components/layout/page-header.tsx`):**
   - Consistent kicker label (e.g., `SERVICE 02 • CAMPUS TRANSIT`), bold display `<h1>`, concise subtitle, status badge, and right-aligned primary action slot across all student, merchant, and admin pages.
4. **Consistent Empty, Loading & Auth-Gate States (`components/ui/state-views.tsx`):**
   - Clean skeleton cards / uniform spinner state, actionable EmptyState card (icon + headline + helper text + reset/CTA button), and AuthPromptCard for protected tabs (`Orders`, `My Tickets`, `Bookings`, `Profile`).
5. **Accessible Radix `Dialog` (`components/ui/dialog.tsx`):**
   - Styled for the Daylight Ledger aesthetic (crisp `1px` border, warm backdrop `bg-stone-950/60`, mobile-friendly max-height scrolling `max-h-[90vh] overflow-y-auto`) and used consistently for **every** modal across the app (seat picker, Telebirr/CBE Birr checkout, QR pickup/boarding pass, upload note, create booking, housing viewing request, maintenance report, marketplace post, merchant add item).

---

## 8. Route-by-Route Redesign Specification

### 8.1 Home — Campus Pulse (`app/page.tsx`)
Transform `/` from a static mock grid into a fast, live **Campus Pulse** command hub:
- **Top Search & Quick-Jump Hero Strip:** Compact daylight header card (not an oversized marketing banner) with unified search input forwarding to `/directory?q=...` and quick-action category pills (`Food & Cafeterias`, `Shuttles`, `Housing`, `Past Papers`, `Bookings`, `Marketplace`).
- **Live Data Sections (Left 8 cols on desktop):**
  - **Next Departing Shuttles:** Fetches live `/transport/trips` (showing top 2–3 upcoming departures with real seat counts, vehicle type, `formatETB`, and direct `Select Seat` link to `/transport`). Graceful fallback message/CTA if offline or empty.
  - **Open Campus Shops & Cafeterias:** Fetches live `/businesses` (filtering verified shops, showing top 3–4 with popular items and `View Menu` link to `/shop/[id]`).
  - **Latest Campus Notice & Quick Modules Strip:** Fetches `/announcements` (if any) + compact 4-tile grid linking to **Verified Housing** (`/housing`), **Academic Past Papers** (`/learning`), **Campus Events** (`/events`), and **Service Bookings** (`/bookings`).
- **Utility Rail (Right 4 cols on desktop):**
  - **Authenticated Student Card OR Guest Pass Prompt:** If signed in (`useAuth().user`), renders the student's real **Perforated Digital Student Pass** (from `/student/me` + live QR) and **Campus Wallet summary** (from `/wallet/me`). If signed out, renders a clean compact **Sign In / Create Account** card + a collapsible **"Pilot Demo Accounts"** accordion for one-click credential copy or instant fill on `/login`.
  - **Emergency Hotlines Card:** High-contrast Clinic (`025-553-0112`), Security (`025-553-0333`), Bate Police (`025-553-0991`) with tap-to-call `tel:` links.

### 8.2 Commerce Flow (`/directory`, `/shop/[id]`, `/cart`, `/orders`)
- **`/directory` (`app/directory/page.tsx`):** Unified `PageHeader`, live announcement banner (when present), sticky/clean campus selector + search + category pills (`All`, `Food & Cafeteria`, `Printing & Stationery`, `Tech & Electronics`), and uniform 2-column merchant cards with verified stamp, popular item chips, and clear `Open Menu` CTA.
- **`/shop/[id]` (`app/shop/[id]/page.tsx`):** Clean shop header banner with verified badge, menu items grid/list with `44x44px` quantity steppers (`-` / `+`), unavailable state badge, and a sticky **Order Summary / Proceed to Cart** bottom bar on mobile + right-side summary card on desktop. Also fix single-merchant cart conflict without blocking `window.confirm()`.
- **`/cart` (`app/cart/page.tsx`):** Clean 2-column checkout ledger (`Order Items` + `Pickup Mode & Notes` on left, `Summary & Place Order` receipt card on right) with `44x44px` touch quantity buttons and inline error/toast feedback.
- **`/orders` (`app/orders/page.tsx`):** Live SSE order tracker with visual 4-step status progress bar (`Pending → Preparing → Ready → Completed`), Telebirr / CBE Birr payment initiation inside Radix `Dialog` (monospace USSD string with copy button + mock verify), and Perforated **Pickup QR Pass** modal.

### 8.3 Transit & Living (`/transport`, `/housing`, `/bookings`, `/maintenance`)
- **`/transport` (`app/transport/page.tsx`):** Replace dark slate hero with Daylight Transit Header + destination filter pills (`All`, `Dire Dawa`, `Harar`, `Addis Ababa`), timetable-style trip cards with clear departure badges and tabular ETB fares, **Interactive Seat Map** inside a scrollable Radix `Dialog` (clear legend: Available / Taken / Selected, passenger details, payment method selector), and **Perforated Boarding Pass Cards** on `My Boarding Passes` tab with inline cancel confirmation dialog & Telebirr payment dialog.
- **`/housing` (`app/housing/page.tsx`):** Property filter bar (`All`, `Single Room`, `Shared`, `Studio`, `Apartment`), utility badge pills (Water, Power Backup, WiFi) with high-contrast icons, clean `formatETB` monthly rent display, `My Viewing Requests` tab, and Radix `Dialog` viewing request form.
- **`/bookings` (`app/bookings/page.tsx`):** Service appointment list with Perforated **Appointment QR Pass** dialog, clean Radix `Dialog` booking modal (fixing hardcoded default past date to dynamically default to tomorrow + formatted local date/time input), and auth-prompt state if signed out.
- **`/maintenance` (`app/maintenance/page.tsx`):** Dorm work-order tracker with category filter (`Plumbing`, `Electrical`, `Carpentry`, `Network`), status pills, and Radix `Dialog` new work-order submission.

### 8.4 Academic, Events, Marketplace & Identity (`/learning`, `/events`, `/marketplace`, `/profile`, `/login`, `/register`)
- **`/learning` (`app/learning/page.tsx`):** Search + Department + Resource Type (`Lecture Note`, `Past Exam`, `Syllabus`, `Lab Manual`) filter toolbar, dense scannable repository rows/cards showing course code in monospace, download counter, and Radix `Dialog` resource upload form.
- **`/events` (`app/events/page.tsx`):** Category filters, event cards with date-block calendar badges (`NOV 24` stamp), attendee counts, one-click RSVP, and `My Tickets` tab displaying Perforated **Event QR Ticket** dialogs.
- **`/marketplace` (`app/marketplace/page.tsx`):** Peer/campus catalog grid with category tabs (`Textbooks`, `Electronics`, `Dorm`, `Stationery`), condition badges, seller contact action, and Radix `Dialog` listing form.
- **`/profile` (`app/profile/page.tsx`):** Clean 3-tab identity hub (`Digital Student ID` featuring the Perforated ID Pass + QR, `Campus Wallet` featuring integer-cent balance + Telebirr/CBE Birr ledger info, `Account & Security` featuring Proclamation No. 1321/2024 privacy notice and Sign Out).
- **`/login` & `/register` (`app/login/page.tsx`, `app/register/page.tsx`):** Split daylight auth layout (left: Haramaya Daylight brand context & campus trust pillars; right: crisp auth card with one-click pilot role prefill chips on `/login` for Student / Merchant / Admin testing, preserving Better Auth + `/auth/login` fallback).

### 8.5 Merchant & Admin Portals (`/merchant/*`, `/admin/*`)
- **`/merchant/dashboard`:** KPI strip (Gross Sales, Active Queue, Menu Catalog) with clear status icons, quick-action cards to Order Queue and Menu, and live cafe status summary.
- **`/merchant/orders`:** High-clarity **Kitchen Display Queue** grouped/badged by status (`Pending` → `Preparing` → `Ready` → `Completed`), audio chime toggle button in header, new-order pulse banner, and one-tap status progression buttons (`Accept`, `Mark Ready`, `Complete`, `Cancel` with confirmation).
- **`/merchant/menu`:** Clean catalog table/grid with instant availability toggle switches, `formatETB` pricing, and Radix `Dialog` for adding new menu items + image upload.
- **`/merchant/register`:** Moved into the Student `AppShell` (not behind the merchant operator gate) so any signed-in applicant can submit their shop for verification; displays a "Pending System Admin Approval" state upon submission with a clean link back to `/directory` or `/`.
- **`/admin/verifications` & `/admin/complaints`:** High-clarity moderation queues with applicant/reporter metadata, clear status stamps, and one-click `Approve Merchant` / `Resolve Report` actions with toast confirmation.

---

## 9. What Is Left to the Builder

- Exact component file breakdown, shared helper hooks (e.g., toast context, cart switch confirmation), and responsive breakpoint spacing details within the defined token system.
- Updating `DESIGN.md` at the end of implementation to reflect the shipped Haramaya Daylight Ledger web tokens (keeping `apps/mobile` notes intact if `DESIGN.md` covers both, or clearly scoping the web section).
- Verifying `pnpm --filter @campusflow/web typecheck` and `pnpm --filter @campusflow/web build` (plus visual/UI inspection in a real browser across desktop and mobile viewports).
