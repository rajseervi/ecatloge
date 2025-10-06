'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { Product, ProductListResponse } from '@/types/product';
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from '@/types/company';
import Image from 'next/image';
import Link from 'next/link';

// Force dynamic rendering since this page fetches data on the client
export const dynamic = 'force-dynamic';

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
  const limit = 10; // Products per page (fits two rows of five)

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
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (debouncedSearch) {
          params.append('search', debouncedSearch);
        }

        if (selectedCategory && selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }

        const response = await fetch(`/api/products?${params.toString()}`, {
          headers: {
            'Cache-Control': 'no-store',
          },
        });
        const data: ProductListResponse = await response.json();
        if (response.ok && data.products) {
          if (data.company) {
            setCompany({ ...DEFAULT_COMPANY_PROFILE, ...data.company });
          }

          setProducts(data.products);
          setTotalPages(data.totalPages || 1);
          setTotalProducts(data.total || 0);
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(['all', ...data.categories]);
          } else {
            setCategories(['all']);
          }
        } else {
          setProducts([]);
          setTotalPages(1);
          setTotalProducts(0);
          setCategories(['all']);
          console.error('Failed to fetch products:', data.error, data.details ? `Details: ${data.details}` : '');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
        setCategories(['all']);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchProducts();
  }, [page, debouncedSearch, selectedCategory]);

  const handlePageChange = (newPage: number) => {
    setLoading(true);
    setPage(newPage);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
    setLoading(true);
  };

  if (loading && isInitialLoad) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading catalog...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Fixed Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 md:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Company Name */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {company.name.charAt(0)}
                </div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900 hidden sm:block">
                  {company.name}
                </h1>
              </div>
              <span className="hidden lg:block text-sm text-gray-500 border-l border-gray-300 pl-3">
                {company.tagline}
              </span>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search products..."
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-10 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  {isSearching ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1016.65 16.65z" />
                    </svg>
                  )}
                </span>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Right: Admin Link & Product Count */}
            <div className="flex items-center gap-4">
              <span className="hidden md:block text-sm font-medium text-gray-600">
                {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
              </span>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="border-t border-gray-200 bg-white px-4 md:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            {/* Category Filters */}
            {categories.map((category) => {
              const isActive = category === selectedCategory;
              const label = category === 'all' ? 'All' : category.replace(/\b\w/g, (char) => char.toUpperCase());
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}

            {/* Active Filter Badges */}
            {(selectedCategory !== 'all' || debouncedSearch) && (
              <>
                <div className="w-px h-6 bg-gray-300"></div>
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                    {selectedCategory}
                    <button
                      onClick={() => handleCategorySelect('all')}
                      className="hover:bg-indigo-200 rounded p-0.5 transition-colors"
                      aria-label="Clear category filter"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                )}
                {debouncedSearch && (
                  <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                    &quot;{debouncedSearch}&quot;
                    <button
                      onClick={() => setSearchTerm('')}
                      className="hover:bg-purple-200 rounded p-0.5 transition-colors"
                      aria-label="Clear search filter"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    handleCategorySelect('all');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium underline"
                >
                  Clear all
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Full Width */}
      <main className="px-4 md:px-6 lg:px-8 py-6">

        {/* Loading State */}
        {loading && !isInitialLoad && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-full mt-3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h2>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t find any products matching your criteria.
            </p>
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
        ) : !loading && (
          <>
            {/* Product Grid - Full Width */}
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
                    />
                    
                    {/* Stock badge */}
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
                    
                    {/* Category badge */}
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
                      {product.inventory > 0 && (
                        <p className="text-xs text-gray-600">{product.inventory} units</p>
                      )}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage = p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1);
                    const showEllipsis = (p === page - 2 && page > 3) || (p === page + 2 && page < totalPages - 2);
                    
                    if (showEllipsis) {
                      return (
                        <span key={p} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    
                    if (!showPage) return null;
                    
                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
