# CampusFlow Web UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the entire `apps/web` frontend (`18+` routes across Student Web, Auth, Merchant Portal, and Admin Portal) into the cohesive, sunlight-readable **Haramaya Daylight Ledger** experience with unified responsive navigation, role-gated portals, and standardized UI feedback primitives.

**Architecture:** Establish semantic CSS variables and Daylight Ledger tokens in `globals.css`/`tailwind.config.ts`, build pure role/cart/navigation helpers alongside shared Radix UI + Toast + ConfirmDialog + `TicketStub` primitives, wrap student/public routes (including `/merchant/register`) in a unified responsive `AppShell`, isolate merchant operational routes under a `(portal)` route group with role-gated responsive rails matching `/admin/*`, and upgrade every page to real data/consistent state handling with zero `alert()`/`confirm()`.

**Tech Stack:** Next.js 14.2.3 (App Router), React 18, TypeScript 5.4, Tailwind CSS 3.4, Radix UI (`dialog`, `dropdown-menu`, `avatar`, `label`, `separator`, `slot`), `lucide-react`, `qrcode.react`, `class-variance-authority`, Node 26 native test runner (`node --test`).

**Spec:** [docs/superpowers/specs/2026-11-24-web-ui-ux-redesign-design.md](../specs/2026-11-24-web-ui-ux-redesign-design.md)

## Global Constraints

- Scope is `apps/web` (plus updating `DESIGN.md` web section at finish). Do NOT modify `apps/mobile`, `apps/api`, `prisma/schema.prisma`, or `@campusflow/contracts`.
- Daylight visual palette: `--background: #FAF8F5` (`40 29% 97%`), `--card: #FFFFFF`, `--muted: #F2EFE9`, `--border: #E2DDD5`, `--foreground: #161815`, `--primary: #14532D` (Haramaya Highland Forest Green), `--secondary: #B45309` (Harar Ochre/Terracotta), plus `.dark` tokens.
- Offline-safe typography: No network-fetched `next/font/google` imports that fail offline builds; use system/CSS display (`Archivo` fallback stack) and tabular monospace (`tabular-nums`) for ETB prices, USSD strings, and ticket codes.
- Zero `window.alert()` or `window.confirm()` calls anywhere in `apps/web`; use `ToastProvider` (`useToast`) and Radix `ConfirmDialog`.
- Minimum `44x44px` touch targets on mobile interactive controls, WCAG AA+ contrast for outdoor sunlight legibility.
- Preserve all working integrations: Better Auth + `/auth/login` fallback, `formatETB()` integer minor units, single-merchant cart rule, SSE order streams on `/orders` and `/merchant/orders`, Web Audio order chimes on `/merchant/orders`, Telebirr/CBE Birr USSD & mock verification, QR code payloads.

## Review Focus

1. **Home search `?q=` dropped on `/directory`:** `/` forwards search queries to `/directory?q=...`; `/directory` must read `?q=` from URL query params on mount (inside a `<Suspense>` boundary) so searches land pre-filtered.
2. **Better Auth overwriting admin/merchant roles on `/login`:** `login/page.tsx` must not short-circuit Better Auth with hardcoded `roles: ['student']` when signing in as a `campus_admin`, `campus_moderator`, or `merchant`; hydrate real roles from `/auth/login`.
3. **Single-merchant cart conflict without `window.confirm()`:** Adding an item from a second business must open an in-app `ConfirmDialog` (`pendingConflict`) rather than calling `window.confirm()`, cleanly preserving or replacing the cart on user choice.
4. **Prospective merchants locked out of `/merchant/register`:** `/merchant/register` must sit outside `app/merchant/(portal)/layout.tsx` and inside the Student `AppShell`, showing a "Pending System Admin Approval" confirmation card after submission without linking non-admins to `/admin/verifications`.
5. **Offline API or unauthenticated states on `/` and protected routes:** `/` must degrade gracefully if `/transport/trips` or `/businesses` fail or return empty, and protected routes (`/orders`, `/bookings`, `/profile`, `/merchant/*`, `/admin/*`) must show clear `AuthPromptCard` or `AccessGateCard` views without unhandled rejections.

