"use client";

import { type ChangeEvent, useRef, useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ------------------------------------------------------------------ */
/* Types                                                             */
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

interface NavItem {
  href: string;
  label: string;
  icon: string;
  children?: { href: string; label: string; description?: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { 
    href: "/", 
    label: "Home", 
    icon: "M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" 
  },
  {
    href: "/#products",
    label: "Products",
    icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
    children: [
      { href: "/#products", label: "All Products", description: "Browse our full catalog" },
      { href: "/scan", label: "Scan & Search", description: "Find products by QR code" },
    ],
  },
  { 
    href: "/about", 
    label: "About", 
    icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
  },
  { 
    href: "/contact", 
    label: "Contact", 
    icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" 
  },
];

const SEARCH_HINTS = [
  "Search products...",
  "Try 'pipes'...",
  "Search 'taps'...",
  "Find 'sanitaryware'...",
  "Search by name...",
];

/* ── Accessible Dropdown ── */
function NavDropdown({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <Link
        href={item.href}
        aria-haspopup="true"
        aria-expanded={open}
        className={`group relative px-5 py-3 text-sm font-medium tracking-wide transition-colors inline-flex items-center gap-1 focus:outline-none ${
          isActive ? "text-teal-700" : "text-gray-500 hover:text-teal-600"
        }`}
      >
        {item.label}
        {item.children && (
          <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
        <span
          className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-transform duration-200 ${
            isActive ? "bg-teal-600 scale-x-100" : "bg-teal-400 scale-x-0 group-hover:scale-x-100 group-focus:scale-x-100"
          }`}
        />
      </Link>

      {item.children && open && (
        <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100 py-2 z-50">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
            >
              <p className="text-sm font-semibold text-gray-900">{child.label}</p>
              {child.description && (
                <p className="text-xs text-gray-500 mt-0.5">{child.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Mobile Drawer Nav Item ── */
function MobileNavItem({
  item,
  isActive,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <Link
        href={item.href}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            setExpanded(!expanded);
          } else {
            onNavigate();
          }
        }}
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all active:scale-[0.98] min-h-[52px] ${
          isActive
            ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200"
            : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          isActive ? "bg-teal-100 text-teal-600" : "bg-gray-100 text-gray-500"
        }`}>
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d={item.icon} />
          </svg>
        </span>
        <span className="font-semibold text-sm flex-1">{item.label}</span>
        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
        {hasChildren && (
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </Link>
      {hasChildren && expanded && (
        <div className="ml-12 mt-1 space-y-1 border-l-2 border-teal-100 pl-3">
          {item.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
              <span className="font-medium">{child.label}</span>
              {child.description && (
                <span className="text-xs text-gray-400 ml-auto hidden sm:inline">{child.description}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Search Hint Hook ── */
function useRotatingPlaceholder(interval = 4000): number {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((prev) => (prev + 1) % SEARCH_HINTS.length);
    }, interval);
    return () => clearInterval(t);
  }, [interval]);

  return index;
}

/* ── Main Component ── */
export default function CatalogHeader({
  config,
  onSearchChange,
  onClearSearch,
}: CatalogHeaderProps) {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef(0);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const pathname = usePathname();
  
  const { companyName, tagline, totalProducts, searchTerm, isSearching, isScrolled, phone, email } = config;
  const placeholderIndex = useRotatingPlaceholder(4000);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  /* Keyboard shortcut global listeners */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const input = searchInputRef.current;
      if (!input) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.focus();
        return;
      }

      if (
        e.key === "/" &&
        document.activeElement !== input &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((document.activeElement as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        input.focus();
        return;
      }

      if (e.key === "Escape") {
        if (document.activeElement === input) {
          e.preventDefault();
          if (searchTerm) {
            onClearSearch();
          } else {
            input.blur();
          }
        } else if (mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchTerm, onClearSearch, mobileMenuOpen]);

  // Window resize sync
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Body Scroll Locking
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [mobileMenuOpen]);

  // Touch handlers
  const handleDrawerTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleDrawerTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartX.current;
    if (deltaX > 0 && mobileMenuRef.current) {
      mobileMenuRef.current.style.transform = `translateX(${Math.min(deltaX, 150)}px)`;
      mobileMenuRef.current.style.opacity = `${1 - deltaX / 400}`;
    }
  }, []);

  const handleDrawerTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (mobileMenuRef.current) {
      mobileMenuRef.current.style.transform = "";
      mobileMenuRef.current.style.opacity = "";
    }
    if (deltaX > 80) {
      setMobileMenuOpen(false);
    }
  }, []);

  // Memoized routing matching to avoid execution on baseline intervals
  const getActiveForLink = useCallback((href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#products")) return pathname === "/" || pathname.startsWith("/product");
    if (href === "/scan") return pathname === "/scan";
    if (href === "/about") return pathname === "/about";
    if (href === "/contact") return pathname === "/contact";
    return false;
  }, [pathname]);

  const sanitizePhone = useMemo(() => phone.replace(/\s+/g, ""), [phone]);

  return (
    <header className={`sticky top-0 z-50 bg-white transition-all duration-300 ${isScrolled ? "shadow-md" : "shadow-sm"}`}>
      <div className="h-1 bg-gradient-to-r from-teal-600 via-cyan-600 to-slate-700 relative overflow-hidden" />

      {/* Desktop Contact Strip */}
      <div className="hidden lg:block bg-slate-900 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <a href={`tel:${sanitizePhone}`} className="flex items-center gap-1.5 hover:text-teal-400 transition-colors">
              <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{phone}</span>
            </a>
            <span className="w-px h-3.5 bg-slate-700" />
            <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-teal-400 transition-colors">
              <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{email}</span>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
              </span>
              Mon to Sat, 9:30 AM - 7:30 PM
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Contact Strip */}
      <div className={`lg:hidden bg-slate-900 text-slate-400 transition-all duration-300 overflow-hidden ${isScrolled ? "h-0 py-0" : "h-8 py-1"}`}>
        <div className="px-3 flex items-center justify-between text-[11px]">
          <a href={`tel:${sanitizePhone}`} className="flex items-center gap-1 hover:text-teal-400 transition-colors">
            <svg className="w-3 h-3 text-teal-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="font-medium">{phone}</span>
          </a>
          <span className="text-slate-500">Open 9:30-7:30</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className={`px-3 sm:px-6 lg:px-8 transition-all duration-300 ${isScrolled ? "py-2" : "py-3"}`}>
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4">
          
          {/* Logo & Identity */}
          <Link href="/" className={`items-center gap-2 sm:gap-3 shrink-0 group min-w-0 ${searchFocused ? "hidden sm:flex" : "flex"}`}>
            <div className={`relative rounded-xl bg-gradient-to-br from-teal-600 to-slate-700 flex items-center justify-center text-white font-extrabold shadow-sm transition-all duration-200 shrink-0 ${isScrolled ? "w-8 h-8 text-sm" : "w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl"}`}>
              {companyName.charAt(0)}
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-white" />
            </div>
            <div className={`min-w-0 ${isScrolled ? "hidden md:block" : "hidden sm:block"}`}>
              <h1 className={`font-extrabold text-gray-900 leading-tight tracking-tight truncate ${isScrolled ? "text-sm" : "text-base lg:text-xl"}`}>{companyName}</h1>
              {!isScrolled && (
                <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                  <span className="truncate">{tagline || "Browse our catalog"}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                  <span className="font-semibold text-gray-800 shrink-0">{totalProducts.toLocaleString()} items</span>
                </div>
              )}
            </div>
          </Link>

          {/* Search Field */}
          <div className={`relative flex-1 min-w-0 transition-all duration-300 ${searchFocused ? "flex-[2_1_0%]" : "flex-1"}`}>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder={SEARCH_HINTS[placeholderIndex]}
                className="w-full pl-10 pr-12 h-10 sm:h-11 text-sm rounded-xl border border-gray-200 bg-gray-50/80 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 focus:bg-white transition-all duration-200"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchTerm && (
                  <button onClick={onClearSearch} className="flex items-center justify-center w-6 h-6 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all" aria-label="Clear search">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {isSearching && searchTerm && (
                  <svg className="animate-spin h-4 w-4 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V2a10 10 0 00-9.95 9.05L4 12z" />
                  </svg>
                )}
                {!searchFocused && !searchTerm && (
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-md">
                    <span>⌘</span>K
                  </kbd>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <a href={`tel:${sanitizePhone}`} className={`lg:hidden shrink-0 flex items-center justify-center rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-100 transition-all ${isScrolled ? "w-8 h-8" : "w-10 h-10"}`} aria-label="Call us">
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>

          <button onClick={() => setMobileMenuOpen(true)} className={`lg:hidden shrink-0 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all ${isScrolled ? "w-8 h-8" : "w-10 h-10"}`} aria-label="Open menu">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop Navigation Link row */}
      <div className="hidden lg:block border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center">
            {NAV_ITEMS.map((item) => {
              const isActive = getActiveForLink(item.href);
              return item.children ? (
                <NavDropdown key={item.href} item={item} isActive={isActive} />
              ) : (
                <Link key={item.href} href={item.href} className={`group relative px-5 py-3 text-sm font-medium tracking-wide transition-colors ${isActive ? "text-teal-700" : "text-gray-500 hover:text-teal-600"}`}>
                  {item.label}
                  <span className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-transform duration-200 ${isActive ? "bg-teal-600 scale-x-100" : "bg-teal-400 scale-x-0 group-hover:scale-x-100"}`} />
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Quick Link Ribbon */}
      <div className={`lg:hidden border-t border-gray-100 bg-white overflow-x-auto transition-all duration-200 ${isScrolled ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}>
        <div className="flex items-center px-3 gap-1 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = getActiveForLink(item.href);
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 min-h-[36px] ${isActive ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200" : "text-gray-500 hover:bg-gray-50"}`}>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Sliding Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" onClick={() => setMobileMenuOpen(false)} />
          <div
            ref={mobileMenuRef}
            onTouchStart={handleDrawerTouchStart}
            onTouchMove={handleDrawerTouchMove}
            onTouchEnd={handleDrawerTouchEnd}
            className="absolute top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-white shadow-2xl overflow-y-auto transform transition-transform duration-200 will-change-transform"
          >
            <div className="sticky top-0 bg-white z-10 px-5 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-slate-700 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
                  {companyName.charAt(0)}
                </div>
                <div>
                  <p className="font-extrabold text-gray-900 text-sm tracking-tight">{companyName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{totalProducts.toLocaleString()} products</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600" aria-label="Close menu">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 pt-4 pb-3 flex gap-2">
              <a href={`tel:${sanitizePhone}`} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-50 text-teal-700 font-semibold text-sm ring-1 ring-teal-200/60">Call</a>
              <a href={`mailto:${email}`} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 text-gray-700 font-semibold text-sm">Email</a>
            </div>

            <div className="px-4 py-2 space-y-1">
              <p className="px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Menu</p>
              {NAV_ITEMS.map((item) => (
                <MobileNavItem key={item.href} item={item} isActive={getActiveForLink(item.href)} onNavigate={() => setMobileMenuOpen(false)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
