"use client";

import { type ChangeEvent, useRef, useState, useEffect } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface CatalogHeaderConfig {
  companyName: string;
  tagline: string;
  totalProducts: number;
  searchTerm: string;
  isSearching: boolean;
  isScrolled: boolean;
  phone: string;
  email: string;
}

interface CatalogHeaderProps {
  config: CatalogHeaderConfig;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#products", label: "Products" },
  { href: "/scan", label: "Scan & Search" },
  { href: "/contact", label: "Contact" },
];

/* ------------------------------------------------------------------ */
/*  Main header component                                             */
/* ------------------------------------------------------------------ */

export default function CatalogHeader({
  config,
  onSearchChange,
  onClearSearch,
}: CatalogHeaderProps) {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { companyName, tagline, totalProducts, searchTerm, isSearching, isScrolled, phone, email } = config;

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
        isScrolled
          ? "shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08)]"
          : "shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]"
      }`}
    >
      {/* ── Top accent bar ── */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 animate-shimmer" style={{ transform: 'skewX(-20deg) translateX(-100%)' }} />
      </div>

      {/* ── Top Contact Bar ── */}
      <div className="hidden md:block bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors group">
              <svg className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-300 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{phone}</span>
            </a>
            <span className="w-px h-3 bg-slate-700" />
            <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors group">
              <svg className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-300 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{email}</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Open Mon — Sat: 9:30 AM – 7:30 PM
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Header Row ── */}
      <div className="px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {/* ── Brand ── */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group min-w-0">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md shadow-emerald-200/50 group-hover:shadow-lg group-hover:shadow-emerald-300/50 transition-all duration-200 shrink-0">
                {companyName.charAt(0)}
                {/* Brand dot indicator */}
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-400 rounded-full ring-2 ring-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold text-gray-900 leading-tight truncate">
                  {companyName}
                </h1>
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                  <span className="truncate">{tagline || "Browse our catalog"}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                  <span className="font-medium text-gray-700 shrink-0">
                    {totalProducts.toLocaleString()} items
                  </span>
                </div>
                {/* Mobile-only tagline */}
                <span className="sm:hidden text-[10px] text-gray-400 truncate block leading-tight">
                  {totalProducts.toLocaleString()} items
                </span>
              </div>
            </Link>

            {/* ── Search + Actions ── */}
            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 ml-auto max-w-lg">
              {/* Phone icon - mobile */}
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="md:hidden shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                aria-label="Call us"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </a>

              {/* Search */}
              <div className="relative flex-1 min-w-[80px] sm:min-w-[160px]">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search products..."
                  className="w-full pl-8 pr-7 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  {searchTerm && (
                    <button onClick={onClearSearch} className="text-gray-400 hover:text-gray-600 transition-colors p-0.5" aria-label="Clear search">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  {isSearching && (
                    <svg className="animate-spin h-3 w-3 text-indigo-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V2a10 10 0 00-9.95 9.05L4 12z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Admin */}
              <Link
                href="/admin"
                className="hidden sm:inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs sm:text-sm font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm shadow-indigo-200 hover:shadow-md active:scale-[0.97]"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">Admin</span>
              </Link>

              {/* Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden shrink-0 inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop Nav Bar ── */}
      <div className="hidden lg:block border-t border-gray-100 bg-gradient-to-b from-gray-50/90 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <nav className="flex items-center">
              {NAV_LINKS.map((link, idx) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 sm:px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors group ${
                    idx > 0 ? 'border-l border-gray-100' : ''
                  }`}
                >
                  {link.label}
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 rounded-full" />
                </Link>
              ))}
            </nav>
            <Link
              href="/admin"
              className="text-sm text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-indigo-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin Panel
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile Navigation Overlay (full-screen) ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Full screen menu panel - slides up from bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                    {companyName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{companyName}</p>
                    <p className="text-xs text-gray-400">{totalProducts.toLocaleString()} items</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 active:scale-90 transition-all"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="px-4 py-4 space-y-2">
              <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Navigate</p>

              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 px-4 py-4 bg-gray-50 rounded-2xl hover:bg-indigo-50 active:bg-indigo-100 transition-all"
              >
                <span className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Home</p>
                  <p className="text-xs text-gray-400">Browse our catalog</p>
                </div>
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/#products"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 px-4 py-4 bg-gray-50 rounded-2xl hover:bg-indigo-50 active:bg-indigo-100 transition-all"
              >
                <span className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Products</p>
                  <p className="text-xs text-gray-400">View all categories</p>
                </div>
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/scan"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 px-4 py-4 bg-gray-50 rounded-2xl hover:bg-indigo-50 active:bg-indigo-100 transition-all"
              >
                <span className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
                  </svg>
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Scan & Search</p>
                  <p className="text-xs text-gray-400">Find products by barcode</p>
                </div>
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 px-4 py-4 bg-gray-50 rounded-2xl hover:bg-indigo-50 active:bg-indigo-100 transition-all"
              >
                <span className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Contact</p>
                  <p className="text-xs text-gray-400">Get in touch with us</p>
                </div>
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="px-4 pb-4">
              <div className="border-t border-gray-100 pt-4">
                <p className="px-2 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Actions</p>
                <div className="flex gap-3">
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-emerald-50 rounded-2xl text-emerald-700 font-semibold text-sm hover:bg-emerald-100 active:scale-[0.97] transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call
                  </a>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-50 rounded-2xl text-indigo-700 font-semibold text-sm hover:bg-indigo-100 active:scale-[0.97] transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin
                  </Link>
                </div>
              </div>
            </div>

            {/* Spacer for safe area */}
            <div className="h-4" />
          </div>
        </div>
      )}
    </header>
  );
}
