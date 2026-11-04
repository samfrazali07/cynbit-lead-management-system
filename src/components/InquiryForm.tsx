"use client";

import { useState } from "react";
import {
  User, Mail, Phone, Building2, Layers, Wallet, Clock, FileText,
  Send, Loader2, CheckCircle2, AlertCircle, ShieldCheck, Copy, Check,
} from "lucide-react";
import { SERVICES, BUDGETS, TIMELINES } from "@/server/types";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  serviceRequired: string;
  budget: string;
  timeline: string;
  projectDescription: string;
};

const initial: FormState = {
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  serviceRequired: "",
  budget: "",
  timeline: "",
  projectDescription: "",
};

export default function InquiryForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ inquiryId: string } | null>(null);
  const [serverError, setServerError] = useState("");
  const [copied, setCopied] = useState(false);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.fullName.trim().length < 2) e.fullName = "Please enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email address";
    const digits = form.phone.replace(/\D/g, "").replace(/^91/, "").replace(/^0/, "");
    if (!/^[6-9]\d{9}$/.test(digits)) e.phone = "Enter a valid 10-digit Indian mobile number";
    if (!form.serviceRequired) e.serviceRequired = "Please select a service";
    if (!form.budget) e.budget = "Please select a budget range";
    if (!form.timeline) e.timeline = "Please select a timeline";
    if (form.projectDescription.trim().length < 20) e.projectDescription = "Please describe your project (min 20 characters)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (submitting) return;
    setServerError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: form.phone.replace(/\D/g, "").replace(/^91/, "").replace(/^0/, ""),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 422 && data.issues?.fieldErrors) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(data.issues.fieldErrors as Record<string, string[]>)) {
            mapped[k] = (v as string[])[0] ?? "Invalid value";
          }
          setErrors(mapped);
          setServerError("Please fix the highlighted fields and try again.");
        } else {
          setServerError(data.error || "Something went wrong. Please try again.");
        }
        return;
      }
      setSuccess({ inquiryId: data.enquiry.inquiryId });
      setForm(initial);
    } catch {
      setServerError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function copyId() {
    if (!success) return;
    navigator.clipboard.writeText(success.inquiryId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (success) {
    return (
      <div className="fade-up rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-200">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h3 className="mt-5 text-2xl font-bold text-slate-900">Inquiry submitted successfully!</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
          Thank you for reaching out to Cynbit Technologies. Our team will review your project and
          contact you within <strong>1 business day</strong>.
        </p>
        <div className="mx-auto mt-6 flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-4">
          <div className="text-left">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Your Enquiry ID</p>
            <p className="text-lg font-bold tracking-wide text-slate-900">{success.inquiryId}</p>
          </div>
          <button
            onClick={copyId}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-500">Please save this ID for future reference.</p>
        <button
          onClick={() => setSuccess(null)}
          className="mt-6 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  const inputCls = (hasErr: boolean) =>
    `w-full rounded-xl border bg-white px-4 py-3 pl-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 ${
      hasErr
        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
        : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
    }`;

  const selectCls = (hasErr: boolean) =>
    `w-full appearance-none rounded-xl border bg-white px-4 py-3 pl-11 pr-10 text-sm outline-none transition focus:ring-2 ${
      hasErr
        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
        : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
    }`;

  const Err = ({ k }: { k: string }) =>
    errors[k] ? <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600"><AlertCircle className="h-3.5 w-3.5" />{errors[k]}</p> : null;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {serverError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Full Name <span className="text-red-500">*</span></label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="e.g. Rahul Sharma" className={inputCls(!!errors.fullName)} autoComplete="name" />
          </div>
          <Err k="fullName" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Email Address <span className="text-red-500">*</span></label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@company.com" type="email" className={inputCls(!!errors.email)} autoComplete="email" />
          </div>
          <Err k="email" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Phone Number <span className="text-red-500">*</span></label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="98765 43210" inputMode="tel" className={inputCls(!!errors.phone)} autoComplete="tel" />
          </div>
          <Err k="phone" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Company Name <span className="font-normal text-slate-400">(optional)</span></label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Your company / startup" className={inputCls(false)} autoComplete="organization" />
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-800">Service Required <span className="text-red-500">*</span></label>
        <div className="relative">
          <Layers className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select value={form.serviceRequired} onChange={(e) => set("serviceRequired", e.target.value)} className={selectCls(!!errors.serviceRequired)}>
            <option value="">Select a service…</option>
            {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▾</span>
        </div>
        <Err k="serviceRequired" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Project Budget <span className="text-red-500">*</span></label>
          <div className="relative">
            <Wallet className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select value={form.budget} onChange={(e) => set("budget", e.target.value)} className={selectCls(!!errors.budget)}>
              <option value="">Select budget…</option>
              {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▾</span>
          </div>
          <Err k="budget" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Project Timeline <span className="text-red-500">*</span></label>
          <div className="relative">
            <Clock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select value={form.timeline} onChange={(e) => set("timeline", e.target.value)} className={selectCls(!!errors.timeline)}>
              <option value="">Select timeline…</option>
              {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▾</span>
          </div>
          <Err k="timeline" />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-800">Project Description <span className="text-red-500">*</span></label>
        <div className="relative">
          <FileText className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <textarea
            value={form.projectDescription}
            onChange={(e) => set("projectDescription", e.target.value)}
            rows={5}
            placeholder="Tell us about your project — goals, features, deadlines, references…"
            className={`${inputCls(!!errors.projectDescription)} resize-y pl-11`}
          />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <Err k="projectDescription" />
          <span className="ml-auto text-xs text-slate-400">{form.projectDescription.length}/5000</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:shadow-xl hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Submitting your inquiry…</>
        ) : (
          <>Submit Inquiry <Send className="h-4 w-4 transition group-hover:translate-x-0.5" /></>
        )}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        Your details are stored securely and used only to respond to your inquiry.
      </p>
    </form>
  );
}
