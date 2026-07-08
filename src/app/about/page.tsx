"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from "@/types/company";
import CatalogHeader, { type CatalogHeaderConfig } from "@/components/CatalogHeader";
import { useScrollBehavior } from "@/hooks/useScrollBehavior";

const MILESTONES = [
  { year: "2010", title: "Founded", description: "Vishnu Agency established with a vision to provide quality plumbing solutions." },
  { year: "2013", title: "Ashirvad Partnership", description: "Became an  of Ashirvad Pipes & Water Tanks." },
  { year: "2016", title: "Hindware Authorized", description: "Added Hindware Sanitaryware to our brand portfolio." },
  { year: "2019", title: "Watertec Onboarded", description: "Expanded into bath fittings with Watertec partnership." },
  { year: "2023", title: "Digital Catalog Launch", description: "Launched our digital catalog for easy product browsing." },
  { year: "2025+", title: "Expanding Reach", description: "Continuing to grow our product range and customer base across Telangana." },
];

const STATS = [
  { value: "500+", label: "Products" },
  { value: "3+", label: "Premium Brands" },
  { value: "15+", label: "Years of Service" },
  { value: "1000+", label: "Happy Customers" },
];

const VALUES = [
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "Quality Assurance",
    description: "We stock only genuine, branded products from India's most trusted manufacturers — Ashirvad, Hindware, and Watertec.",
  },
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "Fast Service",
    description: "From quick order processing to timely delivery, we prioritize speed without compromising on accuracy or care.",
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    title: "Customer First",
    description: "Every interaction is guided by respect, transparency, and a genuine commitment to solving customer needs.",
  },
  {
    icon: "M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3",
    title: "Trust & Reliability",
    description: "As an authorized distributor, every product we sell comes with full manufacturer backing and our service guarantee.",
  },
];

const BRANDS = [
  {
    name: "Ashirvad",
    tagline: "Pipes & Water Tanks",
    color: "emerald",
    description: "India's leading brand for plumbing pipes and water storage solutions, known for innovation and durability.",
  },
  {
    name: "Hindware",
    tagline: "Sanitaryware",
    color: "indigo",
    description: "Premium sanitaryware and bathroom solutions trusted by architects and homeowners across India.",
  },
  {
    name: "Watertec",
    tagline: "Bath Fittings",
    color: "sky",
    description: "Contemporary bath fittings and accessories combining style with functionality at competitive prices.",
  },
];

