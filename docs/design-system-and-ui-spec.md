# CampusFlow Comprehensive Design System & UI/UX Architecture Specification

**Version:** 1.0.0  
**Pilot Institution:** Haramaya University (Main Campus, Bate, Ethiopia)  
**Expansion Targets:** Dire Dawa University, Jigjiga University, Addis Ababa University (AAU), Hawassa University, Jimma University  
**Target Platforms:** Web Application (Next.js 14, Tailwind CSS, Lucide Icons) & Mobile Application (Flutter 3.x, Dart, Material 3)  
**Strict Policy:** Zero unicode emojis in production interfaces or code; 100% vector-based iconography (`lucide-react` on web, `Icon(Icons.*)` on mobile).

---

## 1. Executive Summary & Design Philosophy

CampusFlow is the unified digital campus ecosystem for Ethiopian higher education institutions. Campus life in Ethiopian universities presents distinct operational realities:
- **Intense Outdoor Sunlight:** Bright outdoor environments across Eastern Ethiopian campuses (Haramaya, Dire Dawa) require high-contrast color ratios exceeding WCAG 2.1 AAA on critical indicators.
- **Intermittent Connectivity (2G/3G & Power Interruptions):** Interfaces must never freeze or present blank screens; skeleton loaders, local caching, optimistic updates, and offline fallback states are mandatory.
- **Fintech & Currency Rigor:** Payments in Ethiopian Birr (ETB) utilize Telebirr, CBE Birr, and Chapa with strict integer minor units (BigInt cents: 1 ETB = 100 cents) and unambiguous transaction receipts.
- **Iconographic Clarity:** Because university populations speak multiple regional languages (Amharic, Afaan Oromoo, Somali, Tigrinya, English), icons must convey clear semantic utility without cultural ambiguity or reliance on informal emojis.

### The Three Core Design Pillars
1. **Clarity Over Novelty:** Every button, card, and indicator serves a distinct functional purpose. Visual decoration is restrained; hierarchy is established via contrast, spacing, and typographic weight.
2. **Resilience & Continuity:** Seamless offline-first interactions. Offline badges, local storage sync indicators, and cached QR passes guarantee that students can access dining halls and campus gates even during complete network dropouts.
3. **Institutional Trust:** Clean indigo palettes, crisp 1px borders, subtle drop shadows, and professional typography convey official university authenticity.

---

## 2. Global Design Tokens Specification

The design tokens are shared across the web frontend (`packages/design-system`, `apps/web/tailwind.config.ts`) and mobile Flutter app (`apps/mobile/lib/core/theme/app_theme.dart`).

### 2.1 Color Palette & Semantic Roles

#### Primary Brand Scale (Deep Indigo & Modern Violet)
| Token | Hex Value | Web Utility Class | Flutter Color | Intended Usage |
|---|---|---|---|---|
| `primary-50` | `#EEF2FF` | `bg-indigo-50` | `Color(0xFFEEF2FF)` | Hover fills, subtle banner backgrounds |
| `primary-100` | `#E0E7FF` | `bg-indigo-100` | `Color(0xFFE0E7FF)` | Active selection backgrounds, chip fills |
| `primary-200` | `#C7D2FE` | `border-indigo-200` | `Color(0xFFC7D2FE)` | Selected card borders |
| `primary-500` | `#6366F1` | `text-indigo-500` | `Color(0xFF6366F1)` | Interactive icons, toggle switches |
| `primary-600` | `#4F46E5` | `bg-indigo-600` | `Color(0xFF4F46E5)` | **Primary CTA buttons**, active tabs, brand headers |
| `primary-700` | `#4338CA` | `bg-indigo-700` | `Color(0xFF4338CA)` | Button press/active state |
| `primary-900` | `#312E81` | `bg-indigo-900` | `Color(0xFF312E81)` | Dark navigation headers, sidebar background |
| `primary-950` | `#1E1B4B` | `bg-indigo-950` | `Color(0xFF1E1B4B)` | High-contrast hero containers |