---

### Task 1: Daylight Ledger Tokens, Role Helpers, and Base UI Primitives

**Files:**
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/tailwind.config.ts`
- Modify: `apps/web/components/ui/button.tsx`
- Modify: `apps/web/components/ui/card.tsx`
- Modify: `apps/web/components/ui/badge.tsx`
- Modify: `apps/web/components/ui/input.tsx`
- Modify: `apps/web/components/ui/dialog.tsx`
- Create: `apps/web/lib/roles.ts`
- Create: `apps/web/components/ui/toast.tsx`
- Create: `apps/web/components/ui/confirm-dialog.tsx`
- Create: `apps/web/components/ui/ticket-stub.tsx`
- Create: `apps/web/components/ui/state-views.tsx`
- Test: `apps/web/lib/roles.test.ts`

**Interfaces:**
- Produces in `apps/web/lib/roles.ts`:
  - `hasMerchantAccess(roles?: string[] | null): boolean`
  - `hasAdminAccess(roles?: string[] | null): boolean`
  - `getPrimaryRoleLabel(roles?: string[] | null): string`
- Produces in `apps/web/components/ui/toast.tsx`:
  - `ToastProvider({ children }: { children: React.ReactNode })`
  - `useToast(): { toast: (opts: { title: string; description?: string; variant?: 'default' | 'success' | 'error' | 'warning' }) => void }`
- Produces in `apps/web/components/ui/confirm-dialog.tsx`:
  - `ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, cancelLabel, variant, onConfirm }: ConfirmDialogProps)`
- Produces in `apps/web/components/ui/ticket-stub.tsx`:
  - `TicketStub({ badge, title, subtitle, code, meta, qrValue, footerLeft, footerRight, accent }: TicketStubProps)`
- Produces in `apps/web/components/ui/state-views.tsx`:
  - `LoadingState({ label?: string, count?: number })`
  - `EmptyState({ icon, title, description, actionLabel, onAction, actionHref }: EmptyStateProps)`
  - `AuthPromptCard({ title, description, returnTo }: AuthPromptCardProps)`
  - `AccessGateCard({ title, description, showRegisterShop?: boolean }: AccessGateCardProps)`

- [ ] **Step 1: Write failing unit test for role & currency helpers**

Create `apps/web/lib/roles.test.ts` testing `hasMerchantAccess`, `hasAdminAccess`, `getPrimaryRoleLabel`, and `formatETB`:
- `hasAdminAccess(['campus_admin']) === true`, `hasAdminAccess(['campus_moderator']) === true`, `hasAdminAccess(['admin']) === true`, `hasAdminAccess(['student']) === false`, `hasAdminAccess(undefined) === false`.
- `hasMerchantAccess(['merchant']) === true`, `hasMerchantAccess(['campus_admin']) === true`, `hasMerchantAccess(['student']) === false`.
- `getPrimaryRoleLabel(['campus_admin']) === 'System Admin'`, `getPrimaryRoleLabel(['campus_moderator']) === 'Moderator'`, `getPrimaryRoleLabel(['merchant']) === 'Merchant'`, `getPrimaryRoleLabel(['student']) === 'Student'`, `getPrimaryRoleLabel([]) === 'Student'`.
- `formatETB(8500)` includes `'85.00'`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test apps/web/lib/roles.test.ts`
Expected: FAIL (`Cannot find module './roles'`).

- [ ] **Step 3: Implement `apps/web/lib/roles.ts` and update Daylight tokens**

