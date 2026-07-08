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
  color: string;
  gradient: string;
  trend?: { direction: "up" | "down"; text: string };
}

function StatCard({ label, value, icon, color, gradient, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${gradient}`}>
          <div className={color}>{icon}</div>
        </div>
        {trend && (
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
            trend.direction === "up" 
              ? "bg-emerald-50 text-emerald-600" 
              : "bg-red-50 text-red-600"
          }`}>
            {trend.text}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
      <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
      <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color.replace("text-", "bg-")}`} style={{ width: "30%" }} />
      </div>
    </div>
  );
}

export default function DashboardStats({ stats }: { stats: DashboardStatsData }) {
  const cards: StatCardProps[] = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      color: "text-indigo-600",
      gradient: "bg-indigo-50",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: "Total Value",
      value: `$${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: "text-emerald-600",
      gradient: "bg-emerald-50",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
    },
    {
      label: "Low Stock",
      value: stats.lowStockCount,
      color: "text-amber-600",
      gradient: "bg-amber-50",
      trend: stats.lowStockCount > 0 ? { direction: "up", text: "Alert" } : undefined,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      label: "Out of Stock",
      value: stats.outOfStockCount,
      color: "text-red-600",
      gradient: "bg-red-50",
      trend: stats.outOfStockCount > 0 ? { direction: "up", text: "Critical" } : undefined,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    {
      label: "Hidden",
      value: stats.hiddenCount,
      color: "text-slate-600",
      gradient: "bg-slate-100",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ),
    },
    {
      label: "Avg Price",
      value: `$${stats.averagePrice.toFixed(2)}`,
      color: "text-violet-600",
      gradient: "bg-violet-50",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  );
}
