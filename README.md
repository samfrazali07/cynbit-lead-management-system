# Cynbit Smart Inquiry & Lead Management System

Full-stack prototype for **Cynbit Technologies, Jaipur** — built for the Full Stack Developer Intern assessment.
Customer project enquiries + JWT-protected admin dashboard, powered by **file-based JSON storage. No database required.**

> Based on a live analysis of [cynbit.in](https://cynbit.in/): AI Automation, Full Stack, Cloud & Digital Marketing services, dark-navy + blue/cyan branding, "optimistic architect" positioning.

## Features

- **Customer enquiry form** — name, email, Indian phone validation, company, service, budget, timeline, description. Client + server (Zod) validation, loading states, duplicate-submit prevention, success screen with unique Enquiry ID (`CYN-2026-0001`).
- **Admin dashboard** — JWT auth (httpOnly cookie), bcrypt-hashed passwords, live stats (total / new / in-progress / contacted / completed), searchable + filterable + sortable enquiry table with pagination, detail drawer, status workflow, delete with confirmation, CSV export.
- **JSON storage service** — auto-creates `server/data/*.json`, handles corrupted files (backup + reset), atomic writes (temp + rename), per-file mutex queue prevents concurrent-write corruption. Storage logic is fully separated from business logic.
- **Security** — Zod validation, rate limiting, security headers (CSP, X-Frame-Options, nosniff), storage files never exposed via public URLs.

## Quick Start (local)

```bash
npm install
npm run dev
```

- Customer form: http://localhost:3000/#inquiry
- Admin login: http://localhost:3000/admin/login
- Demo credentials (local dev only): `admin@cynbit.in` / `Admin@123`
- Data lives in `server/data/inquiries.json` + `server/data/admins.json` (auto-created, survives restarts).

### Seed a custom admin

```bash
ADMIN_EMAIL=you@cynbit.in ADMIN_PASSWORD='StrongPass@123' ADMIN_NAME='Your Name' npx tsx scripts/seedAdmin.ts
```

Credentials come from env vars only — never hardcoded. Or set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env.local` and the first login seeds automatically.

## Project Structure

```
src/
  app/                  Next.js pages + API routes (REST layer)
    api/auth/*          login / logout / me
    api/enquiries/*     CRUD + status
    api/dashboard/stats live statistics
    admin/login/        admin sign-in
    admin/dashboard/    protected SaaS dashboard
    report/             technical report + deployment guide
  server/
    storage/jsonStore.ts  file-based JSON storage (mutex, atomic writes)
    services/enquiryService.ts  business logic
    validators.ts       Zod schemas (incl. Indian phone)
    auth.ts             JWT + bcrypt + auto-seed
    rateLimit.ts        rate limiting + security headers
server/data/            inquiries.json, admins.json (persistent storage)
scripts/seedAdmin.ts    admin seed script
```

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | Login, sets httpOnly JWT cookie |
| POST | `/api/auth/logout` | — | Clears session cookie |
| GET | `/api/auth/me` | cookie | Current admin |
| POST | `/api/enquiries` | — | Submit enquiry (rate-limited) |
| GET | `/api/enquiries` | admin | List w/ search, filters, sort, pagination |
| GET | `/api/enquiries/:id` | admin | Single enquiry |
| PATCH | `/api/enquiries/:id/status` | admin | Update status |
| DELETE | `/api/enquiries/:id` | admin | Delete enquiry |
| GET | `/api/dashboard/stats` | admin | Live statistics |

## Environment Variables

See [`.env.example`](.env.example). Required in production: `JWT_SECRET` (32+ chars), `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

## Deployment

### Backend — Render (with Persistent Disk)

1. Create a **Web Service** from this repo. Build: `npm install` · Start: `npm run start`.
2. Add env vars: `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`.
3. Add a **Persistent Disk** (e.g. 1 GB) mounted at `/opt/render/project/src/server/data` so `inquiries.json` survives redeploys. **Without the disk, Render's ephemeral filesystem will lose data.**
4. Seed the admin (env vars + one login, or `scripts/seedAdmin.ts`).

### Frontend — Vercel

Import the repo (Next.js preset). ⚠️ **Vercel serverless functions cannot use their local filesystem as persistent writable storage** — keep the backend + JSON storage on Render. If splitting frontend/backend, point API calls to the Render URL.

### GitHub

Never commit `.env*` (except `.env.example`) or real `admins.json` hashes. Suggested history: initial setup → inquiry form → JSON storage → REST APIs → auth → dashboard → integration → validation/security → testing/docs.

## Limitations of File-Based Storage

Single-instance only (file locks + rate limits don't coordinate across servers); performance degrades beyond ~10k records; no transactions/joins. The service-layer design makes a future SQLite/Postgres migration a drop-in swap behind `jsonStore.ts`.

## Technical Report

Full 16-section report + deployment guide: http://localhost:3000/report
