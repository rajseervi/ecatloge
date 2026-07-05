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
          <div className="relative mx-auto mb-6 w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-indigo-500 animate-pulse shadow-[4px_4px_0px_0px_rgba(99,102,241,0.3)]" />
            <div className="absolute inset-2 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded-lg mx-auto animate-pulse" />
            <div className="h-3 w-24 bg-gray-100 rounded-lg mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ───── TOOLBAR ───── */}
      <div className="bg-white rounded-2xl border-2 border-gray-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)] p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Left side — brand + health */}
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] overflow-hidden ring-2 ring-white/10 shrink-0">
              <img src="/logo.svg" alt="eCatloge" className="h-full w-full object-contain p-1.5 brightness-0 invert" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
                {lastRefreshed && (
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                    {lastRefreshed}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-sm font-medium text-gray-500">Product catalog overview</p>
                <span className="text-xs font-bold text-gray-400">{products.length} products</span>
              </div>
            </div>

            {/* Health score pill */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 border-gray-200 bg-gray-50">
              <div className={`w-2.5 h-2.5 rounded-full ${
                healthScore > 80 ? "bg-emerald-500" : healthScore > 50 ? "bg-amber-500" : "bg-red-500"
              }`} />
              <span className="text-xs font-bold text-gray-700">{healthScore}% Health</span>
            </div>
          </div>

          {/* Right side — actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => fetchProducts()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? "Loading..." : "Refresh"}
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-900 text-sm font-bold text-gray-900 bg-white hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[1px] hover:translate-y-[1px]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Catalog
            </Link>
            <button
              onClick={() => { setShowForm((v) => !v); if (!showForm) window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 border-2 border-indigo-600 text-white font-bold text-sm shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] hover:shadow-[2px_2px_0px_0px_rgba(99,102,241,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
              </svg>
              {showForm ? "Close Form" : "Add Product"}
            </button>
          </div>
        </div>
      </div>

      {/* ───── STATS ───── */}
      {stats && <DashboardStats stats={stats} />}

      {/* ───── PRODUCT FORM ───── */}
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

      {/* ───── QUICK ACTIONS + CSV EXPORT ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions
          onAddProduct={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          onOpenSettings={() => window.location.href = "/admin/settings"}
          productCount={products.length}
        />
        <CsvExport products={products} />
      </div>

      {/* ───── STOCK ALERTS + CATEGORY ANALYTICS ───── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {(lowStockCount > 0 || outOfStockCount > 0) && (
          <div className="xl:col-span-1">
            <StockAlerts products={products} />
          </div>
        )}
        <div className={(lowStockCount > 0 || outOfStockCount > 0) ? "xl:col-span-3" : "xl:col-span-4"}>
          <CategoryAnalytics categories={categoryAnalysis} />
        </div>
      </div>

      {/* ───── SEARCH + FILTERS BAR ───── */}
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

      {/* ───── PRODUCTS VIEW ───── */}
      {viewMode === "grid" ? (
        <ProductGridView
          products={sortedProducts}
          selectedProducts={selectedProducts}
          onToggleSelect={toggleSelection}
        />
      ) : (
        <ProductTableView
          products={sortedProducts}
          selectedProducts={selectedProducts}
          onToggleSelect={toggleSelection}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
        />
      )}

      {/* ───── EMPTY STATE ───── */}
      {sortedProducts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-1">No products found</h3>
          <p className="text-sm font-medium text-gray-500 mb-6">Get started by adding your first product to the catalog.</p>
          <button
            onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 border-2 border-indigo-600 text-white font-bold text-sm shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] hover:shadow-[2px_2px_0px_0px_rgba(99,102,241,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>
      )}

      {/* ───── FLOATING MOBILE ACTION (switch view) ───── */}
      <div className="lg:hidden fixed bottom-20 right-6 z-20 flex flex-col gap-2">
        {selectedProducts.length > 0 && (
          <div className="bg-white border-2 border-gray-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.12)] p-3 mb-2 animate-fadeIn">
            <p className="text-xs font-bold text-gray-700 mb-2">{selectedProducts.length} selected</p>
            <div className="flex gap-2">
              <button onClick={() => handleBulkAction("hide")} className="px-3 py-1.5 text-xs font-bold bg-amber-400 border-2 border-amber-500 text-gray-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(217,119,6,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(217,119,6,0.3)] transition-all">
                Hide
              </button>
              <button onClick={() => handleBulkAction("show")} className="px-3 py-1.5 text-xs font-bold bg-emerald-400 border-2 border-emerald-500 text-gray-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(16,185,129,0.3)] transition-all">
                Show
              </button>
              <button onClick={clearSelection} className="px-3 py-1.5 text-xs font-bold bg-gray-200 border-2 border-gray-300 text-gray-700 rounded-lg">
                Clear
              </button>
            </div>
          </div>
        )}
        {/* View toggle */}
        <div className="bg-white border-2 border-gray-900 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,0.12)] overflow-hidden flex">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-3 transition-colors ${viewMode === "grid" ? "bg-indigo-500 text-white" : "text-gray-500"}`}
            aria-label="Grid view"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <div className="w-px bg-gray-200 my-2" />
          <button
            onClick={() => setViewMode("table")}
            className={`p-3 transition-colors ${viewMode === "table" ? "bg-indigo-500 text-white" : "text-gray-500"}`}
            aria-label="Table view"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
