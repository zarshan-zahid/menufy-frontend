import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ExternalLink, Globe, AlertCircle, ShoppingBag, ArrowRight, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

import Sidebar from '../components/dashboard/Sidebar';
import StatCards from '../components/dashboard/StatCards';
import OrdersManager from '../components/dashboard/OrdersManager';
import MenuCategoryManager from '../components/dashboard/MenuCategoryManager';
import MenuItemManager from '../components/dashboard/MenuItemManager';
import WebsiteCustomizer from '../components/dashboard/WebsiteCustomizer';
import DeliveryManager from '../components/dashboard/DeliveryManager';
import CouponsManager from '../components/dashboard/CouponsManager';
import SettingsManager from '../components/dashboard/SettingsManager';
import BranchManager from '../components/dashboard/BranchManager';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, restaurant, loading: authLoading, refreshRestaurant } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const loadDashboardData = async () => {
    if (!restaurant) return;
    try {
      const [catsRes, itemsRes, statsRes] = await Promise.all([
        api.get(`/categories?restaurantId=${restaurant._id}`).catch(() => ({ categories: [] })),
        api.get(`/menu-items?restaurantId=${restaurant._id}`).catch(() => ({ items: [] })),
        api.get(`/orders/stats?restaurantId=${restaurant._id}`).catch(() => ({ stats: null })),
      ]);

      if (catsRes.categories) setCategories(catsRes.categories);
      if (itemsRes.items) setItems(itemsRes.items);
      if (statsRes.stats) setStats(statsRes.stats);
    } catch (e) {
      console.warn('Dashboard data fetch error:', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (restaurant) {
      loadDashboardData();

      // Auto-polling interval every 10 seconds to keep live metrics and trend synchronized
      const interval = setInterval(() => {
        loadDashboardData();
      }, 10000);

      return () => clearInterval(interval);
    } else if (!authLoading && user) {
      // User has no restaurant, refresh
      refreshRestaurant().then((r) => {
        if (!r) setLoadingData(false);
      });
    }
  }, [restaurant, user, authLoading]);

  if (authLoading || (loadingData && restaurant)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Loading your restaurant portal...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-600/20 text-orange-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">No Restaurant Found</h2>
          <p className="text-xs text-slate-400">
            You don't have a restaurant attached to this account yet.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="w-full py-3 bg-orange-600 hover:bg-orange-500 font-bold rounded-xl text-sm"
          >
            Create Restaurant Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        restaurant={restaurant}
        pendingOrdersCount={stats?.pendingCount || 0}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">
        {/* Top Bar on Mobile */}
        <div className="md:hidden flex items-center justify-between pb-3 border-b border-gray-200">
          <div className="font-bold text-sm text-gray-900">{restaurant.name}</div>
          <a
            href={`/restaurant/${restaurant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-orange-600 font-bold flex items-center gap-1"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Application Pending Review Banner & Details Card */}
        {restaurant?.status === 'pending' && (
          <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl text-amber-950 shadow-sm space-y-3 animate-fade-in">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="font-extrabold text-base text-amber-950">
                      Partner Application Under Review
                    </strong>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                      Pending Super Admin Approval
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mt-1 max-w-2xl leading-relaxed">
                    Thank you for applying to partner with MenuFy! Your application is in review by our platform administration team. While pending, your restaurant website is not live in the public directory and cannot accept customer orders.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-all"
              >
                Update Details
              </button>
            </div>

            {/* Application Summary Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-amber-200/60 text-xs">
              <div>
                <span className="text-[10px] text-amber-700 uppercase font-bold tracking-wider block">Restaurant</span>
                <span className="font-bold text-amber-950">{restaurant.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-amber-700 uppercase font-bold tracking-wider block">Cuisine</span>
                <span className="font-bold text-amber-950">{restaurant.cuisine || 'General'}</span>
              </div>
              <div>
                <span className="text-[10px] text-amber-700 uppercase font-bold tracking-wider block">City / Location</span>
                <span className="font-bold text-amber-950">{restaurant.city || 'Food City'}</span>
              </div>
              <div>
                <span className="text-[10px] text-amber-700 uppercase font-bold tracking-wider block">Store URL Slug</span>
                <span className="font-bold font-mono text-amber-900">/{restaurant.slug}</span>
              </div>
            </div>
          </div>
        )}

        {/* Application Rejected Banner */}
        {restaurant?.status === 'rejected' && (
          <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start justify-between gap-4 text-rose-950 shadow-sm animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <strong className="font-extrabold text-base text-rose-950">
                    Application Not Approved
                  </strong>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-900">
                    Rejected
                  </span>
                </div>
                <p className="text-rose-900">
                  Your restaurant partner application was reviewed and not approved by platform administration.
                </p>
                {restaurant.rejectionReason && (
                  <p className="p-2.5 bg-rose-100/70 rounded-xl text-xs font-semibold text-rose-950 border border-rose-200/60">
                    <strong>Admin Reason:</strong> "{restaurant.rejectionReason}"
                  </p>
                )}
                <p className="text-rose-700 font-medium pt-1">
                  You may update your permitted business information in Settings and contact platform support.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all"
            >
              Edit Profile
            </button>
          </div>
        )}

        {/* Suspended Account Warning Banner */}
        {restaurant?.status === 'suspended' && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-900 shadow-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="font-extrabold text-sm block text-rose-950">
                Restaurant Account Suspended by Platform Administration
              </strong>
              <p>
                Your storefront is currently hidden from public ordering and catalogue modifications are disabled.
                {restaurant.suspensionReason && (
                  <span className="block font-semibold mt-0.5">
                    Reason: "{restaurant.suspensionReason}"
                  </span>
                )}
              </p>
              <p className="text-rose-700 font-semibold">
                Please contact platform super administration at support@menufy.io to resolve this suspension.
              </p>
            </div>
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Here's a live overview of your orders and business metrics for{' '}
                <span className="font-bold text-gray-800">{restaurant.name}</span>.
              </p>
            </div>

            {/* Stat Cards */}
            <StatCards stats={stats} currencySymbol={restaurant.currencySymbol || '$'} />

            {/* 7-Day Sales Performance Visualizer */}
            {stats?.salesTrend && stats.salesTrend.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                      <span>7-Day Sales Trend & Demand</span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      Completed and active orders trend across the past 7 days
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                    7-Day Total: {restaurant.currencySymbol || '$'}{(stats?.weekRevenue || 0).toFixed(2)} ({stats?.weekOrdersCount || 0} orders)
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-2 pt-2">
                  {stats.salesTrend.map((day, idx) => {
                    const maxRev = Math.max(...stats.salesTrend.map((d) => d.revenue), 1);
                    const pct = Math.min(100, Math.max(12, Math.round((day.revenue / maxRev) * 100)));
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <span className="text-[11px] font-black text-gray-900">
                          {restaurant.currencySymbol || '$'}{day.revenue.toFixed(0)}
                        </span>
                        <div className="w-full bg-gray-100 rounded-xl h-24 flex items-end p-1">
                          <div
                            className="w-full rounded-lg transition-all"
                            style={{
                              height: `${pct}%`,
                              backgroundColor: day.revenue > 0 ? 'var(--primary)' : '#e2e8f0',
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-gray-600">{day.dayName}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">{day.ordersCount} ord</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Popular Dishes / Top Sellers */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                    <span className="text-base">🔥</span> Popular Menu Dishes
                  </h3>
                  <p className="text-xs text-gray-400">
                    Calculated from actual completed & active customer orders in database
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700">
                  {stats?.popularProducts?.length || 0} Ranked Dishes
                </span>
              </div>

              {stats?.popularProducts && stats.popularProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {stats.popularProducts.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </div>
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-gray-900 truncate">{p.name}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                          <span>{p.quantitySold} units sold</span>
                          <span>•</span>
                          <span className="font-semibold text-gray-800">
                            {restaurant.currencySymbol || '$'}{p.totalRevenue?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-gray-400 bg-gray-50/50 rounded-xl">
                  No sales data yet. Once customers place orders, your most popular dishes will appear here.
                </div>
              )}
            </div>

            {/* Active Orders Stream */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-gray-900">
                  Live Orders Stream
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
                >
                  <span>Full Order Management</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <OrdersManager
                restaurantId={restaurant._id}
                currencySymbol={restaurant.currencySymbol || '$'}
                onOrderUpdate={loadDashboardData}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Live Orders Dashboard</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Incoming orders auto-refresh every 10 seconds. Accept, advance cooking, dispatch, or reject.
              </p>
            </div>

            <OrdersManager
              restaurantId={restaurant._id}
              currencySymbol={restaurant.currencySymbol || '$'}
              onOrderUpdate={loadDashboardData}
            />
          </div>
        )}

        {/* Tab 3: Menu Management */}
        {activeTab === 'menu' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Menu Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage categories, dishes, prices, sizes, and extras. Changes reflect on your public storefront immediately.
              </p>
            </div>

            <MenuCategoryManager
              categories={categories}
              restaurantId={restaurant._id}
              onRefresh={loadDashboardData}
            />

            <MenuItemManager
              items={items}
              categories={categories}
              restaurantId={restaurant._id}
              currencySymbol={restaurant.currencySymbol || '$'}
              onRefresh={loadDashboardData}
            />
          </div>
        )}

        {/* Tab: Branches & Outlets */}
        {activeTab === 'branches' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Branches & Outlets</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage multiple locations, operating hours, and delivery / pickup fulfillment channels.
              </p>
            </div>

            <BranchManager restaurantId={restaurant._id} />
          </div>
        )}

        {/* Tab 4: Website Customizer */}
        {activeTab === 'customizer' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Website Customizer</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Select themes, fine-tune colors, configure headlines, preview live, and publish your store.
              </p>
            </div>

            <WebsiteCustomizer
              restaurant={restaurant}
              onRefresh={async () => {
                await refreshRestaurant();
                loadDashboardData();
              }}
            />
          </div>
        )}

        {/* Tab 5: Delivery & Hours */}
        {activeTab === 'delivery' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Delivery & Operating Hours</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Configure delivery policies, opening schedules, minimum order amounts, and custom delivery zones.
              </p>
            </div>

            <DeliveryManager
              restaurant={restaurant}
              onRefresh={async () => {
                await refreshRestaurant();
                loadDashboardData();
              }}
            />
          </div>
        )}

        {/* Tab 6: Coupons & Promos */}
        {activeTab === 'coupons' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Coupons & Promotions</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Create voucher codes with minimum spend amounts, usage limits, and expiration dates.
              </p>
            </div>

            <CouponsManager
              restaurantId={restaurant._id}
              currencySymbol={restaurant.currencySymbol || '$'}
            />
          </div>
        )}

        {/* Tab 7: Restaurant Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Restaurant Profile</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Business address, contact phone, support email, and currency symbols.
              </p>
            </div>

            <SettingsManager
              restaurant={restaurant}
              onRefresh={async () => {
                await refreshRestaurant();
                loadDashboardData();
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
