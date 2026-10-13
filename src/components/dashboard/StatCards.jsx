import React from 'react';
import { DollarSign, ShoppingBag, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

export default function StatCards({ stats, currencySymbol = '$' }) {
  const cards = [
    {
      title: 'Total Sales',
      value: `${currencySymbol}${(stats?.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: "Today's Sales",
      value: `${currencySymbol}${(stats?.todayRevenue || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 text-blue-700',
    },
    {
      title: "Today's Orders",
      value: stats?.todayOrdersCount || 0,
      icon: ShoppingBag,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50 text-indigo-700',
    },
    {
      title: 'This Week',
      value: stats?.weekOrdersCount || 0,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50 text-purple-700',
    },
    {
      title: 'Avg Order Value',
      value: `${currencySymbol}${(stats?.averageOrderValue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-teal-500',
      lightColor: 'bg-teal-50 text-teal-700',
    },
    {
      title: 'Pending Tickets',
      value: stats?.pendingCount || 0,
      icon: Clock,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 text-amber-700',
      alert: stats?.pendingCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md"
          >
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                {card.title}
              </span>
              <div className="text-2xl font-black text-gray-900 mt-1 flex items-center gap-2">
                <span>{card.value}</span>
                {card.alert && (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
            </div>

            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.lightColor}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
