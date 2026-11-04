import Link from "next/link";
import { ArrowLeft, Database, Server, ShieldCheck, GitBranch, Rocket, FileText, Zap, Lock, HardDrive } from "lucide-react";

const sections = [
  {
    n: "1", title: "Project Introduction",
    body: "Cynbit Smart Inquiry & Lead Management System is a full-stack prototype built for Cynbit Technologies, Jaipur. It replaces the generic contact form with a structured project enquiry pipeline: customers submit detailed project briefs, and the admin team tracks every lead from NEW → IN_PROGRESS → CONTACTED → COMPLETED through a protected SaaS dashboard.",
  },
  {
    n: "2", title: "Existing Website Analysis (cynbit.in)",
    body: "Verified by fetching https://cynbit.in/ during development. Branding: dark navy (#0a1128) with electric blue/cyan accents, bold geometric sans-serif typography, 'optimistic architect' positioning. Navigation covers services, impact, and internships. Services confirmed: AI Automation (custom LLMs, autonomous agents), Full Stack Development, Cloud Infrastructure (AWS/Azure), Digital Marketing & SEO, plus a proprietary SaaS suite. The site emphasizes startup speed with enterprise rigor, 98% retention, 24/7 support, 3× ROI uplift. Opportunity identified: no structured project brief form — visitors could not share budget, timeline, or scope in one place, and the team had no lead-tracking pipeline. This system closes exactly that gap without inventing new company features.",
  },
  {
    n: "3", title: "Problem Statement",
    body: "Enquiries arriving via email or generic contact forms lack structure: no budget/timeline data, no unique reference ID, no status tracking, and no way to measure pipeline health. Leads get lost, follow-ups are manual, and the team cannot prioritize high-value projects.",
  },
  {
    n: "4", title: "Proposed Solution",
    body: "A two-experience system: (1) a customer-facing smart enquiry form with guided fields (service, budget, timeline, description) that validates on both client and server; (2) a JWT-protected admin dashboard with live statistics, searchable/filterable enquiry table, status workflow, and deletion with confirmation. Every operation flows through REST APIs into JSON file storage — no database required.",
  },
  {
    n: "5", title: "Technology Stack",
    body: "Frontend: Next.js 16 (React 19 + TypeScript), Tailwind CSS 4, Lucide icons. Backend: Next.js Route Handlers (Node.js runtime) acting as the REST API layer. Storage: Node.js fs/promises JSON files. Auth: jsonwebtoken (JWT, httpOnly cookie) + bcryptjs (12-round hashing). Validation: Zod on both client and server. No database, no ORM, no external services.",
  },
  {
    n: "6", title: "System Architecture",
    body: "Browser → Next.js pages → REST APIs (/api/*) → Service layer (enquiryService) → JSON Storage Service (jsonStore) → server/data/*.json. Auth middleware (getSessionAdmin) guards all admin APIs. Storage logic is fully separated from business logic and controllers, mirroring the requested server/src/{config,controllers,services,storage,validators} architecture inside the Next.js project layout.",
  },
  {
    n: "7", title: "JSON Storage Architecture",
    body: "Two files: server/data/inquiries.json and server/data/admins.json. The storage service auto-creates missing files, backs up corrupted JSON to *.corrupt-*.bak and resets safely, writes atomically (temp file + rename), and serializes all writes through a per-file promise-queue mutex so concurrent requests can never interleave and lose records. Enquiry IDs are sequential (CYN-2026-0001) computed under the same lock. Data survives backend restarts because it lives on the persistent filesystem.",
  },
  {
    n: "8", title: "API Endpoints",
    body: "POST /api/auth/login · POST /api/auth/logout · GET /api/auth/me · POST /api/enquiries (public, rate-limited 5/10min) · GET /api/enquiries (admin; search, service/status filters, sort, pagination) · GET /api/enquiries/:id · PATCH /api/enquiries/:id/status · DELETE /api/enquiries/:id · GET /api/dashboard/stats. Correct status codes throughout (201 create, 401 unauthorized, 404 not found, 422 validation, 429 rate-limited).",
  },
  {
    n: "9", title: "Frontend Implementation",
    body: "Customer experience: dark navy hero with grid backdrop, services grid, 4-step lifecycle, and the enquiry form with inline validation, loading state, duplicate-submit prevention, and a success screen showing the generated Enquiry ID with copy-to-clipboard. Admin experience: sidebar + topbar SaaS layout, 5 live stat cards, recent enquiries, service breakdown bars, responsive data table with drawer detail view, status workflow buttons, delete confirmation modal, CSV export, and toast notifications. Fully responsive from mobile to desktop.",
  },
  {
    n: "10", title: "Backend Implementation",
    body: "Route handlers validate with Zod (including Indian phone normalization: strips +91/0, enforces 10-digit starting 6–9), sanitize input, and delegate to services. Centralized JSON error responses with security headers (CSP, X-Frame-Options DENY, nosniff). In-memory per-IP rate limiting on login and enquiry submission. Storage files are never exposed via public URLs — they live outside the web root and are only reachable through APIs.",
  },
  {
    n: "11", title: "Authentication & Security",
    body: "Admin credentials come from ADMIN_EMAIL / ADMIN_PASSWORD env vars, bcrypt-hashed (never plain text) into admins.json via an auto-seed on first login or the scripts/seedAdmin.ts script. Sessions use 8-hour JWTs in httpOnly cookies (Secure in production). All admin APIs verify the session server-side — client-side checks are UX only, never the security boundary. CORS is same-origin by default; JSON files are not publicly accessible.",
  },
  {
    n: "12", title: "Testing Results",
    body: "Verified during development: (1) customer submission saves to inquiries.json with sequential ID; (2) invalid forms show inline + server 422 errors; (3) admin login succeeds with seeded credentials; (4) unauthenticated API calls return 401; (5) status updates persist and stats recalculate; (6) search/filter/sort/pagination work; (7) deletion removes records; (8) data persists across restarts (filesystem-backed); (9) concurrent writes are serialized by the mutex queue; (10) mobile + desktop layouts verified responsive. Run npm run build + manual API checks to reproduce.",
  },
  {
    n: "13", title: "Performance Improvements",
    body: "Atomic temp-file writes avoid partial-file reads; read-modify-write under lock prevents lost updates; pagination caps payloads at 10–100 rows; debounced search avoids API spam; stats are computed in one pass over the array. For large datasets, migrate the storage service to SQLite or Postgres behind the same service interface — no controller changes needed.",
  },
  {
    n: "14", title: "Screenshots",
    body: "Live preview: customer form at / (scroll to #inquiry), admin login at /admin/login, dashboard at /admin/dashboard. Demo login: admin@cynbit.in / Admin@123 (local dev only — override via env vars in production).",
  },
  {
    n: "15", title: "Limitations of File-Based Storage",
    body: "Honest trade-offs: (1) single-instance only — in-memory rate limits and file locks don't coordinate across multiple servers; (2) performance degrades beyond ~10k records (full-file reads); (3) no transactions or relational queries; (4) requires a persistent disk in production (Render Persistent Disk) — ephemeral filesystems lose data on redeploy; (5) Vercel serverless functions cannot use local filesystem as persistent storage, so the backend must stay on Render (or any always-on Node host) with the disk mounted to server/data. The service-layer design makes a future database migration a drop-in replacement.",
  },
  {
    n: "16", title: "Conclusion",
    body: "Delivered: a genuinely functional full-stack system — React + TypeScript frontend, Node.js REST APIs, JWT/bcrypt auth, Zod validation, and JSON file storage with concurrency-safe writes — with zero database setup. It complements Cynbit's verified branding and services, and is production-deployable on Vercel (frontend) + Render (backend + persistent disk).",
  },
];