Implement `hasMerchantAccess`, `hasAdminAccess`, `getPrimaryRoleLabel` in `apps/web/lib/roles.ts`.
Update `apps/web/app/globals.css` with Haramaya Daylight Ledger HSL variables (`--background: 40 29% 97%`, `--foreground: 100 7% 9%`, `--card: 0 0% 100%`, `--muted: 39 21% 93%`, `--muted-foreground: 28 6% 32%`, `--border: 37 18% 86%`, `--primary: 144 61% 20%`, `--secondary: 28 90% 37%`, `--destructive: 347 77% 41%`, `--radius: 0.625rem`, plus `.dark` variables and `.font-display` / `.tabular-nums` utilities).
Update `apps/web/tailwind.config.ts` font stacks (`display`, `sans`, `mono`) and daylight shadows/colors without `fonts.googleapis.com` network imports.

- [ ] **Step 4: Run test to verify `roles.test.ts` passes**

Run: `node --test apps/web/lib/roles.test.ts`
Expected: PASS (all assertions green).

- [ ] **Step 5: Upgrade base UI primitives and add `toast.tsx`, `confirm-dialog.tsx`, `ticket-stub.tsx`, `state-views.tsx`**

Update `button.tsx` (`min-h-[44px]` mobile-friendly sizing option + crisp daylight focus rings), `card.tsx` (`border-border bg-card shadow-xs`), `badge.tsx` (high-contrast daylight semantic badges: `success`, `warning`, `danger`, `info`, `outline`), `input.tsx` (`min-h-[44px]` / `h-11` daylight border), and `dialog.tsx` (`max-h-[90vh] overflow-y-auto`, warm stone overlay, accessible close button).
Implement `ToastProvider` + `useToast` in `toast.tsx`, `ConfirmDialog` in `confirm-dialog.tsx`, `TicketStub` (perforated dashed divider with circular side notches + `QRCodeSVG` + monospace stamp) in `ticket-stub.tsx`, and `LoadingState`, `EmptyState`, `AuthPromptCard`, `AccessGateCard` in `state-views.tsx`.

- [ ] **Step 6: Verify typecheck**

Run: `pnpm --filter @campusflow/web typecheck`
Expected: Exit code 0.

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/globals.css apps/web/tailwind.config.ts apps/web/lib/roles.ts apps/web/lib/roles.test.ts apps/web/components/ui/
git commit -m "feat(web): add Haramaya Daylight Ledger tokens, role helpers, and shared UI primitives"
```

---

### Task 2: Cart Conflict Flow, Root Providers, and Role-Preserving Auth

**Files:**
- Create: `apps/web/lib/cart-conflict.ts`
- Create: `apps/web/lib/cart-conflict.test.ts`
- Modify: `apps/web/lib/cart-context.tsx`
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/app/login/page.tsx`
- Modify: `apps/web/app/register/page.tsx`

**Interfaces:**
- Consumes: `ToastProvider` (`useToast`), `hasAdminAccess`, `hasMerchantAccess` from Task 1.
- Produces in `apps/web/lib/cart-conflict.ts`:
  - `resolveCartAdd(currentItems: CartItem[], nextItem: Omit<CartItem, 'quantity'>, quantity: number): { conflict: boolean; nextItems: CartItem[] }`
- Produces in `apps/web/lib/cart-context.tsx`:
  - Adds `pendingConflict: { existingBusinessName: string; newItem: Omit<CartItem, 'quantity'>; quantity: number } | null`
  - Adds `confirmCartSwitch(): void` and `cancelCartSwitch(): void` to `CartContextType` (zero `window.confirm()`).

- [ ] **Step 1: Write failing unit test for `resolveCartAdd`**

