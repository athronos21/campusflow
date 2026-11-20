# CampusFlow — Design System & Craft Guidelines

## Design Language & Anti-AI Slop Rules
CampusFlow rejects generic "AI slop" (random gradient cards, illegible low-contrast text, oversized floating rounded blobs, nested containers without clear hierarchy). Every visual element must serve student speed and clarity.

### 1. Typography Hierarchy
- **Font Stack:** Clean geometric sans (`Inter`, system UI font fallback). Monospace for ticket codes, USSD strings, and financial breakdowns.
- **Display / Headers:** Bold, tight tracking (`tracking-tight`), high-contrast text (`text-slate-900` / `hsl(var(--foreground))`).
- **Body & Captions:** High readability (`text-slate-700` and `text-slate-500`), never falling below WCAG AA contrast standards.

### 2. Color Palette & Semantics
- **Primary Brand:** Deep Indigo (`primary-600`: `#4f46e5` / `hsl(243, 75%, 59%)`) representing academic trust and digital authority.
- **Secondary Accent:** Modern Violet (`secondary-600`: `#7c3aed`) for interactive highlights and active states.
- **Status & Safety:**
  - Emerald (`#10b981`) for completed orders, verified merchants, and active tickets.
  - Amber (`#f59e0b`) for pending requests, preparation states, and warnings.
  - Rose (`#f43f5e`) for cancellations, disputes, and errors.
- **Backgrounds & Surfaces:** Crisp slate neutrals (`neutral-50`: `#f8fafc` canvas, white card surfaces with `border-slate-200`).

### 3. Layout & Touch Ergonomics
- **Touch Targets:** Minimum 44x44px for all mobile interactive elements (buttons, quantity counters, tab triggers).
- **Component Primitives:** Built on **shadcn/ui** and Radix UI primitives with Tailwind CSS utilities.
- **Elevation & Depth:** Subtle `1px` borders with soft shadows (`shadow-sm` or `shadow-glow`), avoiding heavy black dropshadows.
- **Audio Feedback:** Real-time Web Audio chimes for merchant kitchen and order status updates.
