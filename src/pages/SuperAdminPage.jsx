import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  ExternalLink,
  Eye,
  RefreshCw,
  LogOut,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Activity,
  X,
  Clock,
  FileText,
  Utensils,
  Phone,
  Mail,
  User,
  Check,
  Ban,
  RotateCcw,
  Bike,
  TrendingUp,
  BarChart3,
  Filter,
  ShieldCheck,
  Info,
  ChevronRight,
  ChevronLeft,
  Truck,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, isSuperAdmin } from '../utils/api';

export default function SuperAdminPage() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();

  // Navigation tabs:
  // 'overview' | 'operations' | 'applications' | 'tenants' | 'riders' | 'reports' | 'users' | 'activity'
  const [activeTab, setActiveTab] = useState('overview');

  // Overview & Core Data States
  const [stats, setStats] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Date Range Filters for Platform Overview
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'all', 'today', '7d', '30d', 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Restaurant Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'active', 'rejected', 'suspended'
  const [publishedFilter, setPublishedFilter] = useState('all'); // 'all', 'true', 'false'
  const [restaurantPage, setRestaurantPage] = useState(1);
  const [restaurantTotal, setRestaurantTotal] = useState(0);

  // Inspect Restaurant Modal
  const [inspectedRestaurant, setInspectedRestaurant] = useState(null);
  const [loadingInspection, setLoadingInspection] = useState(false);

  // Status Action Modal for Restaurants (Approve, Reject, Suspend, Reactivate)
  const [actionTarget, setActionTarget] = useState(null); // { restaurant, action: 'approve' | 'reject' | 'suspend' | 'activate' }
  const [actionReason, setActionReason] = useState('');
  const [actionProcessing, setActionProcessing] = useState(false);

  // Rider Fleet Management State
  const [riders, setRiders] = useState([]);
  const [riderStatusFilter, setRiderStatusFilter] = useState('all');
  const [riderSearch, setRiderSearch] = useState('');
  const [actionRiderTarget, setActionRiderTarget] = useState(null); // { rider, action: 'approve' | 'reject' | 'suspend' | 'reactivate' }
  const [riderActionReason, setRiderActionReason] = useState('');
  const [riderActionProcessing, setRiderActionProcessing] = useState(false);

  // Deep Rider Inspection Modal (Assignment History & Disputes)
  const [inspectedRiderData, setInspectedRiderData] = useState(null);
  const [loadingRiderInspection, setLoadingRiderInspection] = useState(false);

  // Operational Monitoring State
  const [operationsData, setOperationsData] = useState(null);
  const [operationsLoading, setOperationsLoading] = useState(false);
  const [operationsQueueFilter, setOperationsQueueFilter] = useState('all'); // 'all', 'waiting', 'preparing', 'ready', 'active', 'exceptions', 'cancelled'

  // Reports & Analytics State
  const [reportsData, setReportsData] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('30d');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('all');

  // Users & Access Management State
  const [usersList, setUsersList] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState('all'); // 'all', 'customer', 'owner', 'rider', 'superadmin'
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);

  // Helper for logo initials monogram (No random food photos!)
  const getInitials = (name) => {
    if (!name) return 'MF';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Auth Guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (!isSuperAdmin(user)) {
        alert('Access denied: Super-Administrator privileges required.');
        navigate('/dashboard');
      }
    }
  }, [user, authLoading, navigate]);

  // Load Riders
  const loadRiders = async () => {
    try {
      const res = await api.get(
        `/admin/riders?status=${riderStatusFilter}&search=${encodeURIComponent(riderSearch)}`
      );
      if (res.success && Array.isArray(res.riders)) {
        setRiders(res.riders);
      }
    } catch (err) {
      console.warn('Failed to fetch riders:', err);
    }
  };

  // Load Primary Platform Data (Stats, Restaurants, Activity)
  const loadData = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      let statsQuery = `/admin/stats?period=${selectedPeriod}`;
      if (selectedPeriod === 'custom' && (customStartDate || customEndDate)) {
        statsQuery += `&startDate=${encodeURIComponent(customStartDate)}&endDate=${encodeURIComponent(customEndDate)}`;
      }

      let restQuery = `/admin/restaurants?search=${encodeURIComponent(search)}&status=${statusFilter}&published=${publishedFilter}&page=${restaurantPage}&limit=50`;

      const [statsRes, restRes, actRes] = await Promise.all([
        api.get(statsQuery).catch((err) => ({ success: false, error: err.message })),
        api.get(restQuery).catch((err) => ({ success: false, error: err.message })),
        api.get('/admin/activity?limit=50').catch((err) => ({ success: false, error: err.message })),
      ]);

      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      } else if (statsRes.error && !silent) {
        setFeedback({ type: 'error', message: `Stats error: ${statsRes.error}` });
      }

      if (restRes.success && restRes.restaurants) {
        setRestaurants(restRes.restaurants);
        setRestaurantTotal(restRes.total || restRes.restaurants.length);
      } else if (restRes.error && !silent) {
        setFeedback({ type: 'error', message: `Restaurants list error: ${restRes.error}` });
      }

      if (actRes.success && actRes.activities) {
        setActivities(actRes.activities);
      }

      await loadRiders();
    } catch (err) {
      console.warn('Superadmin data fetch error:', err.message);
      if (!silent) {
        setFeedback({ type: 'error', message: 'Failed to refresh data: ' + err.message });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load Operational Queues
  const loadOperations = async () => {
    setOperationsLoading(true);
    try {
      const res = await api.get('/admin/operations');
      if (res.success) {
        setOperationsData(res);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to fetch operational monitoring queues: ' + err.message });
    } finally {
      setOperationsLoading(false);
    }
  };

  // Load Reports & Performance Analytics
  const loadReports = async () => {
    setReportsLoading(true);
    try {
      let q = `/admin/reports?period=${reportPeriod}&status=${reportStatusFilter}`;
      if (reportPeriod === 'custom' && (reportStartDate || reportEndDate)) {
        q += `&startDate=${encodeURIComponent(reportStartDate)}&endDate=${encodeURIComponent(reportEndDate)}`;
      }
      const res = await api.get(q);
      if (res.success) {
        setReportsData(res);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to generate operational reports: ' + err.message });
    } finally {
      setReportsLoading(false);
    }
  };

  // Load Users Management List
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get(
        `/admin/users?role=${userRoleFilter}&search=${encodeURIComponent(userSearch)}&page=${userPage}&limit=25`
      );
      if (res.success && Array.isArray(res.users)) {
        setUsersList(res.users);
        setUsersTotal(res.total || res.users.length);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to fetch users: ' + err.message });
    } finally {
      setUsersLoading(false);
    }
  };

  // Initial and dependent data loading with auto-refresh interval
  useEffect(() => {
    if (user && isSuperAdmin(user)) {
      loadData(false);

      // Auto-polling interval every 12 seconds for real-time overview & operations
      const interval = setInterval(() => {
        loadData(true);
        if (activeTab === 'operations') {
          loadOperations();
        }
      }, 12000);

      return () => clearInterval(interval);
    }
  }, [user, search, statusFilter, publishedFilter, selectedPeriod, customStartDate, customEndDate, riderStatusFilter, riderSearch, restaurantPage, activeTab]);

  // Tab switch actions
  useEffect(() => {
    if (activeTab === 'operations') {
      loadOperations();
    } else if (activeTab === 'reports') {
      loadReports();
    } else if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, reportPeriod, reportStartDate, reportEndDate, reportStatusFilter, userRoleFilter, userSearch, userPage]);

  // Inspect Rider Details & Assignment History
  const handleInspectRider = async (riderId) => {
    setLoadingRiderInspection(true);
    try {
      const res = await api.get(`/admin/riders/${riderId}`);
      if (res.success) {
        setInspectedRiderData(res);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to inspect rider: ' + err.message });
    } finally {
      setLoadingRiderInspection(false);
    }
  };

  // Handle Rider Status Action (Approve, Reject, Suspend, Reactivate)
  const handleRiderStatusSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!actionRiderTarget || riderActionProcessing) return;
    setRiderActionProcessing(true);

    // Failsafe timer so the rider action button NEVER remains stuck in Processing state
    const safetyTimeout = setTimeout(() => {
      setRiderActionProcessing(false);
    }, 8000);

    try {
      const res = await api.patch(`/admin/riders/${actionRiderTarget.rider._id}/status`, {
        status: actionRiderTarget.action,
        reason: riderActionReason,
      });

      if (res && res.success) {
        setFeedback({
          type: 'success',
          message: res.message || 'Rider status updated successfully.',
        });
        setActionRiderTarget(null);
        setRiderActionReason('');
        await Promise.all([loadRiders(), loadData(true)]);
        if (inspectedRiderData && inspectedRiderData.rider?._id === actionRiderTarget.rider._id) {
          await handleInspectRider(actionRiderTarget.rider._id);
        }
      } else {
        throw new Error(res?.message || 'Failed to update rider status');
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Rider status update failed: ' + (err.message || 'Server error'),
      });
    } finally {
      clearTimeout(safetyTimeout);
      setRiderActionProcessing(false);
    }
  };

  // Detailed Restaurant Inspection
  const handleInspect = async (restId) => {
    if (loadingInspection) return;
    setLoadingInspection(true);
    try {
      const res = await api.get(`/admin/restaurants/${restId}`);
      if (res.success) {
        setInspectedRestaurant(res);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to inspect restaurant: ' + err.message });
    } finally {
      setLoadingInspection(false);
    }
  };

  // Open action modal for restaurants
  const openActionModal = (restaurant, action) => {
    setActionTarget({ restaurant, action });
    setActionReason('');
  };

  // Perform Restaurant status decision (approve, reject, suspend, activate)
  const handleStatusChange = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!actionTarget || actionProcessing) return;

    setActionProcessing(true);
    setFeedback({ type: '', message: '' });

    // Failsafe timer so the status button NEVER remains stuck in Processing state
    const safetyTimeout = setTimeout(() => {
      setActionProcessing(false);
    }, 8000);

    const action = actionTarget.action;
    let endpointStatus = 'active';

    if (action === 'approve') endpointStatus = 'approved';
    else if (action === 'reject') endpointStatus = 'rejected';
    else if (action === 'suspend') endpointStatus = 'suspended';
    else if (action === 'activate') endpointStatus = 'reactivate';

    try {
      const res = await api.patch(`/admin/restaurants/${actionTarget.restaurant._id}/status`, {
        status: endpointStatus,
        reason: actionReason.trim(),
      });

      if (res && res.success && res.restaurant) {
        const updated = res.restaurant;

        setRestaurants((prev) =>
          prev.map((r) => (String(r._id) === String(updated._id) ? { ...r, ...updated } : r))
        );

        if (res.activity) {
          setActivities((prev) => [res.activity, ...prev]);
        }

        if (inspectedRestaurant && String(inspectedRestaurant.restaurant._id) === String(updated._id)) {
          setInspectedRestaurant((prev) =>
            prev ? { ...prev, restaurant: { ...prev.restaurant, ...updated } } : null
          );
        }

        setFeedback({
          type: 'success',
          message:
            res.message ||
            `Restaurant ${updated.name} successfully updated to ${updated.status}.`,
        });

        setActionTarget(null);
        setActionReason('');
        await loadData(true);
      } else {
        throw new Error(res?.message || 'Failed to update restaurant status');
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Status update failed: ' + (err.message || 'Server error'),
      });
    } finally {
      clearTimeout(safetyTimeout);
      setActionProcessing(false);
    }
  };

  if (authLoading || (loading && !stats)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-300">
            Loading MenuFy Super Admin Control Center...
          </p>
        </div>
      </div>
    );
  }

  const pendingAppsCount = stats?.pendingCount || 0;
  const pendingRidersCount = stats?.pendingRiders || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/30">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white">MenuFy</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Super Admin
                </span>

                {/* Visible Pending Indicators */}
                {pendingAppsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('applications');
                      setStatusFilter('pending');
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition animate-pulse"
                  >
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{pendingAppsCount} Restaurant App{pendingAppsCount > 1 ? 's' : ''}</span>
                  </button>
                )}
                {pendingRidersCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('riders');
                      setRiderStatusFilter('pending');
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-orange-500/20 text-orange-300 border border-orange-500/40 hover:bg-orange-500/30 transition animate-pulse"
                  >
                    <Bike className="w-3 h-3 text-orange-400" />
                    <span>{pendingRidersCount} Rider App{pendingRidersCount > 1 ? 's' : ''}</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Platform Administration, Governance & Operational Analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-200">{user?.name}</div>
              <div className="text-[11px] text-slate-400">{user?.email}</div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
            >
              <span>Owner Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Real-time Status / Error Feedback Banner */}
        {feedback.message && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-lg transition-all animate-fade-in ${
              feedback.type === 'error'
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback({ type: '', message: '' })}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Header Controls & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Platform Administration Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live operational monitoring, multi-tenant governance, courier dispatch management, and operational analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                loadData(false);
                if (activeTab === 'operations') loadOperations();
                if (activeTab === 'reports') loadReports();
                if (activeTab === 'users') loadUsers();
              }}
              disabled={refreshing}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold hover:bg-slate-800 text-slate-300 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-rose-500' : ''}`}
              />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Live Data'}</span>
            </button>
          </div>
        </div>

        {/* Comprehensive Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {/* Overview */}
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Platform Overview</span>
          </button>

          {/* Operational Monitoring */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('operations');
              loadOperations();
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              activeTab === 'operations'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Operations & Dispatch</span>
            {operationsData?.counts?.deliveryExceptions > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 animate-pulse">
                {operationsData.counts.deliveryExceptions} Alert{operationsData.counts.deliveryExceptions > 1 ? 's' : ''}
              </span>
            )}
          </button>

          {/* Restaurant Applications */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('applications');
              setStatusFilter('pending');
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              activeTab === 'applications'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Restaurant Approvals</span>
            {pendingAppsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white text-rose-700">
                {pendingAppsCount}
              </span>
            )}
          </button>

          {/* All Restaurants / Tenants */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('tenants');
              setStatusFilter('all');
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              activeTab === 'tenants'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>All Restaurants ({stats?.totalRestaurants || 0})</span>
          </button>

          {/* Riders Fleet */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('riders');
              setRiderStatusFilter('all');
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              activeTab === 'riders'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Riders Fleet ({stats?.totalRiders || riders.length || 0})</span>
            {pendingRidersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 animate-pulse">
                {pendingRidersCount}
              </span>
            )}
          </button>

          {/* Reports & Analytics */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('reports');
              loadReports();
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              activeTab === 'reports'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics & Reports</span>
          </button>

          {/* User & Access Management */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('users');
              loadUsers();
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              activeTab === 'users'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & Access ({stats?.totalUsers || 0})</span>
          </button>

          {/* Audit History */}
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              activeTab === 'activity'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Audit History</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: PLATFORM OVERVIEW (REQUIREMENT 1)                      */}
        {/* ============================================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Date-Range Selector Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-slate-300">Metrics Time Range:</span>
                <span className="text-xs font-extrabold text-rose-400">{stats?.periodLabel || 'All Time'}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'All Time' },
                  { id: 'today', label: 'Today' },
                  { id: '7d', label: 'Last 7 Days' },
                  { id: '30d', label: 'Last 30 Days' },
                  { id: 'custom', label: 'Custom' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPeriod(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedPeriod === p.id
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}

                {selectedPeriod === 'custom' && (
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                    <span className="text-xs text-slate-500">to</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Core Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Total Registered Restaurants */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Restaurants
                  </span>
                  <Store className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-3xl font-black text-white">{stats?.totalRestaurants || 0}</div>
                <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-2 pt-1 border-t border-slate-800/80">
                  <span className="text-emerald-400 font-bold">{stats?.activeCount || 0} Active</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">{stats?.pendingCount || 0} Pending</span>
                  <span>•</span>
                  <span className="text-red-400 font-bold">{stats?.suspendedCount || 0} Suspended</span>
                </div>
              </div>

              {/* Total Registered Riders */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Registered Riders
                  </span>
                  <Bike className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-3xl font-black text-white">{stats?.totalRiders || 0}</div>
                <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-2 pt-1 border-t border-slate-800/80">
                  <span className="text-emerald-400 font-bold">{stats?.activeRiders || 0} Approved</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">{stats?.pendingRiders || 0} Pending</span>
                  <span>•</span>
                  <span className="text-red-400 font-bold">{stats?.suspendedRiders || 0} Suspended</span>
                </div>
              </div>

              {/* Orders in Range & Today */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Orders in Range
                  </span>
                  <ShoppingBag className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-black text-indigo-400">{stats?.ordersInPeriod ?? stats?.totalOrders ?? 0}</div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span>Today's Orders: <strong className="text-white">{stats?.ordersToday || 0}</strong></span>
                  <span>Total All Time: {stats?.totalOrders || 0}</span>
                </div>
              </div>

              {/* Gross Order Value (GOV) vs Completed Order Value (COV) */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Gross Order Value (GOV)
                  </span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-white">
                  ${(stats?.grossOrderValue ?? stats?.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>Completed Sales (COV): </span>
                  <strong className="text-emerald-400">
                    ${(stats?.completedOrderValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              {/* Cancellation & Rejection Metrics */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Cancellation Rate
                  </span>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-3xl font-black text-rose-400">
                  {stats?.cancellationRate ?? 0}%
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span>Cancelled: <strong className="text-white">{stats?.cancelledCount || 0}</strong></span>
                  <span>Rejected: <strong className="text-white">{stats?.rejectedCountOrders || stats?.orderRejectedCount || 0}</strong></span>
                </div>
              </div>

              {/* Platform Revenue / Truthful Commission Model */}
              <div className="bg-slate-900 border border-emerald-500/20 p-5 rounded-3xl space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Platform Commission
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-emerald-400">$0.00</div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span className="text-emerald-300 font-semibold">0% Direct-to-Kitchen Model:</span> 100% of order totals are settled directly with kitchens.
                </div>
              </div>

              {/* Total User Accounts */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Platform Users
                  </span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-3xl font-black text-white">{stats?.totalUsers || 0}</div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>Customers, restaurant owners, couriers, and administrators.</span>
                </div>
              </div>

              {/* Application Review Quick Access */}
              <div
                onClick={() => {
                  setActiveTab('applications');
                  setStatusFilter('pending');
                }}
                className="cursor-pointer bg-slate-900 border border-amber-500/30 hover:border-amber-500/70 p-5 rounded-3xl space-y-2 shadow-lg transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Pending Reviews
                  </span>
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                </div>
                <div className="text-3xl font-black text-amber-400">{pendingAppsCount + pendingRidersCount}</div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>Click to review pending partner & courier submissions.</span>
                </div>
              </div>
            </div>

            {/* Metric Definitions & Transparent Policy Banner */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <Info className="w-4 h-4 text-rose-400" />
                <span>Consistent Platform Metric Definitions</span>
              </div>
              <p>
                <strong>Gross Order Value (GOV):</strong> Cumulative value of all orders initiated on MenuFy during the selected period.
                <br />
                <strong>Completed Order Value (COV):</strong> Real monetary volume of orders successfully delivered and completed. Cancelled and rejected orders are strictly excluded from completed sales.
                <br />
                <strong>Platform Revenue:</strong> Accurately reflects MenuFy's 0% commission direct-to-kitchen model without invented metrics.
              </p>
            </div>

            {/* Recent Platform Activity Audit Snippet */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Recent Platform Activity</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('activity')}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <span>View Full Audit Log</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-800/80 text-xs">
                {(stats?.recentActivity || activities.slice(0, 5)).map((act, idx) => (
                  <div key={act._id || idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 text-xs">{act.type}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          {act.adminEmail || 'System'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{act.message}</p>
                    </div>
                    <span className="text-[11px] text-slate-500 whitespace-nowrap font-mono">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: OPERATIONAL MONITORING (REQUIREMENT 5)                 */}
        {/* ============================================================ */}
        {activeTab === 'operations' && (
          <div className="space-y-6 animate-fade-in">
            {/* Operational Queues Header & Counts */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Truck className="w-5 h-5 text-indigo-400" />
                    <span>Real-Time Operational Queues</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                      {operationsData?.counts?.totalActive || 0} in progress
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live server data and timestamps for active orders, courier assignments, and delivery exceptions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadOperations}
                  disabled={operationsLoading}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${operationsLoading ? 'animate-spin text-rose-500' : ''}`} />
                  <span>Refresh Queues</span>
                </button>
              </div>

              {/* Queue Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
                {[
                  { id: 'all', label: 'All Queues' },
                  { id: 'waiting', label: `Waiting Acceptance (${operationsData?.counts?.waitingAcceptance || 0})` },
                  { id: 'preparing', label: `Kitchen Preparing (${operationsData?.counts?.preparing || 0})` },
                  { id: 'ready', label: `Ready for Pickup (${operationsData?.counts?.readyUnassigned || 0})` },
                  { id: 'active', label: `Active Deliveries (${operationsData?.counts?.activeDeliveries || 0})` },
                  { id: 'exceptions', label: `Exceptions & Delays (${operationsData?.counts?.deliveryExceptions || 0})` },
                  { id: 'cancelled', label: `Cancelled / Rejected (${operationsData?.counts?.cancelledOrRejected || 0})` },
                ].map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setOperationsQueueFilter(q.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      operationsQueueFilter === q.id
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exceptions & Stale Courier Alerts Banner */}
            {operationsData?.counts?.deliveryExceptions > 0 && (
              <div className="p-4 bg-amber-500/15 border border-amber-500/30 rounded-3xl space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{operationsData.counts.deliveryExceptions} Delivery Exception(s) Detected</span>
                </div>
                <p className="text-xs text-amber-200/80">
                  Active deliveries in transit for over 45 minutes or experiencing telemetry delays require operational review.
                </p>
              </div>
            )}

            {/* Operational Queue Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filter helper */}
              {(() => {
                const q = operationsData?.queues || {};
                let items = [];
                if (operationsQueueFilter === 'waiting') items = q.waitingAcceptance || [];
                else if (operationsQueueFilter === 'preparing') items = q.preparing || [];
                else if (operationsQueueFilter === 'ready') items = q.readyUnassigned || [];
                else if (operationsQueueFilter === 'active') items = q.activeDeliveries || [];
                else if (operationsQueueFilter === 'exceptions') items = q.deliveryExceptions || [];
                else if (operationsQueueFilter === 'cancelled') items = q.cancelledOrRejected || [];
                else {
                  // 'all'
                  items = [
                    ...(q.deliveryExceptions || []),
                    ...(q.waitingAcceptance || []),
                    ...(q.preparing || []),
                    ...(q.readyUnassigned || []),
                    ...(q.activeDeliveries || []),
                    ...(q.cancelledOrRejected || []),
                  ];
                }

                if (items.length === 0) {
                  return (
                    <div className="col-span-full bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
                      No orders currently in this operational queue.
                    </div>
                  );
                }

                return items.map((order, idx) => {
                  const isException = Boolean(order.exceptionType);
                  return (
                    <div
                      key={order._id || idx}
                      className={`bg-slate-900 border rounded-3xl p-5 space-y-3 shadow-xl transition flex flex-col justify-between ${
                        isException ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-black text-rose-400">{order.orderNumber}</span>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                            order.status === 'Cancelled' || order.status === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : order.status.includes('Ready')
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : order.status.includes('Rider') || order.status === 'Out for Delivery'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          }`}>
                            {order.status}
                          </span>
                        </div>

                        {isException && (
                          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{order.message}</span>
                          </div>
                        )}

                        <div className="space-y-1 text-xs text-slate-300">
                          <div>
                            <span className="text-slate-500 text-[11px]">Restaurant: </span>
                            <strong className="text-white">{order.restaurantName}</strong>
                            {order.restaurantPhone && <span className="text-slate-400"> ({order.restaurantPhone})</span>}
                          </div>
                          <div>
                            <span className="text-slate-500 text-[11px]">Destination: </span>
                            <span className="text-slate-300">{order.customerAddress || 'Customer Address'}</span>
                          </div>
                          {order.customerPhone && (
                            <div>
                              <span className="text-slate-500 text-[11px]">Customer Tel: </span>
                              <span className="text-slate-300">{order.customerPhone}</span>
                            </div>
                          )}
                          {order.assignedRider && (
                            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 mt-1">
                              <Bike className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                              <span>Courier: <strong>{order.assignedRider.name}</strong> ({order.assignedRider.phone || 'No phone'})</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono text-[11px]">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="font-extrabold text-white text-sm">
                          ${Number(order.total || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3 & 4: RESTAURANT MANAGEMENT & APPLICATIONS              */}
        {/* ============================================================ */}
        {(activeTab === 'applications' || activeTab === 'tenants') && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Store className="w-5 h-5 text-rose-500" />
                    <span>
                      {activeTab === 'applications'
                        ? 'Restaurant Partner Applications & Review Queue'
                        : 'Tenant Directory & Restaurant Governance'}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {restaurantTotal} records
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Search by kitchen name, slug, cuisine, city, or owner account.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search restaurant, slug, owner, city..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-slate-800/80">
                <span className="text-slate-500 font-semibold text-[11px] uppercase mr-1">
                  View Filter:
                </span>
                {[
                  { id: 'all', label: `All Records (${stats?.totalRestaurants || 0})` },
                  { id: 'pending', label: `Pending Review (${stats?.pendingCount || 0})` },
                  { id: 'active', label: `Approved / Active (${stats?.activeCount || 0})` },
                  { id: 'rejected', label: `Rejected (${stats?.rejectedCount || 0})` },
                  { id: 'suspended', label: `Suspended (${stats?.suspendedCount || 0})` },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-xl font-extrabold capitalize transition-all ${
                      statusFilter === st.id
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Application / Tenant Cards List */}
              <div className="divide-y divide-slate-800/80 pt-2">
                {restaurants.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-xs">
                    No restaurants matching the selected criteria.
                  </div>
                ) : (
                  restaurants.map((r) => {
                    const isPending = r.status === 'pending';
                    const isRejected = r.status === 'rejected';
                    const isSuspended = r.status === 'suspended';
                    const isApproved = r.status === 'active' || r.status === 'approved';
                    const isInactive = isPending || isRejected || isSuspended;

                    return (
                      <div
                        key={r._id}
                        className={`py-4 px-3 rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isInactive
                            ? 'bg-slate-950/40 opacity-90 hover:opacity-100 hover:bg-slate-900/60'
                            : 'hover:bg-slate-850/60'
                        }`}
                      >
                        {/* Left: Logo Monogram & Details */}
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                            {r.logo ? (
                              <img
                                src={r.logo}
                                alt={`${r.name} logo`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-slate-200 font-extrabold text-sm tracking-wider">
                                {getInitials(r.name)}
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-sm text-white">
                                {r.name}
                              </span>
                              <span className="font-mono text-[11px] text-slate-400">
                                /{r.slug}
                              </span>

                              {/* Status Badges */}
                              {isPending && (
                                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  PENDING REVIEW
                                </span>
                              )}
                              {isApproved && (
                                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                  APPROVED & ACTIVE
                                </span>
                              )}
                              {isRejected && (
                                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                  REJECTED
                                </span>
                              )}
                              {isSuspended && (
                                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                                  SUSPENDED
                                </span>
                              )}

                              {/* Directory State */}
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  r.isPublished && isApproved
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {r.isPublished && isApproved ? 'Directory: Live' : 'Directory: Hidden'}
                              </span>
                            </div>

                            {/* Details metadata */}
                            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                              <span>Cuisine: <strong className="text-slate-300">{r.cuisine || 'General'}</strong></span>
                              <span>Owner: <strong className="text-slate-300">{r.owner?.name || 'Applicant'}</strong> ({r.owner?.email || r.email})</span>
                              {r.city && <span>• City: {r.city}</span>}
                              {r.branchCount !== undefined && <span>• Branches: {r.branchCount}</span>}
                              {r.totalOrders !== undefined && <span>• Orders: {r.totalOrders}</span>}
                            </div>

                            {/* Rejection / Suspension Reasons */}
                            {isRejected && r.rejectionReason && (
                              <div className="text-[11px] text-rose-300 bg-rose-950/40 border border-rose-900/60 p-2 rounded-xl mt-1">
                                <strong>Rejection Reason:</strong> "{r.rejectionReason}"
                              </div>
                            )}
                            {isSuspended && r.suspensionReason && (
                              <div className="text-[11px] text-red-300 bg-red-950/40 border border-red-900/60 p-2 rounded-xl mt-1">
                                <strong>Suspension Reason:</strong> "{r.suspensionReason}"
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Administrative Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Inspect Application */}
                          <button
                            type="button"
                            onClick={() => handleInspect(r._id)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Inspect Profile, Branches & Orders"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Open Storefront */}
                          <a
                            href={`/restaurant/${r.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Open Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {/* Approval / Rejection / Suspension / Reactivation */}
                          {isPending && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={actionProcessing}
                                onClick={() => openActionModal(r, 'approve')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition shadow-sm flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                disabled={actionProcessing}
                                onClick={() => openActionModal(r, 'reject')}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition shadow-sm flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}

                          {isApproved && (
                            <button
                              type="button"
                              disabled={actionProcessing}
                              onClick={() => openActionModal(r, 'suspend')}
                              className="px-3 py-1.5 rounded-xl bg-rose-600/20 border border-rose-500/40 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs transition"
                            >
                              Suspend
                            </button>
                          )}

                          {isSuspended && (
                            <button
                              type="button"
                              disabled={actionProcessing}
                              onClick={() => openActionModal(r, 'activate')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm flex items-center gap-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reactivate</span>
                            </button>
                          )}

                          {isRejected && (
                            <button
                              type="button"
                              disabled={actionProcessing}
                              onClick={() => openActionModal(r, 'approve')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-xs transition"
                            >
                              Re-review & Approve
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: RIDER FLEET MANAGEMENT (REQUIREMENT 3)                 */}
        {/* ============================================================ */}
        {activeTab === 'riders' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Bike className="w-5 h-5 text-orange-500" />
                    <span>Courier Fleet & Rider Governance</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {riders.length} riders
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Review applications, monitor delivery assignments, investigate disputes, and safely govern courier access.
                  </p>
                </div>

                {/* Rider Search Bar */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by rider name, email, phone, plate..."
                    value={riderSearch}
                    onChange={(e) => setRiderSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-slate-800/80">
                <span className="text-slate-500 font-semibold text-[11px] uppercase mr-1">
                  Fleet Filter:
                </span>
                {[
                  { id: 'all', label: 'All Fleet' },
                  { id: 'pending', label: `Pending Review (${stats?.pendingRiders || 0})` },
                  { id: 'approved', label: `Active / Approved (${stats?.activeRiders || 0})` },
                  { id: 'suspended', label: `Suspended (${stats?.suspendedRiders || 0})` },
                  { id: 'rejected', label: 'Rejected' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setRiderStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                      riderStatusFilter === st.id
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Riders Cards Grid */}
            {riders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
                No riders match the current status filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {riders.map((r) => {
                  const s = r.riderStatus || 'pending';
                  return (
                    <div
                      key={r._id}
                      className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-black text-sm">
                              {getInitials(r.name)}
                            </div>
                            <div>
                              <h3 className="font-extrabold text-white text-sm">{r.name}</h3>
                              <span className="text-[11px] text-slate-400 block">{r.city || 'Pakistan'}</span>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                              s === 'approved' || s === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : s === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                                : s === 'suspended'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {s}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-slate-400 bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-500">Contact:</span>
                            <span className="font-bold text-slate-300">{r.phone || 'No phone'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-500">Email:</span>
                            <span className="font-medium text-slate-300">{r.email}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-500">Vehicle:</span>
                            <span className="font-bold text-slate-300">
                              {r.vehicleType || 'Motorcycle'}{r.vehicleNumber ? ` (${r.vehicleNumber})` : ''}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-850">
                            <span className="text-[11px] text-slate-500">Dispatch Availability:</span>
                            <span className={`font-bold ${r.isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {r.isOnline ? '● Online & Ready' : '○ Offline'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                        {/* Inspect History & Disputes */}
                        <button
                          type="button"
                          onClick={() => handleInspectRider(r._id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Inspect Rider Deliveries & Dispute History"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {s === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setActionRiderTarget({ rider: r, action: 'approve' })}
                              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setActionRiderTarget({ rider: r, action: 'reject' })}
                              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 font-bold text-xs transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {(s === 'approved' || s === 'active') && (
                          <button
                            type="button"
                            onClick={() => setActionRiderTarget({ rider: r, action: 'suspend' })}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Suspend Courier</span>
                          </button>
                        )}

                        {s === 'suspended' && (
                          <button
                            type="button"
                            onClick={() => setActionRiderTarget({ rider: r, action: 'reactivate' })}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reactivate Courier</span>
                          </button>
                        )}

                        {s === 'rejected' && (
                          <button
                            type="button"
                            onClick={() => setActionRiderTarget({ rider: r, action: 'approve' })}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                          >
                            Re-approve Application
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: REPORTS & ANALYTICS (REQUIREMENT 6)                   */}
        {/* ============================================================ */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-rose-500" />
                    <span>Operational Performance Reports</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Comprehensive reporting on restaurant volume, completed deliveries, courier performance, and cancellation rates.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadReports}
                    disabled={reportsLoading}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${reportsLoading ? 'animate-spin text-rose-500' : ''}`} />
                    <span>Generate Report</span>
                  </button>
                </div>
              </div>

              {/* Period and Status Filters */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-500 font-bold uppercase text-[11px]">Range:</span>
                {['today', '7d', '30d', 'all', 'custom'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setReportPeriod(p)}
                    className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all ${
                      reportPeriod === p
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p}
                  </button>
                ))}

                {reportPeriod === 'custom' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={reportStartDate}
                      onChange={(e) => setReportStartDate(e.target.value)}
                      className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                    <span className="text-slate-500">to</span>
                    <input
                      type="date"
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                      className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                )}

                <div className="h-4 w-[1px] bg-slate-800 mx-2 hidden sm:block" />

                <span className="text-slate-500 font-bold uppercase text-[11px]">Status:</span>
                {[
                  { id: 'all', label: 'All Statuses' },
                  { id: 'delivered', label: 'Delivered / Fulfilled' },
                  { id: 'cancelled', label: 'Cancelled / Rejected' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setReportStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      reportStatusFilter === st.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tenant Isolation Policy Alert */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl text-xs text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Tenant Isolation Guarantee:</strong> Super Admin dashboard displays aggregated platform reporting. Restaurant owners can only access their own restaurant's reports via the owner portal.
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Report Period: {reportsData?.meta?.periodLabel || reportPeriod}</span>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1 shadow-lg">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Filtered Orders</span>
                <div className="text-2xl font-black text-white">{reportsData?.summary?.totalOrders || 0}</div>
              </div>
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1 shadow-lg">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Gross Order Value (GOV)</span>
                <div className="text-2xl font-black text-white">${(reportsData?.summary?.grossOrderValue || 0).toFixed(2)}</div>
              </div>
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1 shadow-lg">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Completed Sales (COV)</span>
                <div className="text-2xl font-black text-emerald-400">${(reportsData?.summary?.completedOrderValue || 0).toFixed(2)}</div>
              </div>
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1 shadow-lg">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Cancellation Rate</span>
                <div className="text-2xl font-black text-rose-400">{reportsData?.summary?.cancellationRate ?? 0}%</div>
              </div>
            </div>

            {/* Restaurant Performance Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-rose-500" />
                <span>Restaurant Performance Breakdown</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 uppercase text-[11px]">
                      <th className="py-3 px-2">Restaurant</th>
                      <th className="py-3 px-2">City</th>
                      <th className="py-3 px-2 text-right">Total Orders</th>
                      <th className="py-3 px-2 text-right">GOV</th>
                      <th className="py-3 px-2 text-right">Completed (COV)</th>
                      <th className="py-3 px-2 text-right">Delivered</th>
                      <th className="py-3 px-2 text-right">Cancelled</th>
                      <th className="py-3 px-2 text-right">Cancel Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {reportsData?.restaurantPerformance?.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500">
                          No restaurant order activity recorded in this period.
                        </td>
                      </tr>
                    ) : (
                      (reportsData?.restaurantPerformance || []).map((r) => (
                        <tr key={r.restaurantId} className="hover:bg-slate-850/40 transition">
                          <td className="py-3 px-2 font-bold text-white">{r.restaurantName}</td>
                          <td className="py-3 px-2 text-slate-400">{r.city}</td>
                          <td className="py-3 px-2 text-right font-mono font-bold text-slate-200">{r.totalOrders}</td>
                          <td className="py-3 px-2 text-right font-mono text-slate-300">${r.grossOrderValue.toFixed(2)}</td>
                          <td className="py-3 px-2 text-right font-mono font-bold text-emerald-400">${r.completedOrderValue.toFixed(2)}</td>
                          <td className="py-3 px-2 text-right text-emerald-400 font-bold">{r.deliveredOrders}</td>
                          <td className="py-3 px-2 text-right text-rose-400">{r.cancelledOrders}</td>
                          <td className="py-3 px-2 text-right font-bold text-slate-300">{r.cancellationRate}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rider Delivery Performance Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Bike className="w-4 h-4 text-orange-500" />
                <span>Courier Delivery Performance Breakdown</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 uppercase text-[11px]">
                      <th className="py-3 px-2">Courier</th>
                      <th className="py-3 px-2">City</th>
                      <th className="py-3 px-2">Vehicle</th>
                      <th className="py-3 px-2 text-right">Assigned</th>
                      <th className="py-3 px-2 text-right">Completed</th>
                      <th className="py-3 px-2 text-right">Cancelled</th>
                      <th className="py-3 px-2 text-right">Completion Rate</th>
                      <th className="py-3 px-2 text-right">Delivery Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {reportsData?.riderPerformance?.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500">
                          No courier delivery activity recorded in this period.
                        </td>
                      </tr>
                    ) : (
                      (reportsData?.riderPerformance || []).map((rd) => (
                        <tr key={rd.riderId} className="hover:bg-slate-850/40 transition">
                          <td className="py-3 px-2 font-bold text-white">{rd.riderName}</td>
                          <td className="py-3 px-2 text-slate-400">{rd.city}</td>
                          <td className="py-3 px-2 text-slate-400">{rd.vehicleType}</td>
                          <td className="py-3 px-2 text-right font-mono font-bold text-slate-200">{rd.totalAssigned}</td>
                          <td className="py-3 px-2 text-right text-emerald-400 font-bold">{rd.completedDeliveries}</td>
                          <td className="py-3 px-2 text-right text-rose-400">{rd.cancelledDeliveries}</td>
                          <td className="py-3 px-2 text-right font-bold text-emerald-400">{rd.completionRate}%</td>
                          <td className="py-3 px-2 text-right font-mono font-bold text-slate-200">${rd.totalDeliveryFee.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: USER & ACCESS MANAGEMENT (REQUIREMENT 4)              */}
        {/* ============================================================ */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    <span>User Accounts & Role Governance</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {usersTotal} accounts
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Role-based access enforcement for customers, restaurant owners, couriers, and administrators.
                  </p>
                </div>

                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by user name, email, phone..."
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Role Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-slate-800/80">
                <span className="text-slate-500 font-semibold text-[11px] uppercase mr-1">Role:</span>
                {[
                  { id: 'all', label: 'All Accounts' },
                  { id: 'customer', label: 'Customers' },
                  { id: 'owner', label: 'Restaurant Owners' },
                  { id: 'rider', label: 'Couriers / Riders' },
                  { id: 'superadmin', label: 'Super Administrators' },
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setUserRoleFilter(role.id);
                      setUserPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      userRoleFilter === role.id
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Backend Security & Role Integrity</span>
              </div>
              <p>
                Role permissions are validated and enforced in the server API. User passwords, hashes, and authorization tokens are strictly sanitized and never transmitted in administrative endpoints. Ordinary users and owners are blocked from self-promoting to privileged roles.
              </p>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 uppercase text-[11px]">
                      <th className="py-3 px-2">User</th>
                      <th className="py-3 px-2">Role</th>
                      <th className="py-3 px-2">Email</th>
                      <th className="py-3 px-2">Phone</th>
                      <th className="py-3 px-2">Joined Date</th>
                      <th className="py-3 px-2">Status / Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No user accounts matching the selected filter.
                        </td>
                      </tr>
                    ) : (
                      usersList.map((u) => {
                        const isSuper = ['superadmin', 'super_admin', 'super-admin', 'admin'].includes(u.role);
                        const isOwner = u.role === 'owner' || u.role === 'restaurant_owner';
                        const isRider = u.role === 'rider';
                        return (
                          <tr key={u._id} className="hover:bg-slate-850/40 transition">
                            <td className="py-3 px-2 font-bold text-white flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs">
                                {getInitials(u.name)}
                              </div>
                              <span>{u.name}</span>
                            </td>
                            <td className="py-3 px-2">
                              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                isSuper
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : isOwner
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : isRider
                                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              }`}>
                                {isSuper ? 'SUPER ADMIN' : u.role}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-slate-300 font-mono text-[11px]">{u.email}</td>
                            <td className="py-3 px-2 text-slate-400">{u.phone || '—'}</td>
                            <td className="py-3 px-2 text-slate-500 font-mono text-[11px]">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                            </td>
                            <td className="py-3 px-2 text-slate-400 text-[11px]">
                              {isRider && `Status: ${u.riderStatus || 'pending'}`}
                              {isOwner && (u.restaurantId ? 'Assigned Kitchen' : 'Independent Owner')}
                              {!isRider && !isOwner && 'Standard Customer'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Page {userPage} • {usersTotal} Total Users</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={userPage <= 1}
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={usersList.length < 25}
                    onClick={() => setUserPage((p) => p + 1)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 8: AUDIT TRAIL STREAM                                    */}
        {/* ============================================================ */}
        {activeTab === 'activity' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl animate-fade-in">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              <span>Administrative Audit Trail ({activities.length})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Immutable record of partner reviews, courier dispatch actions, suspensions, reactivations, and order reassignment operations.
            </p>

            <div className="space-y-3 pt-2">
              {activities.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No administrative actions recorded yet.
                </div>
              ) : (
                activities.map((act, i) => (
                  <div
                    key={act._id || i}
                    className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-rose-400 uppercase tracking-wider">
                        {act.type}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-200 font-medium">{act.message}</p>
                    <div className="text-[10px] text-slate-500 flex items-center gap-4">
                      {act.adminEmail && <span>Admin: {act.adminEmail}</span>}
                      {act.restaurantName && <span>Restaurant: {act.restaurantName}</span>}
                      {act.riderName && <span>Courier: {act.riderName}</span>}
                      {act.reason && <span>Reason: "{act.reason}"</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* MODAL 1: RIDER DEEP INSPECTION & DISPUTE INVESTIGATION       */}
      {/* ============================================================ */}
      {inspectedRiderData && (
        <div className="modal-overlay animate-fade-in" onClick={() => setInspectedRiderData(null)}>
          <div
            className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-black text-base">
                  {getInitials(inspectedRiderData.rider?.name)}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">
                    Courier Profile & History
                  </span>
                  <h3 className="text-xl font-black text-white">
                    {inspectedRiderData.rider?.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectedRiderData(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Courier Metrics */}
            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Total Assigned</span>
                <div className="text-lg font-black text-white mt-0.5">{inspectedRiderData.stats?.totalAssigned || 0}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Delivered</span>
                <div className="text-lg font-black text-emerald-400 mt-0.5">{inspectedRiderData.stats?.completedCount || 0}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Cancelled / Disputed</span>
                <div className="text-lg font-black text-rose-400 mt-0.5">{inspectedRiderData.stats?.cancelledCount || 0}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Delivery Fees</span>
                <div className="text-lg font-black text-emerald-400 mt-0.5">${(inspectedRiderData.stats?.totalDeliveryEarnings || 0).toFixed(2)}</div>
              </div>
            </div>

            {/* Delivery Assignment History List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-orange-400" />
                <span>Delivery Assignment History ({inspectedRiderData.deliveryHistory?.length || 0})</span>
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
                {inspectedRiderData.deliveryHistory?.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                    No deliveries have been assigned to this courier yet.
                  </div>
                ) : (
                  inspectedRiderData.deliveryHistory.map((del) => (
                    <div key={del._id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-white font-mono">{del.orderNumber}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          del.status === 'Delivered' || del.status === 'Order Received'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : del.status === 'Cancelled' || del.status === 'Rejected'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          {del.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Kitchen: {del.restaurantName}</span>
                        <span>Fee: ${Number(del.deliveryFee || 0).toFixed(2)}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">Destination: {del.customerAddress}</div>
                      {(del.cancellationReason || del.rejectionReason) && (
                        <div className="text-[10px] text-rose-300 bg-rose-950/40 p-1.5 rounded-lg border border-rose-900/60 mt-1">
                          <strong>Issue / Dispute Note:</strong> {del.cancellationReason || del.rejectionReason}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectedRiderData(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: RIDER ACTION CONFIRMATION MODAL                     */}
      {/* ============================================================ */}
      {actionRiderTarget && (
        <div className="modal-overlay animate-fade-in" onClick={() => setActionRiderTarget(null)}>
          <div
            className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Bike className="w-5 h-5 text-orange-500" />
                <span>
                  {actionRiderTarget.action === 'approve'
                    ? 'Approve Courier Application'
                    : actionRiderTarget.action === 'reject'
                    ? 'Reject Courier Application'
                    : actionRiderTarget.action === 'suspend'
                    ? 'Suspend Courier Account'
                    : 'Reactivate Courier Account'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setActionRiderTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {actionRiderTarget.action === 'approve' &&
                `Approving "${actionRiderTarget.rider.name}" will grant them courier dispatch access to log in to the Rider Portal, switch Online, and accept deliveries in ${actionRiderTarget.rider.city || 'their area'}.`}
              {actionRiderTarget.action === 'reject' &&
                `Rejecting "${actionRiderTarget.rider.name}" will decline their courier application.`}
              {actionRiderTarget.action === 'suspend' &&
                `Suspending "${actionRiderTarget.rider.name}" will immediately stop new assignments. Any active delivery currently assigned to this rider will be safely re-queued to Ready for Pickup so no customer order is lost.`}
              {actionRiderTarget.action === 'reactivate' &&
                `Reactivating "${actionRiderTarget.rider.name}" will restore their approved delivery privileges.`}
            </p>

            {(actionRiderTarget.action === 'reject' || actionRiderTarget.action === 'suspend') && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Reason for {actionRiderTarget.action}:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quality audit, expired vehicle registration, terms violation"
                  value={riderActionReason}
                  onChange={(e) => setRiderActionReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActionRiderTarget(null)}
                disabled={riderActionProcessing}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRiderStatusSubmit}
                disabled={riderActionProcessing}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-lg transition-all ${
                  actionRiderTarget.action === 'approve' || actionRiderTarget.action === 'reactivate'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    : actionRiderTarget.action === 'suspend'
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                }`}
              >
                {riderActionProcessing ? 'Processing...' : `Confirm ${actionRiderTarget.action}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: RESTAURANT ACTION CONFIRMATION MODAL                */}
      {/* ============================================================ */}
      {actionTarget && (
        <div className="modal-overlay animate-fade-in" onClick={() => setActionTarget(null)}>
          <div
            className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                {actionTarget.action === 'approve' && (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>Approve Partner Kitchen</span>
                  </>
                )}
                {actionTarget.action === 'reject' && (
                  <>
                    <XCircle className="w-5 h-5 text-rose-500" />
                    <span>Reject Partner Kitchen</span>
                  </>
                )}
                {actionTarget.action === 'suspend' && (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span>Suspend Restaurant Account</span>
                  </>
                )}
                {actionTarget.action === 'activate' && (
                  <>
                    <RotateCcw className="w-5 h-5 text-emerald-500" />
                    <span>Reactivate Suspended Restaurant</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setActionTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {actionTarget.action === 'approve' &&
                `Approving "${actionTarget.restaurant.name}" will set its status to Active, publish it in the MenuFy discovery directory, and enable customers to place live orders.`}
              {actionTarget.action === 'reject' &&
                `Rejecting "${actionTarget.restaurant.name}" will prevent it from going live or taking orders. The application and reason will be retained for review.`}
              {actionTarget.action === 'suspend' &&
                `Suspending "${actionTarget.restaurant.name}" will immediately stop new customer orders. Historical orders, tenant branches, and records will remain completely intact.`}
              {actionTarget.action === 'activate' &&
                `Reactivating "${actionTarget.restaurant.name}" will restore its active storefront and order intake.`}
            </p>

            {(actionTarget.action === 'reject' || actionTarget.action === 'suspend') && (
              <div className="space-y-1.5 text-xs">
                <label className="block font-bold text-slate-200">
                  {actionTarget.action === 'reject'
                    ? 'Rejection Reason (Informs Applicant):'
                    : 'Suspension Reason:'}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    actionTarget.action === 'reject'
                      ? 'e.g. Incomplete business address, unverifiable kitchen license...'
                      : 'e.g. Terms dispute, quality audit, maintenance...'
                  }
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={actionProcessing}
                onClick={() => setActionTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStatusChange}
                disabled={actionProcessing}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                  actionTarget.action === 'approve' || actionTarget.action === 'activate'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                }`}
              >
                {actionProcessing
                  ? 'Processing...'
                  : actionTarget.action === 'approve'
                  ? 'Confirm Approval'
                  : actionTarget.action === 'reject'
                  ? 'Confirm Rejection'
                  : actionTarget.action === 'suspend'
                  ? 'Confirm Suspension'
                  : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: DETAILED RESTAURANT INSPECTION MODAL                */}
      {/* ============================================================ */}
      {inspectedRestaurant && (
        <div className="modal-overlay animate-fade-in" onClick={() => setInspectedRestaurant(null)}>
          <div
            className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center shrink-0">
                  {inspectedRestaurant.restaurant.logo ? (
                    <img
                      src={inspectedRestaurant.restaurant.logo}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-slate-200 font-extrabold text-base">
                      {getInitials(inspectedRestaurant.restaurant.name)}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                    Restaurant Inspection
                  </span>
                  <h3 className="text-xl font-black text-white">
                    {inspectedRestaurant.restaurant.name}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectedRestaurant(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-200 font-bold">
                Cuisine: {inspectedRestaurant.restaurant.cuisine || 'General'}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-200 font-mono">
                Slug: /{inspectedRestaurant.restaurant.slug}
              </span>
              <span
                className={`px-3 py-1 rounded-full font-bold ${
                  inspectedRestaurant.restaurant.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : inspectedRestaurant.restaurant.status === 'pending'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                Status: {inspectedRestaurant.restaurant.status?.toUpperCase()}
              </span>
            </div>

            {/* Description */}
            {inspectedRestaurant.restaurant.description && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">
                  Kitchen Story / Description
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {inspectedRestaurant.restaurant.description}
                </p>
              </div>
            )}

            {/* Owner & Contact Details */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-slate-400 uppercase text-[11px] block">
                Owner Account & Location
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-500">Owner Name:</div>
                  <div className="font-bold text-white">
                    {inspectedRestaurant.owner?.name || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Owner Email:</div>
                  <div className="font-bold text-white">
                    {inspectedRestaurant.owner?.email || inspectedRestaurant.restaurant.email || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Phone:</div>
                  <div className="font-bold text-white">
                    {inspectedRestaurant.restaurant.phone || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">City:</div>
                  <div className="font-bold text-white">
                    {inspectedRestaurant.restaurant.city || 'N/A'}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-slate-500">Address:</div>
                  <div className="font-bold text-white">
                    {inspectedRestaurant.restaurant.address || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Total Orders</span>
                <div className="text-lg font-black text-white mt-0.5">
                  {inspectedRestaurant.metrics?.totalOrders || 0}
                </div>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Gross Volume</span>
                <div className="text-lg font-black text-emerald-400 mt-0.5">
                  ${(inspectedRestaurant.metrics?.totalRevenue || 0).toFixed(2)}
                </div>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Branches</span>
                <div className="text-lg font-black text-white mt-0.5">
                  {inspectedRestaurant.branches?.length || 0}
                </div>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Dishes</span>
                <div className="text-lg font-black text-white mt-0.5">
                  {inspectedRestaurant.metrics?.dishCount || 0}
                </div>
              </div>
            </div>

            {/* Fast Action Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setInspectedRestaurant(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>

              {inspectedRestaurant.restaurant.status === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      openActionModal(inspectedRestaurant.restaurant, 'reject');
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                  >
                    Reject Application
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openActionModal(inspectedRestaurant.restaurant, 'approve');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Approve Application
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