Create `apps/web/lib/cart-conflict.test.ts` testing:
- Adding item from same `businessId` merges quantity without `conflict: true`.
- Adding item from a different `businessId` when cart is non-empty returns `conflict: true` and leaves `nextItems` unchanged.
- Adding item when cart is empty returns `conflict: false` with `[item]`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test apps/web/lib/cart-conflict.test.ts`
Expected: FAIL (`Cannot find module './cart-conflict'`).

- [ ] **Step 3: Implement `cart-conflict.ts` and update `cart-context.tsx` + `app/layout.tsx`**

Implement `resolveCartAdd` in `apps/web/lib/cart-conflict.ts`.
Update `apps/web/lib/cart-context.tsx` to use `resolveCartAdd` and expose `pendingConflict`, `confirmCartSwitch`, and `cancelCartSwitch` instead of `confirm(...)`.
Wrap `apps/web/app/layout.tsx` in `<ToastProvider><AuthProvider><CartProvider>{children}</CartProvider></AuthProvider></ToastProvider>` and update metadata title/description cleanly.

- [ ] **Step 4: Run test to verify `cart-conflict.test.ts` passes**

Run: `node --test apps/web/lib/cart-conflict.test.ts`
Expected: PASS.

- [ ] **Step 5: Redesign `/login` and `/register` with split Daylight layout and role preservation**

In `apps/web/app/login/page.tsx`:
- Call `/auth/login` first (so backend `memberships` roles such as `campus_admin` or `merchant` are ALWAYS preserved accurately!) and fall back to `authClient.signIn.email` only if `/auth/login` fails for Better Auth-only accounts—never overwriting backend roles with `['student']`.
- Redirect after login based on role (`campus_admin`/`campus_moderator` -> `/admin/verifications`, `merchant` -> `/merchant/dashboard`, else `/directory` or `?next=` param).
- Render split Haramaya Daylight auth layout (left: CampusFlow institutional ledger summary + trust pillars; right: accessible sign-in form with quick-fill Pilot Demo buttons and link to `/register`).
In `apps/web/app/register/page.tsx`:
- Call `/auth/register` cleanly first (preserving `memberships` returned by backend, falling back to `authClient.signUp.email` if needed).
- Render matching split Daylight signup layout with campus selector, Ethiopian phone input, and clear Proclamation No. 1321/2024 notice.

- [ ] **Step 6: Verify typecheck**

Run: `pnpm --filter @campusflow/web typecheck`
Expected: Exit code 0.

- [ ] **Step 7: Commit**

```bash
git add apps/web/lib/cart-conflict.ts apps/web/lib/cart-conflict.test.ts apps/web/lib/cart-context.tsx apps/web/app/layout.tsx apps/web/app/login/page.tsx apps/web/app/register/page.tsx
git commit -m "feat(web): replace cart window.confirm, add ToastProvider, and preserve roles on auth"
```

---

### Task 3: Unified Responsive Student Shell (`AppShell`), Navigation, and `PageHeader`

**Files:**
- Create: `apps/web/lib/navigation.ts`
- Create: `apps/web/lib/navigation.test.ts`
- Create: `apps/web/components/layout/app-shell.tsx`
- Create: `apps/web/components/layout/mobile-bottom-nav.tsx`
- Create: `apps/web/components/layout/page-header.tsx`
- Modify: `apps/web/components/layout/navbar.tsx`
- Modify: `apps/web/components/layout/footer.tsx`

**Interfaces:**
- Consumes: `hasMerchantAccess`, `hasAdminAccess`, `getPrimaryRoleLabel` (Task 1), `useCart` (`pendingConflict`, `confirmCartSwitch`, `cancelCartSwitch`, `itemCount`) (Task 2), `ConfirmDialog` (Task 1).
- Produces in `apps/web/lib/navigation.ts`:
  - `PRIMARY_NAV_ITEMS`, `MORE_CAMPUS_ITEMS`, `MOBILE_DRAWER_SECTIONS`
  - `getRolePortalLinks(roles?: string[] | null): { href: string; label: string; badge: string }[]`
- Produces in `apps/web/components/layout/app-shell.tsx`:
  - `AppShell({ children, maxWidth?: '5xl' | '6xl' | '7xl', flush?: boolean })`
- Produces in `apps/web/components/layout/page-header.tsx`:
  - `PageHeader({ kicker, title, description, badge, action }: PageHeaderProps)`

- [ ] **Step 1: Write failing unit test for navigation role-gating**

Create `apps/web/lib/navigation.test.ts` asserting:
- All 11 student routes (`/`, `/directory`, `/transport`, `/housing`, `/learning`, `/events`, `/bookings`, `/marketplace`, `/maintenance`, `/orders`, `/profile`) plus `/merchant/register` appear across `PRIMARY_NAV_ITEMS`, `MORE_CAMPUS_ITEMS`, and `MOBILE_DRAWER_SECTIONS`.
- `getRolePortalLinks(['student'])` returns `[]` (no `/merchant/dashboard` or `/admin/verifications`).
- `getRolePortalLinks(['merchant'])` includes `/merchant/dashboard` and excludes `/admin/verifications`.
- `getRolePortalLinks(['campus_admin'])` includes `/admin/verifications`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test apps/web/lib/navigation.test.ts`
Expected: FAIL (`Cannot find module './navigation'`).

