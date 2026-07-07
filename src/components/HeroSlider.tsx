"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Banner } from "@/types/banner";

interface HeroSliderProps {
  banners: Banner[];
  companyName: string;
  phone: string;
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [slideKey, setSlideKey] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const totalSlides = banners.length;

  const goToSlide = useCallback((index: number) => {
    const newIndex = ((index % totalSlides) + totalSlides) % totalSlides;
    setCurrentSlide(newIndex);
    setSlideKey((k) => k + 1);
  }, [totalSlides]);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setSlideKey((k) => k + 1);
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => ((prev - 1) % totalSlides + totalSlides) % totalSlides);
    setSlideKey((k) => k + 1);
  }, [totalSlides]);

  useEffect(() => {
    if (!isAutoPlaying || totalSlides <= 1) return;
    intervalRef.current = setInterval(goNext, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, totalSlides, goNext]);

  const resumeAutoplay = useCallback(() => {
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, []);

  const handleSwipe = useCallback((distance: number) => {
    const threshold = 50;
    if (Math.abs(distance) > threshold) {
      if (distance > 0) goNext();
      else goPrev();
    }
  }, [goNext, goPrev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setIsDragging(true);
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    handleSwipe(touchStart - touchEnd);
    resumeAutoplay();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStart(e.clientX);
    setIsDragging(true);
    setIsAutoPlaying(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTouchEnd(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    handleSwipe(touchStart - touchEnd);
    resumeAutoplay();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { goPrev(); setIsAutoPlaying(false); resumeAutoplay(); }
      if (e.key === "ArrowRight") { goNext(); setIsAutoPlaying(false); resumeAutoplay(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goPrev, goNext, resumeAutoplay]);

  if (totalSlides === 0) return null;

  return (
    <section
      ref={containerRef}
      className="group relative w-full overflow-hidden bg-slate-900 select-none"
      aria-label="Featured promotions carousel"
      role="region"
      aria-roledescription="carousel"
    >
      <div
        ref={trackRef}
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] cursor-grab active:cursor-grabbing"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { if (isDragging) { setIsDragging(false); resumeAutoplay(); } }}
      >
        {banners.map((banner, index) => {
          const isActive = currentSlide === index;
          return (
            <div
              key={`${banner.id}-${index}`}
              className="min-w-full relative"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${totalSlides}: ${banner.title}`}
              aria-hidden={!isActive}
            >
              <div className="relative w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px]">
                {banner.imageUrl ? (
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title || `Banner ${index + 1}`}
                    fill
                    className="object-cover scale-100 transition-transform duration-[8000ms] ease-linear"
                    style={{ transform: isActive ? "scale(1.05)" : "scale(1)" }}
                    priority={index === 0}
                    sizes="100vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div
                      key={`content-${slideKey}-${index}`}
                      className={`max-w-xl lg:max-w-2xl transition-all duration-700 ease-out ${
                        isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                      }`}
                      style={{ transitionDelay: isActive ? "150ms" : "0ms" }}
                    >
                      {banner.subtitle && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold tracking-wide mb-4 backdrop-blur-sm animate-slide-in-up">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {banner.subtitle}
                        </div>
                      )}

                      <h2
                        className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-3 drop-shadow-lg transition-all duration-700 ease-out ${
                          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                        }`}
                        style={{ transitionDelay: isActive ? "300ms" : "0ms" }}
                      >
                        {banner.title}
                      </h2>

                      {banner.description && (
                        <p
                          className={`text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed mb-6 max-w-lg line-clamp-2 sm:line-clamp-3 transition-all duration-700 ease-out ${
                            isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                          }`}
                          style={{ transitionDelay: isActive ? "450ms" : "0ms" }}
                        >
                          {banner.description}
                        </p>
                      )}

                      {banner.ctaText && (
                        <div
                          className={`transition-all duration-700 ease-out ${
                            isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                          }`}
                          style={{ transitionDelay: isActive ? "600ms" : "0ms" }}
                        >
                          <Link
                            href={banner.ctaLink || "/"}
                            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:scale-105 active:scale-[0.97]"
                          >
                            {banner.ctaText}
                            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalSlides > 1 && (
        <>
          <button
            onClick={() => { goPrev(); setIsAutoPlaying(false); resumeAutoplay(); }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:bg-white/30 shadow-lg opacity-0 group-hover:opacity-100 lg:opacity-100"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => { goNext(); setIsAutoPlaying(false); resumeAutoplay(); }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:bg-white/30 shadow-lg lg:opacity-100"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {totalSlides > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => { goToSlide(index); setIsAutoPlaying(false); resumeAutoplay(); }}
              className={`transition-all duration-500 ease-out rounded-full ${
                currentSlide === index
                  ? "w-10 h-3 bg-emerald-400 shadow-lg shadow-emerald-400/50"
                  : "w-3 h-3 bg-white/40 hover:bg-white/70 hover:scale-125"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {totalSlides > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-10">
          <div
            key={`progress-${slideKey}`}
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-r-full animate-progress-fill"
          />
        </div>
      )}
    </section>
  );
}