#### Secondary & Accent Scale (Violet / Electric Purple)
| Token | Hex Value | Web Utility Class | Flutter Color | Intended Usage |
|---|---|---|---|---|
| `secondary-50` | `#F5F3FF` | `bg-purple-50` | `Color(0xFFF5F3FF)` | Secondary banner backgrounds |
| `secondary-500` | `#8B5CF6` | `bg-purple-500` | `Color(0xFF8B5CF6)` | Feature highlights, student perks |
| `secondary-600` | `#7C3AED` | `bg-purple-600` | `Color(0xFF7C3AED)` | Special promotional actions |

#### Slate Neutrals (Balanced for Daylight Contrast)
| Token | Hex Value | Web Utility Class | Flutter Color | Intended Usage |
|---|---|---|---|---|
| `neutral-25` | `#FCFCFD` | `bg-slate-25` | `Color(0xFFFCFCFD)` | Card background under direct sunlight |
| `neutral-50` | `#F8FAFC` | `bg-slate-50` | `Color(0xFFF8FAFC)` | Primary application canvas / scaffold |
| `neutral-100` | `#F1F5F9` | `bg-slate-100` | `Color(0xFFF1F5F9)` | Table header backgrounds, input containers |
| `neutral-200` | `#E2E8F0` | `border-slate-200` | `Color(0xFFE2E8F0)` | Standard component border, card outline |
| `neutral-300` | `#CBD5E1` | `border-slate-300` | `Color(0xFFCBD5E1)` | Unfocused form field borders |
| `neutral-400` | `#94A3B8` | `text-slate-400` | `Color(0xFF94A3B8)` | Placeholder text, disabled icon fills |
| `neutral-500` | `#64748B` | `text-slate-500` | `Color(0xFF64748B)` | Meta labels, timestamps, secondary icons |
| `neutral-600` | `#475569` | `text-slate-600` | `Color(0xFF475569)` | Secondary body copy |
| `neutral-700` | `#334155` | `text-slate-700` | `Color(0xFF334155)` | Regular reading text |
| `neutral-800` | `#1E293B` | `text-slate-800` | `Color(0xFF1E293B)` | Card titles, section headers |
| `neutral-900` | `#0F172A` | `text-slate-900` | `Color(0xFF0F172A)` | Page titles, primary numbers, black text |

#### Semantic Status & Alerts
| Semantic Role | 50 (Background) | 500 (Base) | 700 (Border/Text) | Functionality |
|---|---|---|---|---|
| **Success** | `#ECFDF5` | `#10B981` | `#047857` | Order delivered, payment completed, verified badge |
| **Warning** | `#FFFBEB` | `#F59E0B` | `#B45309` | Order preparing, bus departing soon, low balance |
| **Danger** | `#FEF2F2` | `#EF4444` | `#B91C1C` | Emergency alert, out of stock, payment failed |
| **Info** | `#EFF6FF` | `#3B82F6` | `#1D4ED8` | Campus announcements, course syllabus notice |
| **Housing (Teal)** | `#F0FDFA` | `#14B8A6` | `#0F766E` | Dormitory bookings, room occupancy status |
| **Transport (Amber)** | `#FFFBEB` | `#F59E0B` | `#B45309` | Shuttle seat availability, bus routes |

---

### 2.2 Typography Scale & Text Styles

The primary font family is **Inter** on Web and Flutter's default Material San-serif (Roboto on Android, SF Pro on iOS), with native fallbacks to system Amharic fonts (`Nyala`, `Abyssinica SIL`, or `Noto Sans Ethiopic`) when rendered in local languages.

