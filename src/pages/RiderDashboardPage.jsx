import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bike,
  UtensilsCrossed,
  Power,
  RefreshCw,
  LogOut,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  ExternalLink,
  AlertCircle,
  ShoppingBag,
  DollarSign,
  Star,
  ChevronRight,
  ShieldCheck,
  XCircle,
  HelpCircle,
  Radio,
  LocateFixed,
  ArrowRight,
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { emitRiderLocation } from '../utils/socket';

export default function RiderDashboardPage() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();

  // Rider state
  const [rider, setRider] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [completedDeliveries, setCompletedDeliveries] = useState([]);

  // Live GPS Telemetry state
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [lastCoords, setLastCoords] = useState(null);
  const watchIdRef = useRef(null);
  const lastSendTimeRef = useRef(0);

  // UI state
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'available' | 'history'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [claimingOrderNumber, setClaimingOrderNumber] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Auth Guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/rider/login');
      } else if (user.role !== 'rider') {
        navigate('/dashboard');
      }
    }
  }, [user, authLoading, navigate]);

  // Load Rider Profile & Orders
  const loadDashboardData = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      // 1. Fetch Profile
      const meRes = await api.get('/rider/me');
      if (meRes.success && meRes.rider) {
        setRider(meRes.rider);
        setIsOnline(Boolean(meRes.rider.isOnline));
      }

      // 2. Fetch My Deliveries (active & history)
      const myDelRes = await api.get('/rider/my-deliveries');
      if (myDelRes.success) {
        setActiveDelivery(myDelRes.activeDelivery || null);
        setCompletedDeliveries(myDelRes.completedDeliveries || []);
        if (myDelRes.activeDelivery && activeTab === 'available') {
          setActiveTab('active');
        }
      }

      // 3. Fetch Available Orders
      const availRes = await api.get('/rider/available-orders');
      if (availRes.success && Array.isArray(availRes.orders)) {
        setAvailableOrders(availRes.orders);
      }
    } catch (err) {
      console.error('Failed to load rider data:', err);
      if (err.isPending || err.isSuspended) {
        navigate('/rider/login');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'rider') {
      loadDashboardData();

      // Poll every 10 seconds for real-time dispatch synchronization
      const timer = setInterval(() => {
        loadDashboardData(true);
      }, 10000);

      return () => clearInterval(timer);
    }
  }, [user]);

  // Start real-time GPS watch
  const startGpsTracking = (orderNumber) => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    if (!orderNumber) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setGpsActive(true);
    setGpsError(null);

    try {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy || 10,
            updatedAt: new Date().toISOString(),
          };
          setLastCoords(coords);

          // Rate-limit telemetry transmission to every 3 seconds
          const now = Date.now();
          if (now - lastSendTimeRef.current >= 3000) {
            lastSendTimeRef.current = now;

            // 1. Emit over WebSocket
            emitRiderLocation({
              orderNumber,
              lat: coords.lat,
              lng: coords.lng,
              accuracy: coords.accuracy,
              isSharing: true,
              permissionDenied: false,
            });

            // 2. HTTP persistence fallback
            api.post(`/rider/orders/${orderNumber}/location`, {
              lat: coords.lat,
              lng: coords.lng,
              accuracy: coords.accuracy,
              isSharing: true,
              permissionDenied: false,
            }).catch(() => {});
          }
        },
        (err) => {
          console.warn('Rider GPS watch error:', err);
          if (err.code === 1) {
            // PERMISSION_DENIED
            setGpsError('GPS permission denied. Please allow location access in your browser to broadcast arrival.');
            setGpsActive(false);

            emitRiderLocation({
              orderNumber,
              permissionDenied: true,
              isSharing: false,
            });

            api.post(`/rider/orders/${orderNumber}/location`, {
              permissionDenied: true,
              isSharing: false,
            }).catch(() => {});
          } else {
            setGpsError(err.message || 'GPS signal unavailable.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 3000,
        }
      );

      watchIdRef.current = id;
    } catch (e) {
      setGpsError(e.message);
      setGpsActive(false);
    }
  };

  // Stop real-time GPS watch
  const stopGpsTracking = (orderNumber, notifyServer = true) => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsActive(false);

    if (notifyServer && orderNumber) {
      emitRiderLocation({
        orderNumber,
        isSharing: false,
      });

      api.post(`/rider/orders/${orderNumber}/location`, {
        isSharing: false,
      }).catch(() => {});
    }
  };

  // Lifecycle check for active deliveries & GPS
  useEffect(() => {
    const inTransitStatuses = [
      'Rider Picked Up Your Order',
      'Rider Is On The Way',
      'Rider Is At Your Doorstep',
    ];

    if (activeDelivery && inTransitStatuses.includes(activeDelivery.status)) {
      if (!gpsActive && !gpsError) {
        startGpsTracking(activeDelivery.orderNumber);
      }
    } else if (!activeDelivery || activeDelivery.status === 'Order Received') {
      if (gpsActive) {
        stopGpsTracking(activeDelivery?.orderNumber, true);
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [activeDelivery?.status, activeDelivery?.orderNumber]);

  // Availability Toggle
  const handleToggleOnline = async () => {
    setTogglingOnline(true);
    setFeedback({ type: '', message: '' });
    try {
      const nextStatus = !isOnline;
      const res = await api.patch('/rider/availability', { isOnline: nextStatus });
      if (res.success) {
        setIsOnline(res.isOnline);
        setFeedback({
          type: 'success',
          message: res.message,
        });
        await loadDashboardData(true);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setTogglingOnline(false);
    }
  };

  // Claim / Accept Delivery
  const handleAcceptDelivery = async (orderNumber) => {
    setClaimingOrderNumber(orderNumber);
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.post(`/rider/orders/${orderNumber}/accept`);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || `Delivery #${orderNumber} accepted!`,
        });
        setActiveTab('active');
        await loadDashboardData(true);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to accept delivery assignment.',
      });
      await loadDashboardData(true);
    } finally {
      setClaimingOrderNumber(null);
    }
  };

  // Advance Delivery Status
  const handleUpdateStatus = async (orderNumber, targetStatus) => {
    setUpdatingStatus(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.patch(`/rider/orders/${orderNumber}/status`, {
        status: targetStatus,
      });
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Delivery #${orderNumber} marked as '${targetStatus}'!`,
        });

        if (targetStatus === 'Order Received') {
          stopGpsTracking(orderNumber, true);
        } else if (
          ['Rider Picked Up Your Order', 'Rider Is On The Way', 'Rider Is At Your Doorstep'].includes(
            targetStatus
          )
        ) {
          startGpsTracking(orderNumber);
        }

        await loadDashboardData(true);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update delivery status.',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Release / Unassign Delivery before pickup
  const handleUnassign = async (orderNumber) => {
    const reason = prompt('Please enter a reason for releasing this delivery (e.g. vehicle issue, puncture):');
    if (!reason) return;

    stopGpsTracking(orderNumber, true);
    setUpdatingStatus(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.post(`/rider/orders/${orderNumber}/unassign`, { reason });
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Delivery #${orderNumber} released back to active fleet pool.`,
        });
        await loadDashboardData(true);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleLogout = () => {
    if (activeDelivery) {
      stopGpsTracking(activeDelivery.orderNumber, true);
    }
    logout();
    navigate('/rider/login');
  };

  if (loading && !rider) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white animate-pulse shadow-lg shadow-orange-600/30">
          <Bike className="w-6 h-6 animate-bounce" />
        </div>
        <p className="text-xs font-bold text-slate-400 mt-4">Connecting to FoodFlow Courier Fleet...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Network Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-black shadow-lg shadow-orange-600/25">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white leading-none">
                  Food<span className="text-orange-500">Flow</span>
                </span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Rider Hub
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
                {rider?.name} • {rider?.city} ({rider?.vehicleType || 'Motorcycle'})
              </span>
            </div>
          </div>

          {/* Right Controls: Availability Switch & Actions */}
          <div className="flex items-center gap-3">
            {/* Availability Pill */}
            <button
              type="button"
              onClick={handleToggleOnline}
              disabled={togglingOnline}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-sm ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnline ? 'bg-emerald-400 animate-pulse ring-2 ring-emerald-400/50' : 'bg-slate-500'
                }`}
              />
              <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => loadDashboardData()}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Refresh deliveries"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Sign Out */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-slate-800 text-rose-400 hover:bg-rose-500/20 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Feedback Alert */}
        {feedback.message && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback({ type: '', message: '' })}
              className="opacity-70 hover:opacity-100"
            >
              &times;
            </button>
          </div>
        )}

        {/* Quick Courier Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Fleet Status
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}
              />
              <span className={`text-base font-black ${isOnline ? 'text-emerald-400' : 'text-slate-400'}`}>
                {isOnline ? 'Online (Dispatched)' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              In-Progress Delivery
            </span>
            <div className="text-base font-black text-white">
              {activeDelivery ? (
                <span className="text-orange-400">#{activeDelivery.orderNumber}</span>
              ) : (
                <span className="text-slate-500">None Active</span>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Completed Deliveries
            </span>
            <div className="text-base font-black text-white flex items-center gap-1.5">
              <span>{rider?.totalDeliveries || completedDeliveries.length || 0}</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Verified
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Rider Rating
            </span>
            <div className="text-base font-black text-amber-400 flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{rider?.rating?.toFixed(1) || '5.0'}</span>
              <span className="text-[10px] text-slate-500 font-normal">/ 5.0</span>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="border-b border-slate-800 flex items-center space-x-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-3 transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'active'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Active Delivery</span>
            {activeDelivery && (
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('available')}
            className={`pb-3 px-3 transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'available'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Available Assignments</span>
            {availableOrders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-orange-500/20 text-orange-400 text-[10px]">
                {availableOrders.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-3 transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'history'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Delivery History ({completedDeliveries.length})</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE DELIVERY */}
        {activeTab === 'active' && (
          <div className="space-y-6">
            {activeDelivery ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                {/* Active Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        In-Progress Delivery
                      </span>
                      <span className="text-xs text-slate-400">Order #{activeDelivery.orderNumber}</span>
                    </div>
                    <h2 className="text-2xl font-black text-white mt-1">
                      {activeDelivery.restaurantName}
                    </h2>
                  </div>

                  {/* Stage Badge */}
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3 self-start sm:self-auto">
                    <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
                      <Bike className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Current Status</div>
                      <div className="text-xs font-black text-orange-400">{activeDelivery.status}</div>
                    </div>
                  </div>
                </div>

                {/* Pickup & Destination Routing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Step A: Kitchen Pickup */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold uppercase text-[10px] text-orange-400 tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> 1. Kitchen Pickup Location
                      </span>
                      {activeDelivery.restaurantPhone && (
                        <a
                          href={`tel:${activeDelivery.restaurantPhone}`}
                          className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call Kitchen</span>
                        </a>
                      )}
                    </div>
                    <div>
                      <div className="font-extrabold text-white text-sm">
                        {activeDelivery.restaurantName}
                      </div>
                      <div className="text-slate-400 mt-0.5 leading-relaxed">
                        {activeDelivery.restaurantAddress || 'Kitchen Address on File'}
                        {activeDelivery.restaurantCity ? `, ${activeDelivery.restaurantCity}` : ''}
                      </div>
                    </div>
                    {activeDelivery.restaurantAddress && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          activeDelivery.restaurantAddress + ' ' + (activeDelivery.restaurantCity || '')
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 pt-1"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate to Kitchen (Google Maps)</span>
                      </a>
                    )}
                  </div>

                  {/* Step B: Customer Destination */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold uppercase text-[10px] text-emerald-400 tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> 2. Customer Delivery Destination
                      </span>
                      {activeDelivery.customerInfo?.phone && (
                        <a
                          href={`tel:${activeDelivery.customerInfo.phone}`}
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call Customer</span>
                        </a>
                      )}
                    </div>
                    <div>
                      <div className="font-extrabold text-white text-sm">
                        {activeDelivery.customerInfo?.name || 'Customer'}
                      </div>
                      <div className="text-slate-400 mt-0.5 leading-relaxed">
                        {activeDelivery.customerInfo?.address || 'Delivery Address'}
                      </div>
                      {activeDelivery.customerInfo?.notes && (
                        <div className="text-amber-400/90 italic text-[11px] mt-1.5 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                          Instructions: "{activeDelivery.customerInfo.notes}"
                        </div>
                      )}
                      {activeDelivery.recipientInfo?.isGiftOrder && (
                        <div className="text-rose-400/90 text-[11px] mt-1.5 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                          Gift Order for: <strong>{activeDelivery.recipientInfo.recipientName}</strong> (
                          {activeDelivery.recipientInfo.recipientPhone})
                          {activeDelivery.recipientInfo.giftMessage && (
                            <div className="italic mt-0.5">"{activeDelivery.recipientInfo.giftMessage}"</div>
                          )}
                        </div>
                      )}
                    </div>
                    {activeDelivery.customerInfo?.address && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          activeDelivery.customerInfo.address
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 pt-1"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate to Customer (Google Maps)</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Items & Payment Summary */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="text-slate-400 uppercase text-[10px] font-bold">Dishes in Order</div>
                    <div className="font-bold text-white mt-0.5">
                      {activeDelivery.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 uppercase text-[10px] font-bold">Payment Method</div>
                    <div className="font-extrabold text-amber-400 text-sm mt-0.5">
                      Cash on Delivery: {activeDelivery.currencySymbol || '$'}
                      {activeDelivery.pricing?.total?.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Real-Time GPS Telemetry Panel (Phase 7) */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Radio className={`w-4 h-4 ${gpsActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        Live Courier GPS Sharing
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {gpsActive ? (
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          Streaming Real GPS
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          GPS Idle
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {gpsActive
                      ? 'Actual browser device coordinates are being streamed securely to the customer for Order #' +
                        activeDelivery.orderNumber +
                        '. GPS stops automatically once order is marked complete.'
                      : 'Live location updates allow the customer to view your arrival on the live map. Coordinates are never faked or simulated.'}
                  </p>

                  {lastCoords && (
                    <div className="flex flex-wrap items-center gap-3 text-[11px] bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-slate-300">
                      <div className="flex items-center gap-1 font-mono">
                        <LocateFixed className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{lastCoords.lat.toFixed(5)}, {lastCoords.lng.toFixed(5)}</span>
                      </div>
                      {lastCoords.accuracy && (
                        <span className="text-slate-400">• Accuracy: ±{Math.round(lastCoords.accuracy)}m</span>
                      )}
                      <span className="text-slate-400">• Updated: {new Date(lastCoords.updatedAt).toLocaleTimeString()}</span>
                    </div>
                  )}

                  {gpsError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>{gpsError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => startGpsTracking(activeDelivery.orderNumber)}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[11px] shrink-0 self-start sm:self-auto"
                      >
                        Retry GPS Permission
                      </button>
                    </div>
                  )}

                  <div className="pt-1 flex items-center gap-3">
                    {gpsActive ? (
                      <button
                        type="button"
                        onClick={() => stopGpsTracking(activeDelivery.orderNumber, true)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 transition-colors"
                      >
                        <span>Pause GPS Sharing</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startGpsTracking(activeDelivery.orderNumber)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all"
                      >
                        <LocateFixed className="w-3.5 h-3.5" />
                        <span>Share Device Location</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progressive Operational Action Stepper */}
                <div className="border-t border-slate-800 pt-6 space-y-4">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Required Delivery Action:
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Stage 1: Order is Ready for Pickup -> Confirm Pickup */}
                    {['Ready for Pickup', 'Ready', 'Rider Accepted'].includes(activeDelivery.status) && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(activeDelivery.orderNumber, 'Rider Picked Up Your Order')
                          }
                          disabled={updatingStatus}
                          className="flex-1 py-3.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Package className="w-4 h-4" />
                          <span>1. Confirm Pickup from Restaurant Kitchen</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUnassign(activeDelivery.orderNumber)}
                          disabled={updatingStatus}
                          className="py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 font-bold text-xs transition-colors"
                        >
                          Release Assignment
                        </button>
                      </>
                    )}

                    {/* Stage 2: Picked Up -> Depart for delivery */}
                    {activeDelivery.status === 'Rider Picked Up Your Order' && (
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(activeDelivery.orderNumber, 'Rider Is On The Way')
                        }
                        disabled={updatingStatus}
                        className="flex-1 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Bike className="w-4 h-4" />
                        <span>2. Depart Kitchen — On The Way to Customer</span>
                      </button>
                    )}

                    {/* Stage 3: On The Way -> At Doorstep */}
                    {activeDelivery.status === 'Rider Is On The Way' && (
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(activeDelivery.orderNumber, 'Rider Is At Your Doorstep')
                        }
                        disabled={updatingStatus}
                        className="flex-1 py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>3. Arrived at Customer Doorstep</span>
                      </button>
                    )}

                    {/* Stage 4: At Doorstep -> Complete Delivery & Collect Cash */}
                    {activeDelivery.status === 'Rider Is At Your Doorstep' && (
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(activeDelivery.orderNumber, 'Order Received')
                        }
                        disabled={updatingStatus}
                        className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>4. Complete Delivery & Confirm COD Payment</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <Truck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">No Active Delivery in Progress</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {isOnline
                      ? 'You are Online. Check "Available Assignments" to accept a new delivery ready for pickup!'
                      : 'You are currently Offline. Turn Online using the switch in the header to view and accept assignments.'}
                  </p>
                </div>
                {isOnline ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab('available')}
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-colors inline-flex items-center gap-2"
                  >
                    <span>View Available Assignments ({availableOrders.length})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleToggleOnline}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors inline-flex items-center gap-2"
                  >
                    <Power className="w-4 h-4" />
                    <span>Go Online Now</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AVAILABLE ASSIGNMENTS */}
        {activeTab === 'available' && (
          <div className="space-y-4">
            {!isOnline ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <Power className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-white">You Are Offline</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Live dispatch offers are delivered only to Online couriers. Switch online to see orders ready for pickup.
                </p>
                <button
                  type="button"
                  onClick={handleToggleOnline}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors inline-flex items-center gap-2"
                >
                  <Power className="w-4 h-4" />
                  <span>Switch Online</span>
                </button>
              </div>
            ) : activeDelivery ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <h3 className="text-base font-black text-white">Active Delivery in Progress</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Complete delivery #{activeDelivery.orderNumber} before claiming another order.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('active')}
                  className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs"
                >
                  Return to Active Delivery
                </button>
              </div>
            ) : availableOrders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-base font-black text-white">Listening for Ready Orders...</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  As soon as a restaurant kitchen in {rider?.city || 'your area'} marks an order "Ready for Pickup", it will stream here live.
                </p>
                <button
                  type="button"
                  onClick={() => loadDashboardData()}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Check Fleet Dispatch</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Ready for Pickup
                        </span>
                        <span className="text-xs text-slate-400 font-bold">
                          Fee: {order.currencySymbol || '$'}
                          {order.pricing?.deliveryFee?.toFixed(2)}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-black text-white">{order.restaurantName}</h4>
                        <div className="text-xs text-slate-400 mt-1 flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                          <span>Pickup: {order.restaurantAddress || 'Kitchen Address'}</span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1.5 flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Destination: {order.deliveryAddress}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Items: {order.itemCount} dish(es)</span>
                        <span className="font-bold text-white">Order #{order.orderNumber}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAcceptDelivery(order.orderNumber)}
                      disabled={claimingOrderNumber === order.orderNumber}
                      className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {claimingOrderNumber === order.orderNumber ? (
                        <span>Claiming Assignment...</span>
                      ) : (
                        <>
                          <span>Accept Delivery Assignment</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMPLETED HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-black text-white">Completed Delivery History</h3>
              <span className="text-xs text-slate-400 font-bold">
                Total: {completedDeliveries.length} completed
              </span>
            </div>

            {completedDeliveries.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No completed deliveries yet. Orders you finish will be cataloged here with timestamps.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {completedDeliveries.map((d) => (
                  <div key={d._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white">Order #{d.orderNumber}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                          {d.status}
                        </span>
                      </div>
                      <div className="text-slate-400 mt-1">
                        {d.restaurantName} &bull; Delivered to {d.customerInfo?.address || 'Customer'}
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <div className="font-bold text-emerald-400">
                        Total Collected: {d.currencySymbol || '$'}{d.pricing?.total?.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {new Date(d.createdAt).toLocaleDateString()} at{' '}
                        {new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
