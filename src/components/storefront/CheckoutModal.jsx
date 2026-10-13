import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle,
  AlertCircle,
  Bike,
  ShoppingBag,
  ShieldCheck,
  DollarSign,
  Building2,
  MapPin,
  Bookmark,
  Plus,
  User,
  HeartHandshake,
  Navigation,
  Compass,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import GoogleMapPicker from '../common/GoogleMapPicker';

export default function CheckoutModal({ isOpen, onClose, restaurant }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    subtotal,
    deliveryFee,
    discount,
    tax,
    total,
    currencySymbol,
    orderType,
    setOrderType,
    appliedCoupon,
    clearCart,
    hasUnavailableItems,
  } = useCart();

  // Primary customer form state
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(
    orderType === 'delivery' ? 'cash_on_delivery' : 'cash_on_pickup'
  );

  // Delivery address fields
  const [streetAddress, setStreetAddress] = useState('');
  const [aptSuite, setAptSuite] = useState('');
  const [city, setCity] = useState(restaurant?.city || 'Karachi');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');

  // Saved Addresses state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('custom');
  const [saveCurrentAddress, setSaveCurrentAddress] = useState(false);
  const [savedAddressLabel, setSavedAddressLabel] = useState('Home');

  // "Order for someone else" state
  const [orderForSomeoneElse, setOrderForSomeoneElse] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientNotes, setRecipientNotes] = useState('');

  // Interactive Map Pin state
  const [mapPinCoords, setMapPinCoords] = useState(restaurant?.coordinates || { lat: 24.8607, lng: 67.0011 });
  const [isPinAdjusted, setIsPinAdjusted] = useState(false);

  // Multi-branch selection
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load saved addresses on open
  useEffect(() => {
    if (!isOpen) return;

    // Load from localStorage first
    try {
      const localSaved =
        localStorage.getItem('menufy_saved_addresses') ||
        localStorage.getItem('foodflow_saved_addresses');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAddresses(parsed);
          // If first address matches current city, auto-select it
          const first = parsed[0];
          setSelectedAddressId(first.id);
          setStreetAddress(first.address || first.street || '');
          setAptSuite(first.aptSuite || '');
          setCity(first.city || restaurant?.city || '');
          if (first.area) setArea(first.area);
          if (first.landmark) setLandmark(first.landmark);
          if (first.coordinates) {
            setMapPinCoords(first.coordinates);
            setIsPinAdjusted(true);
          }
        }
      }
    } catch (e) {
      console.warn('Could not load local saved addresses:', e);
    }

    // If authenticated, also fetch from backend user profile
    if (user) {
      api.get('/auth/saved-addresses')
        .then((res) => {
          if (res.success && Array.isArray(res.savedAddresses) && res.savedAddresses.length > 0) {
            setSavedAddresses(res.savedAddresses);
            localStorage.setItem('menufy_saved_addresses', JSON.stringify(res.savedAddresses));
            localStorage.setItem('foodflow_saved_addresses', JSON.stringify(res.savedAddresses));
          }
        })
        .catch(() => {});
    }
  }, [isOpen, user]);

  // Fetch branches on open
  useEffect(() => {
    if (isOpen && restaurant?.slug) {
      api.get(`/public/restaurant/${restaurant.slug}/branches`)
        .then((res) => {
          if (res.success && res.branches?.length > 0) {
            setBranches(res.branches);
            const main = res.branches.find((b) => b.isMainBranch) || res.branches[0];
            setSelectedBranchId(main._id);
          }
        })
        .catch((err) => console.warn('Could not fetch storefront branches:', err));
    }
  }, [isOpen, restaurant?.slug]);

  // Combined formatted delivery address
  const fullDeliveryAddress = useMemo(() => {
    const parts = [streetAddress.trim(), aptSuite.trim(), area.trim(), city.trim()].filter(Boolean);
    return parts.join(', ');
  }, [streetAddress, aptSuite, area, city]);

  // Service Area Validation Check (City & Delivery Radius)
  const isAddressInServiceArea = useMemo(() => {
    if (orderType !== 'delivery') return true;
    if (!streetAddress.trim()) return true; // not filled yet

    const targetCity = city.toLowerCase().trim();
    const restCity = (restaurant?.city || 'Karachi').toLowerCase().trim();

    // Check allowed cities if configured
    if (
      restaurant?.deliverySettings?.allowedCities &&
      Array.isArray(restaurant.deliverySettings.allowedCities) &&
      restaurant.deliverySettings.allowedCities.length > 0
    ) {
      const inAllowed = restaurant.deliverySettings.allowedCities.some(
        (c) => c.toLowerCase().trim() === targetCity
      );
      if (!inAllowed) return false;
    } else {
      // Default: Check against restaurant's primary operating city
      const otherCities = ['karachi', 'lahore', 'islamabad', 'rawalpindi', 'peshawar', 'faisalabad'].filter(
        (c) => c !== restCity
      );
      const mentionsOtherCity = otherCities.some((c) => targetCity.includes(c));
      if (mentionsOtherCity && !targetCity.includes(restCity)) return false;
    }

    // Distance Radius Check
    const restCoords = restaurant?.coordinates || { lat: 24.8607, lng: 67.0011 };
    const maxRadius = restaurant?.deliverySettings?.maxDeliveryRadiusKm || 15;
    if (mapPinCoords && mapPinCoords.lat && restCoords.lat) {
      const dLat = (mapPinCoords.lat - restCoords.lat) * (Math.PI / 180);
      const dLon = (mapPinCoords.lng - restCoords.lng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(restCoords.lat * (Math.PI / 180)) *
          Math.cos(mapPinCoords.lat * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = 6371 * c;
      if (dist > maxRadius) {
        return false;
      }
    }

    return true;
  }, [orderType, streetAddress, city, restaurant, mapPinCoords]);

  // Handle saved address selection
  const handleSelectSavedAddress = (addr) => {
    if (addr === 'custom') {
      setSelectedAddressId('custom');
      setStreetAddress('');
      setAptSuite('');
      setArea('');
      setLandmark('');
      return;
    }
    setSelectedAddressId(addr.id);
    setStreetAddress(addr.address || addr.street || '');
    setAptSuite(addr.aptSuite || '');
    if (addr.city) setCity(addr.city);
    if (addr.area) setArea(addr.area);
    if (addr.landmark) setLandmark(addr.landmark);
    if (addr.coordinates) {
      setMapPinCoords(addr.coordinates);
      setIsPinAdjusted(true);
    }
    if (addr.recipientName) setRecipientName(addr.recipientName);
    if (addr.recipientPhone) setRecipientPhone(addr.recipientPhone);
    if (addr.notes || addr.deliveryInstructions) setOrderNotes(addr.deliveryInstructions || addr.notes);
  };

  // Optional Location Detection (Does NOT force GPS match)
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMapPinCoords({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
        });
        setIsPinAdjusted(true);
        // Pre-fill suggested address without restricting manual edit
        if (!streetAddress) {
          setStreetAddress('Detected Street Location (Edit as needed)');
        }
      },
      () => {
        alert('Could not determine GPS coordinates. You can type your delivery address manually.');
      }
    );
  };

  if (!isOpen) return null;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Pre-check for unavailable items
    if (hasUnavailableItems) {
      setErrorMsg('Your cart contains sold-out items. Please remove them before checking out.');
      return;
    }

    // Form Validations
    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 7) {
      setErrorMsg('Please enter a valid phone number');
      return;
    }

    if (orderType === 'delivery') {
      if (!streetAddress.trim()) {
        setErrorMsg('Please provide a delivery street address');
        return;
      }
      if (!isAddressInServiceArea) {
        setErrorMsg(
          `Delivery unavailable: ${restaurant.name} only delivers within ${
            restaurant.city || 'its local service area'
          }. Please choose an address in the delivery zone or switch to Pickup.`
        );
        return;
      }
    }

    if (orderForSomeoneElse) {
      if (!recipientName.trim()) {
        setErrorMsg('Please enter the recipient’s full name');
        return;
      }
      if (!recipientPhone.trim() || recipientPhone.trim().length < 7) {
        setErrorMsg('Please enter a valid contact phone for the recipient');
        return;
      }
    }

    setSubmitting(true);

    try {
      // Save address to storage if requested
      if (orderType === 'delivery' && saveCurrentAddress && streetAddress.trim()) {
        const newSaved = {
          id: `addr_${Date.now()}`,
          label: savedAddressLabel,
          address: fullDeliveryAddress,
          street: streetAddress.trim(),
          aptSuite: aptSuite.trim(),
          city: city.trim(),
          area: area.trim(),
          landmark: landmark.trim(),
          coordinates: mapPinCoords,
          notes: orderNotes.trim(),
          deliveryInstructions: (recipientNotes || orderNotes || '').trim(),
          recipientName: recipientName.trim(),
          recipientPhone: recipientPhone.trim(),
        };
        const updatedList = [newSaved, ...savedAddresses.filter((a) => a.street !== streetAddress.trim()).slice(0, 5)];
        setSavedAddresses(updatedList);
        localStorage.setItem('menufy_saved_addresses', JSON.stringify(updatedList));
        localStorage.setItem('foodflow_saved_addresses', JSON.stringify(updatedList));

        if (user) {
          api.post('/auth/saved-addresses', newSaved).catch(() => {});
        }
      }

      // Build idempotency key
      const idempotencyKey = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Build complete order payload
      const payload = {
        customerInfo: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim(),
          address: orderType === 'delivery' ? fullDeliveryAddress : (restaurant.address || 'Pickup Counter'),
          city: city.trim(),
          area: area.trim(),
          landmark: landmark.trim(),
          coordinates: orderType === 'delivery' ? mapPinCoords : null,
          notes: orderNotes.trim(),
          deliveryInstructions: (recipientNotes || orderNotes || '').trim(),
        },
        recipientInfo: orderForSomeoneElse
          ? {
              isGiftOrder: true,
              recipientName: recipientName.trim(),
              recipientPhone: recipientPhone.trim(),
              giftMessage: recipientNotes.trim(),
              notes: recipientNotes.trim(),
            }
          : null,
        customerId: user?.id || null,
        orderType,
        branchId: selectedBranchId || null,
        idempotencyKey,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          selectedSize: i.selectedSize,
          selectedExtras: i.selectedExtras,
          quantity: i.quantity,
          expectedUnitPrice: i.unitPrice,
          specialInstructions: i.specialInstructions,
        })),
        couponCode: appliedCoupon?.code || null,
        paymentMethod: orderType === 'delivery' ? 'cash_on_delivery' : 'cash_on_pickup',
      };

      const res = await api.post(`/public/restaurant/${restaurant.slug}/orders`, payload);

      if (res.success && res.orderNumber) {
        // Record order in local storage for guest customer history
        try {
          const prevOrders = JSON.parse(
            localStorage.getItem('menufy_customer_orders') ||
            localStorage.getItem('foodflow_customer_orders') ||
            '[]'
          );
          const updatedOrders = [res.orderNumber, ...prevOrders.filter((num) => num !== res.orderNumber)].slice(0, 30);
          localStorage.setItem('menufy_customer_orders', JSON.stringify(updatedOrders));
          localStorage.setItem('foodflow_customer_orders', JSON.stringify(updatedOrders));
        } catch (e) {
          // ignore storage error
        }

        // Trigger celebratory confetti effect
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        clearCart();
        onClose();
        navigate(`/order-status/${res.orderNumber}`);
      } else {
        throw new Error(res.message || 'Failed to complete order');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place order. Please review your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 sticky top-0 z-10 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Secure Checkout</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Ordering directly from <span className="font-bold text-gray-800">{restaurant.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Delivery vs Pickup Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Fulfillment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {restaurant.deliverySettings?.deliveryEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderType('delivery');
                    setPaymentMethod('cash_on_delivery');
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    orderType === 'delivery'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary text-gray-900'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Bike className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <div className="text-sm font-bold">Delivery</div>
                    <div className="text-[11px] text-gray-400">
                      {restaurant.deliverySettings?.estimatedDeliveryTime || '30-45m'}
                    </div>
                  </div>
                </button>
              )}

              {restaurant.deliverySettings?.pickupEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderType('pickup');
                    setPaymentMethod('cash_on_pickup');
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    orderType === 'pickup'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary text-gray-900'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <div className="text-sm font-bold">Takeaway / Pickup</div>
                    <div className="text-[11px] text-gray-400">
                      {restaurant.deliverySettings?.estimatedPickupTime || '15-20m'}
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Branch Outlet Selection */}
          {branches.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Fulfilling Branch / Kitchen Outlet
              </label>
              {branches.length > 1 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {branches.map((b) => {
                    const isSelected = selectedBranchId === b._id;
                    return (
                      <button
                        key={b._id}
                        type="button"
                        onClick={() => setSelectedBranchId(b._id)}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary text-gray-900'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Building2 className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-primary' : 'text-gray-400'}`} />
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate flex items-center gap-1.5">
                            <span>{b.name}</span>
                            {b.isMainBranch && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-primary/10 text-primary">
                                Main
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate mt-0.5">
                            {b.address}{b.city ? `, ${b.city}` : ''}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2.5 text-xs text-gray-600">
                  <Building2 className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="font-bold text-gray-800">{branches[0].name}</span>
                    <span className="text-gray-500 ml-1.5">
                      ({branches[0].address}{branches[0].city ? `, ${branches[0].city}` : ''})
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customer Contact Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span>Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Ahmed"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contact Phone (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+92 300 1234567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="For order confirmation & receipts"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* "Order for someone else" Checkbox & Expandable Section */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={orderForSomeoneElse}
                onChange={(e) => setOrderForSomeoneElse(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-primary" />
                <span>Ordering for someone else (Gift / Different Recipient)?</span>
              </span>
            </label>

            {orderForSomeoneElse && (
              <div className="pt-2 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Recipient’s Full Name *
                  </label>
                  <input
                    type="text"
                    required={orderForSomeoneElse}
                    placeholder="e.g. Ayesha Malik"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Recipient’s Phone Number *
                  </label>
                  <input
                    type="tel"
                    required={orderForSomeoneElse}
                    placeholder="+92 321 9876543"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">
                    Gift Note / Special Delivery Message
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Surprise lunch! Happy birthday from Uncle Tariq."
                    value={recipientNotes}
                    onChange={(e) => setRecipientNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Delivery Address Section (with Saved Addresses & Map Pin Widget) */}
          {orderType === 'delivery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Delivery Address & Location</span>
                </h3>

                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Suggest Current Area</span>
                </button>
              </div>

              {/* Saved Addresses Pills */}
              {savedAddresses.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Select Saved Address:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {savedAddresses.map((addr) => {
                      const isSel = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                            isSel
                              ? 'bg-primary text-white border-primary shadow-xs'
                              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          <Bookmark className="w-3 h-3" />
                          <span>{addr.label || 'Saved'}</span>
                          <span className="text-[10px] opacity-75 truncate max-w-[120px]">
                            ({addr.street})
                          </span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => handleSelectSavedAddress('custom')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                        selectedAddressId === 'custom'
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-white text-gray-600 border-dashed border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>New Address</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Address Input Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Street Address & Landmarks *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House / Street / Road / Landmark"
                    value={streetAddress}
                    onChange={(e) => {
                      setStreetAddress(e.target.value);
                      if (selectedAddressId !== 'custom') setSelectedAddressId('custom');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Building / Apt / Floor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apt 4B, 2nd Fl"
                    value={aptSuite}
                    onChange={(e) => setAptSuite(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  City / Delivery Area *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karachi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Service Area Status Banner */}
              {!isAddressInServiceArea ? (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block">Delivery Unavailable to this Address</span>
                    <span>
                      {restaurant.name} only delivers within{' '}
                      <strong>{restaurant.city || 'its designated service zone'}</strong>. Please select an address in{' '}
                      {restaurant.city || 'the delivery zone'} or switch your order to Pickup.
                    </span>
                  </div>
                </div>
              ) : (
                streetAddress.trim() && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Address verified within {restaurant.name}’s active delivery zone.</span>
                  </div>
                )
              )}

              {/* Interactive Google Maps & Pakistan Location Pin Picker */}
              <div className="pt-1">
                <GoogleMapPicker
                  initialCoordinates={mapPinCoords}
                  initialAddress={streetAddress}
                  initialCity={city}
                  restaurantCity={restaurant?.city || 'Karachi'}
                  onChange={({ address, coordinates, city: newCity, area: newArea, landmark: newLandmark }) => {
                    if (address && !streetAddress) setStreetAddress(address);
                    if (coordinates) {
                      setMapPinCoords(coordinates);
                      setIsPinAdjusted(true);
                    }
                    if (newCity) setCity(newCity);
                    if (newArea) setArea(newArea);
                    if (newLandmark) setLandmark(newLandmark);
                  }}
                />
              </div>

              {/* Save Address Checkbox */}
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={saveCurrentAddress}
                    onChange={(e) => setSaveCurrentAddress(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <span>Save this delivery address for future orders</span>
                </label>

                {saveCurrentAddress && (
                  <select
                    value={savedAddressLabel}
                    onChange={(e) => setSavedAddressLabel(e.target.value)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-gray-300 bg-white font-bold text-gray-700"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                )}
              </div>
            </div>
          )}

          {/* Delivery / Order Instructions */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Delivery Instructions / Kitchen Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Ring bell, gate code 104, extra mint chutney please"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          {/* Payment Method Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span>Payment Method</span>
            </h3>

            <div className="p-3.5 rounded-2xl border-2 border-primary bg-primary/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {orderType === 'delivery' ? 'Cash on Delivery (COD)' : 'Pay at Counter / Cash on Pickup'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Pay securely in cash when your food is handed to you. No online card required.
                  </div>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            </div>
          </div>

          {/* Complete Pricing Breakdown */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
            <div className="font-extrabold text-gray-800 text-sm mb-1">Order Pricing Summary</div>

            <div className="flex justify-between text-gray-600">
              <span>Items Subtotal ({items.length} items)</span>
              <span className="font-semibold text-gray-900">
                {currencySymbol}{subtotal.toFixed(2)}
              </span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount ({appliedCoupon.code})</span>
                <span>-{currencySymbol}{discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className="font-semibold text-gray-900">
                {orderType === 'delivery'
                  ? deliveryFee > 0
                    ? `${currencySymbol}${deliveryFee.toFixed(2)}`
                    : 'FREE'
                  : 'FREE (Pickup)'}
              </span>
            </div>

            {tax > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Estimated Tax ({restaurant.deliverySettings?.taxRate || 0}%)</span>
                <span className="font-semibold text-gray-900">
                  {currencySymbol}{tax.toFixed(2)}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200 flex justify-between text-lg font-black text-gray-900">
              <span>Final Total</span>
              <span>{currencySymbol}{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            type="submit"
            disabled={submitting || hasUnavailableItems || (orderType === 'delivery' && !isAddressInServiceArea)}
            className="w-full py-4 rounded-2xl font-extrabold text-white text-base shadow-xl flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {submitting ? (
              <span>Placing Order with Restaurant...</span>
            ) : hasUnavailableItems ? (
              <span>Remove Sold Out Items to Place Order</span>
            ) : !isAddressInServiceArea ? (
              <span>Delivery Address Outside Service Area</span>
            ) : (
              <span>Confirm Order • {currencySymbol}{total.toFixed(2)}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
