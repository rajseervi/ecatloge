"use client";

import { useEffect, useState, useCallback } from "react";
import { Product } from "@/types/product";
import DashboardStats from "./_components/DashboardStats";
import CategoryAnalytics from "./_components/CategoryAnalytics";
import SearchFilterBar from "./_components/SearchFilterBar";
import ProductForm from "./_components/ProductForm";
import ProductGridView from "./_components/ProductGridView";
import ProductTableView from "./_components/ProductTableView";

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
        const cats = Array.from(
          new Set((data.products || []).map((p: Product) => (p.category || "").trim()).filter(Boolean))
        ) as string[];
        setAllCategories(cats);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

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
        resetForm();
        fetchProducts({
          search: searchQuery || undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
        });
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Failed to save product");
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
  };

  const resetForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  // ----- Bulk actions -----
  const handleBulkAction = async (action: "hide" | "show") => {
    if (selectedProducts.length === 0) return;
    if (!confirm(`Are you sure you want to ${action} ${selectedProducts.length} products?`)) return;

    try {
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
      fetchProducts({
        search: searchQuery || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
      });
    } catch (err) {
      console.error("Bulk action failed:", err);
      alert("Bulk action failed");
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
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your product catalog and inventory</p>
      </div>

      {/* Stats */}
      {stats && <DashboardStats stats={stats} />}

      {/* Category analytics */}
      <CategoryAnalytics categories={categoryAnalysis} />

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
              </svg>
              {showForm ? "Close Form" : "Add Product"}
            </button>

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
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
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
            <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl">
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

      {/* Product form */}
      {showForm && (
        <ProductForm
          form={form}
          editing={editing}
          saving={saving}
          allCategories={allCategories}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          onCancel={resetForm}
        />
      )}

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
        <div className="text-center py-16">
          <div className="mx-auto h-14 w-14 text-gray-300 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
          <p className="text-sm text-gray-500 mb-6">Get started by adding your first product to the catalog.</p>
          <button
            onClick={() => setShowForm(true)}
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