export default function AboutPage() {
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const { isScrolled } = useScrollBehavior();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch("/api/company");
        const data = await res.json();
        if (res.ok && data.company) {
          setCompany((prev) => ({ ...prev, ...data.company }));
        }
      } catch {
        // fallback to defaults
      }
    };
    fetchCompany();
  }, []);

  const headerConfig: CatalogHeaderConfig = {
    companyName: company.name,
    tagline: company.tagline,
    totalProducts: 0,
    searchTerm: "",
    isSearching: false,
    isScrolled,
    phone: company.phone,
    email: company.email,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CatalogHeader
        config={headerConfig}
        onSearchChange={() => {}}
        onClearSearch={() => {}}
      />

      {/* ── Hero Section ── */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-slate-900 to-indigo-900/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 text-emerald-300 text-xs font-semibold tracking-wide mb-4 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              About Us
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Trusted Since 2010
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              {company.name} has been a reliable partner for plumbing, sanitaryware, and bath fitting solutions
              across Hyderabad. We deliver quality products backed by trusted brands and exceptional service.
            </p>
          </div>
        </div>
      </section>

      {/* ── Our Story Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold tracking-wide mb-4">
              Our Story
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
              A Legacy of Quality & Trust
            </h2>
            <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
              <p>
                Founded in 2010, <strong className="text-gray-900">{company.name}</strong> started with a simple
                mission — to provide genuine, high-quality plumbing and sanitaryware products to homes and
                businesses in Hyderabad. What began as a small operation has grown into a trusted name in the
                industry, serving contractors, builders, retailers, and homeowners.
              </p>
              <p>
                Over the years, we have built strong partnerships with India's most respected brands —
                <strong className="text-gray-900"> Ashirvad</strong>, <strong className="text-gray-900">Hindware</strong>,
                and <strong className="text-gray-900">Watertec</strong> — allowing us to offer a comprehensive range
                of products from pipes and water tanks to premium sanitaryware and stylish bath fittings.
              </p>
              <p>
                Our commitment to quality, competitive pricing, and customer satisfaction has earned us the
                trust of over a thousand customers. We continue to expand our product range and improve our
                services to meet the evolving needs of our growing customer base.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-emerald-500/10 via-slate-100 to-indigo-500/10 rounded-2xl border border-gray-200 p-8 sm:p-10">
              <div className="grid grid-cols-2 gap-6">
                {STATS.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-gray-200">
                <blockquote className="text-sm text-gray-500 italic leading-relaxed">
                  &ldquo;Our goal is to be more than just a supplier — we aim to be a trusted partner in every
                  project we serve.&rdquo;
                </blockquote>
                <p className="text-sm font-semibold text-gray-900 mt-3">— Founder, {company.name}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">{stat.value}</p>
                <p className="text-emerald-100 text-sm sm:text-base mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission, Vision, Values ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide mb-4">
            What Drives Us
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Our Mission, Vision & Values
          </h2>
          <p className="mt-4 text-gray-500 leading-relaxed">
            Every product we stock and every interaction we have is guided by a clear purpose and a set of
            core principles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 hover:shadow-md hover:border-emerald-200 transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-5 group-hover:bg-emerald-200 transition-colors">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={value.icon} />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{value.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Brand Partners ── */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold tracking-wide mb-4">
              Our Partners
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Brands We Represent
            </h2>
            <p className="mt-4 text-gray-500 leading-relaxed">
              We are proud to be authorized distributors of India's most trusted names in plumbing,
              sanitaryware, and bath fittings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {BRANDS.map((brand) => (
              <div
                key={brand.name}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 text-center hover:shadow-md transition-all duration-200"
              >
                <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-${brand.color}-100 flex items-center justify-center`}>
                  <span className={`text-${brand.color}-700 font-extrabold text-xl`}>{brand.name.charAt(0)}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{brand.name}</h3>
                <p className="text-sm font-semibold text-emerald-600 mt-1">{brand.tagline}</p>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">{brand.description}</p>
                <div className={`mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-${brand.color}-600 bg-${brand.color}-50 px-3 py-1.5 rounded-full`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Known for Quality
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline / Milestones ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide mb-4">
            Our Journey
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Milestones
          </h2>
          <p className="mt-4 text-gray-500 leading-relaxed">
            Key moments that have shaped our growth and continue to drive us forward.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 via-indigo-400 to-emerald-400 -translate-x-1/2" />

          <div className="space-y-10">
            {MILESTONES.map((milestone, index) => {
              const isLeft = index % 2 === 0;
              return (
                <div
                  key={milestone.year}
                  className={`relative flex flex-col sm:flex-row items-start gap-6 sm:gap-0 ${
                    isLeft ? "sm:flex-row" : "sm:flex-row-reverse"
                  }`}
                >
                  {/* Content card */}
                  <div className={`sm:w-[calc(50%-2rem)] w-full pl-10 sm:pl-0 ${
                    isLeft ? "sm:pr-8 sm:text-right" : "sm:pl-8"
                  }`}>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 hover:shadow-md transition-shadow">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mb-2">
                        {milestone.year}
                      </span>
                      <h3 className="text-base font-bold text-gray-900">{milestone.title}</h3>
                      <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-4 sm:left-1/2 top-5 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 shadow-sm z-10" />

                  {/* Spacer for the other side */}
                  <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 text-emerald-300 text-xs font-semibold tracking-wide mb-4">
              Why Choose Us
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
              The Vishnu Agency Difference
            </h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              What sets us apart from other suppliers in Hyderabad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: "100% Genuine Products",
                description: "Every product we sell is sourced directly from authorized manufacturers — no duplicates, no compromises.",
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
              },
              {
                title: "Competitive Pricing",
                description: "As authorized distributors, we offer the best prices in the market — whether you need one item or a bulk order.",
                icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                title: "Pan-Hyderabad Delivery",
                description: "We serve customers across Hyderabad, Secunderabad, and surrounding areas with timely and reliable delivery.",
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 hover:bg-white/10 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 active:scale-[0.97]"
            >
              Get In Touch
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-emerald-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Ready to Start Your Project?
          </h2>
          <p className="text-indigo-100 text-sm sm:text-base max-w-lg mx-auto mb-8">
            Whether you are a contractor planning a large project or a homeowner upgrading your bathroom,
            we have the products and expertise to help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 transition-all shadow-lg shadow-indigo-900/30 hover:shadow-indigo-900/50 active:scale-[0.97]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </Link>
            <a
              href={`tel:${company.phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all shadow-lg ring-1 ring-white/30 active:scale-[0.97]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call {company.phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
