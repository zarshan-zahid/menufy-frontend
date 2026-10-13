import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChefHat,
  Bike,
  PackageCheck,
  Eye,
  Calendar,
  Phone,
  MapPin,
  X,
} from 'lucide-react';
import { api } from '../../utils/api';

const STATUS_FILTERS = [
  'all',
  'Pending',
  'Confirmed',
  'Accepted',
  'Preparing',
  'Ready',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Rejected',
];

export default function OrdersManager({ restaurantId, currencySymbol = '$', onOrderUpdate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Reject modal state
  const [rejectingOrderId, setRejectingOrderId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingStatus, setProcessingStatus] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (restaurantId) queryParams.set('restaurantId', restaurantId);
      if (statusFilter !== 'all') queryParams.set('status', statusFilter);
      if (dateRange !== 'all') queryParams.set('dateRange', dateRange);
      if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());

      const res = await api.get(`/orders?${queryParams.toString()}`);
      if (res.success && res.orders) {
        setOrders(res.orders);
        // If an order is currently selected, update its reference
        if (selectedOrder) {
          const fresh = res.orders.find((o) => o._id === selectedOrder._id);
          if (fresh) setSelectedOrder(fresh);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Auto-polling interval every 10 seconds for real-time incoming orders
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [restaurantId, statusFilter, dateRange, searchQuery]);

  const handleUpdateStatus = async (orderId, newStatus, reason = '') => {
    setProcessingStatus(true);
    setProcessingOrderId(orderId);

    // Failsafe timer so buttons never remain stuck in Processing
    const safetyTimeout = setTimeout(() => {
      setProcessingStatus(false);
      setProcessingOrderId(null);
    }, 8000);

    try {
      const res = await api.patch(`/orders/${orderId}/status`, {
        restaurantId,
        status: newStatus,
        rejectionReason: reason,
      });

      if (res.success) {
        setRejectingOrderId(null);
        setRejectionReason('');
        await fetchOrders();
        if (typeof onOrderUpdate === 'function') {
          onOrderUpdate();
        }
      } else {
        alert(res.message || 'Failed to update order status');
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      clearTimeout(safetyTimeout);
      setProcessingStatus(false);
      setProcessingOrderId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse';
      case 'Confirmed':
      case 'Accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Preparing':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Ready':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Out for Delivery':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rejected':
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order #, customer name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-700"
            >
              <option value="all">All Dates</option>
              <option value="today">Today Only</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>

            <button
              type="button"
              onClick={fetchOrders}
              className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
              title="Refresh Orders"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize whitespace-nowrap transition-all ${
                statusFilter === s
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'All Statuses' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table / List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm font-semibold">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-base font-bold text-gray-700">No matching orders found</p>
            <p className="text-xs text-gray-400 mt-1">Orders placed via public websites will stream here live.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((o) => (
              <div
                key={o._id}
                className="p-5 hover:bg-gray-50/70 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Order Info */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-black text-gray-900">
                      #{o.orderNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(o.status)}`}>
                      {o.status}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {o.orderType === 'delivery' ? '🚴 Delivery' : '🥡 Pickup'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Customer info preview */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                    <span className="font-bold text-gray-900">{o.customerInfo?.name}</span>
                    <span>{o.customerInfo?.phone}</span>
                    {o.customerInfo?.address && (
                      <span className="text-gray-400 truncate max-w-xs">{o.customerInfo.address}</span>
                    )}
                  </div>

                  {/* Items preview snippet */}
                  <div className="text-xs text-gray-500 truncate max-w-xl">
                    {o.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                  </div>
                </div>

                {/* Right: Total & Action Buttons */}
                <div className="flex items-center justify-between lg:justify-end gap-4">
                  <div className="text-right">
                    <div className="text-lg font-black text-gray-900">
                      {currencySymbol}{o.pricing?.total?.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-gray-400 uppercase font-semibold">
                      {o.paymentMethod === 'cash_on_delivery' ? 'COD' : 'Counter'} • {o.paymentStatus}
                    </div>
                  </div>

                  {/* Quick Status Workflow Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {o.status === 'Pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(o._id, 'Confirmed')}
                          disabled={processingStatus}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectingOrderId(o._id)}
                          disabled={processingStatus}
                          className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {(o.status === 'Confirmed' || o.status === 'Accepted') && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(o._id, 'Preparing')}
                        disabled={processingStatus}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-1"
                      >
                        <ChefHat className="w-3.5 h-3.5" /> Start Cook
                      </button>
                    )}

                    {o.status === 'Preparing' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(o._id, 'Ready')}
                        disabled={processingStatus}
                        className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-all shadow-sm flex items-center gap-1"
                      >
                        <PackageCheck className="w-3.5 h-3.5" /> Mark Ready
                      </button>
                    )}

                    {o.status === 'Ready' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(o._id, o.orderType === 'delivery' ? 'Out for Delivery' : 'Delivered')}
                        disabled={processingStatus}
                        className="px-3 py-1.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-all shadow-sm flex items-center gap-1"
                      >
                        {o.orderType === 'delivery' ? (
                          <>
                            <Bike className="w-3.5 h-3.5" /> Dispatch
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Picked Up
                          </>
                        )}
                      </button>
                    )}

                    {o.status === 'Out for Delivery' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(o._id, 'Delivered')}
                        disabled={processingStatus}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                      </button>
                    )}

                    {/* View Details Drawer */}
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(o)}
                      className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Order Modal */}
      {rejectingOrderId && (
        <div className="modal-overlay animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-gray-900">
                Reject Order Ticket
              </h3>
              <button
                type="button"
                onClick={() => setRejectingOrderId(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Please provide a reason for rejecting this order (e.g. kitchen busy, out of ingredients):
            </p>
            <input
              type="text"
              placeholder="e.g. Out of stock, kitchen closed early"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingOrderId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(rejectingOrderId, 'Rejected', rejectionReason)}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal / Drawer */}
      {selectedOrder && (
        <div className="modal-overlay animate-fade-in" onClick={() => setSelectedOrder(null)}>
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Ticket Details
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-1">
                  Order #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-2xl">
              <div>
                <span className="font-bold text-gray-400 uppercase tracking-wider block">Customer</span>
                <div className="text-sm font-extrabold text-gray-900 mt-0.5">{selectedOrder.customerInfo?.name}</div>
                <div className="text-gray-600 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-gray-400" />
                  {selectedOrder.customerInfo?.phone}
                </div>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase tracking-wider block">
                  {selectedOrder.orderType === 'delivery' ? 'Delivery Address' : 'Pickup'}
                </span>
                <div className="text-gray-800 mt-0.5 font-medium">
                  {selectedOrder.customerInfo?.address || 'Counter Pickup'}
                </div>
                {selectedOrder.customerInfo?.notes && (
                  <div className="text-gray-500 italic mt-1">Note: "{selectedOrder.customerInfo.notes}"</div>
                )}
              </div>
            </div>

            {/* Courier & Delivery Fleet Status (For Delivery Orders) */}
            {selectedOrder.orderType === 'delivery' && (
              <div className="p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 bg-slate-50 border-slate-200">
                {selectedOrder.riderInfo?.name ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shrink-0">
                      <Bike className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-gray-900">
                        Assigned Courier: {selectedOrder.riderInfo.name} ({selectedOrder.riderInfo.vehicleType || 'Motorcycle'})
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                        {selectedOrder.riderInfo.phone && <span>Contact: {selectedOrder.riderInfo.phone}</span>}
                        {selectedOrder.riderInfo.vehicleNumber && <span>• Plate: {selectedOrder.riderInfo.vehicleNumber}</span>}
                      </div>
                    </div>
                  </div>
                ) : ['Ready for Pickup', 'Ready'].includes(selectedOrder.status) ? (
                  <div className="flex items-center gap-2.5 text-amber-700">
                    <Clock className="w-4 h-4 shrink-0 text-amber-600 animate-pulse" />
                    <div>
                      <div className="font-bold">Dispatched to Fleet — Awaiting Rider Claim</div>
                      <div className="text-[10px] text-amber-600 mt-0.5">Online couriers in this city have received this delivery offer.</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Bike className="w-4 h-4 text-gray-400" />
                    <span>Courier dispatch opens once kitchen marks order 'Ready for Pickup'.</span>
                  </div>
                )}
              </div>
            )}

            {/* Items list */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Itemized Dishes ({selectedOrder.items?.length})
              </span>
              <div className="divide-y divide-gray-100">
                {selectedOrder.items?.map((it, i) => (
                  <div key={i} className="py-2.5 flex justify-between items-start text-xs">
                    <div>
                      <div className="font-bold text-gray-900">
                        {it.quantity}x {it.name}
                      </div>
                      {it.selectedSize?.name && (
                        <div className="text-primary font-medium">Size: {it.selectedSize.name}</div>
                      )}
                      {it.selectedExtras?.length > 0 && (
                        <div className="text-gray-500">
                          Extras: {it.selectedExtras.map((e) => e.name).join(', ')}
                        </div>
                      )}
                      {it.specialInstructions && (
                        <div className="text-gray-400 italic">Special: "{it.specialInstructions}"</div>
                      )}
                    </div>
                    <span className="font-extrabold text-gray-900">
                      {currencySymbol}{it.totalPrice?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status History Stepper */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Audit Timeline
              </span>
              <div className="space-y-1.5 text-xs">
                {selectedOrder.statusHistory?.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-gray-600">
                    <span className="font-semibold text-gray-800">● {h.status} - {h.note}</span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(h.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Total */}
            <div className="p-4 bg-gray-50 rounded-2xl space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{currencySymbol}{selectedOrder.pricing?.subtotal?.toFixed(2)}</span>
              </div>
              {selectedOrder.pricing?.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-{currencySymbol}{selectedOrder.pricing.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{currencySymbol}{selectedOrder.pricing?.deliveryFee?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{currencySymbol}{selectedOrder.pricing?.tax?.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-black text-gray-900">
                <span>Total</span>
                <span>{currencySymbol}{selectedOrder.pricing?.total?.toFixed(2)}</span>
              </div>
            </div>

            {/* Modal Quick Actions */}
            <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2">
              {selectedOrder.status === 'Pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder._id, 'Confirmed')}
                    disabled={processingStatus}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm"
                  >
                    Confirm Order
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingOrderId(selectedOrder._id);
                      setSelectedOrder(null);
                    }}
                    disabled={processingStatus}
                    className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100"
                  >
                    Reject Order
                  </button>
                </>
              )}

              {(selectedOrder.status === 'Confirmed' || selectedOrder.status === 'Accepted') && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'Preparing')}
                  disabled={processingStatus}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm flex items-center gap-1.5"
                >
                  <ChefHat className="w-4 h-4" /> Start Cooking
                </button>
              )}

              {selectedOrder.status === 'Preparing' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'Ready')}
                  disabled={processingStatus}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow-sm flex items-center gap-1.5"
                >
                  <PackageCheck className="w-4 h-4" /> Mark Ready
                </button>
              )}

              {selectedOrder.status === 'Ready' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedOrder._id, selectedOrder.orderType === 'delivery' ? 'Out for Delivery' : 'Delivered')}
                  disabled={processingStatus}
                  className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 shadow-sm flex items-center gap-1.5"
                >
                  {selectedOrder.orderType === 'delivery' ? 'Dispatch for Delivery' : 'Mark Picked Up'}
                </button>
              )}

              {selectedOrder.status === 'Out for Delivery' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'Delivered')}
                  disabled={processingStatus}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Complete & Delivered
                </button>
              )}

              {!['Delivered', 'Cancelled', 'Rejected'].includes(selectedOrder.status) && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to cancel this order?')) {
                      handleUpdateStatus(selectedOrder._id, 'Cancelled', 'Cancelled by restaurant');
                    }
                  }}
                  disabled={processingStatus}
                  className="px-3 py-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
