"use client";

interface DashboardStatsData {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  hiddenCount: number;
  averagePrice: number;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
  iconColor: string;
  trend?: { direction: "up" | "down"; text: string };
}

function StatCard({ label, value, icon, borderColor, bgColor, iconColor, trend }: StatCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-md border-l-4 ${borderColor} p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-xs font-medium">
              <svg
                className={`w-3.5 h-3.5 ${trend.direction === "up" ? "text-green-500" : "text-red-500"}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={trend.direction === "up" ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"}
                />
              </svg>
              <span className={trend.direction === "up" ? "text-green-600" : "text-red-600"}>{trend.text}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardStats({ stats }: { stats: DashboardStatsData }) {
  const cards: StatCardProps[] = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      borderColor: "border-indigo-500",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: "Total Inventory Value",
      value: `$${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      borderColor: "border-emerald-500",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
    },
    {
      label: "Low Stock Items",
      value: stats.lowStockCount,
      borderColor: "border-amber-500",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      trend: stats.lowStockCount > 0 ? { direction: "up" as const, text: `${stats.lowStockCount} need attention` } : undefined,
    },
    {
      label: "Out of Stock",
      value: stats.outOfStockCount,
      borderColor: "border-red-500",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      trend: stats.outOfStockCount > 0 ? { direction: "up" as const, text: "Restock needed" } : undefined,
    },
    {
      label: "Hidden Products",
      value: stats.hiddenCount,
      borderColor: "border-gray-500",
      bgColor: "bg-gray-50",
      iconColor: "text-gray-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ),
    },
    {
      label: "Average Price",
      value: `$${stats.averagePrice.toFixed(2)}`,
      borderColor: "border-violet-500",
      bgColor: "bg-violet-50",
      iconColor: "text-violet-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  );
}
