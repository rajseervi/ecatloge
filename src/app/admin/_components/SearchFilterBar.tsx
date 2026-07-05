"use client";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  allCategories: string[];
  sortBy: "name" | "price" | "inventory" | "category";
  onSortByChange: (value: "name" | "price" | "inventory" | "category") => void;
  sortOrder: "asc" | "desc";
  onSortOrderToggle: () => void;
  totalResults: number;
  isLoading: boolean;
}

export default function SearchFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  allCategories,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderToggle,
  totalResults,
  isLoading,
}: SearchFilterBarProps) {
  const hasActiveFilters = selectedCategory !== "all" || searchQuery.trim().length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
      <div className="flex flex-col gap-4">
        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Filters:</span>
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                Category: {selectedCategory}
                <button onClick={() => onCategoryChange("all")} className="hover:text-indigo-900" aria-label="Clear category filter">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                Search: &ldquo;{searchQuery}&rdquo;
                <button onClick={() => onSearchChange("")} className="hover:text-purple-900" aria-label="Clear search">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            <button
              onClick={() => { onSearchChange(""); onCategoryChange("all"); }}
              className="text-xs text-gray-500 hover:text-gray-700 underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Search + Filters Row */}
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, description..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            {/* Category */}
            <div className="relative flex-1 lg:flex-none lg:w-44">
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white appearance-none transition-all cursor-pointer"
              >
                <option value="all">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Sort By */}
            <div className="relative flex-1 lg:flex-none lg:w-32">
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as "name" | "price" | "inventory" | "category")}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white appearance-none transition-all cursor-pointer"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="inventory">Stock</option>
                <option value="category">Category</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Sort Order */}
            <button
              onClick={onSortOrderToggle}
              className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors bg-gray-50"
              title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
            >
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-800">{totalResults}</span> product{totalResults !== 1 ? "s" : ""}
          {hasActiveFilters && <span className="text-gray-400"> (filtered)</span>}
        </div>
      </div>
    </div>
  );
}
