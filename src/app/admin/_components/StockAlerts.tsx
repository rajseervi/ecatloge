"use client";

import { useState, useMemo } from "react";
import { Product } from "@/types/product";
import Link from "next/link";

interface StockAlertsProps {
  products: Product[];
}

type AlertTab = "low" | "out" | "hidden";

export default function StockAlerts({ products }: StockAlertsProps) {
  const [activeTab, setActiveTab] = useState<AlertTab>("low");

  const alertCounts = useMemo(() => ({
    low: products.filter((p) => p.inventory > 0 && p.inventory <= 5).length,
    out: products.filter((p) => p.inventory === 0).length,
    hidden: products.filter((p) => p.hidden).length,
  }), [products]);

  const filtered = useMemo(() => {
    switch (activeTab) {
      case "low":
        return products.filter((p) => p.inventory > 0 && p.inventory <= 5).sort((a, b) => a.inventory - b.inventory);
      case "out":
        return products.filter((p) => p.inventory === 0);
      case "hidden":
        return products.filter((p) => p.hidden);
    }
  }, [products, activeTab]);

  const tabs: { key: AlertTab; label: string; count: number; color: string }[] = [
    { key: "low", label: "Low Stock", count: alertCounts.low, color: "bg-amber-500" },
    { key: "out", label: "Out of Stock", count: alertCounts.out, color: "bg-red-500" },
    { key: "hidden", label: "Hidden", count: alertCounts.hidden, color: "bg-gray-500" },
  ];

  if (alertCounts.low === 0 && alertCounts.out === 0 && alertCounts.hidden === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="text-base font-bold text-gray-900">Stock Alerts</h3>
        </div>
        <Link
          href="/inventory"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          View Inventory →
        </Link>
      </div>

      {/* Alert tabs */}
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold transition-colors relative ${
              activeTab === tab.key
                ? "text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${tab.color}`} />
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === tab.key ? "bg-gray-100 text-gray-700" : "bg-gray-50 text-gray-400"
            }`}>
              {tab.count}
            </span>
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
            )}
          </button>
        ))}
      </div>

      {/* Alert items */}
      <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-gray-500">Nothing to show here</p>
          </div>
        ) : (
          filtered.slice(0, 15).map((product) => (
            <div key={product.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
              <div className="h-10 w-10 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'/%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-500">
                  {activeTab === "low" && `${product.inventory} remaining`}
                  {activeTab === "out" && "No stock available"}
                  {activeTab === "hidden" && `$${product.price.toFixed(2)} · ${product.inventory} in stock`}
                </p>
              </div>
              <div className="text-right shrink-0">
                {activeTab === "low" && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    product.inventory <= 2 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {product.inventory}
                  </span>
                )}
                {activeTab === "out" && (
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-red-50 text-red-700">0</span>
                )}
                {activeTab === "hidden" && (
                  <span className="text-xs font-medium text-gray-400">Hidden</span>
                )}
              </div>
              <Link
                href={`/product/${product.id}`}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 shrink-0"
              >
                View
              </Link>
            </div>
          ))
        )}
      </div>

      {filtered.length > 15 && (
        <div className="px-5 py-3 border-t border-gray-50 text-center">
          <Link href="/inventory" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
            View all {filtered.length} items
          </Link>
        </div>
      )}
    </div>
  );
}