- [ ] **Step 3: Implement `navigation.ts`, `navbar.tsx`, `mobile-bottom-nav.tsx`, `footer.tsx`, `page-header.tsx`, `app-shell.tsx`**

- `navbar.tsx`: Top institutional bar (`#11241A`) with live client-side `EAT` clock (`useEffect` interval) and tap-to-call emergency Clinic/Security links; sticky primary header with mobile drawer button (`44x44px`), Forest Green monogram, primary nav links with active state, Radix `DropdownMenu` for "More Campus" (`/events`, `/bookings`, `/marketplace`, `/maintenance`), Cart trigger with badge, role-gated Portal pill (or `Open Shop` `/merchant/register`), and Auth/Profile pill.
- `mobile-bottom-nav.tsx`: Sticky bottom quick-bar (`md:hidden`) for `Pulse` (`/`), `Directory`, `Transport`, `Orders`, and `More` (opens drawer), each `min-h-[44px]`.
- `footer.tsx`: Compact 3-column daylight footer with student links, `/merchant/register` CTA, role-gated portal links, Proclamation No. 1321/2024 compliance stamp, and integer-cents accounting note.
- `app-shell.tsx`: Composes `Navbar`, `<main>` container, `Footer`, `MobileBottomNav` (with bottom padding on `< md`), and global `ConfirmDialog` bound to `useCart().pendingConflict`.

- [ ] **Step 4: Run test to verify `navigation.test.ts` passes**

Run: `node --test apps/web/lib/navigation.test.ts`
Expected: PASS.

- [ ] **Step 5: Verify typecheck**

Run: `pnpm --filter @campusflow/web typecheck`
Expected: Exit code 0.

- [ ] **Step 6: Commit**

```bash
git add apps/web/lib/navigation.ts apps/web/lib/navigation.test.ts apps/web/components/layout/
git commit -m "feat(web): build responsive AppShell, Navbar, mobile drawer, and PageHeader"
```

---

### Task 4: Live Campus Pulse Home (`apps/web/app/page.tsx`)

**Files:**
- Modify: `apps/web/app/page.tsx`

**Interfaces:**
- Consumes: `AppShell`, `TicketStub`, `LoadingState`, `useToast`, `useAuth`, `apiClient`, `formatETB`.

- [ ] **Step 1: Implement live-API Campus Pulse in `apps/web/app/page.tsx`**

Replace the static mock workspace with:
- Search & Quick-Jump Daylight Command Bar submitting via `router.push(\`/directory?q=\${encodeURIComponent(searchQuery)}\`)` plus category quick-links (`/directory`, `/transport`, `/housing`, `/learning`, `/bookings`, `/marketplace`).
- Live data fetches on mount (`Promise.allSettled` for `/transport/trips`, `/businesses`, `/announcements`, plus `/student/me` & `/wallet/me` when `user` is present) with `LoadingState` and graceful offline/empty fallback cards (no crash when backend is down).
- Right utility rail:
  - Signed-in: Real **Digital Student Pass** rendered via `TicketStub` + live wallet balance (`formatETB`).
  - Guest: Compact Sign In / Create Account card + collapsible `<details>` Pilot Sandbox Credentials drawer (copies with `useToast` feedback instead of temporary inline hack).
  - High-contrast Emergency Hotlines card (`025-553-0112`, `025-553-0333`, `025-553-0991`).

