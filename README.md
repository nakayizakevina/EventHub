# EventHub Dashboard

A frontend-only event management dashboard built for the **Tech4Dev Mentorship Mini Project**.
It displays event performance — ticket sales, revenue, popular events and an event
calendar — entirely from TypeScript seed data. There is no backend, database,
authentication or payment integration.

> **Status:** complete. The data layer, business calculations, tooling, tests, the
> full dashboard UI (matching the supplied design reference) and client-side routing
> across `/dashboard`, `/events` and `/bookings` are all implemented and verified.

## Technology Stack

| Concern          | Technology                                  |
| ---------------- | ------------------------------------------- |
| Runtime          | Node.js 22+                                 |
| UI library       | React 19                                    |
| Routing          | React Router 7 (client-side, shared layout) |
| Language         | TypeScript 5.9 (strict mode)                |
| Build / dev tool | Vite 8                                      |
| Styling          | Tailwind CSS 4 (Vite integration)           |
| Charts           | Recharts                                    |
| Icons            | Lucide React                                |
| Dates            | date-fns                                   |
| Unit testing     | Vitest (+ jsdom)                            |
| Linting          | ESLint 10 (flat config) + typescript-eslint |

## Installation

```bash
npm install
```

## Development Commands

| Command             | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | Start the Vite development server (hot reload)           |
| `npm run build`     | Type-check (`tsc --noEmit`) and produce a production build |
| `npm run preview`   | Serve the production build locally                        |
| `npm run typecheck` | Run the TypeScript compiler without emitting files       |
| `npm run lint`      | Run ESLint over the whole project                        |
| `npm test`          | Run the unit test suite once                             |
| `npm run test:watch`| Run the unit tests in watch mode                         |

## Project Structure

```text
eventhub-dashboard/
├── public/
│   └── images/
│       └── events/            # Event images (SVG placeholders for now)
│
├── src/
│   ├── assets/                # Static assets imported by components
│   ├── components/
│   │   ├── layout/            # AppLayout, Sidebar, Header, MobileNavigation
│   │   ├── dashboard/         # SummaryCards, charts, FeaturedEvent, EventCalendar, AllEvents
│   │   ├── bookings/          # BookingsStats, BookingsTable, BookingFilters, BookingDetails, BookingStatusBadge
│   │   └── shared/            # SectionCard, Pill (reusable presentational components)
│   ├── data/
│   │   └── seed.ts            # Mock events + bookings (stands in for the API)
│   ├── pages/
│   │   ├── DashboardPage.tsx  # Dashboard overview (all sections)
│   │   ├── EventsPage.tsx     # Placeholder page
│   │   └── BookingsPage.tsx   # Bookings overview, filters, table and details dialog
│   ├── services/
│   │   ├── dashboardService.ts# Dashboard data access layer (swap seed → HTTP here)
│   │   └── bookingService.ts  # Bookings data access layer (same async contract)
│   ├── types/
│   │   ├── event.ts           # Event model, EventStatus, EventCategory
│   │   ├── booking.ts         # Booking model, PaymentStatus
│   │   ├── bookings.ts        # Bookings read models (BookingRow, BookingSummary, filters)
│   │   └── dashboard.ts       # Read models (DTOs) returned by the service
│   ├── utils/
│   │   ├── dashboardCalculations.ts # Pure business calculations
│   │   └── bookingCalculations.ts   # Pure bookings calculations (rows, summary, filters)
│   ├── test/                  # Unit tests (Vitest)
│   ├── App.tsx                # Route table (shared AppLayout + nested pages)
│   ├── main.tsx               # Entry point
│   └── index.css              # Tailwind entry point + base styles + card surface
│
├── eslint.config.js           # ESLint flat config
├── index.html                 # Vite HTML entry
├── package.json
├── tsconfig.json
└── vite.config.ts             # Vite + Tailwind + Vitest configuration
```

## Architecture

