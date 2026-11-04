"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, AlertCircle, ShieldCheck, Zap, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (r.ok) router.replace("/admin/dashboard");
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
        return;
      }
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1128] text-white">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a1128]">
      <div className="relative hidden flex-1 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="relative flex h-full flex-col justify-center p-14 text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg">
            <Zap className="h-6 w-6" />
          </span>
          <h1 className="mt-8 max-w-md text-4xl font-extrabold leading-tight">
            Lead Management Command Center
          </h1>
          <p className="mt-4 max-w-md leading-relaxed text-slate-400">
            Track every project enquiry from first touch to closed deal — secured with JWT
            authentication and bcrypt-hashed credentials.
          </p>
          <div className="mt-10 space-y-4 text-sm">
            {["Real-time enquiry pipeline", "Status tracking: New → Completed", "Search, filter & export-ready data"].map((t) => (
              <p key={t} className="flex items-center gap-2.5 text-slate-300">
                <ShieldCheck className="h-4 w-4 text-cyan-400" /> {t}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600">
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>
          <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">Admin Login</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage project enquiries.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cynbit.in"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  autoComplete="current-password"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 disabled:opacity-70"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : "Sign in to Dashboard"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
            <p className="font-bold text-slate-800">Demo credentials (local dev)</p>
            <p className="mt-1">Email: <code className="rounded bg-white px-1.5 py-0.5 font-mono">admin@cynbit.in</code></p>
            <p className="mt-1">Password: <code className="rounded bg-white px-1.5 py-0.5 font-mono">Admin@123</code></p>
            <p className="mt-2 text-slate-500">In production these come from <code className="font-mono">ADMIN_EMAIL</code> / <code className="font-mono">ADMIN_PASSWORD</code> env vars and are bcrypt-hashed into <code className="font-mono">admins.json</code>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
