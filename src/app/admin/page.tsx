"use client";

import { useEffect, useState, useCallback } from "react";
import { Product } from "@/types/product";
import DashboardStats from "./_components/DashboardStats";
import CategoryAnalytics from "./_components/CategoryAnalytics";
import SearchFilterBar from "./_components/SearchFilterBar";
import ProductForm from "./_components/ProductForm";
import ProductGridView from "./_components/ProductGridView";
import ProductTableView from "./_components/ProductTableView";
import StockAlerts from "./_components/StockAlerts";
import CsvExport from "./_components/CsvExport";
import QuickActions from "./_components/QuickActions";
import { useToast } from "./_components/Toast";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface DashboardStatsData {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  hiddenCount: number;
  averagePrice: number;
}

interface CategoryAnalysis {
  name: string;
  count: number;
  totalValue: number;
  averagePrice: number;
  lowStockCount: number;
  percentage: number;
  color: string;
}

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: 0,
  imageUrl: "",
  qrCode: "",
  inventory: 0,
  category: "",
  hidden: false,
};

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortBy, setSortBy] = useState<"name" | "price" | "inventory" | "category">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [categoryAnalysis, setCategoryAnalysis] = useState<CategoryAnalysis[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  // ----- Data fetching -----
  const fetchProducts = useCallback(async (opts?: { search?: string; category?: string }) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: "1000", includeHidden: "true" });
      if (opts?.search) params.set("search", opts.search);
      if (opts?.category && opts.category !== "all") params.set("category", opts.category);
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
        setLastRefreshed(new Date().toLocaleTimeString());
        const cats = Array.from(
          new Set((data.products || []).map((p: Product) => (p.category || "").trim()).filter(Boolean))
        ) as string[];
        setAllCategories(cats);
      } else {
        addToast(data.error || "Failed to fetch products", "error");
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      addToast("Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Recalculate stats when products change
  useEffect(() => {
    if (products.length === 0) {
      setStats(null);
      setCategoryAnalysis([]);
      return;
    }
    calculateStatsAndCategories(products);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Refetch on debounced search / category change
  useEffect(() => {
    fetchProducts({
      search: debouncedSearch || undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
    });
  }, [debouncedSearch, selectedCategory, fetchProducts]);

  // ----- Stats calculation -----
  const calculateStatsAndCategories = (prods: Product[]) => {
    const totalProducts = prods.length;
    const totalValue = prods.reduce((s, p) => s + (typeof p.price === "number" ? p.price : 0) * p.inventory, 0);
    const lowStockCount = prods.filter((p) => p.inventory > 0 && p.inventory <= 5).length;
    const outOfStockCount = prods.filter((p) => p.inventory === 0).length;
    const hiddenCount = prods.filter((p) => p.hidden).length;
    const averagePrice = totalProducts > 0 ? prods.reduce((s, p) => s + (typeof p.price === "number" ? p.price : 0), 0) / totalProducts : 0;

    setStats({ totalProducts, totalValue, lowStockCount, outOfStockCount, hiddenCount, averagePrice });

    // Category analysis
    const catMap = new Map<string, Product[]>();
    prods.forEach((p) => {
      const cat = p.category || "Uncategorized";
      if (!catMap.has(cat)) catMap.set(cat, []);
      catMap.get(cat)!.push(p);
    });
    const analysis: CategoryAnalysis[] = Array.from(catMap.entries())
      .map(([name, catProds], i) => {
        const count = catProds.length;
        const catTotalValue = catProds.reduce((s, p) => s + (typeof p.price === "number" ? p.price : 0) * p.inventory, 0);
        const catAveragePrice = count > 0 ? catProds.reduce((s, p) => s + (typeof p.price === "number" ? p.price : 0), 0) / count : 0;
        const catLowStock = catProds.filter((p) => p.inventory > 0 && p.inventory <= 5).length;
        return {
          name,
          count,
          totalValue: catTotalValue,
          averagePrice: catAveragePrice,
          lowStockCount: catLowStock,
          percentage: (count / totalProducts) * 100,
          color: COLORS[i % COLORS.length],
        };
      })
      .sort((a, b) => b.count - a.count);
    setCategoryAnalysis(analysis);
  };

  // ----- CRUD -----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing ? { ...form, id: editing.id } : form;
      const res = await fetch("/api/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        addToast(
          editing ? `Product "${form.name}" updated successfully` : `Product "${form.name}" added successfully`,
          "success"
        );
        resetForm();
        fetchProducts({
          search: searchQuery || undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
        });
      } else {
        const err = await res.json();
        addToast(`Error: ${err.error}`, "error");
      }
    } catch (err) {
      console.error("Error saving product:", err);
      addToast("Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      qrCode: product.qrCode,
      inventory: product.inventory,
      category: product.category || "",
      hidden: product.hidden || false,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  // ----- Bulk actions -----
  const handleBulkAction = async (action: "hide" | "show") => {
    if (selectedProducts.length === 0) return;

    try {
      const label = action === "hide" ? "hidden" : "visible";
      addToast(`${action === "hide" ? "Hiding" : "Showing"} ${selectedProducts.length} products...`, "info", 2000);

      for (const productId of selectedProducts) {
        const product = products.find((p) => p.id === productId);
        if (!product) continue;
        await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...product, hidden: action === "hide" }),
        });
      }
      setSelectedProducts([]);
      addToast(`${selectedProducts.length} products ${label} successfully`, "success");
      fetchProducts({
        search: searchQuery || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
      });
    } catch (err) {
      console.error("Bulk action failed:", err);
      addToast("Bulk action failed", "error");
    }
  };

  // ----- Sorting -----
  const sortedProducts = [...products].sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;
    switch (sortBy) {
      case "price":
        aVal = a.price;
        bVal = b.price;
        break;
      case "inventory":
        aVal = a.inventory;
        bVal = b.inventory;
        break;
      case "category":
        aVal = a.category || "";
        bVal = b.category || "";
        break;
      default:
        aVal = (a.name || "").toLowerCase();
        bVal = (b.name || "").toLowerCase();
    }
    if (typeof aVal === "string") {
      return sortOrder === "asc" ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
    }
    return sortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  // ----- Selection -----
  const toggleSelection = (id: string) => {
    setSelectedProducts((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const selectAll = () => setSelectedProducts(products.map((p) => p.id));
  const clearSelection = () => setSelectedProducts([]);

  // ----- Helpers -----
  const lowStockCount = products.filter((p) => p.inventory > 0 && p.inventory <= 5).length;
  const outOfStockCount = products.filter((p) => p.inventory === 0).length;
  const healthScore = products.length > 0
    ? Math.round(((products.length - lowStockCount - outOfStockCount) / products.length) * 100)
    : 0;

  // ----- Loading state -----
  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden shrink-0 ring-1 ring-white/20">
            <img src="/logo.svg" alt="eCatloge" className="h-full w-full object-contain p-1.5 brightness-0 invert" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-gray-500">Product catalog overview</p>
              {lastRefreshed && (
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                  Updated {lastRefreshed}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchProducts()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Catalog
          </Link>
        </div>
      </div>

      {/* Quick health summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={healthScore > 80 ? "#10b981" : healthScore > 50 ? "#f59e0b" : "#ef4444"} strokeWidth="3" strokeDasharray={`${(healthScore / 100) * 97.4} 97.4`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900">{healthScore}%</span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Catalog Health</p>
              <p className="text-sm font-semibold text-gray-900">
                {healthScore > 80 ? "Healthy" : healthScore > 50 ? "Needs Attention" : "Critical"}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-sm text-gray-600">
                <strong className="text-gray-900">{products.length - lowStockCount - outOfStockCount}</strong> In Stock
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-sm text-gray-600">
                <strong className="text-gray-900">{lowStockCount}</strong> Low Stock
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-sm text-gray-600">
                <strong className="text-gray-900">{outOfStockCount}</strong> Out of Stock
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
          </svg>
          {showForm ? "Close Form" : "Add Product"}
        </button>
      </div>

      {/* Stats */}
      {stats && <DashboardStats stats={stats} />}

      {/* Product form (slides in between stats and widgets) */}
      {showForm && (
        <div className="animate-slideDown">
          <ProductForm
            form={form}
            editing={editing}
            saving={saving}
            allCategories={allCategories}
            onSubmit={handleSubmit}
            onChange={handleFormChange}
            onCancel={resetForm}
          />
        </div>
      )}

      {/* Horizontal Quick Actions + CSV Export row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions
          onAddProduct={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          onOpenSettings={() => window.location.href = "/admin/settings"}
          productCount={products.length}
        />
        <CsvExport products={products} />
      </div>

      {/* Stock alerts + Category analytics row */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {stats && (lowStockCount > 0 || outOfStockCount > 0) && (
          <div className="xl:col-span-1">
            <StockAlerts products={products} />
          </div>
        )}
        <div className={stats && (lowStockCount > 0 || outOfStockCount > 0) ? "xl:col-span-3" : "xl:col-span-4"}>
          <CategoryAnalytics categories={categoryAnalysis} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* View toggles */}
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 transition-colors ${
                  viewMode === "grid" ? "bg-indigo-50 text-indigo-600" : "bg-white text-gray-400 hover:text-gray-600"
                }`}
                title="Grid view"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2.5 transition-colors ${
                  viewMode === "table" ? "bg-indigo-50 text-indigo-600" : "bg-white text-gray-400 hover:text-gray-600"
                }`}
                title="Table view"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <a
              href="/admin/settings"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </a>
          </div>

          {/* Bulk actions */}
          {selectedProducts.length > 0 && (
            <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl w-full lg:w-auto">
              <span className="text-xs font-semibold text-indigo-700">{selectedProducts.length} selected</span>
              <div className="h-4 w-px bg-indigo-200" />
              <button onClick={() => handleBulkAction("hide")} className="px-3 py-1 text-xs font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                Hide
              </button>
              <button onClick={() => handleBulkAction("show")} className="px-3 py-1 text-xs font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                Show
              </button>
              <button onClick={clearSelection} className="px-3 py-1 text-xs font-semibold bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search + filters */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        allCategories={allCategories}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderToggle={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
        totalResults={sortedProducts.length}
        isLoading={loading}
      />

      {/* Products */}
      {viewMode === "grid" ? (
        <ProductGridView
          products={sortedProducts}
          selectedProducts={selectedProducts}
          onToggleSelect={toggleSelection}
          onEdit={handleEdit}
        />
      ) : (
        <ProductTableView
          products={sortedProducts}
          selectedProducts={selectedProducts}
          onToggleSelect={toggleSelection}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          onEdit={handleEdit}
        />
      )}

      {/* Empty state */}
      {sortedProducts.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="mx-auto h-14 w-14 text-gray-300 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
          <p className="text-sm text-gray-500 mb-6">Get started by adding your first product to the catalog.</p>
          <button
            onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors text-sm shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>
      )}
    </div>
  );
}
