import React from 'react';
import { ShoppingBag, Clock, Phone, MapPin, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function StorefrontHeader({ restaurant }) {
  const { totalCount, total, setIsCartOpen, orderType, setOrderType, currencySymbol } = useCart();

  const isOpen = restaurant.isOpenNow ?? true;
  const hours = restaurant.deliverySettings?.openingHours;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Name */}
          <div className="flex items-center space-x-3">
            {restaurant.logo ? (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary/20 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-md">
                {restaurant.name?.charAt(0) || 'R'}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">
                  {restaurant.name}
                </h1>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  {isOpen ? 'Open Now' : 'Closed'}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate max-w-xs sm:max-w-sm mt-0.5">
                {restaurant.tagline || 'Direct Food Ordering Platform'}
              </p>
            </div>
          </div>

          {/* Center Info: Delivery / Pickup Toggle & Times */}
          <div className="hidden md:flex items-center bg-gray-100 p-1 rounded-xl">
            {restaurant.deliverySettings?.deliveryEnabled && (
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  orderType === 'delivery'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                🚴 Delivery ({restaurant.deliverySettings?.estimatedDeliveryTime || '30-45m'})
              </button>
            )}
            {restaurant.deliverySettings?.pickupEnabled && (
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  orderType === 'pickup'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                🥡 Pickup ({restaurant.deliverySettings?.estimatedPickupTime || '15-20m'})
              </button>
            )}
          </div>

          {/* Right Action: Cart Trigger */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline">View Cart</span>
              {totalCount > 0 && (
                <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs ml-1">
                  {totalCount} • {currencySymbol}{total.toFixed(2)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Delivery Sub-bar */}
        <div className="md:hidden py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
          <div className="flex space-x-2">
            <button
              onClick={() => setOrderType('delivery')}
              className={`px-2.5 py-1 rounded-md font-semibold ${
                orderType === 'delivery' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}
            >
              Delivery ({restaurant.deliverySettings?.estimatedDeliveryTime || '30m'})
            </button>
            <button
              onClick={() => setOrderType('pickup')}
              className={`px-2.5 py-1 rounded-md font-semibold ${
                orderType === 'pickup' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}
            >
              Pickup ({restaurant.deliverySettings?.estimatedPickupTime || '15m'})
            </button>
          </div>
          <div className="flex items-center text-gray-500">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {hours?.openTime || '10:00'} - {hours?.closeTime || '23:00'}
          </div>
        </div>
      </div>
    </header>
  );
}
