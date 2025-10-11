'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Product, ProductListResponse } from '@/types/product';
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from '@/types/company';
import Image from 'next/image';
import Link from 'next/link';

// Force dynamic rendering since this page fetches data on the client
export const dynamic = 'force-dynamic';

interface CachedProductsData {
  products: Product[];
  totalPages: number;
  totalProducts: number;
  categories: string[];
  company: CompanyProfile;
  timestamp: number;
}

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categories, setCategories] = useState<string[]>(['all']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [isSearching, setIsSearching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const productCacheRef = useRef<Map<string, CachedProductsData>>(new Map());
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const limit = 24; // Batch size for incremental loading

  // Scroll state management
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const lastScrollY = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  
  // Industry-level operational states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [apiResponseTime, setApiResponseTime] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [notifications, setNotifications] = useState<Array<{id: number, type: string, message: string, time: string}>>([]);

  const mergeProducts = (existingProducts: Product[], incomingProducts: Product[]) => {
    const existingIds = new Set(existingProducts.map((item) => item.id));
    const filteredIncoming = incomingProducts.filter((item) => !existingIds.has(item.id));
    return [...existingProducts, ...filteredIncoming];
  };

  // Industry-level system monitoring
  useEffect(() => {
    // Simulate real-time system monitoring
    const monitoringInterval = setInterval(() => {
      // Simulate API response time (50-200ms)
      setApiResponseTime(Math.floor(Math.random() * 150) + 50);
      
      // Simulate active users (100-500)
      setActiveUsers(Math.floor(Math.random() * 400) + 100);
      
      // Determine system health based on response time
      const responseTime = apiResponseTime;
      if (responseTime < 100) {
        setSystemHealth('healthy');
      } else if (responseTime < 150) {
        setSystemHealth('warning');
      } else {
        setSystemHealth('critical');
      }
    }, 5000); // Update every 5 seconds

    // Initialize notifications
    setNotifications([
      { id: 1, type: 'success', message: 'New products added successfully', time: '2 min ago' },
      { id: 2, type: 'info', message: 'System backup completed', time: '15 min ago' },
      { id: 3, type: 'warning', message: 'Low stock alert for 3 items', time: '1 hour ago' },
    ]);

    return () => clearInterval(monitoringInterval);
  }, [apiResponseTime]);

  // Keyboard shortcut handler for search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      // ESC to clear search
      if (e.key === 'Escape' && searchTerm) {
        e.preventDefault();
        setSearchTerm('');
        searchInputRef.current?.blur();
      }
      // Cmd/Ctrl + N for notifications
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setShowNotifications(!showNotifications);
      }
      // Cmd/Ctrl + Q for quick actions
      if ((e.metaKey || e.ctrlKey) && e.key === 'q') {
        e.preventDefault();
        setShowQuickActions(!showQuickActions);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchTerm, showNotifications, showQuickActions]);

  // Ultra-optimized scroll handler with RAF throttling, batched updates, and zero-flicker logic
  useEffect(() => {
    let rafId: number | null = null;
    
    const handleScroll = () => {
      // Cancel any pending RAF to prevent queue buildup
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);
        const isScrollingDown = currentScrollY > lastScrollY.current;
        
        // Calculate scroll progress (0-100%) - ALWAYS update for smooth progress bar
        const progress = documentHeight > 0 ? (currentScrollY / documentHeight) * 100 : 0;
        const clampedProgress = Math.min(100, Math.max(0, progress));
        setScrollProgress(clampedProgress);
        
        // Basic scroll detection (20px threshold)
        const newIsScrolled = currentScrollY > 20;
        if (newIsScrolled !== isScrolled) {
          setIsScrolled(newIsScrolled);
        }
        
        // Compact mode (100px threshold)
        const newIsCompact = currentScrollY > 100;
        if (newIsCompact !== isCompact) {
          setIsCompact(newIsCompact);
        }
        
        // Improved header visibility logic
        if (currentScrollY < 50) {
          // Always show header near top
          if (!isHeaderVisible) {
            setIsHeaderVisible(true);
          }
        } else if (scrollDelta > 5) {
          // Only change visibility if scrolled more than 5px
          if (isScrollingDown && currentScrollY > 150) {
            // Hide header when scrolling down (after 150px)
            if (isHeaderVisible) {
              setIsHeaderVisible(false);
            }
          } else if (!isScrollingDown) {
            // Show header immediately when scrolling up
            if (!isHeaderVisible) {
              setIsHeaderVisible(true);
            }
          }
        }
        
        lastScrollY.current = currentScrollY;
        rafId = null;
      });
    };

    // Mouse move handler to show header when hovering near top
    const handleMouseMove = (e: MouseEvent) => {
      // Show header if mouse is within 100px of top of viewport
      if (e.clientY < 100 && !isHeaderVisible && window.scrollY > 150) {
        setIsHeaderVisible(true);
      }
    };

    // Add scroll listener with passive flag for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    // Initial call to set correct state
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isScrolled, isCompact, isHeaderVisible]);

  useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage((prev) => (prev !== 1 ? 1 : prev));
      setIsSearching(false);
    }, 300);

    return () => {
      clearTimeout(handler);
      setIsSearching(false);
    };
  }, [searchTerm]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (page === 1) {
        setLoading(true);
      }
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (!isInitialLoad) {
          setIsFetchingMore(true);
        }

        if (debouncedSearch) {
          params.append('search', debouncedSearch);
        }

        if (selectedCategory && selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }

        const cacheKey = params.toString();
        const cachedEntry = productCacheRef.current.get(cacheKey);
        const now = Date.now();
        const cacheTTL = 60_000; // 60 seconds

        if (cachedEntry && now - cachedEntry.timestamp < cacheTTL) {
          const {
            products: cachedProducts,
            totalPages: cachedTotalPages,
            totalProducts: cachedTotalProducts,
            categories: cachedCategories,
            company: cachedCompany,
          } = cachedEntry;

          if (page === 1) {
            setProducts(cachedProducts);
          } else {
            setProducts((prev) => mergeProducts(prev, cachedProducts));
          }

          setTotalPages(cachedTotalPages);
          setTotalProducts(cachedTotalProducts);
          setCategories(['all', ...cachedCategories]);
          setCompany({ ...DEFAULT_COMPANY_PROFILE, ...cachedCompany });
          setLoading(false);
          setIsInitialLoad(false);
          setHasMore(page < cachedTotalPages);
          setIsFetchingMore(false);
          return;
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        const data: ProductListResponse = await response.json();
        if (response.ok && data.products) {
          if (data.company) {
            setCompany({ ...DEFAULT_COMPANY_PROFILE, ...data.company });
          }

          const incomingProducts = data.products;
          setProducts((prev) => (page === 1 ? incomingProducts : mergeProducts(prev, incomingProducts)));
          setTotalPages(data.totalPages || 1);
          setTotalProducts(data.total || 0);
          setHasMore(page < (data.totalPages || 1));
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(['all', ...data.categories]);
          } else {
            setCategories(['all']);
          }

          productCacheRef.current.set(cacheKey, {
            products: incomingProducts,
            totalPages: data.totalPages || 1,
            totalProducts: data.total || 0,
            categories: Array.isArray(data.categories) ? data.categories : [],
            company: { ...DEFAULT_COMPANY_PROFILE, ...data.company },
            timestamp: Date.now(),
          });
        } else {
          setProducts((prev) => (page === 1 ? [] : prev));
          setTotalPages(1);
          setTotalProducts(0);
          setCategories(['all']);
          setHasMore(false);
          console.error('Failed to fetch products:', data.error, data.details ? `Details: ${data.details}` : '');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts((prev) => (page === 1 ? [] : prev));
        setTotalPages(1);
        setTotalProducts(0);
        setCategories(['all']);
        setHasMore(false);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
        setIsFetchingMore(false);
      }
    };

    fetchProducts();
  }, [page, debouncedSearch, selectedCategory]);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !loading && !isFetchingMore) {
            setPage((prev) => prev + 1);
          }
        });
      },
      { rootMargin: '200px' }
    );

    const currentRef = loadMoreRef.current;
    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, [hasMore, loading, isFetchingMore]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
    setLoading(true);
    setHasMore(true);
    productCacheRef.current.clear();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderProducts = () => {
    if (loading && !isInitialLoad) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4" role="status" aria-live="polite">
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 animate-pulse">
              <div className="w-full h-48 bg-gray-200"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-full mt-3"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!loading && products.length === 0) {
      return (
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h2>
          <p className="text-gray-600 mb-6">We couldn&apos;t find any products matching your criteria.</p>
          {(debouncedSearch || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                handleCategorySelect('all');
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Reset Filters
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 hover:border-indigo-300"
            >
              <div className="relative overflow-hidden bg-gray-50">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                {product.inventory === 0 ? (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium shadow">
                    Out of Stock
                  </div>
                ) : product.inventory <= 5 ? (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium shadow">
                    Low Stock
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium shadow">
                    In Stock
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm text-gray-700 px-2 py-1 rounded text-xs font-medium shadow-sm">
                  {product.category}
                </div>
              </div>
              <div className="p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {product.name}
                </h2>
                <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mb-3">
                  {company.showPrices && (
                    <p className="text-lg font-bold text-indigo-600">
                      ${(product.price || 0).toFixed(2)}
                    </p>
                  )}
                  {product.inventory > 0 && <p className="text-xs text-gray-600">{product.inventory} units</p>}
                </div>
                <Link
                  href={`/product/${product.id}`}
                  className="w-full inline-flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  View Details
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {!hasMore && totalPages <= 1 ? null : (
          <div className="flex justify-center mt-6">
            <div
              ref={loadMoreRef}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-200"
            >
              {isFetchingMore && (
                <svg className="h-4 w-4 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V2a10 10 0 00-9.95 9.05L4 12z"
                  ></path>
                </svg>
              )}
              <span className="text-xs font-medium text-gray-600">
                {hasMore ? 'Loading more products…' : 'You have reached the end'}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading && isInitialLoad) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading E-Cat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header 
        className={`header-transition sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/80 ${
          isScrolled ? 'shadow-2xl' : 'shadow-lg'
        } ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Scroll Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200/50 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 transition-all duration-150 ease-out shadow-lg shadow-indigo-500/50"
            style={{ width: `${scrollProgress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
        {/* Top Navigation Bar */}
        <div 
          className={`border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-pink-50/50 transition-all duration-300 overflow-hidden ${
            isCompact ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'
          }`}
        >
          <div className="px-4 md:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <svg className="w-3.5 h-3.5 text-green-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">All systems operational</span>
                </span>
                <span className="hidden sm:flex items-center gap-1.5 text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 transition-colors group">
                  <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="hidden md:inline">Contact Support</span>
                </button>
                <button className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 transition-colors group">
                  <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden md:inline">Help</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-purple-500/5 to-rose-500/5 pointer-events-none" aria-hidden="true"></div>

          <div 
            className={`px-3 sm:px-4 md:px-6 lg:px-8 relative transition-all duration-300 ${
              isCompact ? 'py-2 sm:py-3' : 'py-3 sm:py-4 md:py-5'
            }`}
          >
            {/* MOBILE LAYOUT (< 768px) */}
            <div className="md:hidden">
              {/* Top Row: Brand + Actions */}
              <div className="flex items-center justify-between gap-3 mb-3">
                {/* Compact Brand */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {company.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
                      {company.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[9px] font-medium">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Quick Actions */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowQuickActions(!showQuickActions)}
                      className="relative p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg active:scale-95 transition-all"
                      title="Quick Actions"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </button>

                    {/* Quick Actions Dropdown */}
                    {showQuickActions && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-fadeIn">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <h3 className="text-sm font-bold text-gray-900">Quick Actions</h3>
                        </div>
                        <button className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 active:bg-indigo-100 transition-colors flex items-center gap-3 text-left">
                          <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span>Export Data</span>
                        </button>
                        <button className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 active:bg-green-100 transition-colors flex items-center gap-3 text-left">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          <span>Add Product</span>
                        </button>
                        <button className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 active:bg-purple-100 transition-colors flex items-center gap-3 text-left">
                          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                          </svg>
                          <span>Analytics</span>
                        </button>
                        <button className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center gap-3 text-left">
                          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                          <span>Settings</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Notifications */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 rounded-xl bg-white border-2 border-gray-200 hover:border-indigo-400 shadow-md active:scale-95 transition-all"
                      title="Notifications"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-red-500 to-pink-500 rounded-full ring-2 ring-white flex items-center justify-center px-1">
                          <span className="text-white text-[10px] font-bold">{notifications.length}</span>
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl border-2 border-gray-200 z-50 animate-fadeIn max-h-[70vh] overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                              {notifications.length > 0 && (
                                <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                                  {notifications.length}
                                </span>
                              )}
                            </div>
                            <button 
                              onClick={() => setShowNotifications(false)}
                              className="p-1 hover:bg-white rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {notifications.length > 0 ? (
                          <div className="divide-y divide-gray-100 max-h-[50vh] overflow-y-auto">
                            {notifications.map((notif) => (
                              <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                                <div className="flex items-start gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    notif.type === 'success' ? 'bg-green-100' :
                                    notif.type === 'warning' ? 'bg-yellow-100' :
                                    'bg-blue-100'
                                  }`}>
                                    {notif.type === 'success' ? (
                                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    ) : notif.type === 'warning' ? (
                                      <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">{notif.message}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{notif.time}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-900">All caught up!</p>
                            <p className="text-xs text-gray-500 mt-0.5">No new notifications</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User Menu */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur flex items-center justify-center font-bold text-xs ring-2 ring-white/30">
                        A
                      </div>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* User Menu Dropdown */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 py-2 z-50 animate-fadeIn overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-indigo-50 to-purple-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white ring-4 ring-indigo-100">
                              A
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-900">Administrator</p>
                              <p className="text-xs text-gray-600 mt-0.5 truncate">admin@company.com</p>
                            </div>
                          </div>
                        </div>
                        <div className="py-2">
                          <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 active:bg-indigo-100 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                              <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="font-medium">Admin Panel</span>
                          </Link>
                          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="font-medium">Profile Settings</span>
                          </button>
                          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 active:bg-blue-100 transition-colors text-left">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                            </div>
                            <span className="font-medium">Messages</span>
                          </button>
                          <div className="border-t border-gray-100 mt-2 pt-2">
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors text-left">
                              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="font-medium">Sign Out</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Search Bar */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search products..."
                  className="w-full pl-11 pr-10 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-md text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Mobile Quick Stats */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {/* Products Stat */}
                <div className="flex items-center gap-2 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200/50 rounded-xl px-3 py-2 shadow-md flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Products</span>
                    <span className="text-base font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {totalProducts.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Categories Stat */}
                <div className="flex items-center gap-2 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200/50 rounded-xl px-3 py-2 shadow-md flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Categories</span>
                    <span className="text-base font-extrabold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                      {categories.length - 1}
                    </span>
                  </div>
                </div>

                {/* Active Users */}
                <div className="flex items-center gap-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/50 rounded-xl px-3 py-2 shadow-md flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg relative">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full ring-2 ring-blue-50"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Online</span>
                    <span className="text-base font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {activeUsers}
                    </span>
                  </div>
                </div>

                {/* Live Status */}
                <div className="flex items-center gap-2 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/50 rounded-xl px-3 py-2 shadow-md flex-shrink-0">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 ring-2 ring-green-200"></span>
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Status</span>
                    <span className="text-xs font-bold text-green-700">Live</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TABLET & DESKTOP LAYOUT (≥ 768px) */}
            <div className="hidden md:flex flex-col gap-3 sm:gap-4 overflow-visible">
              {/* Brand and Actions Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 overflow-visible">
                {/* Brand Section */}
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                  <div className="relative group">
                    <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-all duration-300 ${
                      isCompact ? 'opacity-0' : ''
                    }`}></div>
                    <div className={`relative rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white font-bold shadow-xl ring-4 ring-white/50 group-hover:scale-105 transition-all duration-300 ${
                      isCompact ? 'w-8 h-8 text-base sm:w-10 sm:h-10 sm:text-lg' : 'w-10 h-10 text-lg sm:w-12 sm:h-12 sm:text-xl md:w-14 md:h-14 md:text-2xl'
                    }`}>
                      {company.name.charAt(0)}
                    </div>
                  </div>
                  <div className={`transition-all duration-300 ${isCompact ? 'space-y-0' : 'space-y-0.5 sm:space-y-1'}`}>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <h1 className={`font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent transition-all duration-300 ${
                        isCompact ? 'text-base sm:text-lg md:text-xl' : 'text-lg sm:text-xl md:text-2xl lg:text-3xl'
                      }`}>
                        {company.name}
                      </h1>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-sm transition-all duration-300 ${
                        isCompact ? 'text-[10px] scale-90' : 'text-[10px] sm:text-xs scale-90 sm:scale-100'
                      }`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm text-gray-600 flex items-center gap-1.5 sm:gap-2 transition-all duration-300 overflow-hidden ${
                      isCompact ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100 mt-0.5'
                    }`}>
                      <span className="truncate">{company.tagline}</span>
                      <span className="hidden md:inline text-gray-400">•</span>
                      <span className="hidden md:inline text-indigo-600 font-medium whitespace-nowrap">
                        {totalProducts.toLocaleString()} products
                      </span>
                    </p>
                  </div>
                </div>

                {/* INDUSTRY-LEVEL: Operational Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 text-sm overflow-visible">
                  {/* System Health Monitor - Enhanced Design */}
                  <div className={`hidden lg:flex items-center gap-2 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer group ${
                    systemHealth === 'healthy' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300/50 hover:border-green-400 hover:shadow-lg hover:shadow-green-100' :
                    systemHealth === 'warning' ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300/50 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-100' :
                    'bg-gradient-to-br from-red-50 to-rose-50 border-red-300/50 hover:border-red-400 hover:shadow-lg hover:shadow-red-100'
                  }`}>
                    <div className="relative">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        systemHealth === 'healthy' ? 'bg-green-500' :
                        systemHealth === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping ${
                        systemHealth === 'healthy' ? 'bg-green-400' :
                        systemHealth === 'warning' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">API</span>
                      <span className={`text-sm font-bold ${
                        systemHealth === 'healthy' ? 'text-green-700' :
                        systemHealth === 'warning' ? 'text-yellow-700' :
                        'text-red-700'
                      }`}>
                        {apiResponseTime}ms
                      </span>
                    </div>
                  </div>

                  {/* Active Users Counter - Enhanced Design */}
                  <div className="hidden sm:flex items-center gap-2 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300/50 hover:border-blue-400 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-100 cursor-pointer group">
                    <div className="relative">
                      <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full ring-2 ring-blue-50"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Online</span>
                      <span className="text-sm font-bold text-blue-700">{activeUsers}</span>
                    </div>
                  </div>

                  {/* Quick Actions Menu */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowQuickActions(!showQuickActions)}
                      className={`relative rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group ${
                        isCompact ? 'p-1.5 sm:p-2' : 'p-2 sm:p-2.5'
                      }`}
                      title="Quick Actions (⌘Q)"
                    >
                      <svg className={`group-hover:rotate-90 transition-transform duration-300 ${
                        isCompact ? 'w-4 h-4 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-5 sm:h-5'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </button>

                    {/* Quick Actions Dropdown */}
                    {showQuickActions && (
                      <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-fadeIn">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900">Quick Actions</h3>
                            <span className="text-xs text-gray-500">⌘Q</span>
                          </div>
                        </div>
                        <button className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 transition-colors flex items-center gap-3 text-left group">
                          <svg className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span>Export Data</span>
                        </button>
                        <button className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 transition-colors flex items-center gap-3 text-left group">
                          <svg className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          <span>Add Product</span>
                        </button>
                        <button className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 transition-colors flex items-center gap-3 text-left group">
                          <svg className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                          </svg>
                          <span>Analytics</span>
                        </button>
                        <button className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left group">
                          <svg className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                          <span>Settings</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Notifications Center - Enhanced Design */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`relative rounded-lg sm:rounded-xl bg-white border-2 border-gray-200 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 group ${
                        isCompact ? 'p-1.5 sm:p-2' : 'p-2 sm:p-2.5'
                      }`}
                      title="Notifications (⌘N)"
                    >
                      <svg className={`text-gray-600 group-hover:text-indigo-600 transition-all duration-300 group-hover:rotate-12 ${
                        isCompact ? 'w-4 h-4 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-5 sm:h-5'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full ring-2 ring-white flex items-center justify-center px-1.5 animate-pulse">
                          <span className="text-white text-xs font-bold">{notifications.length}</span>
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown - Enhanced Design */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 z-50 animate-fadeIn max-h-[500px] overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-gray-900">Notifications</h3>
                              {notifications.length > 0 && (
                                <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                                  {notifications.length}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded border border-gray-200">⌘N</span>
                          </div>
                        </div>
                        {notifications.length > 0 ? (
                          <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
                            {notifications.map((notif) => (
                              <div key={notif.id} className="px-5 py-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer group">
                                <div className="flex items-start gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${
                                    notif.type === 'success' ? 'bg-green-100' :
                                    notif.type === 'warning' ? 'bg-yellow-100' :
                                    'bg-blue-100'
                                  }`}>
                                    {notif.type === 'success' ? (
                                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    ) : notif.type === 'warning' ? (
                                      <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-900">{notif.message}</p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                      </svg>
                                      {notif.time}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-5 py-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-900">All caught up!</p>
                            <p className="text-xs text-gray-500 mt-1">No new notifications</p>
                          </div>
                        )}
                        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                          <button className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-colors">
                            Mark all as read
                          </button>
                          <button className="text-xs text-gray-600 hover:text-gray-700 font-medium hover:underline transition-colors">
                            View all
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile Menu - Enhanced Design */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className={`rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 flex items-center gap-1.5 sm:gap-2 md:gap-2.5 group ${
                        isCompact ? 'px-2 py-1.5 sm:px-3 sm:py-2' : 'px-2.5 py-2 sm:px-4 sm:py-2.5'
                      }`}
                    >
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center font-bold text-xs sm:text-sm ring-2 ring-white/30 group-hover:ring-white/50 transition-all">
                        A
                      </div>
                      <span className="hidden sm:inline text-xs sm:text-sm font-semibold">Admin</span>
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-180 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* User Menu Dropdown - Enhanced Design */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-3 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 py-2 z-50 animate-fadeIn overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-br from-indigo-50 to-purple-50">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-lg ring-4 ring-indigo-100">
                              A
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-900">Administrator</p>
                              <p className="text-xs text-gray-600 mt-0.5">admin@company.com</p>
                            </div>
                          </div>
                        </div>
                        <div className="py-2">
                          <Link href="/admin" className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group">
                            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="font-medium">Admin Panel</span>
                          </Link>
                          <button className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 transition-all duration-200 text-left group">
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="font-medium">Profile Settings</span>
                          </button>
                          <button className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 text-left group">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="font-medium">Help & Support</span>
                          </button>
                        </div>
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 text-left group">
                            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="font-semibold">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* TOP-LEVEL: Smart Search Bar + Quick Stats - ALWAYS VISIBLE */}
              <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1fr_auto] items-center">
                {/* Smart Search Bar - Enhanced Design */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500"></div>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 sm:left-4 pointer-events-none">
                      <svg className={`text-gray-400 group-hover:text-indigo-500 transition-colors duration-200 ${
                        isCompact ? 'w-4 h-4' : 'w-4 h-4 sm:w-5 sm:h-5'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      ref={searchInputRef}
                      id="search-top"
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Search products..."
                      className={`w-full rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300 ${
                        isCompact ? 'pl-10 pr-10 sm:pl-11 sm:pr-24 py-2.5 sm:py-3 text-sm' : 'pl-10 pr-10 sm:pl-12 sm:pr-28 py-3 sm:py-3.5 text-sm sm:text-base'
                      }`}
                      aria-label="Search products"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center gap-2">
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="search-clear-btn text-gray-400 hover:text-red-500 transition-all duration-200 p-1.5 hover:bg-red-50 rounded-lg group/clear"
                          aria-label="Clear search"
                        >
                          <svg className="w-4 h-4 group-hover/clear:rotate-90 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                      {isSearching ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 rounded-lg">
                          <svg className="animate-spin h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V2a10 10 0 00-9.95 9.05L4 12z"></path>
                          </svg>
                        </div>
                      ) : (
                        <kbd className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 shadow-sm hover:shadow transition-all duration-200 hover:scale-105">
                          <span className="text-gray-500">⌘</span>K
                        </kbd>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats - Enhanced Design */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Total Products Stat */}
                  <div className="stat-card-hover flex items-center gap-2 sm:gap-3 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200/50 hover:border-indigo-300 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-md hover:shadow-xl group cursor-pointer transition-all duration-300">
                    <div className="icon-bounce flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg group-hover:shadow-indigo-300 group-hover:scale-110 transition-all duration-300">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Products</span>
                      <span className="stat-number text-base sm:text-lg md:text-xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {totalProducts.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Categories Stat */}
                  <div className="stat-card-hover hidden sm:flex items-center gap-2 md:gap-3 bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 border-2 border-pink-200/50 hover:border-pink-300 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-md hover:shadow-xl group cursor-pointer transition-all duration-300">
                    <div className="icon-bounce flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 shadow-lg group-hover:shadow-pink-300 group-hover:scale-110 transition-all duration-300">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Categories</span>
                      <span className="stat-number text-base sm:text-lg md:text-xl font-extrabold bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600 bg-clip-text text-transparent">
                        {categories.length - 1}
                      </span>
                    </div>
                  </div>

                  {/* Live Status Indicator */}
                  <div className="hidden md:flex items-center gap-2 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/50 hover:border-green-300 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2.5 lg:py-3 shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 group">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 ring-2 ring-green-200"></span>
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</span>
                      <span className="text-xs sm:text-sm font-bold text-green-700">Live</span>
                    </div>
                  </div>
                </div>
              </div>
 
              
            </div>
          </div>
        </div>
      </header>

      {/* Show Header Button - Appears when header is hidden */}
      {!isHeaderVisible && isScrolled && (
        <button
          onClick={() => setIsHeaderVisible(true)}
          className="fixed top-0 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-b-xl shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2 animate-slideDown"
          aria-label="Show header"
          title="Show header (or scroll up / hover near top)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-sm font-medium">Show Header</span>
        </button>
      )}

      {/* Category Filter Section */}
      <div 
        className={`sticky z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm transition-all duration-300 ${
          isCompact ? 'top-[70px]' : 'top-[73px]'
        }`}
      >
        <div className="px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Categories:</span>
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  {category === 'all' ? '🏠 All Products' : `📦 ${category.charAt(0).toUpperCase() + category.slice(1)}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {!loading && products.length > 0 && (
        <div className="px-4 md:px-6 lg:px-8 py-4 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700">
                  Showing <span className="font-bold text-indigo-600">{products.length}</span> of{' '}
                  <span className="font-bold text-indigo-600">{totalProducts}</span> products
                </span>
              </div>
              {debouncedSearch && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1016.65 16.65z" />
                  </svg>
                  <span className="text-xs text-gray-600">Search: &quot;{debouncedSearch}&quot;</span>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Full Width */}
      <main className="px-4 md:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && !isInitialLoad && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
                <div className="relative w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded w-3/4"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded w-1/2"></div>
                  <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded w-full mt-3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center animate-bounce">
                <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-xl">🔍</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">No Products Found</h2>
            <p className="text-lg text-gray-600 mb-8">
              We couldn&apos;t find any products matching your criteria.
              <br />
              <span className="text-sm text-gray-500">Try adjusting your filters or search terms.</span>
            </p>
            {(debouncedSearch || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  handleCategorySelect('all');
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Reset All Filters
              </button>
            )}
          </div>
        ) : !loading && (
          <>
            {/* Product Grid - Full Width */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-300 hover:-translate-y-2 animate-[fadeIn_0.5s_ease-out]"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-48 object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-2"
                    />
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Stock badge */}
                    {product.inventory === 0 ? (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        Out of Stock
                      </div>
                    ) : product.inventory <= 5 ? (
                      <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        Low Stock
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        In Stock
                      </div>
                    )}

                    {/* Category badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-gray-200">
                      📦 {product.category}
                    </div>
                  </div>

                  <div className="p-4">
                    <h2 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-[2.5rem]">
                      {product.name}
                    </h2>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 min-h-[2rem]">
                      {product.description}
                    </p>

                    <div className="flex justify-between items-center mb-4">
                      {company.showPrices && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">Price</span>
                          <p className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            ${(product.price || 0).toFixed(2)}
                          </p>
                        </div>
                      )}
                      {product.inventory > 0 && (
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-500">Available</span>
                          <p className="text-sm font-semibold text-gray-700">{product.inventory} units</p>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/product/${product.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 group-hover:gap-3"
                    >
                      View Details
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 mb-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 bg-white rounded-2xl shadow-lg p-2 border border-gray-200">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm font-semibold hover:from-gray-200 hover:to-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="flex items-center gap-1 px-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                        const showPage = p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1);
                        const showEllipsis = (p === page - 2 && page > 3) || (p === page + 2 && page < totalPages - 2);

                        if (showEllipsis) {
                          return (
                            <span key={p} className="px-3 text-gray-400 font-bold">
                              ⋯
                            </span>
                          );
                        }

                        if (!showPage) return null;

                        return (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`min-w-[44px] h-11 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
                              p === page
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-110'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-105'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm font-semibold hover:from-gray-200 hover:to-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-600 bg-white px-6 py-2 rounded-full shadow-sm border border-gray-200">
                    Page <span className="font-bold text-indigo-600">{page}</span> of <span className="font-bold text-indigo-600">{totalPages}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 z-40 p-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/70 hover:scale-110 transition-all duration-300 group ${
          isScrolled ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <svg 
          className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-300" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse ring-2 ring-white"></span>
      </button>
    </div>
  );
}