| Style Name | Size (px / rem) | Line Height | Letter Spacing | Weight | Usage |
|---|---|---|---|---|---|
| **Display 2XL** | `48px` (`3.00rem`) | `1.15` | `-0.04em` | 800 (Bold) | Marketing landing page hero titles |
| **Display XL** | `36px` (`2.25rem`) | `2.50rem` (`40px`) | `-0.035em` | 800 (Bold) | Web portal main view headers |
| **Heading Lg** | `24px` (`1.50rem`) | `2.00rem` (`32px`) | `-0.025em` | 700 (Bold) | Mobile screen titles, modal headers |
| **Heading Md** | `20px` (`1.25rem`) | `1.75rem` (`28px`) | `-0.02em` | 700 (Bold) | Section cards, merchant shop titles |
| **Heading Sm** | `18px` (`1.125rem`) | `1.75rem` (`28px`) | `-0.015em` | 600 (SemiBold) | Subheaders, drawer sheet headers |
| **Body Lg** | `16px` (`1.00rem`) | `1.50rem` (`24px`) | `-0.01em` | 400 (Regular) | Primary article body, lead text |
| **Body Md** | `14px` (`0.875rem`) | `1.25rem` (`20px`) | `0.00em` | 500 (Medium) | Default app text, card descriptions, inputs |
| **Caption Sm** | `12px` (`0.75rem`) | `1.00rem` (`16px`) | `+0.01em` | 600 (SemiBold) | Badges, timestamps, avatar labels |
| **Micro / Subtext** | `11px` (`0.6875rem`)| `0.875rem` (`14px`) | `+0.02em` | 600 (SemiBold) | Tab bar labels, minor unit notes |

---

### 2.3 4pt/8pt Spatial System

Every spacing increment adheres strictly to an 8-point base grid (with 4-point micro-increments for compact mobile controls):

```
+-- 4px  (0.25rem / p-1)   : Micro paddings inside badges and avatar borders
+-- 8px  (0.50rem / p-2)   : Gap between icon and text label; compact button padding
+-- 12px (0.75rem / p-3)   : Mobile card interior spacing; table row padding
+-- 16px (1.00rem / p-4)   : Standard screen edge padding on mobile; card padding
+-- 20px (1.25rem / p-5)   : Large dialog padding; card gutters
+-- 24px (1.50rem / p-6)   : Desktop section card padding; screen headers
+-- 32px (2.00rem / p-8)   : Vertical spacing between major view blocks
+-- 48px (3.00rem / p-12)  : Section breaks in web dashboard
+-- 64px (4.00rem / p-16)  : Landing page section margins
```

---

### 2.4 Elevation & Drop Shadows

Drop shadows in CampusFlow are engineered with low-opacity slate tints rather than muddy blacks, avoiding screen visual noise:

- **Shadow XS (`shadow-xs`):** `0 1px 2px 0 rgba(15, 23, 42, 0.05)` — Subtle table rows and pill badges.
- **Shadow SM (`shadow-sm`):** `0 1px 3px 0 rgba(15, 23, 42, 0.08)` — Standard product card at rest.
- **Shadow MD (`shadow-md`):** `0 4px 6px -1px rgba(15, 23, 42, 0.08)` — Hovered card, floating action buttons.
- **Shadow LG (`shadow-lg`):** `0 10px 15px -3px rgba(15, 23, 42, 0.08)` — Dropdowns, popovers, contextual menus.
- **Shadow XL (`shadow-xl`):** `0 20px 25px -5px rgba(15, 23, 42, 0.10)` — Centered modal dialogs.
- **Shadow Drawer (`shadow-drawer`):** `0 -10px 25px -5px rgba(15, 23, 42, 0.15)` — Mobile bottom drawer sheets.
- **Glow Indigo (`shadow-glow`):** `0 0 25px -5px rgba(79, 70, 229, 0.35)` — Active digital ID QR presentation aura.

---

### 2.5 Border Radii (Curvature)

- **Radius SM (`4px` / `rounded-sm`):** Micro-chips, input inner elements.
- **Radius MD (`8px` / `rounded-md`):** Form input fields, small buttons, status tags.
- **Radius LG (`12px` / `rounded-lg`):** Primary action buttons, standard cards, dropdowns.
- **Radius XL (`16px` / `rounded-xl`):** Feature cards, summary dashboards, bottom sheets top corners.
- **Radius 2XL (`20px` / `rounded-2xl`):** Digital ID physical card facsimile, student hero banner.
- **Radius Full (`9999px` / `rounded-full`):** Pill tags, circle avatar frames, counter badges.

---

## 3. Core Component Specifications

### 3.1 Buttons
Buttons are available in 5 functional variants and 3 sizes:

