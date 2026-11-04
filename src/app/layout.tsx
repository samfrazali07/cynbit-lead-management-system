import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cynbit Technologies — Smart Project Inquiry",
  description:
    "Cynbit Technologies, Jaipur. AI Automation, Website, Mobile App, Full Stack, SaaS & Cloud solutions. Submit your project inquiry in 2 minutes.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f6f8fc] text-slate-900 antialiased">{children}</body>
    </html>
  );
}