- [ ] **Step 2: Verify typecheck**

Run: `pnpm --filter @campusflow/web typecheck`
Expected: Exit code 0.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/page.tsx
git commit -m "feat(web): redesign Home into live Campus Pulse hub"
```

---

### Task 5: Commerce & Ordering Flow (`/directory`, `/shop/[id]`, `/cart`, `/orders`)

**Files:**
- Modify: `apps/web/components/commerce/product-card.tsx`
- Modify: `apps/web/components/commerce/order-status-badge.tsx`
- Modify: `apps/web/app/directory/page.tsx`
- Modify: `apps/web/app/shop/[id]/page.tsx`
- Modify: `apps/web/app/cart/page.tsx`
- Modify: `apps/web/app/orders/page.tsx`

**Interfaces:**
- Consumes: `AppShell`, `PageHeader`, `TicketStub`, `LoadingState`, `EmptyState`, `AuthPromptCard`, `Dialog`, `useToast`, `useCart`, `useAuth`, `formatETB`.

- [ ] **Step 1: Redesign shared commerce components and `/directory`**

- Update `product-card.tsx` and `order-status-badge.tsx` to Daylight tokens.
- Update `directory/page.tsx` to use `AppShell` + `PageHeader`, read `?q=` from `useSearchParams()` (wrapped in `<Suspense>`) so Home search queries pre-filter merchants/products, show announcement notice, campus selector, category pills, and uniform verified merchant cards.

- [ ] **Step 2: Redesign `/shop/[id]` and `/cart`**

- `shop/[id]/page.tsx`: Clean shop banner, `44x44px` quantity steppers, unavailable state badges, sticky mobile Order Summary bar + desktop summary card, zero `alert()`/`confirm()` (cart conflicts trigger `AppShell`'s `ConfirmDialog` automatically via `addItem`).
- `cart/page.tsx`: 2-column checkout ledger (`Order Items` + `Pickup Mode & Notes` on left, `Receipt Summary & Place Order` on right), `44x44px` controls, `useToast` feedback, redirect to `/login` cleanly via link/toast if guest.

- [ ] **Step 3: Redesign `/orders`**

- Preserve SSE `/orders/stream` + 8s polling fallback.
- Add visual 4-step order progress indicator (`Pending -> Preparing -> Ready -> Completed`).
- Move Telebirr / CBE Birr USSD payment panel and Pickup QR Pass into accessible Radix `Dialog`s (using `TicketStub` for the Pickup QR pass), replacing all `alert()` calls with `useToast`.

- [ ] **Step 4: Verify typecheck**

Run: `pnpm --filter @campusflow/web typecheck`
Expected: Exit code 0.

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/commerce/ apps/web/app/directory/page.tsx apps/web/app/shop/ apps/web/app/cart/page.tsx apps/web/app/orders/page.tsx
git commit -m "feat(web): redesign directory, shop, cart, and live SSE orders flow"
```

---

### Task 6: Transit & Living Flow (`/transport`, `/housing`, `/bookings`, `/maintenance`)

**Files:**
- Modify: `apps/web/app/transport/page.tsx`
- Modify: `apps/web/app/housing/page.tsx`
- Modify: `apps/web/app/bookings/page.tsx`
- Modify: `apps/web/app/maintenance/page.tsx`

**Interfaces:**
- Consumes: `AppShell`, `PageHeader`, `TicketStub`, `ConfirmDialog`, `Dialog`, `LoadingState`, `EmptyState`, `AuthPromptCard`, `useToast`, `formatETB`.

- [ ] **Step 1: Redesign `/transport`**