#### Variants
1. **Primary (`btn-primary`):** Background `#4F46E5`, Text `#FFFFFF`, Shadow `shadow-sm`.
   - *Hover:* Background `#4338CA`, Transform `translateY(-1px)`, Shadow `shadow-md`.
   - *Active/Pressed:* Background `#3730A3`, Transform `translateY(0)`.
   - *Disabled:* Background `#E2E8F0`, Text `#94A3B8`, Cursor `not-allowed`.
   - *Loading:* Text transparent; centered spinning Lucide `Loader2` in `#FFFFFF`.
2. **Secondary / Outlined (`btn-outline`):** Background `#FFFFFF`, Border `1.5px solid #E2E8F0`, Text `#1E293B`.
   - *Hover:* Background `#F8FAFC`, Border `#CBD5E1`, Text `#0F172A`.
3. **Ghost (`btn-ghost`):** Transparent background, Text `#475569`.
   - *Hover:* Background `#F1F5F9`, Text `#0F172A`.
4. **Danger (`btn-danger`):** Background `#EF4444`, Text `#FFFFFF`.
   - *Hover:* Background `#DC2626`.
5. **Success (`btn-success`):** Background `#10B981`, Text `#FFFFFF`.

#### Sizing Matrix
- **Small (SM):** Height `32px`, Padding `0 12px`, Typography `12px / 600`, Icon `14px`.
- **Medium (MD):** Height `42px`, Padding `0 16px`, Typography `14px / 600`, Icon `16px`.
- **Large (LG):** Height `50px`, Padding `0 24px`, Typography `16px / 600`, Icon `20px`.

---

### 3.2 Badges & Semantic Status Tags
Badges utilize a soft tinted background with a high-contrast dark text tone:

| Status Badge | Background | Text Color | Border Color | Vector Icon |
|---|---|---|---|---|
| **DELIVERED / COMPLETED** | `#ECFDF5` | `#047857` | `#A7F3D0` | `CheckCircle2` |
| **PREPARING / IN PROGRESS**| `#FFFBEB` | `#B45309` | `#FDE68A` | `Clock` |
| **PENDING PAYMENT** | `#EFF6FF` | `#1D4ED8` | `#BFDBFE` | `CreditCard` |
| **CANCELLED / FAILED** | `#FEF2F2` | `#B91C1C` | `#FECACA` | `AlertTriangle` |
| **OFFLINE CACHED** | `#F1F5F9` | `#475569` | `#CBD5E1` | `WifiOff` |
| **OFFICIAL / VERIFIED** | `#EEF2FF` | `#4338CA` | `#C7D2FE` | `ShieldCheck` |

---

### 3.3 Cards & Surface Architecture
Every card is wrapped with a 1px border (`#E2E8F0`) over a `#FFFFFF` or `#FCFCFD` surface.
- **Interactive Card:** When clickable (e.g. food item, shuttle route, housing unit), adds `transition: all 0.2s ease`, cursor `pointer`, hover border `#C7D2FE`, and hover shadow `0 10px 15px -3px rgba(15,23,42,0.08)`.
- **Media Header Cards:** 16:9 aspect ratio image container with fallback skeleton gradient `#F1F5F9` to `#E2E8F0` when image is loading or offline.

---

### 3.4 Navigation Architecture

#### Web Portal (`apps/web`)
1. **Header Navigation (64px Height, Fixed Top):**
   - Left: CampusFlow logo mark with Haramaya University branch tag (`Haramaya Main Campus`).
   - Center: Service category links (`Directory`, `Food Order`, `Shuttle`, `Housing`, `Facilities`, `Learning`).
   - Right: Active university term pill (`2026/27 Sem II`), Cart drawer trigger with count badge, Notification bell icon, Profile avatar dropdown.
2. **Global Breadcrumbs (40px Height):**
   - Contextual path navigation (`Home > Food Order > Haramaya Cafe > Order #1042`).

#### Mobile Application (`apps/mobile`)
1. **Top App Bar (56px Height):**
   - Left: Back icon or navigation drawer toggle.
   - Title: Crisp 18px semi-bold centered or left-aligned title.
   - Right: Offline connectivity pill (green dot when online, amber dot when syncing, grey dot when offline) + Cart / Search action.
