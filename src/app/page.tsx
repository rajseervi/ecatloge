'use client';

import { useEffect, useState } from 'react';
import { Product, ProductListResponse } from '@/types/product';
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from '@/types/company';
import Image from 'next/image';
import Link from 'next/link';
import CatalogHeader, { type CatalogHeaderConfig } from '@/components/CatalogHeader';
import SearchLoader from '@/components/SearchLoader';
import CatalogLoader from '@/components/CatalogLoader';
import { useScrollBehavior } from '@/hooks/useScrollBehavior';

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
  const [isSearching, setIsSearching] = useState(false);
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);

  const limit = 24;

  const { isScrolled } = useScrollBehavior();

  /* ── fetch company profile ── */
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

  /* ── debounce search ─────── */
  useEffect(() => {
    setIsSearching(true);
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
      setIsSearching(false);
    }, 300);
    return () => { clearTimeout(t); setIsSearching(false); };
  }, [searchTerm]);

  /* ── fetch products ──────── */
  useEffect(() => {
    const fetchProducts = async () => {
      if (page === 1) setLoading(true);

      try {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (selectedCategory !== 'all') params.set('category', selectedCategory);

        const res = await fetch(`/api/products?${params}`);
        const data: ProductListResponse = await res.json();

        if (res.ok && data.products) {
          setProducts(data.products);
          setTotalPages(data.totalPages || 1);
          setTotalProducts(data.total || 0);
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(['all', ...data.categories]);
          }
        } else {
          setProducts([]);
          setTotalPages(1);
          setTotalProducts(0);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, selectedCategory]);

  const handleSearchChange = (value: string) => setSearchTerm(value);
  const handleClearSearch = () => setSearchTerm('');

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
    setLoading(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const headerConfig: CatalogHeaderConfig = {
    companyName: company.name,
    tagline: company.tagline,
    totalProducts,
    searchTerm,
    isSearching,
    isScrolled,
  };

  /* ── loading screen ──────── */
  if (loading && isInitialLoad) {
    return <CatalogLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CatalogHeader
        config={headerConfig}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
      />

      {/* Category Filter */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider shrink-0">Categories</span>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-150 ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  {cat === 'all' ? 'All Products' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {!loading && products.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-900">{products.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{totalProducts}</span> products
              {debouncedSearch && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                  &ldquo;{debouncedSearch}&rdquo;
                </span>
              )}
            </p>
            <p className="text-xs text-gray-400">
              Page {page} of {totalPages}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderProducts()}
      </main>
    </div>
  );

  /* ================================================================ */
  /*  RENDER PRODUCTS                                                 */
  /* ================================================================ */
  function renderProducts() {
    // Loading skeleton (incremental) — polished search loader
    if (loading && !isInitialLoad) {
      return <SearchLoader count={limit} />;
    }

    // Empty state
    if (!loading && products.length === 0) {
      return (
        <div className="max-w-sm mx-auto text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">No products found</h2>
          <p className="text-sm text-gray-500 mb-6">Try adjusting your search or filters.</p>
          {(debouncedSearch || selectedCategory !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); handleCategorySelect('all'); }}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset filters
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-200"
            >
              <Link href={`/product/${product.id}`} className="block">
                <div className="relative overflow-hidden bg-gray-50">
                  <Image
                    src={product.imageUrl}
                    alt={product.name || "Product"}
                    width={300}
                    height={300}
                    className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                  {/* Stock badge */}
                  {product.inventory === 0 ? (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
                      Out of Stock
                    </div>
                  ) : product.inventory <= 5 ? (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
                      Low Stock
                    </div>
                  ) : null}
                  {/* Category label */}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded-md shadow-sm">
                    {product.category}
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h2 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
                    {product.name}
                  </h2>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-1">{product.description}</p>
                  <div className="flex items-center justify-between">
                    {company.showPrices && (
                      <p className="text-base font-bold text-gray-900">
                        ${(product.price || 0).toFixed(2)}
                      </p>
                    )}
                    {product.inventory > 0 && (
                      <p className="text-xs text-gray-400">{product.inventory} available</p>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-4 pt-4 pb-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const showPage = p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1);
                  const showEllipsis = (p === page - 2 && page > 3) || (p === page + 2 && page < totalPages - 2);
                  if (showEllipsis) return <span key={p} className="px-2 text-gray-300 text-sm">...</span>;
                  if (!showPage) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-all ${
                        p === page
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
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
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Page {page} of {totalPages}
            </p>
          </div>
        )}
      </div>
    );
  }
}