- Replace dark hero with Daylight Transit `PageHeader` + destination filter pills (`All`, `Dire Dawa`, `Harar`, `Addis Ababa`).
- Timetable-style trip cards with tabular `formatETB` fares and seat availability badges.
- Interactive Seat Map inside Radix `Dialog` (4-column coach/minibus grid with Available / Taken / Selected legend, passenger inputs, payment provider choice).
- `My Boarding Passes` tab rendering `TicketStub` cards with Radix `ConfirmDialog` for ticket cancellation and Radix `Dialog` for Telebirr USSD payment + `useToast` feedback (zero `alert()`/`confirm()`).

- [ ] **Step 2: Redesign `/housing`, `/bookings`, and `/maintenance`**

- `housing/page.tsx`: Property type filters (`All`, `Single Room`, `Shared`, `Studio`, `Apartment`), utility icon chips (Water, Power Backup, WiFi), `My Viewing Requests` tab, Radix `Dialog` viewing request modal + `useToast`.
- `bookings/page.tsx`: Dynamic default date (`tomorrow at 10:00`) instead of hardcoded past date `2026-11-20`, `TicketStub` Appointment QR Pass dialog, Radix `Dialog` booking modal, `AuthPromptCard` for guests, `useToast` feedback.
- `maintenance/page.tsx`: Category filter (`All`, `Plumbing`, `Electrical`, `Carpentry`, `Network`), status stamps, Radix `Dialog` new work order modal + `useToast`.

- [ ] **Step 3: Verify typecheck**

Run: `pnpm --filter @campusflow/web typecheck`
Expected: Exit code 0.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/transport/page.tsx apps/web/app/housing/page.tsx apps/web/app/bookings/page.tsx apps/web/app/maintenance/page.tsx
git commit -m "feat(web): redesign transport, housing, bookings, and maintenance pages"
```

---

### Task 7: Academic, Events, Marketplace & Profile (`/learning`, `/events`, `/marketplace`, `/profile`)

**Files:**
- Modify: `apps/web/app/learning/page.tsx`
- Modify: `apps/web/app/events/page.tsx`
- Modify: `apps/web/app/marketplace/page.tsx`
- Modify: `apps/web/app/profile/page.tsx`

**Interfaces:**
- Consumes: `AppShell`, `PageHeader`, `TicketStub`, `Dialog`, `LoadingState`, `EmptyState`, `AuthPromptCard`, `useToast`, `formatETB`.

- [ ] **Step 1: Redesign `/learning` and `/events`**

- `learning/page.tsx`: Search + Department + Resource Type toolbar, scannable repository rows with monospace course codes, download counts, and Radix `Dialog` resource upload modal.
- `events/page.tsx`: Category filters, event cards with calendar date-stamp blocks (`NOV 24`), one-click RSVP, and `My Tickets` tab rendering `TicketStub` QR event passes inside Radix `Dialog`.

- [ ] **Step 2: Redesign `/marketplace` and `/profile`**

- `marketplace/page.tsx`: Category tabs (`Textbooks`, `Electronics`, `Dorm`, `Stationery`), seller contact details, Radix `Dialog` listing creation form + `useToast`.
- `profile/page.tsx`: 3-tab student identity hub (`Digital Student ID` with `TicketStub` + QR, `Campus Wallet` with integer-cent balance + Telebirr/CBE Birr ledger overview, `Account & Security` with Proclamation No. 1321/2024 compliance notice and Sign Out), using `AuthPromptCard` / `LoadingState` cleanly.

- [ ] **Step 3: Verify typecheck**

Run: `pnpm --filter @campusflow/web typecheck`
Expected: Exit code 0.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/learning/page.tsx apps/web/app/events/page.tsx apps/web/app/marketplace/page.tsx apps/web/app/profile/page.tsx
git commit -m "feat(web): redesign learning, events, marketplace, and profile pages"
```

---

### Task 8: Role-Gated Merchant & Admin Portals, `DESIGN.md` Sync, and Full Build Verification

