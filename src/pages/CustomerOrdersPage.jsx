import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  RefreshCw,
  Search,
  ExternalLink,
  Store,
  ChevronRight,
  AlertCircle,
  Phone,
  Home,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { normalizePhase5Status } from '../components/storefront/OrderStatusTracker';

export default function CustomerOrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'completed' | 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');

  // Manual guest lookup state
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupOrderNumber, setLookupOrderNumber] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  // Cancellation modal state
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [cancelProcessing, setCancelProcessing] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    setError('');

    try {
      if (user) {
        // Authenticated customer: fetch orders matching account
        const res = await api.get('/orders/customer/my-orders');
        if (res.success && Array.isArray(res.orders)) {
          setOrders(res.orders);
        } else {
          setOrders([]);
        }
      } else {
        // Guest customer: load saved order numbers from local storage
        const savedOrderNums = JSON.parse(
          localStorage.getItem('menufy_customer_orders') ||
          localStorage.getItem('foodflow_customer_orders') ||
          '[]'
        );

        if (savedOrderNums.length > 0) {
          const res = await api.post('/public/orders/guest-history', {
            orderNumbers: savedOrderNums,
          });
          if (res.success && Array.isArray(res.orders)) {
            setOrders(res.orders);
          } else {
            setOrders([]);
          }
        } else {
          setOrders([]);
        }
      }
    } catch (err) {
      console.warn('Could not load orders:', err);
      setError(err.message || 'Failed to fetch customer orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  // Handle manual guest lookup
  const handleManualLookup = async (e) => {
    e.preventDefault();
    if (!lookupPhone.trim() && !lookupOrderNumber.trim()) {
      alert('Please enter your contact phone or an order number.');
      return;
    }

    setLookupLoading(true);
    try {
      const orderNumbers = lookupOrderNumber.trim() ? [lookupOrderNumber.trim()] : [];
      const res = await api.post('/public/orders/guest-history', {
        orderNumbers,
        phone: lookupPhone.trim(),
      });

      if (res.success && Array.isArray(res.orders) && res.orders.length > 0) {
        // Merge with existing
        const existingIds = new Set(orders.map((o) => o._id));
        const newOrders = [...res.orders.filter((o) => !existingIds.has(o._id)), ...orders];
        setOrders(newOrders);
        alert(`Found ${res.orders.length} orders matching your details.`);
      } else {
        alert('No orders found matching the provided reference.');
      }
    } catch (err) {
      alert(err.message || 'Lookup failed.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Handle order cancellation
  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancellingOrder) return;

    setCancelProcessing(true);
    const safetyTimeout = setTimeout(() => {
      setCancelProcessing(false);
    }, 8000);

    try {
      const res = await api.patch(`/public/orders/${cancellingOrder.orderNumber}/cancel`, {
        reason: cancelReason,
        phone: cancellingOrder.customerInfo?.phone,
      });

      if (res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.orderNumber === cancellingOrder.orderNumber
              ? { ...o, status: 'Cancelled', cancellationReason: cancelReason }
              : o
          )
        );
        setCancellingOrder(null);
      } else {
        alert(res.message || 'Could not cancel order');
      }
    } catch (err) {
      alert(err.message || 'Order cannot be cancelled at this stage.');
    } finally {
      clearTimeout(safetyTimeout);
      setCancelProcessing(false);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const norm = normalizePhase5Status(o.status);

    // Tab filter
    if (activeTab === 'active') {
      if (['Order Received', 'Delivered', 'Cancelled', 'Rejected'].includes(norm)) {
        return false;
      }
    } else if (activeTab === 'completed') {
      if (!['Order Received', 'Delivered'].includes(norm)) return false;
    } else if (activeTab === 'cancelled') {
      if (!['Cancelled', 'Rejected'].includes(norm)) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = o.orderNumber?.toLowerCase().includes(q);
      const matchRest = o.restaurantName?.toLowerCase().includes(q);
      const matchItem = o.items?.some((i) => i.name?.toLowerCase().includes(q));
      return matchNum || matchRest || matchItem;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Platform Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-orange-600/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block leading-none">
                Menu<span className="text-orange-500">Fy</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mt-1">
                Customer Orders Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3 text-xs font-bold">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white transition-colors"
            >
              Explore Restaurants
            </Link>
            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                Dashboard ({user.name?.split(' ')[0]})
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-400 mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Customer Order History</span>
            </div>
            <h1 className="text-3xl font-black text-white">Your Orders</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {user
                ? `Logged in as ${user.name} (${user.email})`
                : 'Showing orders placed from this device. Enter your phone number below to lookup older orders.'}
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
            <span>Refresh Orders</span>
          </button>
        </div>

        {/* Guest Manual Lookup Box (if not signed in or looking up another number) */}
        {!user && (
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-white flex items-center gap-1.5">
                <Search className="w-4 h-4 text-orange-400" />
                <span>Find Orders by Phone or Reference Number</span>
              </span>
              <span className="text-[10px] text-slate-400">Guest Order Verification</span>
            </div>

            <form onSubmit={handleManualLookup} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <input
                type="tel"
                placeholder="Phone Number (e.g. +92 300 1234567)"
                value={lookupPhone}
                onChange={(e) => setLookupPhone(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              <input
                type="text"
                placeholder="Order Number (e.g. FF-202610...)"
                value={lookupOrderNumber}
                onChange={(e) => setLookupOrderNumber(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-xl transition-all disabled:opacity-50"
              >
                {lookupLoading ? 'Searching...' : 'Lookup Orders'}
              </button>
            </form>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs overflow-x-auto">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'active', label: 'In Progress' },
              { id: 'completed', label: 'Delivered' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by restaurant, item, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Orders List / Cards */}
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading your order history...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-white">No Orders Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `No orders matching "${searchQuery}".`
                : 'You have not placed any orders matching this filter yet.'}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs shadow-md transition-all"
            >
              <span>Explore Restaurants</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((ord) => {
              const normStatus = normalizePhase5Status(ord.status);
              const isCancellable = normStatus === 'Order Placed';
              const isCompleted = normStatus === 'Order Received' || normStatus === 'Delivered';
              const isCancelled = normStatus === 'Cancelled' || normStatus === 'Rejected';

              // Status badge styling
              const statusBadgeStyle = isCancelled
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : isCompleted
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-orange-500/10 text-orange-400 border-orange-500/30 animate-pulse';

              const orderDateStr = ord.createdAt
                ? new Date(ord.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recent Order';

              const currencySym = ord.currencySymbol || '$';

              return (
                <div
                  key={ord._id || ord.orderNumber}
                  className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl hover:border-slate-700 transition-all"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-lg text-white">
                        <Store className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-white">
                            {ord.restaurantName || 'MenuFy Restaurant'}
                          </h3>
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${statusBadgeStyle}`}
                          >
                            {normStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="font-mono text-orange-400 font-bold">
                            #{ord.orderNumber}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>{orderDateStr}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-lg font-black text-white">
                        {currencySym}{Number(ord.pricing?.total || 0).toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        {ord.paymentMethod?.replace(/_/g, ' ') || 'Cash on Delivery'}
                      </div>
                    </div>
                  </div>

                  {/* Items Snapshot */}
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Ordered Items:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {ord.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5"
                        >
                          <span className="font-extrabold text-orange-400">
                            {item.quantity}x
                          </span>
                          <span>{item.name}</span>
                          {item.selectedSize?.name && (
                            <span className="text-[10px] text-slate-500">
                              ({item.selectedSize.name})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Location & Notes */}
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">
                      {ord.orderType === 'delivery'
                        ? `Delivery to: ${ord.customerInfo?.address}`
                        : `Takeaway Pickup`}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
                    <div className="text-xs text-slate-400">
                      {ord.orderType === 'delivery' ? '🚴 Delivery' : '🥡 Counter Pickup'}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Cancel Button (Only when allowed in Phase 5 workflow) */}
                      {isCancellable && (
                        <button
                          type="button"
                          onClick={() => setCancellingOrder(ord)}
                          className="px-3.5 py-2 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 hover:bg-rose-900/60 font-bold text-xs transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}

                      {/* Live Tracking Link */}
                      <Link
                        to={`/order-status/${ord.orderNumber}`}
                        className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
                      >
                        <span>Live Status</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cancellation Confirmation Dialog */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Cancel Order #{cancellingOrder.orderNumber}?
                </h3>
                <p className="text-xs text-slate-400">Permitted prior to kitchen preparation</p>
              </div>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Change of plans">Change of plans</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Incorrect address entered">Incorrect address entered</option>
                  <option value="Need to change items">Need to change items</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelProcessing}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold disabled:opacity-50"
                >
                  {cancelProcessing ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