2. **Bottom Navigation Bar (64px Height):**
   - 5 Persistent primary tabs:
     1. **Home / Explore (`Home`):** Dashboard quick-links and daily schedule.
     2. **Shuttle & Map (`Bus` / `MapPin`):** Transportation departures and campus POIs.
     3. **ID Pass (`CreditCard`):** Instant digital student card modal trigger.
     4. **Services (`Grid`):** Housing, maintenance, academic portal, bookings.
     5. **Wallet (`Wallet`):** Telebirr top-up, transaction feed, QR pay.

---

## 4. Screen-by-Screen UI/UX Blueprints (All Key Services)

### 4.1 Service 1: Campus Dining & Merchant Commerce (`/shop`, `/cart`, `/orders`)
- **Header:** Merchant identity banner showing operating status (Open / Busy / Closed), dietary certifications, opening hours (`07:00 - 21:30 EAT`), and preparation lead-time (`15-20 min`).
- **Category Filter Tabs:** Horizontally scrollable chips: `All Items`, `Hot Meals`, `Bakery & Pastries`, `Beverages & Coffee`, `Stationery`.
- **Product Card Anatomy:**
  - High-res food image thumbnail (cached locally on mobile).
  - Item Title (`Injera with Shiro`, `Special Foul`, `Macchiato`).
  - Unit Price in bold slate-900: `85.00 ETB` (stored as `8500` minor cents).
  - Stepper control (`-`, count, `+`) with instantaneous optimistic cart update.
- **Cart Checkout Flow:**
  - Order summary breakdown: Subtotal, Student Subsidy deduction (if meal plan active), Total Payable.
  - Payment Selector: `Campus Digital Wallet`, `Telebirr Direct`, `CBE Birr`, `Cash at Counter`.
  - Confirmation: Live order progress stepper (`Received` -> `Preparing` -> `Ready for Pickup` -> `Collected`) with countdown timer.

---

### 4.2 Service 2: Transportation & Inter-Campus Shuttles (`/transport`)
- **Route Selection Header:** Origin (`Main Campus Gate 1`) to Destination (`Harar Health College` or `Bate Town`).
- **Shuttle Schedule Timeline:**
  - Departure time badge with real-time countdown (`Leaves in 8 mins`).
  - Vehicle ID & Plate Number (`Code 3 - 48210 ET`).
  - Capacity Meter: `18/24 seats reserved` (dynamic progress bar colored green < 70%, amber 70-95%, red 100%).
- **Interactive Seat Matrix Component:**
  - Front: Driver seat icon with steering wheel indicator.
  - Passenger Rows: 2x2 grid layout with aisle.
  - Seat States:
    - *Available:* Slate-100 background, Slate-300 border, clickable.
    - *Selected:* Indigo-600 background, white text, glowing outline.
    - *Occupied:* Slate-300 background, disabled, Slate-500 user silhouette.
- **Booking Receipt:** Offline-verifiable QR boarding pass containing departure timestamp, route ID, seat number, and SHA-256 integrity signature.

---

### 4.3 Service 3: Facility & Study Room Bookings (`/bookings`)
- **Resource Hierarchy:** Library Study Cubicles, Science Labs, Tennis Courts, Amphitheater.
- **Calendar & Time-Slot Matrix:**
  - Day selector: 7-day horizontal carousel.
  - Hour Blocks: 60-minute increments (`08:00 - 09:00`, `09:00 - 10:00`, ... `21:00 - 22:00`).
  - Real-time availability indicator: Blue pill `Available`, Red pill `Reserved`.
- **Reservation Modal:**
  - Purpose of reservation input.
  - Companion student IDs (for study group reservations).
  - Instant calendar `.ics` download link and SMS confirmation toggle.

---