const deploy = [
  { icon: Server, t: "Backend — Render", d: "Create a Web Service from this repo. Build: npm install. Start: npm run start. Set env: JWT_SECRET (32+ chars), ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME. Add a Persistent Disk (e.g. 1 GB) mounted at /opt/render/project/src/server/data so inquiries.json survives redeploys. Without the disk, Render's ephemeral filesystem will lose data." },
  { icon: Rocket, t: "Frontend — Vercel", d: "Import the repo, framework preset Next.js. If frontend and backend are split, point API calls to the Render URL. Note: Vercel serverless functions have read-only/ephemeral filesystems — never store inquiries.json there. Keep all storage on the Render backend." },
  { icon: Lock, t: "Seed the admin", d: "Set ADMIN_* env vars on Render, then hit POST /api/auth/login once (or run scripts/seedAdmin.ts locally). The first admin is bcrypt-hashed into admins.json automatically. Never commit .env or admins.json with real hashes to GitHub — add both to .gitignore." },
  { icon: GitBranch, t: "GitHub", d: "Suggested history: Initial project setup → Build customer inquiry form → Implement JSON storage service → Create backend REST APIs → Implement admin authentication → Build admin dashboard → Integrate frontend and backend → Add validation and security → Add testing and documentation." },
  { icon: Database, t: "Why no database?", d: "Zero setup, zero cost, zero accounts. JSON files are human-readable, git-friendly for prototypes, and backed up by copying one directory. The storage service interface means you can swap in SQLite/Postgres later without touching controllers or UI." },
  { icon: HardDrive, t: "Local development", d: "npm install && npm run dev. Data lives in server/data/*.json (auto-created). Override admin via ADMIN_EMAIL / ADMIN_PASSWORD in .env.local. Restart the server — your enquiries are still there." },
];

