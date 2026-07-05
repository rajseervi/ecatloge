"use client";

import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";

interface ProductGridViewProps {
  products: Product[];
  selectedProducts: string[];
  onToggleSelect: (id: string) => void;
  onEdit: (product: Product) => void;
}

function StockBadge({ inventory }: { inventory: number }) {
  if (inventory === 0) {
    return (
      <div className="absolute top-3 right-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
        Out of Stock
      </div>
    );
  }
  if (inventory <= 5) {
    return (
      <div className="absolute top-3 right-3 bg-amber-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
        Low Stock
      </div>
    );
  }
  return null;
}

export default function ProductGridView({
  products,
  selectedProducts,
  onToggleSelect,
  onEdit,
}: ProductGridViewProps) {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((product) => {
        const isSelected = selectedProducts.includes(product.id);
        return (
          <div
            key={product.id}
            className={`group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border ${
              isSelected ? "border-indigo-400 ring-2 ring-indigo-200" : "border-gray-100"
            }`}
          >
            {/* Image */}
            <div className="relative h-48 bg-gray-50">
              <Image
                src={product.imageUrl}
                alt={product.name || "Product image"}
                width={400}
                height={300}
                className="w-full h-full object-cover"
              />
              <StockBadge inventory={product.inventory} />
              {product.hidden && (
                <div className="absolute bottom-3 left-3 bg-gray-900/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Hidden
                </div>
              )}
              <label className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(product.id)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shadow-sm"
                />
              </label>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 truncate">{product.name}</h3>
                  {product.category && (
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full mt-1 uppercase tracking-wider">
                      {product.category}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xl font-bold text-emerald-600">${typeof product.price === "number" ? product.price.toFixed(2) : "0.00"}</p>
                  <p className="text-xs text-gray-500">
                    Stock: <span className="font-semibold text-gray-700">{product.inventory}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(product)}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Edit
                </button>
                <Link
                  href={`/product/${product.id}`}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-semibold transition-colors text-center"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