### 4.4 Service 4: Off-Campus Housing & Dormitories (`/housing`)
- **Dual Mode Toggle:** `On-Campus Dorm Allocation` vs `Off-Campus Verified Housing (Bate / Harar)`.
- **Listing Card Anatomy:**
  - Photos carousel with full-screen viewer.
  - Price per semester or month (`1,800 ETB / month`).
  - Distance badge from Campus Gate (`600m from Gate 2 - 8 min walk`).
  - Verified Landlord Badge (national ID & property papers checked by university student union).
  - Amenities Checklist with vector icons: Water Tank (`Droplet`), Backup Generator (`Zap`), WiFi (`Wifi`), Security Guard (`Shield`), Private Bathroom (`Key`).
- **Inquiry & Booking:** Direct in-app secure chat with landlord and deposit escrow flow via CampusFlow wallet.

---

### 4.5 Service 5: Campus Directory & Interactive Map (`/directory`, `campus_map_screen.dart`)
- **Split-View Architecture (Web):**
  - Left Panel (40% width): Search input with instant autocomplete for professors, administrative offices, departments, clinics, and lecture halls.
  - Right Panel (60% width): Interactive vector map with clickable markers and pathfinding routes.
- **Department Contact Card:**
  - Building Name & Room Number (`College of Computing, Block 314, Room 12`).
  - Office hours (`Mon - Fri: 08:30 - 11:30, 14:00 - 16:30`).
  - Direct actions: `Call Extension`, `Send Email`, `Copy Directions`, `Book Office Hour`.

---

### 4.6 Service 6: Digital Student ID & Gate Access (`digital_id_screen.dart`)
- **Physical Card Metaphor:** Sleek 20px rounded card with official Haramaya University crest watermark, hologram foil shine animation, and photo portrait.
- **Student Data Attributes:**
  - Full Name (Template placeholder: Student Name / የተማሪ ስም).
  - Student ID Number (Template placeholder: `HU/00000/00`).
  - Faculty & Department (`Software Engineering, Year 3`).
  - Validity Period (`Expires: 30 July 2027`).
- **Dynamic Security QR Code:**
  - Time-based rotating QR code regenerated every 30 seconds to prevent screenshot sharing.
  - Animated pulsing security ring around QR code confirming screen is live and not a static photo.
  - Barcode option toggle for legacy laser library scanners.

---

### 4.7 Service 7: Campus Wallet & Payments (`wallet_screen.dart`)
- **Balance Card:**
  - Primary Balance display in bold 32px: `ETB 1,420.50`.
  - Quick Action Buttons: `Top Up (Telebirr/CBE)`, `Pay QR`, `Transfer to Student`, `Transaction Statement`.
- **Top-Up Modal:**
  - Quick Amount Chips: `+50 ETB`, `+100 ETB`, `+250 ETB`, `+500 ETB`.
  - Integrated Telebirr Payment Sheet: Seamless deep-link handoff to Telebirr app or USSD prompt.
- **Transaction History List:**
  - Icon categorized by service: Merchant Food (`Utensils`), Shuttle (`Bus`), Book Print (`Printer`), Wallet Top-up (`ArrowDownLeft`).
  - Detailed receipt modal with transaction reference number (`TXN-202611-9482`), date/time, and fee breakdown (0% student transaction fee).

---

### 4.8 Service 8: Campus Emergency & Safety Hotlines (`emergency_screen.dart`)
- **Emergency Panic Banner:** High-visibility `#EF4444` top card with single-tap quick call for Campus Security (`025-553-0333`), University Clinic (`025-553-0112`), and Bate Police Station.
- **Geolocated SOS Beacon:**
  - "Share My Current Location" button broadcasts GPS coordinates to campus security dispatch.
  - Works over zero-rated university WiFi and sends SMS fallback when cellular data is disabled.
- **Safe Walk Companion:** Real-time location sharing with a trusted campus roommate until safe arrival at dormitory.

---

### 4.9 Service 9: Facility Maintenance & Work Orders (`maintenance_screen.dart`)
- **Incident Reporting Form:**
  - Location Dropdown: Campus, Dorm Block, Floor, Room Number.
  - Issue Category: Plumbing (`Wrench`), Electrical (`Zap`), Furniture / Carpenter (`Armchair`), Internet / LAN (`Wifi`).
  - Camera Attachment: Photo capture with automatic image compression to preserve mobile bandwidth.
  - Severity Rating: Low, Medium, Critical (e.g., exposed electrical wire, flooding).
