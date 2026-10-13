import React, { useState } from 'react';
import { Clock, Bike, ShoppingBag, MapPin, Plus, Trash2, Save, CheckCircle2 } from 'lucide-react';
import { api } from '../../utils/api';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DeliveryManager({ restaurant, onRefresh }) {
  const current = restaurant.deliverySettings || {};

  const [deliveryFee, setDeliveryFee] = useState(current.deliveryFee ?? 4.99);
  const [minOrderAmount, setMinOrderAmount] = useState(current.minOrderAmount ?? 15.0);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(current.estimatedDeliveryTime || '30-45 mins');
  const [estimatedPickupTime, setEstimatedPickupTime] = useState(current.estimatedPickupTime || '15-20 mins');
  const [taxRate, setTaxRate] = useState(current.taxRate ?? 5);

  const [deliveryEnabled, setDeliveryEnabled] = useState(current.deliveryEnabled ?? true);
  const [pickupEnabled, setPickupEnabled] = useState(current.pickupEnabled ?? true);

  const [openTime, setOpenTime] = useState(current.openingHours?.openTime || '10:00');
  const [closeTime, setCloseTime] = useState(current.openingHours?.closeTime || '23:00');
  const [isOpen24Hours, setIsOpen24Hours] = useState(current.openingHours?.isOpen24Hours ?? false);
  const [closedDays, setClosedDays] = useState(current.openingHours?.closedDays || []);

  const [deliveryZones, setDeliveryZones] = useState(
    current.deliveryZones || [
      { name: 'Downtown (0-4 km)', fee: 3.5, minOrder: 15, maxDistanceKm: 4 },
      { name: 'Midtown (4-8 km)', fee: 5.5, minOrder: 20, maxDistanceKm: 8 },
    ]
  );

  const [maxDeliveryRadiusKm, setMaxDeliveryRadiusKm] = useState(current.maxDeliveryRadiusKm ?? 15);
  const [enforceZoneBoundary, setEnforceZoneBoundary] = useState(current.enforceZoneBoundary ?? true);
  const [restaurantLat, setRestaurantLat] = useState(restaurant.coordinates?.lat ?? 24.8607);
  const [restaurantLng, setRestaurantLng] = useState(restaurant.coordinates?.lng ?? 67.0011);

  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneFee, setNewZoneFee] = useState('');
  const [newZoneMin, setNewZoneMin] = useState('');
  const [newZoneMaxDist, setNewZoneMaxDist] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleToggleDay = (day) => {
    if (closedDays.includes(day)) {
      setClosedDays(closedDays.filter((d) => d !== day));
    } else {
      setClosedDays([...closedDays, day]);
    }
  };

  const handleAddZone = () => {
    if (!newZoneName.trim() || newZoneFee === '') return;
    setDeliveryZones([
      ...deliveryZones,
      {
        name: newZoneName.trim(),
        fee: Number(newZoneFee),
        minOrder: Number(newZoneMin) || 0,
        maxDistanceKm: Number(newZoneMaxDist) || null,
      },
    ]);
    setNewZoneName('');
    setNewZoneFee('');
    setNewZoneMin('');
    setNewZoneMaxDist('');
  };

  const handleRemoveZone = (index) => {
    setDeliveryZones(deliveryZones.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const payload = {
        coordinates: {
          lat: Number(restaurantLat),
          lng: Number(restaurantLng),
        },
        deliverySettings: {
          deliveryFee: Number(deliveryFee),
          minOrderAmount: Number(minOrderAmount),
          estimatedDeliveryTime: estimatedDeliveryTime.trim(),
          estimatedPickupTime: estimatedPickupTime.trim(),
          taxRate: Number(taxRate),
          deliveryEnabled: Boolean(deliveryEnabled),
          pickupEnabled: Boolean(pickupEnabled),
          maxDeliveryRadiusKm: Number(maxDeliveryRadiusKm),
          enforceZoneBoundary: Boolean(enforceZoneBoundary),
          openingHours: {
            openTime,
            closeTime,
            isOpen24Hours: Boolean(isOpen24Hours),
            closedDays,
          },
          deliveryZones,
        },
      };

      const res = await api.put(`/restaurants/${restaurant._id}/delivery-settings`, payload);
      if (res.success) {
        setSuccessMsg('Delivery, operating hours and zone policies saved!');
        onRefresh();
      }
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span>Delivery Policy & Operating Hours</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Set delivery fees, minimum requirements, dispatch times and open schedules
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Fulfillment Toggles & Base Pricing */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Bike className="w-4 h-4 text-primary" />
            <span>Fulfillment Methods & Pricing</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
              <div>
                <div className="text-xs font-bold text-gray-900">Enable Doorstep Delivery</div>
                <div className="text-[11px] text-gray-400">Allow customers to order delivery</div>
              </div>
              <input
                type="checkbox"
                checked={deliveryEnabled}
                onChange={(e) => setDeliveryEnabled(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
              <div>
                <div className="text-xs font-bold text-gray-900">Enable Takeaway / Pickup</div>
                <div className="text-[11px] text-gray-400">Allow customers to pickup at store</div>
              </div>
              <input
                type="checkbox"
                checked={pickupEnabled}
                onChange={(e) => setPickupEnabled(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Standard Delivery Fee</label>
              <input
                type="number"
                step="0.01"
                required
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Minimum Order Amount</label>
              <input
                type="number"
                step="0.01"
                required
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Est. Delivery Time</label>
              <input
                type="text"
                value={estimatedDeliveryTime}
                onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Sales Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Max Delivery Radius (km)</label>
              <input
                type="number"
                step="0.5"
                value={maxDeliveryRadiusKm}
                onChange={(e) => setMaxDeliveryRadiusKm(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-2">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
              <div>
                <div className="text-xs font-bold text-gray-900">Enforce Service Zone Boundary</div>
                <div className="text-[11px] text-gray-400">Reject orders placed outside active delivery radius</div>
              </div>
              <input
                type="checkbox"
                checked={enforceZoneBoundary}
                onChange={(e) => setEnforceZoneBoundary(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
            </label>

            <div className="p-3 bg-gray-50 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Kitchen GPS Coordinates
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (p) => {
                          setRestaurantLat(Number(p.coords.latitude.toFixed(4)));
                          setRestaurantLng(Number(p.coords.longitude.toFixed(4)));
                        },
                        () => alert('Could not retrieve browser GPS.')
                      );
                    }
                  }}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  Detect My Location
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={restaurantLat}
                    onChange={(e) => setRestaurantLat(e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-gray-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={restaurantLng}
                    onChange={(e) => setRestaurantLng(e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-gray-200 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Opening Hours */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Store Hours & Availability</span>
          </h3>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
            <div>
              <div className="text-xs font-bold text-gray-900">Open 24/7</div>
              <div className="text-[11px] text-gray-400">Accept orders around the clock</div>
            </div>
            <input
              type="checkbox"
              checked={isOpen24Hours}
              onChange={(e) => setIsOpen24Hours(e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
          </label>

          {!isOpen24Hours && (
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Daily Opening Time</label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Daily Closing Time</label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Weekly Closed Days (Click to toggle)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((day) => {
                const isClosed = closedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isClosed
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day} {isClosed ? '(Closed)' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Delivery Zones Manager */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span>Configured Delivery Zones ({deliveryZones.length})</span>
        </h3>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Zone Name (e.g. Downtown 0-4km)"
            value={newZoneName}
            onChange={(e) => setNewZoneName(e.target.value)}
            className="flex-1 p-2.5 rounded-xl border border-gray-200 text-xs"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Fee"
            value={newZoneFee}
            onChange={(e) => setNewZoneFee(e.target.value)}
            className="w-24 p-2.5 rounded-xl border border-gray-200 text-xs"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Min Order"
            value={newZoneMin}
            onChange={(e) => setNewZoneMin(e.target.value)}
            className="w-24 p-2.5 rounded-xl border border-gray-200 text-xs"
          />
          <input
            type="number"
            step="0.5"
            placeholder="Max Dist (km)"
            value={newZoneMaxDist}
            onChange={(e) => setNewZoneMaxDist(e.target.value)}
            className="w-28 p-2.5 rounded-xl border border-gray-200 text-xs"
          />
          <button
            type="button"
            onClick={handleAddZone}
            className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold shrink-0"
          >
            Add Zone
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {deliveryZones.map((z, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-gray-900">{z.name}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Fee: ${z.fee?.toFixed(2)} • Min: ${z.minOrder?.toFixed(2)}
                  {z.maxDistanceKm ? ` • Up to ${z.maxDistanceKm}km` : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveZone(idx)}
                className="p-1 text-gray-400 hover:text-rose-600 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