**Files:**
- Create: `apps/web/app/merchant/(portal)/layout.tsx`
- Create: `apps/web/app/merchant/(portal)/dashboard/page.tsx` (moved & redesigned from `apps/web/app/merchant/dashboard/page.tsx`)
- Create: `apps/web/app/merchant/(portal)/orders/page.tsx` (moved & redesigned from `apps/web/app/merchant/orders/page.tsx`)
- Create: `apps/web/app/merchant/(portal)/menu/page.tsx` (moved & redesigned from `apps/web/app/merchant/menu/page.tsx`)
- Delete: `apps/web/app/merchant/layout.tsx`, `apps/web/app/merchant/dashboard/page.tsx`, `apps/web/app/merchant/orders/page.tsx`, `apps/web/app/merchant/menu/page.tsx`
- Modify: `apps/web/app/merchant/register/page.tsx`
- Modify: `apps/web/app/admin/layout.tsx`
- Modify: `apps/web/app/admin/verifications/page.tsx`
- Modify: `apps/web/app/admin/complaints/page.tsx`
- Modify: `DESIGN.md`

**Interfaces:**
- Consumes: `hasMerchantAccess`, `hasAdminAccess`, `AccessGateCard`, `AppShell`, `PageHeader`, `ConfirmDialog`, `Dialog`, `useToast`, `formatETB`.

- [ ] **Step 1: Implement route-grouped Merchant portal shell & pages**

- Create `apps/web/app/merchant/(portal)/layout.tsx`: Enforces `hasMerchantAccess(user?.roles)` (rendering `AccessGateCard` with `showRegisterShop` when unauthorized), provides responsive desktop sidebar (`bg-[#0F1F16]`) + mobile top header & slide-over Radix `Dialog` drawer (`Dashboard`, `Live Order Queue`, `Menu & Catalog`, `Back to Campus Hub`).
- Move & redesign `dashboard`, `orders` (preserving SSE `/orders/stream` + Web Audio chime + `ConfirmDialog` for order cancellation + `useToast`), and `menu` (Radix `Dialog` for new item + availability toggles + `useToast`) under `apps/web/app/merchant/(portal)/`. Delete the old un-grouped `merchant/layout.tsx`, `merchant/dashboard`, `merchant/orders`, `merchant/menu` files so Next.js routes stay `/merchant/dashboard`, `/merchant/orders`, `/merchant/menu` cleanly.
- Redesign `apps/web/app/merchant/register/page.tsx` inside `AppShell` (outside `(portal)`) with a clean "Pending System Admin Approval" confirmation view (no `/admin/verifications` shortcut for non-admins).

- [ ] **Step 2: Implement role-gated Admin portal shell & pages**

- Update `apps/web/app/admin/layout.tsx`: Enforces `hasAdminAccess(user?.roles)` (rendering `AccessGateCard` when unauthorized), provides responsive desktop rail (`bg-[#171316]`) + mobile header & slide-over drawer.
- Redesign `verifications/page.tsx` and `complaints/page.tsx` with Daylight moderation cards, status badges, `ConfirmDialog` / `useToast` confirmations, and zero `alert()`.

- [ ] **Step 3: Update `DESIGN.md`**

Update `DESIGN.md` to document the shipped **Haramaya Daylight Ledger** web tokens, typography, and perforated stub conventions while preserving existing mobile design notes.

- [ ] **Step 4: Run all tests, typecheck, lint, and production build**

Run:
```bash
node --test apps/web/lib/*.test.ts
pnpm --filter @campusflow/web typecheck
pnpm --filter @campusflow/web lint
pnpm --filter @campusflow/web build
```
Expected: All unit tests PASS, `typecheck` exits 0, `lint` passes, `next build` succeeds with all routes compiled cleanly.

- [ ] **Step 5: Final commit**

```bash
git add apps/web DESIGN.md
git commit -m "feat(web): complete Haramaya Daylight Ledger redesign for merchant, admin, and docs"
```