- **Ticket Progress Tracker:** Live status: `Reported` -> `Dispatched to Maintenance Team` -> `In Repair` -> `Resolved` (with technician feedback photo).

---

### 4.10 Service 10: Academic Timetable & Learning Hub (`learning_screen.dart`, `academic_screen.dart`)
- **Daily Class Schedule View:**
  - Chronological schedule cards showing course code (`SEng 3122`), course title (`Software Architecture`), lecture room (`Block 42, Hall B`), and instructor.
  - Current active class highlighted with glowing indigo border and countdown timer (`42 mins remaining`).
- **Peer Tutoring & Study Groups:**
  - Browse peer tutors with verified course grades (e.g. `Grade: A in Data Structures`).
  - Book 45-minute peer review sessions in library meeting rooms.

---

## 5. Interaction Design, Micro-Interactions & Audio Feedback

### 5.1 Micro-Interactions
1. **Button Taps & Haptic Feedback:** Mobile interactions trigger subtle HapticFeedback (`HapticFeedback.lightImpact()` on Flutter) on button release.
2. **Pull-to-Refresh:** Standard spring physics with rotating indigo indicator.
3. **Skeleton Loading Shimmer:** Shimmer animation sweeps from `#F1F5F9` to `#E2E8F0` at 1.5s interval during async API fetches.

### 5.2 Audio Feedback System
For busy cafeteria counters and noisy campus bus stops, auditory confirmation is essential:
- **Order Paid / Validated Chime:** Two-tone major ascending chord (`C6 -> G6`, frequencies `1046.5 Hz` and `1567.98 Hz`, duration `180ms`) confirming successful tap-to-pay.
- **Invalid / Expired Chime:** Low warning double-beep (`D4 -> D4`, frequency `293.66 Hz`, duration `250ms`) indicating insufficient funds or expired pass.
- **Emergency Trigger Chime:** High-priority alert siren tone with continuous visual flashing banner.

---

## 6. Accessibility & Ethiopian Context Adaptations

### 6.1 WCAG 2.1 AA & AAA Compliance
- **Contrast Ratios:** All primary text (`#0F172A`, `#1E293B`) on surfaces (`#FFFFFF`, `#F8FAFC`) achieves a contrast ratio of **14.2:1** (exceeding WCAG AAA requirement of 7.0:1).
- **Interactive Targets:** Minimum touch target size on mobile is **48x48dp** for all buttons, tab items, and checkboxes to prevent mis-taps.

### 6.2 Low Bandwidth & Offline Strategy
- **Asset Optimization:** All vector icons are bundled directly within the app binary (`lucide-react` tree-shaken SVG on web, Material icons compiled in Flutter). No network requests for iconography.
- **Image Compression:** User-submitted photos (marketplace items, maintenance tickets) are automatically compressed on device to WebP format (< 150KB) before transmission.
- **Local SQLite / IndexedDB Cache:** Offline storage caches the student's active schedule, digital ID, cached bus ticket, and offline campus directory.

### 6.3 Multilingual & Amharic Typographic Accommodations
- Ethiopic script characters (ፊደል) require an extra 15% vertical line height compared to Latin characters to prevent diacritic clipping.
- The typography system provides an automatic line-height multiplier (`lineHeight: 1.6` for Ethiopic vs `1.4` for English) when the language is switched to Amharic (`am_ET`) or Afaan Oromoo (`om_ET`).

---

## 7. Quality Assurance Checklist

- [x] All unicode emojis replaced with vector icons (`lucide-react` / `Icon(Icons.*)`).
- [x] All monetary amounts represented in integer minor units (cents in ETB).
- [x] Full responsive breakpoints tested: 360px (mobile), 768px (tablet), 1024px (desktop), 1280px (wide).
- [x] Offline indicators verified for poor network environments.
- [x] Light theme optimized for extreme direct outdoor sunlight readability.
- [x] Color scheme compliant with Ethiopian higher education aesthetic standards.
