# 🧭 TripNest

A full-stack travel planner built for **travelling Bangladesh** — 25 destinations from Cox's
Bazar to the Sundarbans, priced per day in **BDT (৳)**, plotted on an interactive map with
Google Maps integration, and every taka logged against a budget you actually control.

Built with **Next.js 16 (App Router)**, **PostgreSQL**, **Drizzle ORM** and **Tailwind CSS v4**.

---

## ✨ Features

### Public site
| Page | What it does |
|---|---|
| `/` | Hero, live featured destinations from the DB, region guide, how-it-works, CTA |
| `/destinations` | All 25 destinations with **division** filters + cheapest/top-rated sorting, each card linking to Google Maps |
| `/costs` | **Individual trip cost table for all 25 destinations** — sortable columns for lodging, food, local transport, activities and the round-trip fare from Dhaka, plus 2/3/5-day totals and an interactive calculator |
| `/location` | **Interactive Bangladesh map** plotting real lat/lng pins by division — tap a pin to switch to a live **Google Maps** embed, get directions, or see the cost panel |
| `/about` | Story, stats, values, timeline, team |
| `/contact` | Validated contact form persisting to Postgres, **office location in Joydebpur, Gazipur** with an embedded Google Map, and FAQ accordion |

### Authentication
- Cookie-based sessions (30 days) with **scrypt** password hashing + timing-safe comparison
- `sessions` table in Postgres — revocable server-side
- Protected `(auth)` route group with a split-screen layout
- Auto-redirect for signed-in users, and guarded dashboard routes

### Dashboard (sidebar layout)
| Section | Capabilities |
|---|---|
| **Overview** | Stat tiles, budget-vs-spend pacing bar, category spend chart, upcoming trips with per-trip pacing |
| **Destinations** | Full CRUD card grid with per-day cost, Dhaka fare, travel mode, access notes and a Google Maps button |
| **Trips** | Full CRUD with destination linking, date validation, live cost estimate in the modal |
| **Travel Cost** | Expense CRUD, one-tap quick-log strip, category/trip filters, running totals |
| **Inbox** | Triage contact messages (auto mark-read, archive, delete) with a reading pane |
| **Settings** | Profile, traveller type, default currency |

---

## 🎁 UX details

- **Optimistic updates** — every create/update/delete renders instantly with a pending shimmer,
  rolls back on failure, and surfaces a toast
- **Google Maps integration** — every destination exposes a Maps search link and directions URL
  derived from its coordinates; the contact page and location page embed live Maps iframes
- **Empty states** — purpose-built for every collection, both "nothing yet" and "no search matches"
- **Loading states** — route-level `loading.tsx` skeletons plus shimmer placeholders
- **Responsive** — mobile drawers for both the site nav and the dashboard sidebar
- **Error handling** — 404 page, error boundary, inline field-level form validation

---

## 🛠️ Tech stack

- **Framework** — Next.js 16, App Router, React 19, Turbopack
- **Database** — PostgreSQL
- **ORM** — Drizzle ORM + drizzle-kit
- **Styling** — Tailwind CSS v4 (CSS-first `@theme` config), no component library
- **Language** — TypeScript (strict)

---

## 🚀 Getting started

### 1. Install

```bash
npm install
```

### 2. Configure the database

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

### 3. Push the schema

```bash
npx drizzle-kit push
```

### 4. Run

```bash
npm run dev
```

Open <http://localhost:3000>.

> The app **self-seeds on first request** — an idempotent seed routine inserts a demo user,
> **25 Bangladesh destinations**, 6 trips, 23 expenses and 5 contact messages.

### Demo account

| | |
|---|---|
| Email | `rafi@tripnest.app` |
| Password | `travel123` |
| Home city | Joydebpur, Gazipur |
| Default currency | BDT (৳) |

The login screen has a **"Try the demo account"** button that fills these in for you.

---

## 🇧🇩 Destinations included

All 25 are seeded with real coordinates, a division, travel mode, journey time, distance from
Dhaka, access notes and an individual cost breakdown.

| # | Destination | Division | ৳/day |
|---|---|---|---|
| 1 | Cox's Bazar | Chattogram | 3,800 |
| 2 | Saint Martin's Island | Chattogram | 4,200 |
| 3 | Sajek Valley | Rangamati | 3,400 |
| 4 | Sreemangal | Moulvibazar | 2,400 |
| 5 | Jaflong | Sylhet | 2,200 |
| 6 | Ratargul Swamp Forest | Sylhet | 2,000 |
| 7 | Bichanakandi | Sylhet | 2,300 |
| 8 | Lalakhal | Sylhet | 2,100 |
| 9 | Nilgiri, Bandarban | Bandarban | 3,000 |
| 10 | Nilachal | Bandarban | 2,600 |
| 11 | Boga Lake | Bandarban | 3,400 |
| 12 | Kaptai Lake | Rangamati | 2,700 |
| 13 | Shuvolong Waterfall | Rangamati | 2,500 |
| 14 | Kuakata | Patuakhali | 3,000 |
| 15 | The Sundarbans | Khulna | 6,500 |
| 16 | Tanguar Haor | Sunamganj | 3,800 |
| 17 | Jadukata River | Sunamganj | 2,400 |
| 18 | Madhabkunda Waterfall | Moulvibazar | 2,000 |
| 19 | Somapura Mahavihara, Paharpur | Naogaon | 1,800 |
| 20 | Mahasthangarh | Bogura | 1,900 |
| 21 | Panam City | Narayanganj | 1,700 |
| 22 | Lalbagh Fort | Dhaka | 1,500 |
| 23 | Birishiri | Netrokona | 2,300 |
| 24 | Guliakhali Sea Beach | Chattogram | 2,000 |
| 25 | Mohamaya Lake | Chattogram | 2,200 |

