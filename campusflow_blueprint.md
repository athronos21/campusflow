# CampusFlow — Final Startup Blueprint

<text color="secondary" size="sm">Haramaya University pilot → Ethiopian university network</text>

Brotha, we're treating CampusFlow as a real startup with a long-term product vision, a controlled first release, and a path to revenue. The goal is to create a platform your five-person team can build and maintain without paying for expensive infrastructure before you've found customers.

<AsyncImage query="premium SaaS startup product mockup university super app Android phone campus marketplace bus ticket booking student services beside laptop web merchant dashboard professional navy blue violet design" aspectRatio="16:9" width="100%" maxHeight={340} radius="xl"/>

<box border radius="lg" padding={3} gap={3}>
  <title size="lg">Product charter</title>
  <row align="start" gap={3}>
    <icon name="target" size="xl" color="success"/>
    <box flex="1" gap={1}>
      **Mission**

      Make campus services easier to discover, access, book, and manage through one trusted digital platform.
    </box>
  </row>
  <row align="start" gap={3}>
    <icon name="users" size="xl" color="success"/>
    <box flex="1" gap={1}>
      **Initial customers**

      Students, campus-area merchants, service providers, student organizations, and eventually participating university administrations.
    </box>
  </row>
  <row align="start" gap={3}>
    <icon name="wallet" size="xl" color="success"/>
    <box flex="1" gap={1}>
      **Financial constraint**

      Near-zero starting budget: open-source development tools, free hosting tiers where available, and spending only when revenue or funding justifies it.
    </box>
  </row>
  <row align="start" gap={3}>
    <icon name="layers" size="xl" color="success"/>
    <box flex="1" gap={1}>
      **Architecture**

      One monorepo, one modular backend, one PostgreSQL database, one web application, and one Android application.
    </box>
  </row>
</box>

## 1. Product scope: all ten services, delivered in stages

The long-term architecture will accommodate every service category, but the initial launch must solve one complete problem reliably.

<box border radius="lg" padding={3} gap={3}>
  <title size="md">Release 1 — Pilot MVP</title>
  <badge color="success">Build first</badge>
  <list marker="number" gap={1}>
    <list-item>Student accounts, profiles, campus directory, and announcements.</list-item>
    <list-item>Verified merchant profiles and marketplace listings.</list-item>
    <list-item>Food and product orders with clear statuses.</list-item>
    <list-item>Local service listings and booking requests.</list-item>
    <list-item>Merchant dashboard, admin moderation, and notifications.</list-item>
    <list-item>Order history, basic reports, and complaint handling.</list-item>
  </list>
  <text color="secondary" size="sm">Payment can initially be handled at pickup or directly between the parties, with clear records. Do not claim an order is paid unless payment is verified.</text>
</box>

