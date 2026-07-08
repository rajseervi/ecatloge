"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface CatalogHeroProps {
  companyName: string;
  phone: string;
}

export default function CatalogHero({ companyName, phone }: CatalogHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  /* ── Parallax scroll ──────── */
  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / window.innerHeight));
      setParallaxOffset(progress * 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white"
      aria-label="Hero banner"
    >
      {/* Parallax decorative background elements */}
      <div
        className="absolute inset-0 will-change-transform opacity-20"
        style={{ transform: `translateY(${parallaxOffset * 0.5}px)` }}
      >
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-emerald-500/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Text */}
            <div className="space-y-6">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold tracking-wide animate-slide-in-up"
                style={{ transform: `translateY(${parallaxOffset * -0.3}px)` }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Authorized Distributor — Ashirvad, Hindware & Watertec
              </div>

              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight"
                style={{ transform: `translateY(${parallaxOffset * -0.15}px)` }}
              >
                Premium{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                  Plumbing & Sanitaryware
                </span>{" "}
                in Hyderabad
              </h1>

              <p
                className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl"
                style={{ transform: `translateY(${parallaxOffset * -0.1}px)` }}
              >
                {companyName} is your trusted Hyderabad dealer for Ashirvad pipes & water tanks,
                Hindware sanitaryware, Watertec bath fittings, PTMT taps, and complete plumbing
                solutions. Quality products, competitive prices, and reliable service.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  10+ years serving Hyderabad
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Bulk orders welcome
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Free delivery* across Hyderabad
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 active:scale-[0.97]"
                  aria-label={`Call ${companyName} at ${phone}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Now — {phone}
                </a>
                <Link
                  href="#products"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all backdrop-blur-sm"
                >
                  Browse Products
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right: Visual */}
            <div
              className="hidden lg:flex items-center justify-center"
              style={{ transform: `translateY(${parallaxOffset * -0.4}px)` }}
            >
              <div className="relative w-80 h-80">
                {/* Decorative circles */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 animate-pulse" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-400/10 to-blue-400/10" />

                {/* Plumbing icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-white/60">
                    <rect x="50" y="20" width="20" height="10" rx="3" fill="currentColor" />
                    <rect x="55" y="30" width="10" height="35" rx="2" fill="currentColor" />
                    <path d="M45 65h30a8 8 0 018 8v4a8 8 0 01-8 8H45a8 8 0 01-8-8v-4a8 8 0 018-8z" fill="currentColor" opacity="0.6" />
                    <circle cx="60" cy="45" r="5" fill="currentColor" opacity="0.4" />
                    <path d="M60 78v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M56 86c0-2.2 4-2.2 4 0s-4 2.2-4 0z" fill="currentColor" opacity="0.5" />
                    <rect x="30" y="50" width="8" height="3" rx="1" fill="currentColor" opacity="0.4" />
                    <rect x="82" y="50" width="8" height="3" rx="1" fill="currentColor" opacity="0.4" />
                  </svg>
                </div>

                {/* Brand rings */}
                <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-[8px] font-bold text-emerald-300">
                  A
                </div>
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-[8px] font-bold text-blue-300">
                  H
                </div>
                <div className="absolute bottom-8 left-6 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[7px] font-bold text-indigo-300">
                  W
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll-down indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-white/60 tracking-widest uppercase">Scroll</span>
        <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
    </section>
  );
}
