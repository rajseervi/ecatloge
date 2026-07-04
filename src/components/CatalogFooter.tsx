"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from "@/types/company";

export default function CatalogFooter() {
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch("/api/company");
        const data = await res.json();
        if (res.ok && data.company) {
          setCompany((prev) => ({ ...prev, ...data.company }));
        }
      } catch {
        // silently fall back to defaults
      }
    };
    fetchCompany();
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Top decorative border */}
      <div className="h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* ── 4-Column Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* ──── Column 1: About Company ──── */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              About Company
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              <span className="font-semibold text-slate-200">{company.name}</span>{" "}
              {company.description ? (
                company.description
              ) : (
                <>
                  is a trusted supplier of premium bath fittings, sanitaryware, and plumbing
                  solutions across the region. Since 2010, we have been delivering quality products
                  backed by reliable service to contractors, retailers, and homeowners alike.
                </>
              )}
            </p>
            {/* Trust badge */}
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Verified & Authorized Distributor
            </div>
          </div>

          {/* ──── Column 2: Our Brands & Segments ──── */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Our Brands & Segments
            </h3>
            <ul className="space-y-3">
              <li>
                <span className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  Hindware Sanitaryware
                </span>
              </li>
              <li>
                <span className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  Watertec Bath Fittings
                </span>
              </li>
              <li>
                <span className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  PTMT Taps & Mixers
                </span>
              </li>
              <li>
                <span className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  Pipes & Accessories
                </span>
              </li>
            </ul>
            {/* Brand logos placeholder */}
            <div className="mt-5 flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-2.5 py-1 rounded">
                Hindware
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-2.5 py-1 rounded">
                Watertec
              </span>
            </div>
          </div>

          {/* ──── Column 3: Business Information ──── */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Business Information
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <p className="text-sm text-slate-200 font-medium">Authorized Distributor</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hindware & Watertec certified partner
                  </p>
                </div>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-sky-400 transition-colors group"
                >
                  <svg className="w-5 h-5 text-amber-400 shrink-0 group-hover:text-amber-300 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Bulk Order Inquiry</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogs"
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-sky-400 transition-colors group"
                >
                  <svg className="w-5 h-5 text-amber-400 shrink-0 group-hover:text-amber-300 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download Product Catalogs</span>
                </Link>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-sm text-slate-200 font-medium">GST Details</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">GSTIN: XX-XXXXX-XXXXX-XX</p>
                </div>
              </li>
            </ul>
          </div>

          {/* ──── Column 4: Contact & Support ──── */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Contact & Support
            </h3>
            <ul className="space-y-4">
              {/* Address */}
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-400/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4.5 h-4.5 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-200 font-medium">Warehouse / Office</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {company.address
                      ? company.address.split(", ").map((line, i) => (
                          <span key={i}>
                            {line}
                            {i < company.address.split(", ").length - 1 && <br />}
                          </span>
                        ))
                      : "123, Industrial Area, Main Road"}
                  </p>
                </div>
              </li>

              {/* Mobile */}
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-400/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4.5 h-4.5 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-200 font-medium">Phone</p>
                  <a
                    href={`tel:${company.phone.replace(/\s+/g, "")}`}
                    className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    {company.phone}
                  </a>
                </div>
              </li>

              {/* Email */}
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-400/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4.5 h-4.5 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-200 font-medium">Email</p>
                  <a
                    href={`mailto:${company.email}`}
                    className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    {company.email}
                  </a>
                </div>
              </li>

              {/* Business Hours */}
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-400/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4.5 h-4.5 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-200 font-medium">Business Hours</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mon — Sat: 9:30 AM – 7:30 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-xs text-slate-500 text-center sm:text-left">
              &copy; {currentYear} <span className="text-slate-400 font-medium">{company.name}</span>.
              All rights reserved. | An authorized distributor of Hindware & Watertec.
            </p>

            {/* Footer links */}
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/sitemap"
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
