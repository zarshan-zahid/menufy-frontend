import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Palette,
  Clock,
  Tag,
  Settings,
  ExternalLink,
  LogOut,
  Globe,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, isSuperAdmin } from '../../utils/api';

export default function Sidebar({ activeTab, setActiveTab, restaurant, pendingOrdersCount = 0 }) {
  const { user, logout, refreshRestaurant } = useAuth();

  const handleTogglePublish = async () => {
    if (!restaurant) return;
    try {
      const res = await api.patch(`/restaurants/${restaurant._id}/publish`, {
        isPublished: !restaurant.isPublished,
      });
      if (res.success) {
        await refreshRestaurant();
      }
    } catch (e) {
      alert('Failed to update publish state: ' + e.message);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'orders',
      label: 'Live Orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
    },
    { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed },
    { id: 'branches', label: 'Branches & Outlets', icon: Building2 },
    { id: 'customizer', label: 'Website Customizer', icon: Palette },
    { id: 'delivery', label: 'Delivery & Hours', icon: Clock },
    { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
    { id: 'settings', label: 'Restaurant Profile', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col justify-between border-r border-slate-800">
      <div>
        {/* Restaurant Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3 mb-2">
            {restaurant?.logo ? (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/40"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center font-black text-sm text-slate-200 shadow-sm">
                {(restaurant?.name || 'MF')
                  .split(' ')
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
            <div className="truncate">
              <h2 className="font-extrabold text-sm text-white truncate">
                {restaurant?.name || 'My Restaurant'}
              </h2>
              <span className="text-[11px] text-slate-400 truncate block">
                {restaurant?.cuisine || 'MenuFy Portal'}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          {restaurant?.status && (
            <div className="mb-2">
              {restaurant.status === 'pending' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Application Pending Review
                </span>
              )}
              {restaurant.status === 'rejected' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  Application Rejected
                </span>
              )}
              {restaurant.status === 'suspended' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 border border-red-500/40 text-red-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Account Suspended
                </span>
              )}
              {(restaurant.status === 'active' || restaurant.status === 'approved') && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Approved Partner
                </span>
              )}
            </div>
          )}

          {/* Published / Unpublished Toggle Banner */}
          {restaurant && (
            <div className="mt-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    restaurant.isPublished && (restaurant.status === 'active' || restaurant.status === 'approved')
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-amber-400'
                  }`}
                />
                <span className="text-[11px] font-bold text-slate-300">
                  {restaurant.status === 'pending'
                    ? 'Pending Approval'
                    : restaurant.status === 'rejected'
                    ? 'Rejected'
                    : restaurant.isPublished
                    ? 'Published Live'
                    : 'Unpublished'}
                </span>
              </div>
              {restaurant.status === 'active' || restaurant.status === 'approved' ? (
                <button
                  type="button"
                  onClick={handleTogglePublish}
                  className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
                    restaurant.isPublished
                      ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}
                >
                  {restaurant.isPublished ? 'Unpublish' : 'Publish'}
                </button>
              ) : (
                <span className="text-[9px] font-semibold text-slate-500">
                  Locked
                </span>
              )}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Actions */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        {isSuperAdmin(user) && (
          <a
            href="/admin"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Super Admin Panel</span>
          </a>
        )}

        {restaurant?.slug && (
          <a
            href={`/restaurant/${restaurant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span>View Public Website</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        )}

        <div className="flex items-center justify-between pt-2 text-xs text-slate-400 px-1">
          <div className="truncate pr-2">
            <span className="font-bold text-slate-200 block truncate">{user?.name}</span>
            <span className="text-[10px] text-slate-500 block truncate">{user?.email}</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
