"use client";

import { type ChangeEvent, useRef } from "react";
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
}

interface CatalogHeaderProps {
  config: CatalogHeaderConfig;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

/* ------------------------------------------------------------------ */
/*  Main header component                                             */
/* ------------------------------------------------------------------ */

export default function CatalogHeader({
  config,
  onSearchChange,
  onClearSearch,
}: CatalogHeaderProps) {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const { companyName, tagline, totalProducts, searchTerm, isSearching, isScrolled } =
    config;

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-shadow duration-200 ${
        isScrolled ? "shadow-lg shadow-gray-200/50" : "shadow-sm"
      }`}
    >
      {/* Top accent bar — brand stripes */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-600" />

      <div className="px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          {/* ── Brand ── */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group min-w-0">
            {/* Logo circle */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-200/50 group-hover:shadow-lg group-hover:shadow-emerald-300/50 transition-all duration-200 shrink-0">
              {companyName.charAt(0)}
              {/* Small brand dot indicator */}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-white" />
            </div>

            {/* Name + Tagline */}
            <div className="hidden sm:block min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight truncate">
                {companyName}
              </h1>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="truncate">{tagline || "Browse our catalog"}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                <span className="font-medium text-gray-700 shrink-0">
                  {totalProducts.toLocaleString()}
                </span>
              </div>
            </div>
          </Link>

          {/* ── Search + Actions ── */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl ml-auto">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="w-full pl-10 pr-10 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchTerm && (
                  <button
                    onClick={onClearSearch}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                    aria-label="Clear search"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
                {isSearching && (
                  <svg className="animate-spin h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V2a10 10 0 00-9.95 9.05L4 12z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Admin Button */}
            <Link
              href="/admin"
              className="shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm shadow-indigo-200 hover:shadow-md active:scale-[0.97]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