Three layers keep concerns separated (see the diagram below):

```text
UI components (src/components, src/App.tsx)
        │  consume read models (DashboardSummary, MonthlyRevenuePoint, …)
        ▼
Service layer (src/services/dashboardService.ts)
        │  async functions — the contract UI code is written against
        ▼
Seed data (src/data/seed.ts)  +  Calculations (src/utils/dashboardCalculations.ts)
```

- **`dashboardService.ts`** and **`bookingService.ts`** are the only modules that read seed
  data (dashboard and bookings respectively). Every function is
  `async` and returns a `Promise`, exactly like a future REST/GraphQL API would.
  Replacing the seed with `fetch(...)` calls later only changes these function bodies —
  no UI component needs to be rewritten.
- **`dashboardCalculations.ts`** and **`bookingCalculations.ts`** hold all business logic as
  pure functions (revenue, occupancy, monthly grouping, rankings; booking rows,
  summaries and filters). Components never compute dashboard figures
  themselves, so no number is ever hardcoded in more than one place.
- **`types/dashboard.ts`** defines the read models (DTOs) that flow from the service to
  the UI, keeping the seed models free of presentation concerns.

## Routing & Responsive Layout

Client-side routing via React Router (`src/App.tsx`):

| Route        | Page                        | Notes                                    |
| ------------ | --------------------------- | ---------------------------------------- |
| `/dashboard` | `DashboardPage`             | Full design-reference dashboard          |
| `/events`    | `EventsPage`                | Placeholder — "This is a events page"    |
| `/bookings`  | `BookingsPage`              | Bookings overview, filters, table, details dialog |
| `/` and any unknown path | → `/dashboard` | `Navigate` with `replace`       |

All three routes render inside a single shared `AppLayout` (React Router layout route
with an `<Outlet />`), so the **sidebar and header persist** across navigations — only
the main content swaps. Navigation uses `NavLink` (`aria-current="page"` + orange
highlight for the active item); nothing opens a new tab and nothing triggers a full
page reload.

**Mobile-first responsive behaviour** (`src/components/layout/`):

- **Mobile (<1024px):** the desktop sidebar is replaced by a hamburger menu button in
  the header that opens a drawer (`MobileNavigation`) with a backdrop; it closes on
  backdrop click, `Escape`, or after choosing a nav link. Cards, charts and event grids
  stack vertically with no horizontal overflow.
- **Tablet (≥768px):** two-column summary cards, search input appears, charts keep
  readable fixed heights.
- **Desktop (≥1024px):** persistent left sidebar; at ≥1280px the dashboard uses the
  reference three-column arrangement with the featured event and calendar in the right
  column.


## Data Model Overview

### Event (`src/types/event.ts`)

| Field            | Type                                    | Notes                              |
| ---------------- | --------------------------------------- | ---------------------------------- |
| `id`             | `string`                                | Unique identifier                  |
| `title`          | `string`                                |                                    |
| `category`       | `EventCategory`                         | `'Music' \| 'Sports' \| 'Fashion' \| 'Technology' \| 'Food & Culinary'` |
| `date`           | `string`                                | ISO 8601 date-time                 |
| `venue`          | `string`                                | Venue + city                       |
| `status`         | `EventStatus`                           | `'upcoming' \| 'active' \| 'completed'` |
| `ticketCapacity` | `number`                                | Maximum sellable tickets           |
| `ticketsSold`    | `number`                                | Authoritative sold count, `<= ticketCapacity` |
| `image`          | `string`                                | Path under `/images/events/`       |
| `description`    | `string?`                               | Short blurb for featured/event cards |

The interface is named `EventItem` so it never shadows the DOM `Event` global type.

### Booking (`src/types/booking.ts`)

