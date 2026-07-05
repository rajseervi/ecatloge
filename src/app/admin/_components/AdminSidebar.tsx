"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { auth } from "@/lib/firebase";
import { signOut as firebaseSignOut } from "firebase/auth";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
}

const NAV_LINKS: SidebarLink[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/inventory",
    label: "Inventory",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/",
    label: "View Catalog",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    ),
    badge: "Live",
  },
];

const QUICK_LINKS: SidebarLink[] = [
  {
    href: "/scan",
    label: "QR Scanner",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    href: "/product",
    label: "Products",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      setIsSigningOut(true);
      try { await firebaseSignOut(auth); } catch { /* continue */ }
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Logout error:", error);
      setIsSigningOut(false);
    }
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-gray-950 text-white z-40 flex flex-col transition-all duration-300 ease-in-out shadow-2xl ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo area */}
        <div className={`flex items-center h-16 px-4 border-b border-white/[0.06] shrink-0 ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="h-9 w-9 min-w-[36px] rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden ring-1 ring-white/10">
            <img src="/logo.svg" alt="eCatloge" className="h-full w-full object-contain p-1 brightness-0 invert" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <h1 className="text-sm font-bold tracking-tight text-white">eCatloge</h1>
              <p className="text-[9px] text-white/40 uppercase tracking-[0.15em] font-medium">Admin Panel</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0 ${collapsed ? "mt-4" : ""}`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className={`w-4 h-4 text-white/40 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1 scrollbar-hide">
          {/* Main section label */}
          <div className={`px-3 mb-2 ${collapsed ? "text-center" : ""}`}>
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/20">
              {collapsed ? "•••" : "Main Menu"}
            </span>
          </div>

          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  active
                    ? "bg-indigo-500/15 text-indigo-300 shadow-sm shadow-indigo-500/5"
                    : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                }`}
                title={collapsed ? link.label : undefined}
              >
                {/* Active glow */}
                {active && (
                  <span className="absolute inset-0 rounded-xl bg-indigo-500/5 blur-sm" />
                )}
                {/* Active indicator bar */}
                {active && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full shadow-sm shadow-indigo-400/50" />
                )}
                <span className={`relative z-10 shrink-0 transition-transform duration-200 ${
                  active ? "scale-110" : "group-hover:scale-110"
                }`}>
                  {link.icon}
                </span>
                {!collapsed && (
                  <>
                    <span className="relative z-10">{link.label}</span>
                    {link.badge && (
                      <span className="ml-auto relative z-10 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] font-bold uppercase tracking-wider ring-1 ring-emerald-500/20">
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-4 border-t border-white/[0.06]" />

          {/* Quick Links label */}
          <div className={`px-3 mb-2 ${collapsed ? "text-center" : ""}`}>
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/20">
              {collapsed ? "•••" : "Quick Links"}
            </span>
          </div>

          {QUICK_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  active
                    ? "bg-indigo-500/15 text-indigo-300"
                    : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                }`}
                title={collapsed ? link.label : undefined}
              >
                {active && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full" />
                )}
                <span className={`relative z-10 shrink-0 transition-transform duration-200 ${
                  active ? "scale-110" : "group-hover:scale-110"
                }`}>
                  {link.icon}
                </span>
                {!collapsed && <span className="relative z-10">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-3 border-t border-white/[0.06] space-y-1">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            disabled={isSigningOut}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full group ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? "Log out" : undefined}
          >
            <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110 duration-200" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!collapsed && (
              <span>{isSigningOut ? "Signing out..." : "Log out"}</span>
            )}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-red-100">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Confirm Logout</h3>
                <p className="text-sm text-gray-500">Are you sure you want to sign out?</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 transition-all"
              >
                Yes, Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