### Cost model

Each destination stores six individual figures:

| Field | Meaning |
|---|---|
| `lodgingCost` | One night, mid-range local hotel or resort |
| `foodCost` | Three meals plus tea, local counters |
| `localTransportCost` | Rickshaw / CNG / local bus for the day |
| `activityCost` | Boat hire, guide fees, park entry |
| `intercityTransport` | **Round trip from Dhaka** (bus / train / launch / flight) |
| `entryFee` | One-off fort, museum or preserve ticket |

`avgDailyCost` is derived automatically as `lodging + food + localTransport + activities`,
so the headline figure can never drift out of sync with its parts. The public cost table then
computes **N-day totals** as `(N × avgDailyCost) + intercityTransport + entryFee`.

---

## 📁 Project structure

```
src/
├── app/
│   ├── (site)/          # Public marketing pages
│   │   ├── page.tsx           # Home
│   │   ├── destinations/   # Division-filtered library
│   │   ├── costs/          # Individual trip cost table + calculator
│   │   ├── location/       # Bangladesh map + Google Maps
│   │   ├── about/
│   │   └── contact/        # Joydebpur, Gazipur office + map embed
│   ├── (auth)/          # Login + signup (split-screen layout)
│   ├── dashboard/       # Authenticated workspace (sidebar layout)
│   │   ├── page.tsx           # Overview
│   │   ├── destinations/
│   │   ├── trips/
│   │   ├── expenses/
│   │   ├── messages/
│   │   └── settings/
│   ├── api/             # Route handlers (auth, destinations, trips, expenses, messages, profile)
│   ├── layout.tsx
│   └── globals.css      # Tailwind v4 theme + custom animations
├── components/
│   ├── ui.tsx           # Design system: Button, Card, Badge, Modal, Toast, EmptyState, Skeleton…
│   ├── site/            # SiteNav, SiteFooter, DestinationCard, CostCalculator, LocationMap, ContactForm
│   ├── dashboard/       # Sidebar, PageHeader, *Manager (client CRUD shells)
│   └── auth/            # AuthForm
├── db/
│   ├── index.ts         # Drizzle client (pg Pool)
│   ├── schema.ts        # users, sessions, destinations, trips, expenses, messages
│   └── seed.ts          # Idempotent lazy seeding
└── lib/
    ├── auth.ts          # scrypt hashing, session create/verify/destroy
    ├── api.ts           # Response helpers + body parsers
    ├── client.ts        # Typed fetch wrapper for optimistic UI
    ├── status.ts        # Server-safe badge tone helpers
    ├── maps.ts          # Google Maps search / directions / embed URL builders
    └── format.ts        # BDT + date formatting, divisions, travel modes
```

---

## 🗄️ Data model

```
users ──┬──< sessions
        ├──< destinations
        ├──< trips ──< expenses
        └──< expenses

messages   (public submissions, standalone)
```

| Table | Notable columns |
|---|---|
| `users` | name, email (unique), password_hash, role, home_city, currency |
| `sessions` | token (PK), user_id → users, expires_at |
| `destinations` | name, country, **division**, avg_daily_cost, **lodging/food/local_transport/activity_cost**, **intercity_transport**, **entry_fee**, **distance_from_dhaka**, **travel_mode/time**, **access_note**, rating, lat/lng, tags (jsonb), status, featured |
| `trips` | title, start/end date, travelers, budget, status, destination_id → destinations |
| `expenses` | category, description, amount, currency, spent_on, trip_id → trips |
| `messages` | name, email, subject, message, status |

---

## 🔌 API reference

All resource routes are scoped to the authenticated user and return `401` when unauthenticated.

| Method | Route | Auth | Notes |
|---|---|---|---|
| `POST` | `/api/auth/signup` | – | Creates user + session |
| `POST` | `/api/auth/login` | – | Sets session cookie |
| `POST` | `/api/auth/logout` | – | Revokes session |
| `GET` | `/api/destinations` | ✅ | Supports `?q=`, `?status=` |
| `POST` | `/api/destinations` | ✅ | |
| `PATCH` | `/api/destinations/[id]` | ✅ | Partial update |
| `DELETE` | `/api/destinations/[id]` | ✅ | |
| `GET` / `POST` | `/api/trips` | ✅ | |
| `PATCH` / `DELETE` | `/api/trips/[id]` | ✅ | |
| `GET` / `POST` | `/api/expenses` | ✅ | |
| `PATCH` / `DELETE` | `/api/expenses/[id]` | ✅ | |
| `GET` | `/api/messages` | ✅ | Inbox read |
| `POST` | `/api/messages` | – | **Public** contact form |
| `PATCH` / `DELETE` | `/api/messages/[id]` | ✅ | Triage |
| `PATCH` | `/api/profile` | ✅ | Profile + default currency |
| `GET` | `/api/health` | – | DB ping + seed check |

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

---

## 📄 License

MIT — photography courtesy of [Pexels](https://www.pexels.com).

> ⚠️ Costs are realistic mid-range estimates and move with the season. Restricted areas such as
> **Boga Lake** require current permission from local authorities — always verify access rules
> before travelling.