export default function ReportPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600">
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>
          <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white"><Zap className="h-4 w-4" /></span>
            Technical Report
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Cynbit Smart Inquiry & Lead Management System</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Technical Report & Deployment Guide</h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-600">
          Full-stack prototype for the Full Stack Developer Intern assessment — React + TypeScript,
          Node.js REST APIs, JWT authentication, and <strong>file-based JSON storage with no database</strong>.
          Based on a live analysis of <a href="https://cynbit.in/" target="_blank" rel="noreferrer" className="font-semibold text-blue-600 hover:underline">cynbit.in</a>.
        </p>

        <div className="mt-10 space-y-4">
          {sections.map((s) => (
            <article key={s.n} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-extrabold text-white">{s.n}</span>
                <div>
                  <h2 className="font-extrabold text-slate-900">{s.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <h2 className="mt-12 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
          <Rocket className="h-6 w-6 text-blue-600" /> Deployment Instructions
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {deploy.map((d) => (
            <div key={d.t} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><d.icon className="h-5 w-5" /></span>
              <h3 className="mt-4 font-bold text-slate-900">{d.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{d.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-[#0a1128] p-6 text-white">
          <p className="flex items-center gap-2 font-bold"><FileText className="h-4 w-4 text-cyan-400" /> API Quick Reference</p>
          <div className="mt-4 grid gap-2 font-mono text-xs sm:grid-cols-2">
            {[
              "POST /api/auth/login", "POST /api/auth/logout", "GET /api/auth/me",
              "POST /api/enquiries", "GET /api/enquiries", "GET /api/enquiries/:id",
              "PATCH /api/enquiries/:id/status", "DELETE /api/enquiries/:id", "GET /api/dashboard/stats",
            ].map((e) => (
              <code key={e} className="rounded-lg bg-white/10 px-3 py-2">{e}</code>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">Demo admin (local dev): admin@cynbit.in / Admin@123 — override via env vars in production.</p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/#inquiry" className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white">Try the Enquiry Form</Link>
          <Link href="/admin/login" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700">Open Admin Dashboard</Link>
        </div>
      </main>

      <footer className="mt-10 bg-[#0a1128] py-6 text-center text-sm text-slate-400">
        Cynbit Technologies · Jaipur, India · Smart Inquiry & Lead Management System
      </footer>
    </div>
  );
}
