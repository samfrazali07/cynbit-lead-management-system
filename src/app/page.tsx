import Link from "next/link";
import {
  Bot, Globe, Smartphone, Code2, Layers, Cloud, TrendingUp, Sparkles,
  ArrowRight, MapPin, Mail, Phone, ShieldCheck, Clock, Zap, Lock,
  ChevronRight, FileText, LayoutDashboard,
} from "lucide-react";
import InquiryForm from "@/components/InquiryForm";

const services = [
  { icon: Bot, title: "AI Automation", desc: "Custom LLMs, autonomous agents & workflow automation for cognitive operations.", tag: "Most popular" },
  { icon: Globe, title: "Website Development", desc: "Fast, cinematic, conversion-focused websites engineered to rank and sell.", tag: "" },
  { icon: Smartphone, title: "Mobile App Development", desc: "Native-quality iOS & Android apps with smooth, delightful experiences.", tag: "" },
  { icon: Code2, title: "Full Stack Development", desc: "Secure end-to-end platforms — from database to pixel-perfect UI.", tag: "" },
  { icon: Layers, title: "SaaS Development", desc: "Bespoke digital ecosystems built for scale, billing & multi-tenancy.", tag: "" },
  { icon: Cloud, title: "Cloud Solutions", desc: "Zero-trust deployment across AWS & Azure for global scale.", tag: "" },
  { icon: TrendingUp, title: "Digital Marketing", desc: "Data-driven ROI engines merging technical SEO with creative precision.", tag: "" },
  { icon: Sparkles, title: "Something Else?", desc: "Tell us your idea — we architect custom solutions around your goals.", tag: "" },
];

const steps = [
  { n: "01", title: "Discovery & audit", desc: "We deep-dive into your workflows to find invisible friction." },
  { n: "02", title: "Strategy & blueprint", desc: "A custom roadmap for logic, AI integration & scale." },
  { n: "03", title: "Design & build", desc: "High-fidelity systems, clean code, enterprise stability." },
  { n: "04", title: "Launch & evolve", desc: "Live launch plus ROI-driven optimization and scaling." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-200">
              <Zap className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-extrabold tracking-tight text-slate-900">CYNBIT</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Technologies · Jaipur</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#services" className="hover:text-blue-600">Services</a>
            <a href="#process" className="hover:text-blue-600">Process</a>
            <a href="#inquiry" className="hover:text-blue-600">Start a Project</a>
            <Link href="/report" className="hover:text-blue-600">Technical Report</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/admin/login" className="hidden items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:flex">
              <LayoutDashboard className="h-3.5 w-3.5" /> Admin
            </Link>
            <a href="#inquiry" className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700">
              Get a Quote <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0a1128] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl" />
          <div className="absolute -bottom-32 right-1/5 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px]" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-cyan-300" />
              AI Automation & Software Solutions — Jaipur, India
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Architecting the future with{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">AI automation.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Cynbit Technologies builds autonomous AI agents, custom software and scalable business
              platforms. Tell us about your project — we reply within <strong className="text-white">1 business day</strong>.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#inquiry" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 text-sm font-bold shadow-lg shadow-blue-900/40 hover:brightness-110">
                Start Your Project <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#services" className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold hover:bg-white/10">
                Explore Services
              </a>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
              {[
                { v: "98%", l: "Client retention" },
                { v: "24/7", l: "Support" },
                { v: "3×", l: "ROI uplift" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-2xl font-extrabold sm:text-3xl">{s.v}</p>
                  <p className="mt-1 text-xs text-slate-400">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero mini-card: what happens next */}
          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">What happens next?</p>
              <div className="mt-6 space-y-5">
                {[
                  { icon: FileText, t: "Submit in 2 minutes", d: "Fill the form — no account, no calls needed." },
                  { icon: Clock, t: "Reply within 1 business day", d: "A senior engineer reviews scope, budget & timeline." },
                  { icon: ShieldCheck, t: "Blueprint & estimate", d: "You get a clear roadmap before any commitment." },
                ].map((s) => (
                  <div key={s.t} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
                      <s.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-bold">{s.t}</p>
                      <p className="mt-0.5 text-sm text-slate-400">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-xs text-slate-300">
                <Lock className="h-4 w-4 shrink-0 text-emerald-400" />
                Protected by JWT-secured APIs, Zod validation & rate limiting. No spam, ever.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-20">
        <p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Our Ecosystem</p>
        <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Foundational pillars.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          Integrated excellence across AI technology, full-stack software development and cloud infrastructure.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <a key={s.title} href="#inquiry" className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100">
              {s.tag && (
                <span className="absolute right-4 top-4 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                  {s.tag}
                </span>
              )}
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-200">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.desc}</p>
              <span className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600">
                Enquire <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ── Process ── */}
      <section id="process" className="scroll-mt-20 border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Architectural Lifecycle</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">How we construct digital success.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-extrabold text-blue-600">{s.n}</p>
                <h3 className="mt-2 font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Inquiry form ── */}
      <section id="inquiry" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Smart Project Inquiry</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Ready to build your digital future?
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Share your project details and our Jaipur team will architect a solution around your
              goals. Every enquiry is stored securely and tracked through our lead management system.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { icon: MapPin, t: "Jaipur, Rajasthan", d: "Serving clients across India & globally" },
                { icon: Mail, t: "hello@cynbit.in", d: "We reply within 1 business day" },
                { icon: Phone, t: "+91 98765 43210", d: "Mon–Sat, 10 AM – 7 PM IST" },
              ].map((c) => (
                <div key={c.t} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{c.t}</p>
                    <p className="text-sm text-slate-500">{c.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-[#0a1128] p-5 text-white">
              <p className="text-sm font-bold">The speed of a startup. The rigor of an enterprise.</p>
              <p className="mt-1 text-sm text-slate-400">Startup speed · AI-first thinking · End-to-end ownership · ROI engineering</p>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
            <InquiryForm />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0a1128] text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Cynbit Technologies · Jaipur, India</p>
          <div className="flex items-center gap-5">
            <Link href="/report" className="hover:text-white">Technical Report</Link>
            <Link href="/admin/login" className="hover:text-white">Admin Login</Link>
            <a href="https://cynbit.in/" target="_blank" rel="noreferrer" className="hover:text-white">cynbit.in</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
