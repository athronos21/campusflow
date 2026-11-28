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

## Mobile Application (`apps/mobile`): Haramaya Daylight Ledger Alignment

### 1. Unified Mobile Token Hierarchy (`lib/core/constants/app_colors.dart`)
- **Canvas & Surface:**
  - `AppColors.background`: `0xFFFAF8F5` (Warm Limestone Canvas for sunlight readability on mobile screens).
  - `AppColors.surface`: `0xFFFFFFFF` (Crisp Paper Card Surface).
  - `AppColors.border`: `0xFFE2DDD5` (Hairline Travertine Border, `1px` crisp outlines).
  - `AppColors.muted`: `0xFFF2EFE9` (Warm Stone Well for input fills and unselected filter chips).
- **Brand Palette:**
  - `AppColors.primary`: `0xFF14532D` (Haramaya Highland Forest Green).
  - `AppColors.primaryLight`: `0xFFF0FDF4` (Daylight Green tint for active state pills and badges).
  - `AppColors.primaryDark`: `0xFF052E16` (Deep Pine for high-contrast headers).
  - `AppColors.secondary`: `0xFFB45309` (Harar Ochre / Terracotta for urgent actions, transit, and badges).
  - `AppColors.secondaryLight`: `0xFFFEF3C7` (Amber-gold tint).
- **Semantics:**
  - `AppColors.success` / `successBg`: `0xFF15803D` / `0xFFDCFCE7` (Emerald).
  - `AppColors.warning` / `warningBg`: `0xFFB45309` / `0xFFFEF3C7` (Ochre Amber).
  - `AppColors.danger` / `dangerBg`: `0xFFBE123C` / `0xFFFFE4E6` (Deep Crimson Rose).
- **Ink & Typography:**
  - `AppColors.textPrimary`: `0xFF161815` (Deep Charcoal Ink).
  - `AppColors.textSecondary`: `0xFF57534E` (High-contrast Stone).
  - `AppColors.textMuted`: `0xFF78716C` (Medium Stone).

### 2. Signature Mobile Widgets
- **Perforated Ticket Stub (`PerforatedTicketStub`):** Custom-painted ticket component with circular side cutouts, dashed ticket divider line, high-contrast QR pass container, and tabular metadata grid. Used across check-in passes, cafeteria meal tickets, and appointment bookings.
- **Physical Touch Target Standards:** Minimum `44x44px` (recommended `48px`) touch targets on all interactive cards, icon buttons, and action buttons.
- **Elevation & Shadowcraft:** Zero blur-heavy elevation cards; strictly single-elevation hairline borders (`Border.all(color: AppColors.border)`) with subtle daylight diffusion (`AppColors.softShadow`).