| Field             | Type            | Notes                                     |
| ----------------- | --------------- | ----------------------------------------- |
| `id`              | `string`        | Unique identifier                         |
| `eventId`         | `string`        | References an event `id`                  |
| `attendeeName`    | `string?`       | Optional                                  |
| `ticketQuantity`  | `number`        | Tickets in the order, `> 0`               |
| `amount`          | `number`        | Order total in USD (quantity × unit price)|
| `paymentStatus`   | `PaymentStatus` | `'paid' \| 'pending' \| 'failed'`         |
| `createdAt`       | `string`        | ISO 8601 timestamp                       |

On the Bookings screens this payment status is mapped to a display status
(`paid → confirmed`, `pending → pending`, `failed → cancelled`) by
`bookingCalculations.toDisplayStatus`. The mapping lives at the presentation
boundary only — the domain model and all revenue rules are unchanged.

## Seed Data Assumptions & Data Rules

All dashboard figures derive from `src/data/seed.ts` — nothing is hardcoded in
components. The rules below are documented in `dashboardCalculations.ts` and enforced
by `src/test/seedIntegrity.test.ts`:

1. **Revenue includes only `paid` bookings.** Pending and failed payments never
   contribute to revenue; their totals are reported separately
   (`outstandingRevenue`, `failedRevenue`).
2. **Ticket sales come from `event.ticketsSold`**, the authoritative per-event sold
   count. Total sales, category breakdowns and occupancy all derive from this single
   field, so every view agrees with every other view.
3. **Occupancy** = `ticketsSold / ticketCapacity` (0–100 %, one decimal).
4. **Capacity is never exceeded:** `ticketsSold <= ticketCapacity` for every event,
   and the paid-booking ticket quantities of an event never exceed its `ticketsSold`.
5. **Bookings are a representative sample of orders** (not an exhaustive ledger) used
   for revenue, booking counts and monthly trends; per-event aggregates come from the
   event record. Every `eventId` references a valid event.
6. **Dates are generated relative to the current date** at module load time
   (via `date-fns`), so the seed always contains upcoming, active and completed events
   plus roughly six months of booking history. When real API data replaces the seed,
   dates will simply come from the server.
7. **Images** are lightweight SVG placeholders in `public/images/events/`, one per
   event, referenced by the event's `image` field.
8. **Ticket-sales donut buckets** partition total capacity by event occupancy:
   `sold-out` ≥ 90 %, `fully-booked` 70–90 %, `available` < 70 %. The three buckets
   always sum exactly to the total ticket capacity.

Seed contents: **10 events** (5 categories × 3 statuses, capacities 600–5000) and
**27 bookings** (18 paid, 5 pending, 4 failed) spanning ~5 months.

## Testing

Tests live in `src/test/` and cover:

- `dashboardCalculations.test.ts` — pure business logic (revenue rules, occupancy,
  monthly grouping, rankings, upcoming/calendar filtering, ticket-sales donut buckets).
- `seedIntegrity.test.ts` — data rules: referential integrity, capacity limits,
  required categories/statuses/payment states, revenue-only-paid, donut buckets
  always cover the full ticket pool.
- `dashboardService.test.ts` — service contract: async API, summary consistency,
  ordering and limits (including `getTicketSalesByStatus` and `getFeaturedEvent`).
- `bookingCalculations.test.ts` — bookings logic: payment → display status mapping,
  booking/event joins, newest-first ordering, summary counts, and
  search/filter behaviour (including combined AND filtering).

**71 tests**, all passing.

```bash
npm test
```

## Future API Integration

`dashboardService.ts` is the single place to change. For example:

```ts
// Before (seed):
export async function getAllEvents(): Promise<EventItem[]> {
  return [...events].sort((a, b) => a.date.localeCompare(b.date));
}

// After (API):
export async function getAllEvents(): Promise<EventItem[]> {
  const response = await fetch('/api/events');
  if (!response.ok) throw new Error('Failed to load events');
  return response.json() as Promise<EventItem[]>;
}
```

Components keep working unchanged because they already handle the `Promise`-based
contract (loading and error states).
