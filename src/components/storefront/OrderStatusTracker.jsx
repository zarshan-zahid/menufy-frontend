import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Bike,
  PackageCheck,
  AlertTriangle,
  RefreshCw,
  Phone,
  MapPin,
  ArrowLeft,
  ShoppingBag,
  Truck,
  DoorOpen,
  XCircle,
  FileText,
  Building2,
} from 'lucide-react';
import { api } from '../../utils/api';
import LiveTrackingMap from '../common/LiveTrackingMap';
import { getSocket, joinOrderTracking, leaveOrderTracking } from '../../utils/socket';

// Phase 5 Simple 7-Step Sequence for Delivery Orders
export const PHASE_5_DELIVERY_STEPS = [
  { key: 'Order Placed', label: '1. Order Placed', icon: Clock, desc: 'Kitchen acknowledged order ticket' },
  { key: 'Preparing Your Order', label: '2. Preparing Your Order', icon: ChefHat, desc: 'Chef is crafting your meal' },
  { key: 'Ready for Pickup', label: '3. Ready for Pickup', icon: PackageCheck, desc: 'Dishes boxed and sealed' },
  { key: 'Rider Picked Up Your Order', label: '4. Rider Picked Up', icon: Bike, desc: 'Rider received order from kitchen' },
  { key: 'Rider Is On The Way', label: '5. Rider On The Way', icon: Truck, desc: 'En route to your delivery address' },
  { key: 'Rider Is At Your Doorstep', label: '6. At Your Doorstep', icon: MapPin, desc: 'Rider has arrived at your door' },
  { key: 'Order Received', label: '7. Order Received', icon: CheckCircle2, desc: 'Delivered and ready to enjoy' },
];

// Phase 5 Sequence for Counter Takeaway / Pickup
export const PHASE_5_PICKUP_STEPS = [
  { key: 'Order Placed', label: '1. Order Placed', icon: Clock, desc: 'Kitchen acknowledged order ticket' },
  { key: 'Preparing Your Order', label: '2. Preparing Your Order', icon: ChefHat, desc: 'Chef is crafting your meal' },
  { key: 'Ready for Pickup', label: '3. Ready for Pickup', icon: PackageCheck, desc: 'Order ready at counter' },
  { key: 'Order Received', label: '4. Order Received', icon: CheckCircle2, desc: 'Picked up from counter' },
];

// Helper to normalize any database or legacy status to Phase 5 sequence
export const normalizePhase5Status = (rawStatus) => {
  if (!rawStatus) return 'Order Placed';
  const s = rawStatus.toLowerCase().trim();
  if (s === 'pending' || s === 'accepted' || s === 'confirmed' || s === 'order placed') {
    return 'Order Placed';
  }
  if (s === 'preparing' || s === 'preparing your order') {
    return 'Preparing Your Order';
  }
  if (s === 'ready' || s === 'ready for pickup') {
    return 'Ready for Pickup';
  }
  if (s === 'rider picked up your order' || s === 'rider picked up') {
    return 'Rider Picked Up Your Order';
  }
  if (s === 'out for delivery' || s === 'rider is on the way' || s === 'on the way') {
    return 'Rider Is On The Way';
  }
  if (s === 'rider is at your doorstep' || s === 'at doorstep') {
    return 'Rider Is At Your Doorstep';
  }
  if (s === 'delivered' || s === 'order received' || s === 'completed') {
    return 'Order Received';
  }
  if (s === 'cancelled') return 'Cancelled';
  if (s === 'rejected') return 'Rejected';
  return rawStatus;
};

