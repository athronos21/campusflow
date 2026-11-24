# CampusFlow — Design System & Craft Guidelines

## Design Language & Anti-AI Slop Rules
CampusFlow rejects generic "AI slop" (random gradient cards, illegible low-contrast text, oversized floating rounded blobs, nested containers without clear hierarchy). Every visual element must serve student speed and sunlight clarity.

---

## Web Application (`apps/web`): Haramaya Daylight Ledger

### 1. Typography Hierarchy
- **Display / Headings (`.font-display`):** `Archivo, 'Segoe UI', system-ui, sans-serif` with tight tracking (`-0.025em`) and bold/black weights for crisp hierarchy without external network font dependencies.
- **Body & Controls:** System geometric/humanist sans (`'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif`) at `14px–16px` with `1.5` line-height.
- **Monospace (`.font-mono` + `.tabular-nums`):** Used exclusively for ETB pricing, USSD strings (`*127#`), order references, student IDs, and ticket verification codes.

### 2. Color Palette & Semantics (`apps/web/app/globals.css`)
- **Canvas & Surfaces (Daylight Light Default):**
  - `--background`: `#FAF8F5` (`40 29% 97%` Warm Limestone canvas for outdoor sunlight readability)
  - `--card` / `--popover`: `#FFFFFF` (Paper surface)
  - `--muted`: `#F2EFE9` (`39 21% 93%` Warm Stone well)
  - `--border` / `--input`: `#E2DDD5` (`37 18% 86%` Hairline Travertine border)
  - `--foreground`: `#161815` (`100 7% 9%` Deep Charcoal ink)
  - `--muted-foreground`: `#57534E` (`28 6% 32%` High-contrast Stone)
- **Brand & Operational Accents:**
  - `--primary`: `#14532D` (`144 61% 20%` Haramaya Highland Forest Green)
  - `--secondary`: `#B45309` (`28 90% 37%` Harar Ochre / Terracotta for transit and urgent calls to action)
  - `--destructive`: `#BE123C` (`347 77% 41%` Deep Rose-Crimson)
- **Dark Mode (`.dark`):** Obsidian-Pine (`#0C110E` canvas, `#141C17` card surface, `#F5F3EE` ink).

### 3. Layout, Primitives & Signature Stubs
- **Responsive Shell (`AppShell` & `PortalShell`):**
  - Student web routes (including `/merchant/register`) share `AppShell` (institutional top bar with live EAT clock, sticky desktop navbar + `More Campus` menu, mobile slide-over drawer, and sticky mobile bottom bar).
  - Merchant (`/merchant/(portal)/*`) and Admin (`/admin/*`) portals enforce role-gated access (`merchant`, `campus_admin`, `campus_moderator`, `admin`) via `PortalShell` with responsive mobile drawers.
- **Perforated Ticket Stub (`TicketStub`):** Shared two-zone QR stub with dashed divider and side notches used across Student Digital ID, Shuttle Boarding Passes, Pickup Order Passes, Appointment Passes, and Event Tickets.
- **Touch & Feedback:** Minimum `44x44px` interactive targets on mobile, Radix `Dialog` + `ConfirmDialog` + `ToastProvider` (zero native `alert()` or `confirm()` dialogs), crisp `1px` borders without heavy shadows.

---

## Mobile Application (`apps/mobile`) Reference
- **Primary Brand:** Deep Indigo (`#4f46e5`) and Modern Violet (`#7c3aed`) on Slate neutrals (`#f8fafc`), with Emerald (`#10b981`), Amber (`#f59e0b`), and Rose (`#f43f5e`) semantic statuses.
- **Audio Feedback:** Real-time Web Audio chimes for merchant kitchen and order status updates.
