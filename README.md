<div align="center">

# MeetFlow

**A modern scheduling platform inspired by Calendly and Cal.com.**

Create booking links in seconds, let guests pick a time that works in **their** timezone, and let MeetFlow handle availability, Google Calendar sync, team scheduling, emails, and analytics.

<!-- Replace with a real screenshot once captured (see Screenshots section) -->
![MeetFlow Dashboard](public/screenshots/dashboard.png)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-meetflow--chi.vercel.app-10B981?style=flat-square&logo=vercel&logoColor=white)](https://meetflow-chi.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/haridyanshujindal/meetflow)

![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

</div>

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Folder Structure](#folder-structure)
- [Local Installation](#local-installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Prisma Migrations](#prisma-migrations)
- [Vercel Deployment](#vercel-deployment)
- [Google OAuth Setup](#google-oauth-setup)
- [Google Calendar Integration](#google-calendar-integration)
- [Email Configuration](#email-configuration)
- [Timezone Support](#timezone-support)
- [Future Roadmap](#future-roadmap)
- [License](#license)

---

## Features

- **Booking links** — Public booking pages (`/book/<slug>`) with configurable event types: duration, buffers, description, location, and color.
- **Smart availability** — Weekly schedules with per-day time intervals, quick copy-across-days, and per-date overrides (available/unavailable with custom hours).
- **Timezone-aware scheduling** — Availability is anchored to the host's timezone; guests pick a timezone and slot times render in the timezone they choose. Dates/times across the dashboard, emails, and analytics are rendered in the viewer's timezone.
- **Google Calendar sync** — One-click connect, automatic event creation/update/deletion on booking, reschedule, and cancellation. Google Meet links are created automatically.
- **Booking rules** — Minimum notice, maximum advance booking, daily/weekly booking limits, and buffer times, validated on every booking.
- **Guest self-service** — Guests can reschedule or cancel their booking via a secure tokenized link, with emails sent for every change.
- **Team scheduling** — Create teams, invite members via email links, and build **Round-Robin** and **Collective** event types.
- **Analytics dashboard** — KPIs (bookings, completion, cancellation, reschedule), bookings over time, availability insights (busiest weekday/hour, average lead time), per-event-type and per-team analytics, and recent activity.
- **Transactional emails** — Confirmation, reschedule, and cancellation emails via [Resend](https://resend.com), rendered in the guest's timezone.
- **Auth** — Google and GitHub OAuth via NextAuth.js with JWT sessions.
- **Dark, modern UI** — A custom landing page and app shell built with Tailwind CSS 4 and shadcn/base-ui primitives.

## Screenshots

| Screenshot | Description |
| --- | --- |
| ![Landing](public/screenshots/landing.png) | Marketing landing page (hero, features, pricing, FAQ) |
| ![Dashboard](public/screenshots/dashboard.png) | Dashboard home (greeting, today, upcoming meetings) |
| ![Event Types](public/screenshots/event-types.png) | Event type list and creation |
| ![Availability](public/screenshots/availability.png) | Weekly schedule editor + date overrides |
| ![Booking](public/screenshots/booking.png) | Public booking page with timezone picker |
| ![Bookings](public/screenshots/bookings.png) | Bookings list + calendar view |
| ![Analytics](public/screenshots/analytics.png) | Analytics overview |
| ![Teams](public/screenshots/teams.png) | Team management |
| ![Settings](public/screenshots/settings.png) | Settings (profile, timezone, security) |

### Screenshot Checklist

1. **landing.png** — Visit the landing page (`/`) and capture the full hero section.
2. **dashboard.png** — Log in and capture the dashboard home with a greeting card and upcoming meetings.
3. **event-types.png** — Open **Event Types** and capture the list; include the "New event type" dialog.
4. **availability.png** — Open **Availability** and capture the weekly schedule grid with a date override visible.
5. **booking.png** — Copy a booking link and capture the guest booking page (date picker, timezone selector, time slots).
6. **bookings.png** — Open **Bookings** and capture the list view (and optionally the calendar month view).
7. **analytics.png** — Open **Analytics** and capture the KPI row and the bookings-over-time chart.
8. **teams.png** — Open **Teams** and capture the team list and member management view.
9. **settings.png** — Open **Settings → Timezone** and capture the timezone selector.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 15](https://nextjs.org) (App Router, Server Actions) |
| UI | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) + [Base UI](https://base-ui.com), [Lucide](https://lucide.dev) icons |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| ORM / Database | [Prisma 6](https://www.prisma.io) + [PostgreSQL 16](https://www.postgresql.org) |
| Auth | [NextAuth.js 5](https://next-auth.js.org) (Google, GitHub OAuth, JWT) |
| Calendar | [Google Calendar API](https://developers.google.com/calendar) via `googleapis` |
| Email | [Resend](https://resend.com) |
| Charts | [Recharts](https://recharts.org) |
| Forms / Validation | [React Hook Form](https://react-hook-form.com), [Zod](https://zod.dev) |
| Date/time | [date-fns](https://date-fns.org) + [date-fns-tz](https://github.com/marnusw/date-fns-tz) |
| Motion | [Framer Motion](https://www.framer.com/motion/) |

## Architecture Overview

MeetFlow stores every timestamp in **UTC**. Wall-clock availability (weekly intervals, override hours) is anchored to the host's `User.timezone`, and all business logic (slot generation, booking rules, day-boundary checks) converts through centralized timezone utilities in `src/lib/date.ts`. Every date/time shown anywhere in the app is rendered in the viewer's or the guest's timezone.

- **Server layer** — `src/app/**/page.tsx` are server components that fetch data via `src/lib/queries/*` and guard routes with `auth()`.
- **Mutations** — Server actions in `src/lib/actions/*` validate with Zod schemas, enforce business rules, run serializable transactions to prevent double-booking, and write to Google Calendar + send emails.
- **Slot generation** — `src/lib/scheduling/generate-slots.ts` computes available slots for a given day in a given timezone from weekly availability, overrides, buffers, and booking rules.
- **Persistence** — PostgreSQL via Prisma; the Prisma client is generated into `src/generated/prisma` (gitignored) and the Next.js config bundles the Prisma engine so it runs on the Vercel serverless runtime.

## Folder Structure

```
meetflow/
├── prisma/
│   ├── migrations/            # SQL migrations (history applied via prisma migrate)
│   └── schema.prisma          # Data models (User, EventType, Booking, Team, availability, ...)
├── public/
│   └── screenshots/           # README screenshots (placeholders, add yours)
├── src/
│   ├── app/
│   │   ├── (auth)/login/      # Sign-in page
│   │   ├── api/auth/          # NextAuth route handler
│   │   ├── book/[slug]/       # Public booking page
│   │   ├── booking/manage/    # Guest reschedule/cancel (tokenized)
│   │   ├── dashboard/         # App shell: bookings, availability, event types,
│   │   │                      #   teams, analytics, integrations, settings
│   │   ├── teams/invite/      # Team invitation acceptance
│   │   ├── globals.css        # Tailwind theme + design tokens
│   │   ├── layout.tsx
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # Base UI primitives (button, dialog, toast, ...)
│   │   ├── landing/           # Landing page sections
│   │   ├── dashboard/         # Sidebar, top nav, timezone detector
│   │   ├── booking/           # Booking flow (slots, form, confirmation, manage)
│   │   ├── availability/      # Weekly schedule + date overrides
│   │   ├── event-types/       # Event type cards + form
│   │   ├── bookings/          # Bookings list + calendar view
│   │   ├── teams/             # Team management
│   │   ├── analytics/         # KPIs, charts, insights
│   │   ├── settings/          # Profile, timezone, appearance, security
│   │   └── integrations/      # Google Calendar card
│   ├── lib/
│   │   ├── actions/           # Server actions (mutations + revalidation)
│   │   ├── queries/           # Read-side data access
│   │   ├── schemas/           # Zod schemas
│   │   ├── scheduling/        # Slot generation
│   │   ├── validation/        # Booking rule checks
│   │   ├── services/          # Google Calendar + Resend integrations
│   │   ├── email/             # Email templates
│   │   ├── server/            # Server-only helpers
│   │   ├── auth*.ts           # NextAuth configuration, types, adapter
│   │   ├── date.ts            # Centralized timezone utilities
│   │   └── prisma.ts
│   └── middleware.ts
├── docker-compose.yml         # Local PostgreSQL for development
├── next.config.ts             # Prisma engine bundling for Vercel
├── .env.example
└── package.json
```

## Local Installation

### Prerequisites

- [Node.js](https://nodejs.org) 20+
- [Docker](https://www.docker.com) (for the local PostgreSQL database)
- A [Google Cloud](https://console.cloud.google.com) project for OAuth/Calendar
- A [Resend](https://resend.com) account for email

### 1. Clone and install

```bash
git clone https://github.com/haridyanshujindal/meetflow.git
cd meetflow
npm install
```

`npm install` runs `prisma generate` automatically (postinstall), generating the client into `src/generated/prisma`.

### 2. Start the database

```bash
docker compose up -d
```

This starts PostgreSQL 16 on `localhost:5432` (`meetflow` / `meetflow123` / `meetflow`).

### 3. Configure environment variables

```bash
cp .env.example .env
```

Then fill in the values (see [Environment Variables](#environment-variables)).

### 4. Migrate the database

```bash
npx prisma migrate dev
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env` file from `.env.example`:

```env
DATABASE_URL=

AUTH_SECRET=
AUTH_URL=

# Google OAuth (also used for the Google Calendar API)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# GitHub OAuth (optional)
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

RESEND_API_KEY=
```

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string, e.g. `postgresql://meetflow:meetflow123@localhost:5432/meetflow?schema=public` |
| `AUTH_SECRET` | Yes | NextAuth secret. Generate with `npx auth secret` |
| `AUTH_URL` | Yes | Canonical app URL, e.g. `http://localhost:3000` locally or `https://your-app.vercel.app` in production |
| `AUTH_GOOGLE_ID` | Yes* | Google OAuth client ID (required for sign-in and Calendar) |
| `AUTH_GOOGLE_SECRET` | Yes* | Google OAuth client secret |
| `AUTH_GITHUB_ID` | No | GitHub OAuth client ID |
| `AUTH_GITHUB_SECRET` | No | GitHub OAuth client secret |
| `RESEND_API_KEY` | Yes* | Resend API key for transactional emails |

\* Required to use that feature; sign-in still works if the corresponding provider is removed from `src/lib/auth.config.ts`.

## Database Setup

- Schema lives in `prisma/schema.prisma`.
- The Prisma client is generated with the `prisma-client` generator into `src/generated/prisma` (gitignored; regenerated on install).
- `binaryTargets = ["native", "rhel-openssl-3.0.x"]` ensures the query engine works on both your machine and the Vercel serverless runtime.

## Prisma Migrations

```bash
# Create and apply a new migration during development
npx prisma migrate dev --name <migration_name>

# Apply pending migrations to a database (e.g. production / Vercel Postgres)
npx prisma migrate deploy

# Regenerate the client after schema changes
npx prisma generate
```

The migration history is committed under `prisma/migrations/`.

## Vercel Deployment

1. Push the repository to GitHub and import it into [Vercel](https://vercel.com/new).
2. Add a **Neon** (or any PostgreSQL) database and create a database.
3. In Vercel project settings → Environment Variables, set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `RESEND_API_KEY`.
4. Run migrations against the production database: `npx prisma migrate deploy`.
5. Deploy. `next.config.ts` copies the Prisma query engine into the build output and includes it in the function tracing so the client works on Vercel's runtime.

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials → Create Credentials → OAuth client ID** (Web application).
2. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-app-domain>/api/auth/callback/google`
3. Copy the client ID/secret into `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.
4. Enable the **Google Calendar API** (APIs & Services → Library → search "Google Calendar API" → Enable).

## Google Calendar Integration

The Google provider requests `offline` access (`access_type=offline`, `prompt=consent`) with the `https://www.googleapis.com/auth/calendar.events` scope. On first sign-in, refresh tokens are stored in the `Account` table.

- Bookings create calendar events on the host's (or assigned member's) primary calendar with `Google Meet` enabled.
- Reschedules update events; cancellations delete them.
- Events are sent as UTC instants; Google Calendar renders them in each viewer's own calendar timezone.

## Email Configuration

- Create a domain/key in [Resend](https://resend.com) and set `RESEND_API_KEY`.
- The sender is configured in `src/lib/services/email.ts` (`MeetFlow <onboarding@resend.dev>` by default).
- Emails are sent on booking **confirmation**, **reschedule**, and **cancellation**, and include the meeting time rendered in the guest's timezone.
- Note: the default `onboarding@resend.dev` sender only works while testing; use a verified domain for production sending.

## Timezone Support

- New users default to `Asia/Kolkata`; the client-side `TimezoneDetector` upgrades it to the browser's detected timezone on first use. Users can change it anytime in **Settings → Timezone**.
- Guests select their timezone on the booking page; availability slots and the booking summary render in the guest's timezone.
- Host availability is defined as wall-clock hours in the host's timezone and converted to absolute UTC instants for slot generation.
- All day-boundary logic (booking windows, daily/weekly limits, analytics day bucketing, "today" labels) runs through `src/lib/date.ts` with `date-fns-tz`.
- All timestamps are stored in UTC.

## Future Roadmap

- Recurring event types and custom intervals.
- Email/calendar reminders and resend invitations.
- Public API + webhooks.
- Import existing Google Calendar events (two-way conflict detection).
- PWA/mobile experience.
- Multi-language (i18n) support.
- Cancellation/rebooking policies and admin controls.

## License

This project is licensed under the [MIT License](LICENSE).
