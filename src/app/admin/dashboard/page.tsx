"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Inbox, Loader2, LogOut, Search, Trash2, Eye, X, Mail, Phone,
  Building2, Calendar, Clock, Wallet, Layers, FileText, RefreshCw, ChevronLeft,
  ChevronRight, Zap, CheckCircle2, AlertCircle, TrendingUp, UserCheck, BadgeCheck,
  CircleDot, ArrowLeft, Download,
} from "lucide-react";
import type { Inquiry, EnquiryStatus } from "@/server/types";
import { SERVICES, STATUSES } from "@/server/types";

type Stats = {
  total: number; newCount: number; inProgress: number; contacted: number; completed: number;
  recent: Inquiry[]; byService: Record<string, number>;
};

const STATUS_META: Record<EnquiryStatus, { label: string; cls: string; dot: string }> = {
  NEW: { label: "New", cls: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  CONTACTED: { label: "Contacted", cls: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  COMPLETED: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [items, setItems] = useState<Inquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [service, setService] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<Inquiry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null);
  const [toast, setToast] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<"overview" | "enquiries">("overview");

  const loadStats = useCallback(async () => {
    const res = await fetch("/api/dashboard/stats");
    if (res.status === 401) { router.replace("/admin/login"); return; }
    const data = await res.json().catch(() => ({}));
    if (res.ok) setStats(data.stats);
  }, [router]);

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "10", sort });
      if (search.trim()) params.set("search", search.trim());
      if (service) params.set("service", service);
      if (status) params.set("status", status);
      const res = await fetch(`/api/enquiries?${params.toString()}`);
      if (res.status === 401) { router.replace("/admin/login"); return; }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load enquiries");
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  }, [page, search, service, status, sort, router]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (r) => {
        if (!r.ok) { router.replace("/admin/login"); return; }
        const data = await r.json();
        setAdmin(data.admin);
        setAuthChecked(true);
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  useEffect(() => { if (authChecked) { loadStats(); loadEnquiries(); } }, [authChecked, loadStats, loadEnquiries]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(t);
  }, [search, service, status, sort]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  async function updateStatus(id: string, s: EnquiryStatus) {
    const res = await fetch(`/api/enquiries/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { showToast(data.error || "Update failed"); return; }
    setItems((prev) => prev.map((r) => (r.inquiryId === id ? data.enquiry : r)));
    if (detail?.inquiryId === id) setDetail(data.enquiry);
    await loadStats();
    showToast(`Status updated to ${STATUS_META[s].label}`);
  }

  async function doDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/enquiries/${encodeURIComponent(deleteTarget.inquiryId)}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { showToast(data.error || "Delete failed"); return; }
    setDeleteTarget(null);
    setDetail(null);
    await loadEnquiries();
    await loadStats();
    showToast("Enquiry deleted");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  }

  function exportCsv() {
    const rows = [
      ["Enquiry ID", "Name", "Email", "Phone", "Company", "Service", "Budget", "Timeline", "Status", "Date"],
      ...items.map((r) => [r.inquiryId, r.fullName, r.email, r.phone, r.companyName, r.serviceRequired, r.budget, r.timeline, r.status, r.createdAt]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "cynbit-enquiries.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const statCards = useMemo(() => [
    { label: "Total Enquiries", value: stats?.total ?? 0, icon: Inbox, cls: "from-blue-600 to-cyan-500" },
    { label: "New", value: stats?.newCount ?? 0, icon: CircleDot, cls: "from-blue-500 to-blue-400" },
    { label: "In Progress", value: stats?.inProgress ?? 0, icon: TrendingUp, cls: "from-amber-500 to-orange-400" },
    { label: "Contacted", value: stats?.contacted ?? 0, icon: UserCheck, cls: "from-violet-500 to-purple-400" },
    { label: "Completed", value: stats?.completed ?? 0, icon: BadgeCheck, cls: "from-emerald-500 to-teal-400" },
  ], [stats]);

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1128] text-white">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-[#0a1128] text-white">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500">
          <Zap className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-extrabold">CYNBIT</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Admin Console</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        <button onClick={() => { setTab("overview"); setSidebarOpen(false); }}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold ${tab === "overview" ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
          <LayoutDashboard className="h-4 w-4" /> Overview
        </button>
        <button onClick={() => { setTab("enquiries"); setSidebarOpen(false); }}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold ${tab === "enquiries" ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
          <Inbox className="h-4 w-4" /> Enquiries
          {(stats?.newCount ?? 0) > 0 && (
            <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold">{stats?.newCount}</span>
          )}
        </button>
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> View Website
        </Link>
        <Link href="/report" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white">
          <FileText className="h-4 w-4" /> Technical Report
        </Link>
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-bold">
            {(admin?.name || "A").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-bold">{admin?.name}</p>
            <p className="truncate text-xs text-slate-400">{admin?.email}</p>
          </div>
          <button onClick={logout} title="Logout" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f6f8fc]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">{sidebar}</aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64">{sidebar}</aside>
        </div>
      )}

      <main className="min-w-0 flex-1">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg border border-slate-200 p-2 lg:hidden" aria-label="Open menu">
              <LayoutDashboard className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                {tab === "overview" ? "Dashboard Overview" : "Enquiry Management"}
              </h1>
              <p className="text-xs text-slate-500">Live data from <code className="font-mono">inquiries.json</code> · {total} record{total === 1 ? "" : "s"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { loadStats(); loadEnquiries(); }} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <RefreshCw className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={exportCsv} className="hidden items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:flex">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-700">
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </header>

        <div className="space-y-6 px-4 py-6 sm:px-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {statCards.map((c) => (
              <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${c.cls} text-white shadow-md`}>
                  <c.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">{c.value}</p>
                <p className="text-xs font-semibold text-slate-500">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Overview: recent + by service */}
          {tab === "overview" && (
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">Recent Enquiries</h2>
                  <button onClick={() => setTab("enquiries")} className="text-xs font-bold text-blue-600 hover:underline">View all →</button>
                </div>
                <div className="mt-4 space-y-2">
                  {(stats?.recent ?? []).length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
                      No enquiries yet. Submit one from the <Link href="/#inquiry" className="font-bold text-blue-600">public form</Link> to see it here.
                    </div>
                  )}
                  {(stats?.recent ?? []).map((r) => (
                    <button key={r.inquiryId} onClick={() => setDetail(r)} className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 text-left hover:border-blue-200 hover:bg-blue-50/40">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                        {r.fullName.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-slate-900">{r.fullName} <span className="font-normal text-slate-400">· {r.inquiryId}</span></span>
                        <span className="block truncate text-xs text-slate-500">{r.serviceRequired} · {fmtDate(r.createdAt)}</span>
                      </span>
                      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_META[r.status].cls}`}>{STATUS_META[r.status].label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-bold text-slate-900">Enquiries by Service</h2>
                <div className="mt-4 space-y-3">
                  {Object.entries(stats?.byService ?? {}).length === 0 && (
                    <p className="text-sm text-slate-500">No data yet.</p>
                  )}
                  {Object.entries(stats?.byService ?? {}).sort((a, b) => b[1] - a[1]).map(([s, n]) => {
                    const pct = stats && stats.total > 0 ? Math.round((n / stats.total) * 100) : 0;
                    return (
                      <div key={s}>
                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                          <span>{s}</span><span>{n} · {pct}%</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
                  <p className="font-bold text-slate-800">Pipeline health</p>
                  <p className="mt-1">
                    {stats && stats.total > 0
                      ? `${Math.round(((stats.completed + stats.contacted) / stats.total) * 100)}% of enquiries have been actioned. ${stats.newCount} still awaiting first response.`
                      : "Submit enquiries to start tracking pipeline health."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enquiries table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, phone, ID, company…"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select value={service} onChange={(e) => setService(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                  <option value="">All Services</option>
                  {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                  <option value="">All Statuses</option>
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                </select>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="m-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> Loading enquiries…
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 text-center">
                <Inbox className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 font-bold text-slate-800">No enquiries found</p>
                <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p>
                <button onClick={() => { setSearch(""); setService(""); setStatus(""); }} className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
                        <th className="px-4 py-3 font-bold">Enquiry ID</th>
                        <th className="px-4 py-3 font-bold">Customer</th>
                        <th className="px-4 py-3 font-bold">Service</th>
                        <th className="px-4 py-3 font-bold">Budget</th>
                        <th className="px-4 py-3 font-bold">Date</th>
                        <th className="px-4 py-3 font-bold">Status</th>
                        <th className="px-4 py-3 text-right font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((r) => (
                        <tr key={r.inquiryId} className="border-b border-slate-50 hover:bg-slate-50/70">
                          <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-700">{r.inquiryId}</td>
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-slate-900">{r.fullName}</p>
                            <p className="text-xs text-slate-500">{r.email}</p>
                            <p className="text-xs text-slate-400">{r.phone}</p>
                          </td>
                          <td className="px-4 py-3.5 text-slate-700">{r.serviceRequired}</td>
                          <td className="px-4 py-3.5 text-xs text-slate-600">{r.budget}</td>
                          <td className="px-4 py-3.5 text-xs text-slate-500">{fmtDate(r.createdAt)}</td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_META[r.status].cls}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[r.status].dot}`} />
                              {STATUS_META[r.status].label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => setDetail(r)} title="View details" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-blue-300 hover:text-blue-600">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button onClick={() => setDeleteTarget(r)} title="Delete" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-red-300 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-500 sm:px-5">
                  <span>Showing {items.length} of {total} enquiries · Page {page} of {totalPages}</span>
                  <div className="flex items-center gap-1.5">
                    <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* ── Detail drawer ── */}
      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetail(null)} />
          <div className="fade-up relative flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <div>
                <p className="font-mono text-xs font-bold text-slate-400">{detail.inquiryId}</p>
                <h2 className="text-lg font-extrabold text-slate-900">{detail.fullName}</h2>
              </div>
              <button onClick={() => setDetail(null)} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 space-y-5 px-6 py-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <a href={`mailto:${detail.email}`} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 hover:border-blue-300">
                  <Mail className="h-4 w-4 shrink-0 text-blue-600" />
                  <span className="min-w-0"><span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Email</span><span className="block truncate font-semibold text-slate-800">{detail.email}</span></span>
                </a>
                <a href={`tel:+91${detail.phone}`} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 hover:border-blue-300">
                  <Phone className="h-4 w-4 shrink-0 text-blue-600" />
                  <span><span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Phone</span><span className="block font-semibold text-slate-800">+91 {detail.phone}</span></span>
                </a>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-3">
                  <Building2 className="h-4 w-4 shrink-0 text-blue-600" />
                  <span className="min-w-0"><span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Company</span><span className="block truncate font-semibold text-slate-800">{detail.companyName || "—"}</span></span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-3">
                  <Calendar className="h-4 w-4 shrink-0 text-blue-600" />
                  <span><span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Submitted</span><span className="block text-xs font-semibold text-slate-800">{fmtDate(detail.createdAt)}</span></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400"><Layers className="h-3.5 w-3.5" /> Service</p>
                  <p className="mt-1 font-bold text-slate-900">{detail.serviceRequired}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400"><Wallet className="h-3.5 w-3.5" /> Budget</p>
                  <p className="mt-1 font-bold text-slate-900">{detail.budget}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400"><Clock className="h-3.5 w-3.5" /> Timeline</p>
                  <p className="mt-1 font-bold text-slate-900">{detail.timeline}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400"><CheckCircle2 className="h-3.5 w-3.5" /> Updated</p>
                  <p className="mt-1 text-xs font-semibold text-slate-700">{fmtDate(detail.updatedAt)}</p>
                </div>
              </div>

              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400"><FileText className="h-3.5 w-3.5" /> Project Description</p>
                <p className="mt-2 whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700">{detail.projectDescription}</p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Update Status</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(detail.inquiryId, s)}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${detail.status === s ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}
                    >
                      {STATUS_META[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 px-6 py-4">
              <button onClick={() => setDeleteTarget(detail)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-700 hover:bg-red-100">
                <Trash2 className="h-4 w-4" /> Delete this enquiry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteTarget(null)} />
          <div className="fade-up relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-extrabold text-slate-900">Delete enquiry?</h3>
            <p className="mt-1.5 text-sm text-slate-600">
              <strong>{deleteTarget.inquiryId}</strong> from {deleteTarget.fullName} will be permanently
              removed from <code className="font-mono text-xs">inquiries.json</code>. This cannot be undone.
            </p>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={doDelete} className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fade-up fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