<box border radius="lg" padding={3} gap={2}>
  <title size="md">Long-term service catalog</title>
  <table>
    <table-row>
      <table-cell width="12%">
        **#**
      </table-cell>
      <table-cell>
        **Service module**
      </table-cell>
      <table-cell>
        **Target release**
      </table-cell>
    </table-row>
    {#each [{n:"01",name:"Student life and digital campus",phase:"MVP"},{n:"02",name:"Transport and ticketing",phase:"Phase 2"},{n:"03",name:"Marketplace and shopping",phase:"MVP"},{n:"04",name:"Food and cafeteria",phase:"MVP"},{n:"05",name:"Housing and accommodation",phase:"Phase 3"},{n:"06",name:"Clubs, unions, and events",phase:"Phase 3"},{n:"07",name:"Learning and opportunities",phase:"Phase 3"},{n:"08",name:"Payments and transactions",phase:"Phase 2"},{n:"09",name:"Local services and appointments",phase:"MVP — basic"},{n:"10",name:"Business and administration",phase:"MVP — basic"}] as item}
      <table-row>
        <table-cell>
          <text color="secondary" size="sm">{item.n}</text>
        </table-cell>
        <table-cell>{item.name}</table-cell>
        <table-cell>
          <text color={item.phase==="MVP"||item.phase==="MVP — basic"?"success":"default"} size="sm">{item.phase}</text>
        </table-cell>
      </table-row>
    {/each}
  </table>
</box>

**Critical product boundary:** the MVP is not an official university information system unless Haramaya University authorizes the integration. Use opt-in accounts, public information, and voluntary merchant registration. Don't collect student records or use official logos without permission.

## 2. Technical stack

Use one main programming language across the team to reduce learning and maintenance costs.

| Layer | Technology | Purpose |
|---|---|---|
| Web | Next.js, React, TypeScript | Student storefront, merchant portal, admin portal |
| Android | React Native, Expo, TypeScript | Student mobile experience |
| API | NestJS, Node.js, TypeScript | Business logic and REST endpoints |
| Database | PostgreSQL | Persistent transactional data |
| Data access | Prisma ORM | Schema, migrations, type-safe queries |
| Validation | Zod and NestJS validation | Validate requests and inputs |
| API contract | OpenAPI / Swagger | Document and test the API |
| Testing | Jest or Vitest, Playwright | Unit, integration, and end-to-end tests |
| CI/CD | GitHub Actions | Automated checks and deployment workflows |
| Images | S3-compatible object storage | Product and merchant images |
| Notifications | In-app first; push later | Order updates and announcements |

Start without Redis, microservices, Kubernetes, or paid AI services. Add infrastructure only when a measured requirement justifies it.

## 3. Monorepo structure

Use `pnpm` workspaces and Turborepo so all five developers can work in one repository while maintaining separate applications and backend modules.

```text
campusflow/
├── apps/
│   ├── web/                     # Next.js website
│   │   ├── app/
│   │   │   ├── (public)/
│   │   │   ├── student/
│   │   │   ├── merchant/
│   │   │   └── admin/
│   │   ├── components/
│   │   └── lib/
│   ├── mobile/                  # Expo Android app
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   └── lib/
│   └── api/                     # NestJS REST API
│       └── src/
│           ├── auth/
│           ├── users/
│           ├── campuses/
│           ├── announcements/
│           ├── businesses/
│           ├── catalog/
│           ├── orders/
│           ├── bookings/
│           ├── notifications/
│           ├── moderation/
│           ├── payments/
│           ├── subscriptions/
│           ├── transport/
│           ├── housing/
│           ├── events/
│           └── learning/
├── packages/
│   ├── contracts/               # Shared API types and schemas
│   ├── config/                  # TypeScript, lint, formatting
│   ├── design-system/           # Shared design tokens
│   └── utils/                   # Safe, platform-neutral helpers
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── security.md
│   └── decisions/
├── .github/workflows/
├── .env.example
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

### Workspace setup

The root `package.json` should define scripts for `dev`, `build`, `lint`, `typecheck`, and `test`. Keep the apps independently deployable, even though they share a repository.

A sensible rule is:

- `apps/web` and `apps/mobile` call the API; they never connect directly to PostgreSQL.
- `apps/api` owns all business logic and database access.
- `packages/contracts` contains shared request/response types and validation schemas.
- `prisma/migrations` is the authoritative history of database changes.
- All changes to the database schema go through reviewed migrations, never ad hoc production edits.

## 4. Service-module boundaries

Each module owns its business rules, database access, and permissions. Modules communicate through explicit service interfaces rather than querying each other's internal repositories.

<box border radius="lg" padding={3} gap={3}>
  {#each [{title:"Platform foundation",items:"Authentication, users, roles, campuses, file uploads, audit logs"},{title:"Campus directory",items:"Businesses, service categories, announcements, search"},{title:"Commerce",items:"Products, inventory, carts, orders, order items, merchant reports"},{title:"Bookings",items:"Service availability, appointments, cancellations, booking history"},{title:"Communications",items:"In-app notifications, preferences, notification delivery status"},{title:"Trust and operations",items:"Merchant verification, reports, complaints, moderation, support"},{title:"Future modules",items:"Payments, transport, housing, clubs, events, learning, jobs, subscriptions"}] as module}
    <box gap={1}>
      <text weight="medium">{module.title}</text>
      <text color="secondary" size="sm">{module.items}</text>
    </box>
    <divider color="subtle"/>
  {/each}
</box>

Build the foundation and commerce modules first. Create future module folders only when they have real implementation work, and avoid empty placeholder modules that create unnecessary maintenance.

## 5. PostgreSQL data model

The schema below is the baseline for the MVP. It includes the primary relationships and constraints; production migrations should add complete indexes, deletion rules, audit requirements, and any fields required by the finalized workflows.

<CodeBlock language="sql" editable={true}>
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    city TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'suspended', 'deleted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TABLE campus_memberships (
    user_id UUID NOT NULL REFERENCES users(id),
    campus_id UUID NOT NULL REFERENCES campuses(id),
    role TEXT NOT NULL
        CHECK (role IN (
            'student', 'merchant', 'merchant_staff',
            'campus_moderator', 'campus_admin'
        )),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'pending', 'revoked')),
    PRIMARY KEY (user_id, campus_id, role)
);

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES campuses(id),
    owner_id UUID NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'verified', 'rejected', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE business_staff (
    business_id UUID NOT NULL REFERENCES businesses(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role TEXT NOT NULL CHECK (role IN ('manager', 'staff')),
    PRIMARY KEY (business_id, user_id)
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID REFERENCES campuses(id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    UNIQUE (campus_id, slug)
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    category_id UUID REFERENCES categories(id),
    name TEXT NOT NULL,
    description TEXT,
    price_minor BIGINT NOT NULL CHECK (price_minor >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'ETB',
    stock_quantity INTEGER CHECK (stock_quantity >= 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES campuses(id),
    customer_id UUID NOT NULL REFERENCES users(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending', 'accepted', 'preparing', 'ready',
            'completed', 'cancelled', 'rejected'
        )),
    payment_status TEXT NOT NULL DEFAULT 'unpaid'
        CHECK (payment_status IN (
            'unpaid', 'pending', 'paid', 'failed', 'refunded'
        )),
    currency CHAR(3) NOT NULL DEFAULT 'ETB',
    subtotal_minor BIGINT NOT NULL CHECK (subtotal_minor >= 0),
    fee_minor BIGINT NOT NULL DEFAULT 0 CHECK (fee_minor >= 0),
    total_minor BIGINT NOT NULL CHECK (total_minor >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    product_name TEXT NOT NULL,
    unit_price_minor BIGINT NOT NULL CHECK (unit_price_minor >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    service_name TEXT NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'requested'
        CHECK (status IN (
            'requested', 'confirmed', 'completed',
            'cancelled', 'rejected'
        )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    provider TEXT NOT NULL,
    provider_reference TEXT,
    amount_minor BIGINT NOT NULL CHECK (amount_minor >= 0),
    currency CHAR(3) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending', 'succeeded', 'failed', 'refunded'
        )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider, provider_reference)
);

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES campuses(id),
    author_id UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id),
    campus_id UUID REFERENCES campuses(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_businesses_campus_status
    ON businesses(campus_id, status);

CREATE INDEX idx_products_business_available
    ON products(business_id, is_available);

CREATE INDEX idx_orders_customer_created
    ON orders(customer_id, created_at DESC);

CREATE INDEX idx_orders_business_status
    ON orders(business_id, status);

CREATE INDEX idx_bookings_business_start
    ON bookings(business_id, starts_at);

CREATE INDEX idx_notifications_user_created
    ON notifications(user_id, created_at DESC);
</CodeBlock>

### Important schema rules

- Store money as integer minor units, not floating-point values. The API must explicitly define the currency and how amounts are converted to those units.
- Keep order item names and prices as snapshots so old orders remain accurate when a merchant changes a listing.
- Compute order totals on the server. Validate stock and reserve or decrement it transactionally to prevent overselling.
- A unique payment reference is useful for duplicate prevention, but nullable references require deliberate database behavior and provider-specific idempotency rules.
- A business's `owner_id` is not enough to authorize every request. Validate the caller's active role and relationship to that business.
- Add a `reports` or `complaints` table before public launch; it is intentionally omitted from the abbreviated schema above.
- Future transport requires operators, routes, trips, seats, and ticket reservations. Housing needs property listings and viewing requests. Events and learning need their own entities and permissions.

The schema is a starter migration specification, not a complete production database. Use Prisma migrations and integration tests to verify every relationship and constraint.

## 6. REST API specification

Use a versioned API prefix: `/api/v1`. Return JSON, validate request bodies, use consistent error responses, and publish the contract through Swagger.

### Authentication and profiles

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/auth/register` | Create account |
| `POST` | `/auth/login` | Sign in |
| `POST` | `/auth/refresh` | Rotate refresh credentials |
| `POST` | `/auth/logout` | Revoke session |
| `GET` | `/me` | Get current profile |
| `PATCH` | `/me` | Update permitted profile fields |
| `GET` | `/campuses` | List available campuses |

### Directory and marketplace

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/businesses` | Search verified businesses |
| `POST` | `/businesses` | Register a business |
| `GET` | `/businesses/:id` | View business profile |
| `PATCH` | `/businesses/:id` | Update authorized business |
| `POST` | `/businesses/:id/verification` | Submit verification evidence |
| `GET` | `/products` | Search and filter listings |
| `POST` | `/businesses/:id/products` | Create a product |
| `PATCH` | `/products/:id` | Update an authorized listing |
| `DELETE` | `/products/:id` | Archive a listing |

### Orders and bookings

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/orders` | Place an order |
| `GET` | `/orders` | List the caller's permitted orders |
| `GET` | `/orders/:id` | View an order |
| `POST` | `/orders/:id/cancel` | Request permitted cancellation |
| `POST` | `/orders/:id/accept` | Merchant accepts an order |
| `POST` | `/orders/:id/ready` | Merchant marks it ready |
| `POST` | `/orders/:id/complete` | Complete an order |
| `POST` | `/bookings` | Request a service booking |
| `GET` | `/bookings` | List permitted bookings |
| `POST` | `/bookings/:id/confirm` | Confirm an authorized booking |
| `POST` | `/bookings/:id/cancel` | Cancel under the applicable rules |

### Administration and future modules

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/admin/businesses/pending` | Review registrations |
| `POST` | `/admin/businesses/:id/verify` | Approve a business |
| `POST` | `/admin/businesses/:id/suspend` | Suspend a business |
| `POST` | `/reports` | Report content or a transaction |
| `GET` | `/notifications` | Read notification history |
| `GET` | `/announcements` | Read campus announcements |
| `GET` | `/transport/trips` | Future transport search |
| `POST` | `/transport/reservations` | Future ticket reservation |
| `GET` | `/housing/listings` | Future accommodation search |
| `GET` | `/events` | Future events directory |
| `GET` | `/learning/resources` | Future learning resources |

Do not implement all endpoints in the first sprint. Deliver endpoints alongside the feature that needs them.

### API conventions

- Use pagination with `limit` and a cursor or stable page token for large lists.
- Use consistent error bodies such as `{ "code": "ORDER_UNAVAILABLE", "message": "This item is no longer available." }`.
- Use an idempotency key for order creation and any payment-related action that could be retried.
- Require optimistic concurrency or transactional checks for inventory and booking availability.
- Never accept client-supplied totals as authoritative.
- Provide API examples and error responses in Swagger, and test them with automated integration tests.

## 7. Security and role permissions

CampusFlow will hold account details, transaction histories, and potentially sensitive user-submitted material. Security must be part of the architecture from the beginning.

### Role-based access control

| Role | Permitted access |
|---|---|
| Student | Own profile, public listings, own orders, own bookings, own reports |
| Merchant owner | Own business profile, listings, orders, authorized business reports |
| Merchant staff | Explicitly assigned business operations |
| Campus moderator | Assigned campus reports, approved moderation actions |
| Platform admin | Platform-level operations with audited privileges |
| Transport operator | Future assigned routes, trips, and reservations only |

Use scoped permissions rather than a single broad `admin` boolean. A campus moderator must not automatically become a platform administrator, and merchant staff must not be able to read another business's orders.

### Mandatory security checklist

<box border radius="lg" padding={3} gap={2}>
  {#each ["Hash passwords with Argon2id or an appropriately configured bcrypt implementation.","Use short-lived access tokens or secure sessions and rotate refresh credentials.","Apply authorization checks on every protected API endpoint and object lookup.","Rate-limit authentication, account creation, booking, and order endpoints.","Validate and sanitize inputs; use parameterized database operations.","Keep API secrets and database credentials in server-side environment variables.","Use HTTPS in deployed environments and restrict production database access.","Protect file uploads with type, size, and ownership checks; never trust filenames.","Verify payment webhooks and reconcile payment status with the provider.","Audit sensitive admin actions without recording passwords, tokens, or payment secrets.","Back up production data and periodically test restoration.","Provide privacy notices, deletion and correction workflows, and incident-response procedures."] as item}
    <checkbox defaultChecked={false}>{item}</checkbox>
  {/each}
</box>

Ethiopia's Personal Data Protection Proclamation No. 1321/2024 is an important legal starting point for this project. Review its requirements on lawful processing, consent, transparency, data security, and applicable controller/processor obligations before collecting real users' personal data. Seek local legal advice on the platform's specific obligations. <Cite refs={["turn866810search0","turn866810search9"]}/>

Do not collect student IDs or identity documents merely because you can. If verification requires them, define a lawful purpose, restrict access, minimize retention, and avoid storing copies when a less intrusive verification method is sufficient.

## 8. Five-person team and sprint backlog

Assume part-time work alongside university. Start with two-week sprints, a working demonstration at the end of each sprint, and a release checklist before production.

<box border radius="lg" padding={3} gap={3}>
  <title size="md">Team responsibilities</title>
  <row align="start" gap={3}>
    <box background="surface" radius="md" size="44px" align="center" justify="center">
      <icon name="git-branch" size="xl"/>
    </box>
    <box flex="1" gap={1}>
      **You — technical lead and backend architect**

      API contracts, system design, code review, deployment, and high-risk business logic.
    </box>
  </row>
  <divider color="subtle"/>
  <row align="start" gap={3}>
    <box background="surface" radius="md" size="44px" align="center" justify="center">
      <icon name="monitor" size="xl"/>
    </box>
    <box flex="1" gap={1}>
      **Developer 2 — web**

      Student storefront, merchant dashboard, admin UI, responsive layouts.
    </box>
  </row>
  <divider color="subtle"/>
  <row align="start" gap={3}>
    <box background="surface" radius="md" size="44px" align="center" justify="center">
      <icon name="smartphone" size="xl"/>
    </box>
    <box flex="1" gap={1}>
      **Developer 3 — Android**

      Navigation, authentication, listings, ordering, local error handling, and device testing.
    </box>
  </row>
  <divider color="subtle"/>
  <row align="start" gap={3}>
    <box background="surface" radius="md" size="44px" align="center" justify="center">
      <icon name="database" size="xl"/>
    </box>
    <box flex="1" gap={1}>
      **Developer 4 — backend and database**

      Prisma schema, migrations, commerce logic, notifications, integration tests.
    </box>
  </row>
  <divider color="subtle"/>
  <row align="start" gap={3}>
    <box background="surface" radius="md" size="44px" align="center" justify="center">
      <icon name="clipboard-check" size="xl"/>
    </box>
    <box flex="1" gap={1}>
      **Developer 5 — product, design, QA, and pilot sales**

      Interviews, prototypes, acceptance tests, merchant onboarding, documentation, and support. This role should contribute to development when product work allows.
    </box>
  </row>
</box>

### Eight two-week sprints

<box gap={3}>
  {#each [{n:"Sprint 1",title:"Foundation",tasks:"Agree on scope, repo, branch rules, CI, architecture decisions, Figma flows, and development environments.",done:"All five developers can run the project; the CI pipeline passes."},{n:"Sprint 2",title:"Accounts and campus",tasks:"Database migrations, registration, login, profiles, campus records, role guards, and seed data.",done:"Users can sign in and access only permitted resources."},{n:"Sprint 3",title:"Business directory",tasks:"Merchant registration, verification workflow, categories, business profiles, and image upload.",done:"An admin can verify a business and students can find it."},{n:"Sprint 4",title:"Listings and discovery",tasks:"Product CRUD, search, filters, availability, responsive catalog, Android browsing.",done:"Verified merchants can publish listings visible to students."},{n:"Sprint 5",title:"Orders and inventory",tasks:"Order creation, price snapshots, stock validation, order states, cancellation, merchant queue.",done:"An end-to-end order completes without incorrect totals or duplicate processing."},{n:"Sprint 6",title:"Bookings and admin",tasks:"Basic service bookings, complaints, announcements, notifications, merchant analytics.",done:"A service booking and an administrative moderation workflow work end to end."},{n:"Sprint 7",title:"Hardening and pilot",tasks:"Authorization tests, accessibility, error handling, backups, privacy review, pilot training.",done:"Critical defects are fixed and the team can recover from a failed deployment."},{n:"Sprint 8",title:"Controlled release",tasks:"Pilot rollout, support process, metrics, user feedback, pricing experiments, prioritized fixes.",done:"Pilot results inform the decision to continue, pivot, or expand."}] as sprint}
    <box border radius="lg" padding={3} gap={2}>
      <row align="center" gap={2}>
        <badge>{sprint.n}</badge>
        <title size="md">{sprint.title}</title>
      </row>
      {sprint.tasks}
      <text color="secondary" size="sm">Definition of done: {sprint.done}</text>
    </box>
  {/each}
</box>

This roadmap targets a first pilot in about 16 weeks, not the complete ten-module platform. Don't start the next sprint by adding features to a broken workflow.

## 9. Deployment strategy and near-zero budget

The key is to separate local development, staging, and production. A free deployment is useful for demonstrations, but it is not automatically reliable enough for real orders or sensitive production data.

### Suggested deployment layout

<box border radius="lg" padding={3} gap={3}>
  <row align="start" gap={3}>
    <icon name="laptop" size="xl"/>
    <box flex="1" gap={1}>
      **Development**

      <text color="secondary" size="sm">Local laptops</text>
      Run Next.js, NestJS, and PostgreSQL locally using Docker Compose. Use synthetic seed data, not real student records.
    </box>
  </row>
  <divider color="subtle"/>
  <row align="start" gap={3}>
    <icon name="test-tube" size="xl"/>
    <box flex="1" gap={1}>
      **Staging**

      <text color="secondary" size="sm">Shared team test environment</text>
      Deploy the API and web app, use a separate test database, and verify each release with test accounts.
    </box>
  </row>
  <divider color="subtle"/>
  <row align="start" gap={3}>
    <icon name="cloud" size="xl"/>
    <box flex="1" gap={1}>
      **Production**

      <text color="secondary" size="sm">Pilot and paying customers</text>
      Use commercial-permitted hosting, HTTPS, restricted database access, backups, monitoring, and a tested recovery procedure.
    </box>
  </row>
</box>

### Free-tier options to evaluate

<box gap={3}>
  <row align="start" gap={3}>
    <AsyncImage query="Supabase official logo green database platform" aspectRatio="1:1" maxWidth="56px"/>
    <box flex="1" gap={1}>
      **<Entity value="Supabase" category="software" disambig="managed PostgreSQL database and backend platform"/> — database option**

      Its published free plan includes a 500 MB database, 1 GB file storage, and 5 GB egress. Free projects may pause after a week of inactivity, and automatic backups aren't included on the free plan. Good for prototyping; don't treat it as your only production backup. <Cite refs={["turn866810search3","turn866810search4"]}/>

      <text><Link url="https://supabase.com/pricing" title="Check current plans"/></text>
    </box>
  </row>
  <divider color="subtle"/>
  <row align="start" gap={3}>
    <AsyncImage query="GitHub official Octocat logo" aspectRatio="1:1" maxWidth="56px"/>
    <box flex="1" gap={1}>
      **<Entity value="GitHub" category="software" disambig="code hosting and collaboration platform"/> — source control and CI**

      Use a private repository for proprietary source code, pull requests, issue tracking, and automated checks. GitHub Free currently lists 2,000 monthly GitHub Actions minutes for standard runners, subject to plan rules. <Cite refs={["turn866810search5","turn866810search8"]}/>

      <text><Link url="https://github.com/pricing" title="Check plans and limits"/></text>
    </box>
  </row>
  <divider color="subtle"/>
  <row align="start" gap={3}>
    <AsyncImage query="Expo React Native official logo" aspectRatio="1:1" maxWidth="56px"/>
    <box flex="1" gap={1}>
      **<Entity value="Expo" category="software" disambig="React Native development and build platform"/> — Android builds**

      Develop locally for free and use EAS only when its free build quota is useful. When cloud build credits run out, local Android builds can avoid a paid build subscription, provided your development environment is configured correctly. <Cite refs={["turn866810search7","turn866810search10","turn866810search13"]}/>

      <text><Link url="https://expo.dev/pricing" title="Check current EAS limits"/></text>
    </box>
  </row>
  <divider color="subtle"/>
  <row align="start" gap={3}>
    <AsyncImage query="Vercel official black triangle logo" aspectRatio="1:1" maxWidth="56px"/>
    <box flex="1" gap={1}>
      **<Entity value="Vercel" category="software" disambig="web application hosting platform"/> — web deployment**

      Convenient for Next.js prototypes, but its Hobby plan is restricted to personal, non-commercial use. Plan a different commercially permitted deployment arrangement before operating a revenue-generating service on that plan. <Cite refs={["turn866810search1","turn866810search6"]}/>

      <text><Link url="https://vercel.com/pricing" title="Review hosting plans"/></text>
    </box>
  </row>
</box>

### Cost-control policy

1. Use a custom domain only when the budget allows; start with the provider's permitted development URL.
2. Use local development databases and seed data to avoid unnecessary cloud database usage.
3. Compress product images, limit uploads, and remove unused test files.
4. Disable paid services and usage-based features until you need them.
5. Set usage alerts where supported and review resource usage weekly.
6. Keep database exports or backups in a separate location and test restoring them.
7. Before launching commercially, check hosting terms, uptime expectations, regional availability, data location, and payment requirements.

**Budget reality:** you can build and demonstrate most of CampusFlow for almost zero cash expenditure. Reliable commercial operations may eventually require paid hosting, a domain, backups, SMS, payment integration, and app distribution expenses. Don't promise permanent zero-cost hosting.

## 10. Business validation and first revenue

The most important early milestone isn't downloading the app. It's proving that a real merchant receives useful orders and that students return to use the service.

### Before launch

- Interview 30 students and 10 campus-area businesses.
- Choose the first transaction flow based on real demand.
- Recruit 3–5 merchants willing to participate in a pilot.
- Create a clickable prototype and test it with students.
- Ask merchants what operational problem they'd pay you to solve.
- Record baseline figures such as existing order volume, time spent managing orders, and repeat customers.

### Pricing experiments

Test three offers with merchants rather than assuming a subscription will sell:

| Offer | What you learn |
|---|---|
| Free pilot | Will merchants participate and use the platform? |
| Basic monthly subscription | Will merchants pay for useful management tools? |
| Optional promotion or transaction fee | Will merchants pay for measurable additional value? |

Make all fees transparent. Confirm merchant agreements, refund responsibilities, consumer protection obligations, and any applicable payment-provider requirements before collecting commercial transactions.

### Weekly metrics

Track these numbers from the beginning:

- Active students and merchants.
- Listings that are actually available.
- Orders started, accepted, completed, and cancelled.
- Time from order placement to merchant response.
- Repeat student usage.
- Merchant retention and willingness to pay.
- Complaints, refunds, and unresolved issues.
- Hosting costs per active merchant and completed order.

Don't use sign-ups alone as your success metric. A thousand registrations with no completed orders is weaker evidence than a smaller group using the product repeatedly.

## 11. Staged launch plan

<box gap={3}>
  <row align="start" gap={3}>
    <box background="surface" radius="lg" padding={2} minWidth="88px" align="center">
      <title size="lg">Stage 0</title>
      <caption>Weeks 1–2</caption>
    </box>
    <box flex="1" gap={1}>
      **Validate the problem**

      Conduct interviews, test the prototype, recruit pilot merchants, and confirm which services can be launched without institutional permissions.
      <text color="secondary" size="sm">Gate: evidence of a real problem and initial pilot interest.</text>
    </box>
  </row>
  <divider color="subtle"/>
  <row align="start" gap={3}>
    <box background="surface" radius="lg" padding={2} minWidth="88px" align="center">
      <title size="lg">Stage 1</title>
      <caption>Weeks 3–8</caption>
    </box>
    <box flex="1" gap={1}>
      **Build the core platform**

      Deliver accounts, directory, merchant verification, listings, and the first order workflow. Test with synthetic data.
      <text color="secondary" size="sm">Gate: an end-to-end order works in a controlled environment.</text>
    </box>
  </row>
  <divider color="subtle"/>
  <row align="start" gap={3}>
    <box background="surface" radius="lg" padding={2} minWidth="88px" align="center">
      <title size="lg">Stage 2</title>
      <caption>Weeks 9–12</caption>
    </box>
    <box flex="1" gap={1}>
      **Closed pilot**

      Invite selected merchants and student testers. Fix usability issues, verify permissions, test recovery, and measure actual order completion.
      <text color="secondary" size="sm">Gate: pilot users can complete the primary workflow reliably.</text>
    </box>
  </row>
  <divider color="subtle"/>
  <row align="start" gap={3}>
    <box background="surface" radius="lg" padding={2} minWidth="88px" align="center">
      <title size="lg">Stage 3</title>
      <caption>Weeks 13–16</caption>
    </box>
    <box flex="1" gap={1}>
      **Haramaya public pilot**

      Launch the web experience and Android beta, provide user support, onboard additional merchants, and test willingness to pay.
      <text color="secondary" size="sm">Gate: repeat usage, manageable support workload, and evidence of merchant value.</text>
    </box>
  </row>
  <divider color="subtle"/>
  <row align="start" gap={3}>
    <box background="surface" radius="lg" padding={2} minWidth="88px" align="center">
      <title size="lg">Stage 4</title>
      <caption>After validation</caption>
    </box>
    <box flex="1" gap={1}>
      **Expand services and campuses**

      Introduce transport ticketing and integrated payments through approved partners, followed by housing, clubs, events, and learning services. Expand to another university only when support and onboarding are repeatable.
    </box>
  </row>
</box>

These are target stages, not fixed promises. Payment partnerships, institutional approval, and app distribution can change the timeline.

## 12. Your launch checklist

{@body const tasks = [{group:"Business",items:["Interview students and local businesses","Choose the first transaction workflow","Recruit pilot merchants","Agree on team ownership and responsibilities"]},{group:"Engineering",items:["Create the monorepo and CI pipeline","Implement database migrations and authentication","Build directory, listings, and orders","Add scoped permissions and automated tests","Deploy a staging environment"]},{group:"Launch readiness",items:["Publish privacy and service terms","Test backups and recovery","Complete Android device testing","Set up complaint handling and support","Confirm commercial hosting and partner permissions"]}]}
{@body const [checked,setChecked] = DIL.useState([])}
<box border radius="lg" padding={3} gap={3}>
  <row align="center" justify="between">
    <title size="lg">CampusFlow launch tracker</title>
    <title size="md" color="success">{checked.length}/{tasks.reduce((sum,g)=>sum+g.items.length,0)}</title>
  </row>
  <box background="surface-tertiary" radius="full" height="6px" clip>
    <box background="success-solid" radius="full" height="6px" width={`${checked.length/tasks.reduce((sum,g)=>sum+g.items.length,0)*100}%`}/>
  </box>
  {#each tasks as group}
    <box gap={2}>
      <text weight="medium">{group.group}</text>
      {#each group.items as item}
        <checkbox key={item} checked={checked.includes(item)} onChange={v=>setChecked(old=>v?[...old,item]:old.filter(x=>x!==item))}>{item}</checkbox>
      {/each}
    </box>
    <divider color="subtle"/>
  {/each}
  <button block variant="outline" onClick={()=>GenUI.copy(tasks.map(g=>g.group+"\n"+g.items.map(i=>(checked.includes(i)?"[x] ":"[ ] ")+i).join("\n")).join("\n\n"))}> <icon name="copy" size="sm" inline/> Copy checklist</button>
</box>

## 13. What the team should do tomorrow

1. Create the private `campusflow` GitHub repository.
2. Assign one person to lead the business interviews and prototype.
3. Have the technical team establish the monorepo, local PostgreSQL database, and API skeleton.
4. Agree on the first complete workflow: **student discovers a merchant → places an order → merchant accepts it → student sees the status**.
5. Demo that workflow before adding more services.

My recommendation is to keep transport ticketing and integrated payments in the architecture, but not make them prerequisites for the first release. They introduce external dependencies and operational risks that could delay validation.

**The first milestone is not a giant app. It is a reliable campus service that real people use repeatedly and businesses are willing to pay for.** Once that works at Haramaya University, you'll have a much stronger foundation for expanding CampusFlow across Ethiopia. 🚀

---

If you want, I can:

- Outline next development sprint plan
- Define initial marketing and user onboarding strategies
- Detail integration approach with university systems