export default function OrderStatusTracker() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Customer cancellation state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [cancelling, setCancelling] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState('');

  const fetchStatus = async () => {
    try {
      setError('');
      const res = await api.get(`/public/orders/${orderNumber}`);
      if (res.success && res.order) {
        setOrder(res.order);
        setRestaurant(res.restaurant);
        setLastRefreshed(new Date());
      } else {
        setError(res.message || 'Order not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch order status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Auto-poll status every 8 seconds for live updates (reliable fallback)
    const interval = setInterval(() => {
      fetchStatus();
    }, 8000);

    // Real-time WebSocket connection
    const s = getSocket();
    if (orderNumber) {
      joinOrderTracking(orderNumber);

      const handleLocation = (data) => {
        if (data.orderNumber === orderNumber) {
          setOrder((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              riderLocation: {
                lat: data.lat,
                lng: data.lng,
                accuracy: data.accuracy,
                updatedAt: data.updatedAt,
                permissionDenied: data.permissionDenied,
                isSharing: data.isSharing,
              },
              distanceKm: data.distanceKm !== undefined ? data.distanceKm : prev.distanceKm,
              etaMinutes: data.etaMinutes !== undefined ? data.etaMinutes : prev.etaMinutes,
              isStale: false,
            };
          });
        }
      };

      const handleStatusUpdated = (data) => {
        if (data.orderNumber === orderNumber) {
          setOrder((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              status: data.status,
              riderInfo: data.riderInfo || prev.riderInfo,
            };
          });
        }
      };

      const handleLocationStale = (data) => {
        if (data.orderNumber === orderNumber) {
          setOrder((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              isStale: true,
            };
          });
        }
      };

      s.on('order:location', handleLocation);
      s.on('order:status-updated', handleStatusUpdated);
      s.on('order:location-stale', handleLocationStale);

      return () => {
        clearInterval(interval);
        s.off('order:location', handleLocation);
        s.off('order:status-updated', handleStatusUpdated);
        s.off('order:location-stale', handleLocationStale);
        leaveOrderTracking(orderNumber);
      };
    }

    return () => clearInterval(interval);
  }, [orderNumber]);

  // Handle customer cancellation
  const handleCancelOrder = async (e) => {
    e.preventDefault();
    setCancelling(true);
    setCancelFeedback('');

    try {
      const res = await api.patch(`/public/orders/${orderNumber}/cancel`, {
        reason: cancelReason,
        phone: order?.customerInfo?.phone,
      });

      if (res.success) {
        setOrder((prev) => ({
          ...prev,
          status: 'Cancelled',
          cancellationReason: cancelReason,
        }));
        setShowCancelModal(false);
      } else {
        setCancelFeedback(res.message || 'Failed to cancel order');
      }
    } catch (err) {
      setCancelFeedback(err.message || 'Unable to cancel order at this stage.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="w-8 h-8 text-orange-600 animate-spin" />
          <p className="text-sm font-semibold text-gray-600">Retrieving live MenuFy order status...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto text-rose-600">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Order Not Found</h2>
          <p className="text-sm text-gray-500">{error || 'Could not locate order reference.'}</p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/my-orders"
              className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-500 transition-all text-center"
            >
              View My Order History
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-all text-center"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Platform
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const normalizedCurrentStatus = normalizePhase5Status(order.status);
  const isRejected = normalizedCurrentStatus === 'Rejected';
  const isCancelled = normalizedCurrentStatus === 'Cancelled';
  const isPickup = order.orderType === 'pickup';
  const activeSteps = isPickup ? PHASE_5_PICKUP_STEPS : PHASE_5_DELIVERY_STEPS;
  const currencySymbol = restaurant?.currencySymbol || '$';

  // Get current step index
  const currentStepIdx = activeSteps.findIndex((s) => s.key === normalizedCurrentStatus);

  // Cancellation is permitted ONLY when status is in the first stage ('Order Placed')
  const isCancellable = normalizedCurrentStatus === 'Order Placed';

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-orange-500 selection:text-white">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs font-bold text-gray-500">
          <Link to="/" className="inline-flex items-center gap-1.5 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Restaurants</span>
          </Link>
          <Link
            to="/my-orders"
            className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>My Order History</span>
          </Link>
        </div>

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-orange-600 bg-orange-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Live MenuFy Tracker
                </span>
                <span className="text-xs text-gray-400">
                  Updated {lastRefreshed.toLocaleTimeString()}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
                Order #{order.orderNumber}
              </h1>
              {restaurant && (
                <p className="text-sm font-semibold text-gray-600 mt-1 flex items-center gap-2">
                  <span>From:</span>
                  <span className="font-bold text-gray-900">{restaurant.name}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={fetchStatus}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>

              {/* Cancellation Button (Only when allowed) */}
              {isCancellable && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Cancel Order</span>
                </button>
              )}
            </div>
          </div>

          {/* Stepper / Phase 5 Status Workflow */}
          <div>
            {isRejected ? (
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-base">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Order Declined by Restaurant</span>
                </div>
                <p className="text-xs text-rose-700">
                  Reason: {order.rejectionReason || 'The kitchen is temporarily overloaded and could not accept new orders.'}
                </p>
              </div>
            ) : isCancelled ? (
              <div className="p-5 rounded-2xl bg-gray-100 border border-gray-200 text-gray-700 space-y-1">
                <div className="font-extrabold text-sm flex items-center gap-2 text-gray-900">
                  <XCircle className="w-4 h-4 text-gray-500" />
                  <span>Order Cancelled</span>
                </div>
                <p className="text-xs text-gray-500">
                  {order.cancellationReason || 'This order was cancelled by customer request before preparation began.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Visual Stepper Grid */}
                <div
                  className={`grid gap-2.5 ${
                    isPickup ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7'
                  }`}
                >
                  {activeSteps.map((step, idx) => {
                    const isCompleted = currentStepIdx > idx;
                    const isCurrent = currentStepIdx === idx;
                    const Icon = step.icon;

                    return (
                      <div
                        key={step.key}
                        className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
                          isCurrent
                            ? 'border-orange-500 bg-orange-500/10 shadow-md ring-2 ring-orange-500 text-orange-950'
                            : isCompleted
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-gray-100 bg-gray-50/70 text-gray-400 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 ${
                            isCurrent
                              ? 'bg-orange-600 text-white shadow-md animate-pulse'
                              : isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[11px] font-black leading-tight">
                            {step.label}
                          </div>
                          <div className="text-[9px] opacity-75 mt-0.5 leading-snug hidden sm:block">
                            {step.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Active Stage Callout Bar */}
                <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-orange-800 uppercase font-black tracking-wider">
                      Current Operational Stage
                    </div>
                    <div className="text-base font-black text-gray-900 mt-0.5">
                      {normalizedCurrentStatus}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {activeSteps[currentStepIdx]?.desc || 'Order is being processed.'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-bold px-3 py-1 bg-white border border-gray-200 rounded-full shadow-2xs">
                      {isPickup ? '🥡 Counter Pickup' : '🚴 Doorstep Delivery'}
                    </span>
                  </div>
                </div>

                {/* Cancellation Status Helper Note */}
                {!isCancellable && !isCompletedStatus(normalizedCurrentStatus) && (
                  <div className="text-[11px] text-gray-500 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>The kitchen has commenced order preparation. Online cancellation is closed.</span>
                  </div>
                )}

                {/* Assigned Courier Card */}
                {order.riderInfo && order.riderInfo.name && (
                  <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                        <Bike className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                          Assigned Delivery Courier
                        </div>
                        <div className="text-sm font-black text-gray-900">
                          {order.riderInfo.name}
                        </div>
                        <div className="text-xs text-gray-600 flex items-center gap-2 mt-0.5">
                          <span>{order.riderInfo.vehicleType || 'Motorcycle'}</span>
                          {order.riderInfo.vehicleNumber && <span>• {order.riderInfo.vehicleNumber}</span>}
                        </div>
                      </div>
                    </div>
                    {order.riderInfo.phone && (
                      <a
                        href={`tel:${order.riderInfo.phone}`}
                        className="px-3.5 py-2 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Rider</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Phase 7: Live Real-Time Courier Tracking Map */}
        {order.orderType === 'delivery' && !isCancelled && !isRejected && (
          <LiveTrackingMap
            orderNumber={order.orderNumber}
            status={normalizedCurrentStatus}
            restaurantLocation={
              order.restaurantLocation || {
                name: restaurant?.name || 'Kitchen',
                address: restaurant?.address || '',
                coordinates: restaurant?.coordinates,
              }
            }
            destinationLocation={{
              address: order.customerInfo?.address,
              coordinates: order.customerInfo?.coordinates,
              area: order.customerInfo?.area,
              city: order.customerInfo?.city,
            }}
            assignedRider={order.riderInfo}
            riderLocation={order.riderLocation}
            distanceKm={order.distanceKm}
            etaMinutes={order.etaMinutes}
          />
        )}

        {/* Customer Details & Purchased Items Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
            <span>Purchased Items & Snapshot</span>
          </h2>

          <div className="divide-y divide-gray-100">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-3 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                      {item.quantity}x
                    </span>
                    <span className="text-sm font-bold text-gray-900">{item.name}</span>
                  </div>

                  {item.selectedSize?.name && (
                    <div className="text-xs text-orange-600 font-medium mt-0.5">
                      Size: {item.selectedSize.name}
                    </div>
                  )}

                  {item.selectedExtras?.length > 0 && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      Extras: {item.selectedExtras.map((e) => e.name).join(', ')}
                    </div>
                  )}

                  {item.specialInstructions && (
                    <div className="text-[11px] text-gray-400 italic mt-0.5">
                      Instructions: "{item.specialInstructions}"
                    </div>
                  )}
                </div>

                <span className="text-sm font-extrabold text-gray-900">
                  {currencySymbol}{Number(item.totalPrice || (item.unitPrice * item.quantity)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">
                {currencySymbol}{order.pricing?.subtotal?.toFixed(2)}
              </span>
            </div>

            {order.pricing?.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount ({order.pricing.couponCode || 'Promo'})</span>
                <span>-{currencySymbol}{order.pricing.discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-gray-900">
                {order.pricing?.deliveryFee > 0
                  ? `${currencySymbol}${order.pricing.deliveryFee.toFixed(2)}`
                  : 'FREE'}
              </span>
            </div>

            {order.pricing?.tax > 0 && (
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-semibold text-gray-900">
                  {currencySymbol}{order.pricing.tax.toFixed(2)}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200 flex justify-between text-lg font-black text-gray-900">
              <span>Grand Total</span>
              <span>{currencySymbol}{order.pricing?.total?.toFixed(2)}</span>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50 space-y-1">
              <span className="font-bold text-gray-700 block">Customer Information</span>
              <div className="font-semibold text-gray-900">{order.customerInfo?.name}</div>
              <div className="text-gray-500">{order.customerInfo?.phone}</div>
              {order.customerInfo?.email && (
                <div className="text-gray-500">{order.customerInfo?.email}</div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 space-y-1">
              <span className="font-bold text-gray-700 block">
                {order.orderType === 'delivery' ? 'Delivery Address' : 'Pickup Location'}
              </span>
              <div className="text-gray-800 font-medium">
                {order.orderType === 'delivery'
                  ? order.customerInfo?.address
                  : restaurant?.address || 'Pickup counter'}
              </div>
              {order.customerInfo?.notes && (
                <div className="text-gray-500 italic mt-1">Note: "{order.customerInfo.notes}"</div>
              )}
            </div>

            {/* Recipient Details (if ordered for someone else) */}
            {order.recipientInfo?.isGiftOrder && (
              <div className="sm:col-span-2 p-4 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-1">
                <span className="font-bold text-orange-950 block">🎁 Gift / Recipient Details</span>
                <div className="font-semibold text-gray-900">
                  Recipient: {order.recipientInfo.recipientName} ({order.recipientInfo.recipientPhone})
                </div>
                {order.recipientInfo.giftMessage && (
                  <div className="text-orange-900 italic">
                    Gift Message: "{order.recipientInfo.giftMessage}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Cancel Order #{order.orderNumber}?</h3>
                <p className="text-xs text-gray-500">Allowed before kitchen begins preparation</p>
              </div>
            </div>

            {cancelFeedback && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                {cancelFeedback}
              </div>
            )}

            <form onSubmit={handleCancelOrder} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Reason for cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white font-medium focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Change of plans">Change of plans</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Incorrect delivery address entered">Incorrect delivery address entered</option>
                  <option value="Need to change items">Need to change items</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold disabled:opacity-60"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function isCompletedStatus(status) {
  return ['Order Received', 'Delivered', 'Cancelled', 'Rejected'].includes(status);
}
